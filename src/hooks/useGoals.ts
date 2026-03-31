import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export interface Goal {
  id: string
  goal_type: 'strength' | 'body' | 'free'
  description: string
  target_value: number | null
  current_value: number | null
  exercise_id: string | null
  status: 'active' | 'completed'
  created_at: string
  completed_at: string | null
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })
      setGoals((data ?? []) as Goal[])
      setLoading(false)
    }
    load()
  }, [])

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals])
  const completedGoals = useMemo(() => goals.filter((g) => g.status === 'completed'), [goals])

  async function addGoal(input: Omit<Goal, 'id' | 'created_at' | 'completed_at' | 'status'>) {
    const { data } = await supabase
      .from('goals')
      .insert({ ...input, status: 'active' })
      .select('*')
      .single()
    if (data) setGoals((prev) => [data as Goal, ...prev])
    return data as Goal | null
  }

  async function updateGoal(id: string, fields: Partial<Goal>) {
    await supabase.from('goals').update(fields).eq('id', id)
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...fields } : g)))
  }

  async function completeGoal(id: string) {
    const now = new Date().toISOString()
    await supabase
      .from('goals')
      .update({ status: 'completed', completed_at: now })
      .eq('id', id)
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'completed', completed_at: now } : g))
    )
  }

  async function deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return { goals, activeGoals, completedGoals, loading, addGoal, updateGoal, completeGoal, deleteGoal }
}
