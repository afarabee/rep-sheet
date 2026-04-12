import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getActiveWorkoutSummary,
  setActiveWorkoutSummary,
  subscribeToActiveWorkoutSummary,
  type ActiveWorkoutSummary,
} from '@/lib/workoutSession'

function toSummary(summary: ActiveWorkoutSummary | null) {
  return {
    activeWorkoutId: summary?.workoutId ?? null,
    activeWorkoutType: summary?.workoutType ?? null,
    hasActiveWorkout: summary !== null,
  }
}

export function useActiveWorkoutPresence() {
  const [presence, setPresence] = useState(() => toSummary(getActiveWorkoutSummary()))

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      const { data } = await supabase
        .from('workouts')
        .select('id, workout_type')
        .not('started_at', 'is', null)
        .is('completed_at', null)
        .limit(1)

      if (cancelled) return

      const active = data?.[0]
      const nextSummary = active
        ? { workoutId: active.id, workoutType: active.workout_type ?? 'freeform' }
        : null

      setActiveWorkoutSummary(nextSummary)
      setPresence(toSummary(nextSummary))
    }

    const unsubscribe = subscribeToActiveWorkoutSummary(() => {
      if (cancelled) return
      setPresence(toSummary(getActiveWorkoutSummary()))
    })

    refresh()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return presence
}

