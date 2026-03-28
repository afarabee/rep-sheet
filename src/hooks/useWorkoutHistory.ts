import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface WorkoutSummary {
  id: string
  workout_type: string
  started_at: string | null
  completed_at: string | null
  notes: string | null
  exercise_count: number
}

export interface WorkoutSetDetail {
  id: string
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
}

export interface WorkoutExerciseDetail {
  id: string
  sort_order: number
  exercise_name: string
  sets: WorkoutSetDetail[]
}

export interface WorkoutDetail {
  id: string
  workout_type: string
  started_at: string | null
  completed_at: string | null
  notes: string | null
  exercises: WorkoutExerciseDetail[]
}

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<WorkoutDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Load workout list on mount
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, workout_type, started_at, completed_at, notes, workout_exercises(count)')
        .order('started_at', { ascending: false, nullsFirst: false })

      if (error || !data) { setLoading(false); return }

      setWorkouts(
        data.map((w) => ({
          id: w.id,
          workout_type: w.workout_type,
          started_at: w.started_at,
          completed_at: w.completed_at,
          notes: w.notes,
          exercise_count: Array.isArray(w.workout_exercises)
            ? (w.workout_exercises[0] as { count: number } | undefined)?.count ?? 0
            : 0,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  // Load detail when selection changes
  useEffect(() => {
    if (!selectedId) { setDetail(null); return }

    async function loadDetail() {
      setDetailLoading(true)

      const [workoutResult, exercisesResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, workout_type, started_at, completed_at, notes')
          .eq('id', selectedId)
          .single(),
        supabase
          .from('workout_exercises')
          .select('id, sort_order, exercises(name), workout_sets(id, set_number, weight_lbs, reps, completed)')
          .eq('workout_id', selectedId)
          .order('sort_order', { ascending: true }),
      ])

      if (workoutResult.error || exercisesResult.error) {
        setDetailLoading(false)
        return
      }

      const w = workoutResult.data
      const exercises: WorkoutExerciseDetail[] = (exercisesResult.data ?? []).map((ex) => ({
        id: ex.id,
        sort_order: ex.sort_order,
        exercise_name: (ex.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
        sets: ((ex.workout_sets as WorkoutSetDetail[]) ?? [])
          .slice()
          .sort((a, b) => a.set_number - b.set_number),
      }))

      setDetail({
        id: w.id,
        workout_type: w.workout_type,
        started_at: w.started_at,
        completed_at: w.completed_at,
        notes: w.notes,
        exercises,
      })
      setDetailLoading(false)
    }

    loadDetail()
  }, [selectedId])

  return { workouts, loading, selectedId, setSelectedId, detail, detailLoading }
}
