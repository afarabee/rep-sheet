import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface FiveByFiveConfigEntry {
  id: string
  exercise_id: string
  sort_order: number
  name: string
  working_weight: number | null
}

export function use5x5Config() {
  const [configA, setConfigA] = useState<FiveByFiveConfigEntry[]>([])
  const [configB, setConfigB] = useState<FiveByFiveConfigEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [configResult, weightsResult] = await Promise.all([
      supabase
        .from('five_by_five_config')
        .select('id, exercise_id, workout_label, sort_order, exercises(name)')
        .order('sort_order', { ascending: true }),
      supabase
        .from('working_weights')
        .select('exercise_id, weight_lbs'),
    ])

    if (configResult.error || weightsResult.error) { setLoading(false); return }

    const weightsMap = new Map(
      (weightsResult.data ?? []).map((w) => [w.exercise_id, w.weight_lbs as number | null])
    )

    const toEntry = (row: {
      id: string; exercise_id: string; sort_order: number; exercises: unknown
    }): FiveByFiveConfigEntry => ({
      id: row.id,
      exercise_id: row.exercise_id,
      sort_order: row.sort_order,
      name: (row.exercises as { name: string } | null)?.name ?? 'Unknown',
      working_weight: weightsMap.get(row.exercise_id) ?? null,
    })

    const allRows = configResult.data ?? []
    setConfigA(allRows.filter((r) => r.workout_label === 'A').map(toEntry))
    setConfigB(allRows.filter((r) => r.workout_label === 'B').map(toEntry))
    setLoading(false)
  }

  async function addExercise(label: 'A' | 'B', exerciseId: string, name: string) {
    setError(null)
    const currentConfig = label === 'A' ? configA : configB
    const sortOrder = currentConfig.reduce((max, entry) => Math.max(max, entry.sort_order), -1) + 1
    const { data, error: insertError } = await supabase
      .from('five_by_five_config')
      .insert({ workout_label: label, exercise_id: exerciseId, sort_order: sortOrder })
      .select('id')
      .single()
    if (insertError) { setError(insertError.message); return }

    const newEntry: FiveByFiveConfigEntry = {
      id: data.id,
      exercise_id: exerciseId,
      sort_order: sortOrder,
      name,
      working_weight: null,
    }
    if (label === 'A') setConfigA((prev) => [...prev, newEntry])
    else setConfigB((prev) => [...prev, newEntry])
  }

  async function removeExercise(configId: string, label: 'A' | 'B') {
    setError(null)
    const currentConfig = label === 'A' ? configA : configB
    const { error } = await supabase.from('five_by_five_config').delete().eq('id', configId)
    if (error) { setError(error.message); return }

    const reordered = currentConfig
      .filter((entry) => entry.id !== configId)
      .map((entry, index) => ({ ...entry, sort_order: index }))

    const reorderResults = await Promise.all(
      reordered
        .filter((entry) => {
          const previous = currentConfig.find((candidate) => candidate.id === entry.id)
          return previous?.sort_order !== entry.sort_order
        })
        .map((entry) =>
          supabase
            .from('five_by_five_config')
            .update({ sort_order: entry.sort_order })
            .eq('id', entry.id)
        )
    )

    const reorderError = reorderResults.find((result) => result.error)?.error
    if (reorderError) { setError(reorderError.message); return }

    if (label === 'A') setConfigA(reordered)
    else setConfigB(reordered)
  }

  async function setWorkingWeight(exerciseId: string, weight: number | null) {
    setError(null)
    const { error } = await supabase
      .from('working_weights')
      .upsert(
        { exercise_id: exerciseId, weight_lbs: weight, updated_at: new Date().toISOString() },
        { onConflict: 'exercise_id' }
      )
    if (error) { setError(error.message); return }
    const update = (prev: FiveByFiveConfigEntry[]) =>
      prev.map((e) => e.exercise_id === exerciseId ? { ...e, working_weight: weight } : e)
    setConfigA(update)
    setConfigB(update)
  }

  async function reorderExercise(label: 'A' | 'B', configId: string, direction: 'up' | 'down') {
    setError(null)
    const config = label === 'A' ? configA : configB
    const idx = config.findIndex((e) => e.id === configId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= config.length) return

    const entry = config[idx]
    const swapEntry = config[swapIdx]

    const [res1, res2] = await Promise.all([
      supabase.from('five_by_five_config').update({ sort_order: swapEntry.sort_order }).eq('id', entry.id),
      supabase.from('five_by_five_config').update({ sort_order: entry.sort_order }).eq('id', swapEntry.id),
    ])
    if (res1.error) { setError(res1.error.message); return }
    if (res2.error) { setError(res2.error.message); return }

    const updated = [...config]
    updated[idx] = { ...entry, sort_order: swapEntry.sort_order }
    updated[swapIdx] = { ...swapEntry, sort_order: entry.sort_order }
    updated.sort((a, b) => a.sort_order - b.sort_order)

    if (label === 'A') setConfigA(updated)
    else setConfigB(updated)
  }

  return { configA, configB, loading, error, addExercise, removeExercise, setWorkingWeight, reorderExercise }
}
