import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface CalendarWorkout {
  id: string
  workout_type: string
  started_at: string
  completed_at: string | null
}

export interface ScheduledWorkout {
  id: string
  scheduled_date: string
  workout_type: string | null
  template_id: string | null
  template_name: string | null
  notes: string | null
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function useCalendarData(year: number, month: number) {
  const [workouts, setWorkouts] = useState<CalendarWorkout[]>([])
  const [scheduled, setScheduled] = useState<ScheduledWorkout[]>([])
  const [trainingDays, setTrainingDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)

      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endYear = month === 11 ? year + 1 : year
      const endMonth = month === 11 ? 1 : month + 2
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

      const startTs = new Date(year, month, 1).toISOString()
      const endTs = new Date(year, month + 1, 1).toISOString()

      const [wResult, schResult, sResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, workout_type, started_at, completed_at')
          .not('started_at', 'is', null)
          .gte('started_at', startTs)
          .lt('started_at', endTs)
          .order('started_at', { ascending: true }),
        supabase
          .from('scheduled_workouts')
          .select('id, scheduled_date, workout_type, template_id, notes, workout_templates(name)')
          .gte('scheduled_date', startDate)
          .lt('scheduled_date', endDate)
          .order('scheduled_date', { ascending: true }),
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

      setScheduled(
        (schResult.data ?? []).map((s) => {
          const tmpl = s.workout_templates as unknown as { name: string } | null
          return {
            id: s.id,
            scheduled_date: s.scheduled_date,
            workout_type: s.workout_type,
            template_id: s.template_id,
            template_name: tmpl?.name ?? null,
            notes: s.notes,
          }
        })
      )

      setTrainingDays((sResult.data?.training_days as string[]) ?? ['monday', 'wednesday', 'friday'])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [year, month, refreshKey])

  function getWorkoutsForDay(day: number): CalendarWorkout[] {
    return workouts.filter((w) => {
      const d = new Date(w.started_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function getScheduledForDay(day: number): ScheduledWorkout[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return scheduled.filter((s) => s.scheduled_date === dateStr)
  }

  function isTrainingDay(dayOfWeek: number): boolean {
    return trainingDays.includes(DAY_NAMES[dayOfWeek])
  }

  return { workouts, scheduled, trainingDays, loading, getWorkoutsForDay, getScheduledForDay, isTrainingDay, reload }
}
