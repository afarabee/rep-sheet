import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface AbCircuitEntry {
  id: string
  exercise_id: string
  sort_order: number
  name: string
}

export function useAbCircuit() {
  const [config, setConfig] = useState<AbCircuitEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ab_circuit_config')
        .select('id, exercise_id, sort_order, exercises(name)')
        .order('sort_order', { ascending: true })

      const entries: AbCircuitEntry[] = (data ?? []).map((row) => ({
        id: row.id,
        exercise_id: row.exercise_id,
        sort_order: row.sort_order,
        name: (row.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
      }))

      setConfig(entries)
      setLoading(false)
    }
    load()
  }, [])

  async function addExercise(exerciseId: string, name: string) {
    setError(null)
    const sortOrder = config.length
    const { data, error: insertError } = await supabase
      .from('ab_circuit_config')
      .insert({ exercise_id: exerciseId, sort_order: sortOrder })
      .select('id')
      .single()

    if (insertError) { setError(insertError.message); return }

    setConfig((prev) => [...prev, { id: data.id, exercise_id: exerciseId, sort_order: sortOrder, name }])
  }

  async function removeExercise(configId: string) {
    setError(null)
    const { error } = await supabase.from('ab_circuit_config').delete().eq('id', configId)
    if (error) { setError(error.message); return }
    setConfig((prev) => prev.filter((e) => e.id !== configId))
  }

  async function reorderExercise(configId: string, direction: 'up' | 'down') {
    setError(null)
    const idx = config.findIndex((e) => e.id === configId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= config.length) return

    const a = config[idx]
    const b = config[swapIdx]

    const [res1, res2] = await Promise.all([
      supabase.from('ab_circuit_config').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('ab_circuit_config').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    if (res1.error) { setError(res1.error.message); return }
    if (res2.error) { setError(res2.error.message); return }

    const next = config
      .map((e) => {
        if (e.id === a.id) return { ...e, sort_order: b.sort_order }
        if (e.id === b.id) return { ...e, sort_order: a.sort_order }
        return e
      })
      .sort((x, y) => x.sort_order - y.sort_order)

    setConfig(next)
  }

  return { config, loading, error, addExercise, removeExercise, reorderExercise }
}
