import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CalendarWorkout {
  id: string
  workout_type: string
  started_at: string
  completed_at: string | null
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function useCalendarData(year: number, month: number) {
  const [workouts, setWorkouts] = useState<CalendarWorkout[]>([])
  const [trainingDays, setTrainingDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)

      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 1).toISOString()

      const [wResult, sResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, workout_type, started_at, completed_at')
          .not('started_at', 'is', null)
          .gte('started_at', start)
          .lt('started_at', end)
          .order('started_at', { ascending: true }),
        supabase
          .from('program_settings')
          .select('training_days')
          .limit(1)
          .single(),
      ])

      if (cancelled) return

      setWorkouts(
        (wResult.data ?? []).map((w) => ({
          id: w.id,
          workout_type: w.workout_type,
          started_at: w.started_at!,
          completed_at: w.completed_at,
        }))
      )
      setTrainingDays((sResult.data?.training_days as string[]) ?? ['monday', 'wednesday', 'friday'])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [year, month])

  /** Get workouts for a specific day (1-indexed) */
  function getWorkoutsForDay(day: number): CalendarWorkout[] {
    return workouts.filter((w) => {
      const d = new Date(w.started_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  /** Check if a day index (0=Sun) is a configured training day */
  function isTrainingDay(dayOfWeek: number): boolean {
    return trainingDays.includes(DAY_NAMES[dayOfWeek])
  }

  return { workouts, trainingDays, loading, getWorkoutsForDay, isTrainingDay }
}
