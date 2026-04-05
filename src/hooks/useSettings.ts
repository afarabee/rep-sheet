import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ProgramSettings {
  rest_seconds_default: number
  rest_seconds_increment: number
  increment_upper_lbs: number
  increment_squat_lbs: number
  increment_deadlift_lbs: number
  anthropic_api_key: string | null
}

export interface WorkingWeight {
  exercise_id: string
  name: string
  weight_lbs: number | null
}

const DEFAULTS: ProgramSettings = {
  rest_seconds_default: 120,
  rest_seconds_increment: 30,
  increment_upper_lbs: 5,
  increment_squat_lbs: 5,
  increment_deadlift_lbs: 10,
  anthropic_api_key: null,
}

export function useSettings() {
  const [settings, setSettings] = useState<ProgramSettings>(DEFAULTS)
  const [workingWeights, setWorkingWeights] = useState<WorkingWeight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [settingsResult, weightsResult] = await Promise.all([
        supabase
          .from('program_settings')
          .select('rest_seconds_default, rest_seconds_increment, increment_upper_lbs, increment_squat_lbs, increment_deadlift_lbs, anthropic_api_key')
          .limit(1)
          .single(),
        supabase
          .from('working_weights')
          .select('exercise_id, weight_lbs, exercises(name)')
          .order('exercise_id'),
      ])

      if (settingsResult.data) {
        const d = settingsResult.data
        setSettings({
          rest_seconds_default:   d.rest_seconds_default  ?? DEFAULTS.rest_seconds_default,
          rest_seconds_increment: d.rest_seconds_increment ?? DEFAULTS.rest_seconds_increment,
          increment_upper_lbs:    d.increment_upper_lbs   ?? DEFAULTS.increment_upper_lbs,
          increment_squat_lbs:    d.increment_squat_lbs   ?? DEFAULTS.increment_squat_lbs,
          increment_deadlift_lbs: d.increment_deadlift_lbs ?? DEFAULTS.increment_deadlift_lbs,
          anthropic_api_key:      d.anthropic_api_key ?? null,
        })
      }

      const weights: WorkingWeight[] = ((weightsResult.data ?? []) as unknown as Array<{
        exercise_id: string
        weight_lbs: number | null
        exercises: { name: string } | null
      }>).map((w) => ({
        exercise_id: w.exercise_id,
        name: w.exercises?.name ?? 'Unknown',
        weight_lbs: w.weight_lbs,
      })).sort((a, b) => a.name.localeCompare(b.name))
      setWorkingWeights(weights)
      setLoading(false)
    }
    load()
  }, [])

  async function saveSetting(field: keyof ProgramSettings, value: number | string | null) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    await supabase
      .from('program_settings')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .not('id', 'is', null)
  }

  async function saveWorkingWeight(exerciseId: string, weight: number) {
    setWorkingWeights((prev) =>
      prev.map((w) => w.exercise_id === exerciseId ? { ...w, weight_lbs: weight } : w)
    )
    await supabase
      .from('working_weights')
      .upsert(
        { exercise_id: exerciseId, weight_lbs: weight, updated_at: new Date().toISOString() },
        { onConflict: 'exercise_id' }
      )
  }

  async function exportCsv() {
    // 1. Fetch workouts
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id, workout_type, started_at, completed_at, notes')
      .order('started_at', { ascending: false })

    if (!workouts || workouts.length === 0) {
      const blob = new Blob(['No workout data to export.'], { type: 'text/csv' })
      triggerDownload(blob, 'rep-sheet-export.csv')
      return
    }

    const workoutIds = workouts.map((w) => w.id)

    // 2. Fetch workout_exercises with exercise names
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('id, workout_id, exercises(name)')
      .in('workout_id', workoutIds)

    const exerciseMap = new Map(
      (exercises ?? []).map((e) => [
        e.id,
        { workout_id: e.workout_id, name: (e.exercises as unknown as { name: string } | null)?.name ?? '' }
      ])
    )

    const exerciseIds = (exercises ?? []).map((e) => e.id)

    // 3. Fetch sets
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('workout_exercise_id, set_number, weight_lbs, reps')
      .in('workout_exercise_id', exerciseIds)
      .order('set_number')

    // 4. Build lookup: workout_id → workout info
    const workoutMap = new Map(workouts.map((w) => [w.id, w]))

    // 5. Build CSV
    const rows: string[] = [
      ['Date', 'Workout Type', 'Exercise', 'Set #', 'Weight (lbs)', 'Reps', 'Notes'].join(',')
    ]

    for (const set of (sets ?? [])) {
      const ex = exerciseMap.get(set.workout_exercise_id)
      if (!ex) continue
      const workout = workoutMap.get(ex.workout_id)
      if (!workout) continue
      const date = workout.started_at
        ? new Date(workout.started_at).toLocaleDateString('en-US')
        : ''
      rows.push([
        date,
        workout.workout_type ?? '',
        `"${ex.name.replace(/"/g, '""')}"`,
        set.set_number ?? '',
        set.weight_lbs ?? '',
        set.reps ?? '',
        `"${(workout.notes ?? '').replace(/"/g, '""')}"`,
      ].join(','))
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    triggerDownload(blob, `rep-sheet-export-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { settings, workingWeights, loading, saveSetting, saveWorkingWeight, exportCsv }
}
