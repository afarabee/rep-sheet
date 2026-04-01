import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getStartDate, estimateOneRepMax } from '@/components/charts/chartTheme'
import type { TimePeriod } from '@/components/charts/chartTheme'

export interface ExerciseSessionPoint {
  date: number
  maxWeight: number
  volume: number
  estimated1RM: number
}

export interface ExerciseOption {
  id: string
  name: string
}

export function useExerciseOptions() {
  const [exercises, setExercises] = useState<ExerciseOption[]>([])

  useEffect(() => {
    async function load() {
      // Get exercises that have at least one completed set
      const { data } = await supabase
        .from('workout_sets')
        .select('workout_exercises!inner(exercise_id, exercises!inner(name))')
        .eq('completed', true)
        .not('weight_lbs', 'is', null)

      if (!data) return

      const seen = new Map<string, string>()
      for (const row of data) {
        const we = row.workout_exercises as unknown as { exercise_id: string; exercises: { name: string } }
        if (!seen.has(we.exercise_id)) {
          seen.set(we.exercise_id, we.exercises.name)
        }
      }
      const list = Array.from(seen.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setExercises(list)
    }
    load()
  }, [])

  return exercises
}

export function useExerciseProgress(exerciseId: string | null, period: TimePeriod) {
  const [data, setData] = useState<ExerciseSessionPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseId) { setData([]); return }

    let cancelled = false
    async function load() {
      setLoading(true)
      const start = getStartDate(period)

      // Fetch all completed sets for this exercise with their workout dates
      let query = supabase
        .from('workout_sets')
        .select('weight_lbs, reps, workout_exercises!inner(exercise_id, workout_id, workouts!inner(started_at))')
        .eq('completed', true)
        .eq('workout_exercises.exercise_id', exerciseId)
        .not('weight_lbs', 'is', null)

      if (start) {
        query = query.gte('workout_exercises.workouts.started_at', start.toISOString())
      }

      const { data: rows } = await query
      if (cancelled || !rows) { setLoading(false); return }

      // Group by workout session (by date)
      const sessions = new Map<string, { date: number; sets: { weight: number; reps: number }[] }>()

      for (const row of rows) {
        const we = row.workout_exercises as unknown as {
          exercise_id: string
          workout_id: string
          workouts: { started_at: string }
        }
        const dateStr = new Date(we.workouts.started_at).toDateString()
        const date = new Date(we.workouts.started_at).getTime()

        if (!sessions.has(dateStr)) {
          sessions.set(dateStr, { date, sets: [] })
        }
        sessions.get(dateStr)!.sets.push({
          weight: Number(row.weight_lbs),
          reps: Number(row.reps ?? 0),
        })
      }

      // Compute per-session metrics
      const points: ExerciseSessionPoint[] = []
      for (const session of sessions.values()) {
        let maxWeight = 0
        let volume = 0
        let best1RM = 0

        for (const s of session.sets) {
          if (s.weight > maxWeight) maxWeight = s.weight
          volume += s.weight * s.reps
          const e1rm = estimateOneRepMax(s.weight, s.reps)
          if (e1rm > best1RM) best1RM = e1rm
        }

        points.push({
          date: session.date,
          maxWeight,
          volume,
          estimated1RM: best1RM,
        })
      }

      points.sort((a, b) => a.date - b.date)
      setData(points)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [exerciseId, period])

  return { data, loading }
}
