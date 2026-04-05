import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface WorkoutTemplate {
  id: string
  name: string
  notes: string | null
  created_at: string
  exercise_count: number
}

export interface TemplateExercise {
  id: string
  exercise_id: string
  sort_order: number
  name: string
  prescribed_sets: number | null
  prescribed_reps: number | null
  is_timed: boolean
  is_count: boolean
}

export interface TemplateDetail {
  id: string
  name: string
  notes: string | null
  exercises: TemplateExercise[]
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TemplateDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load template list on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  // Load detail when selection changes
  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    loadDetail(selectedId)
  }, [selectedId])

  async function loadTemplates() {
    setLoading(true)
    const { data } = await supabase
      .from('workout_templates')
      .select('id, name, notes, created_at, workout_template_exercises(count)')
      .order('name', { ascending: true })

    setTemplates(
      (data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        notes: t.notes,
        created_at: t.created_at,
        exercise_count: Array.isArray(t.workout_template_exercises)
          ? (t.workout_template_exercises[0] as { count: number } | undefined)?.count ?? 0
          : 0,
      }))
    )
    setLoading(false)
  }

  async function loadDetail(templateId: string) {
    setDetailLoading(true)
    const [tResult, exResult] = await Promise.all([
      supabase
        .from('workout_templates')
        .select('id, name, notes')
        .eq('id', templateId)
        .single(),
      supabase
        .from('workout_template_exercises')
        .select('id, exercise_id, sort_order, prescribed_sets, prescribed_reps, exercises(name, is_timed, is_count)')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true }),
    ])

    if (tResult.error || exResult.error) { setDetailLoading(false); return }

    setDetail({
      id: tResult.data.id,
      name: tResult.data.name,
      notes: tResult.data.notes,
      exercises: (exResult.data ?? []).map((ex) => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        sort_order: ex.sort_order,
        name: (ex.exercises as unknown as { name: string; is_timed: boolean; is_count: boolean } | null)?.name ?? 'Unknown',
        prescribed_sets: ex.prescribed_sets,
        prescribed_reps: ex.prescribed_reps,
        is_timed: (ex.exercises as unknown as { is_timed: boolean } | null)?.is_timed ?? false,
        is_count: (ex.exercises as unknown as { is_count: boolean } | null)?.is_count ?? false,
      })),
    })
    setDetailLoading(false)
  }

  async function saveNewTemplate(
    name: string,
    exercises: Array<{ exercise_id: string; prescribed_sets: number | null; prescribed_reps: number | null }>
  ): Promise<string | null> {
    setError(null)
    const { data, error: insertError } = await supabase
      .from('workout_templates')
      .insert({ name, notes: null })
      .select('id')
      .single()
    if (insertError) { setError(insertError.message); return null }

    const templateId = data.id

    if (exercises.length > 0) {
      const { error: exError } = await supabase.from('workout_template_exercises').insert(
        exercises.map((ex, i) => ({
          template_id: templateId,
          exercise_id: ex.exercise_id,
          sort_order: i,
          prescribed_sets: ex.prescribed_sets,
          prescribed_reps: ex.prescribed_reps,
        }))
      )
      if (exError) { setError(exError.message); return null }
    }

    const newTemplate: WorkoutTemplate = {
      id: templateId,
      name,
      notes: null,
      created_at: new Date().toISOString(),
      exercise_count: exercises.length,
    }
    setTemplates((prev) => [newTemplate, ...prev])
    return templateId
  }

  async function renameTemplate(id: string, name: string) {
    setError(null)
    const { error } = await supabase
      .from('workout_templates')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { setError(error.message); return }
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, name } : t))
    if (detail?.id === id) setDetail((prev) => prev ? { ...prev, name } : prev)
  }

  async function deleteTemplate(id: string) {
    setError(null)
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    if (selectedId === id) { setSelectedId(null); setDetail(null) }
  }

  async function addExercise(templateId: string, exerciseId: string, name: string, isTimed?: boolean, isCount?: boolean) {
    setError(null)
    const currentCount = detail?.exercises.length ?? 0
    const { data, error: insertError } = await supabase
      .from('workout_template_exercises')
      .insert({ template_id: templateId, exercise_id: exerciseId, sort_order: currentCount })
      .select('id')
      .single()
    if (insertError) { setError(insertError.message); return }

    const newEx: TemplateExercise = {
      id: data.id,
      exercise_id: exerciseId,
      sort_order: currentCount,
      name,
      prescribed_sets: 3,
      prescribed_reps: null,
      is_timed: isTimed ?? false,
      is_count: isCount ?? false,
    }
    setDetail((prev) => prev ? { ...prev, exercises: [...prev.exercises, newEx] } : prev)
    setTemplates((prev) =>
      prev.map((t) => t.id === templateId ? { ...t, exercise_count: t.exercise_count + 1 } : t)
    )
  }

  async function removeExercise(templateExerciseId: string) {
    setError(null)
    const { error } = await supabase.from('workout_template_exercises').delete().eq('id', templateExerciseId)
    if (error) { setError(error.message); return }
    setDetail((prev) => {
      if (!prev) return prev
      const filtered = prev.exercises.filter((e) => e.id !== templateExerciseId)
      return { ...prev, exercises: filtered }
    })
    if (selectedId) {
      setTemplates((prev) =>
        prev.map((t) => t.id === selectedId ? { ...t, exercise_count: Math.max(0, t.exercise_count - 1) } : t)
      )
    }
  }

  async function updatePrescription(
    templateExerciseId: string,
    prescribed_sets: number | null,
    prescribed_reps: number | null
  ) {
    setError(null)
    const { error } = await supabase
      .from('workout_template_exercises')
      .update({ prescribed_sets, prescribed_reps })
      .eq('id', templateExerciseId)
    if (error) { setError(error.message); return }
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === templateExerciseId ? { ...e, prescribed_sets, prescribed_reps } : e
            ),
          }
        : prev
    )
  }

  async function reorderExercise(templateExerciseId: string, direction: 'up' | 'down') {
    setError(null)
    if (!detail) return
    const idx = detail.exercises.findIndex((e) => e.id === templateExerciseId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= detail.exercises.length) return

    const entry = detail.exercises[idx]
    const swapEntry = detail.exercises[swapIdx]

    const [res1, res2] = await Promise.all([
      supabase.from('workout_template_exercises').update({ sort_order: swapEntry.sort_order }).eq('id', entry.id),
      supabase.from('workout_template_exercises').update({ sort_order: entry.sort_order }).eq('id', swapEntry.id),
    ])
    if (res1.error) { setError(res1.error.message); return }
    if (res2.error) { setError(res2.error.message); return }

    const updated = [...detail.exercises]
    updated[idx] = { ...entry, sort_order: swapEntry.sort_order }
    updated[swapIdx] = { ...swapEntry, sort_order: entry.sort_order }
    updated.sort((a, b) => a.sort_order - b.sort_order)
    setDetail((prev) => prev ? { ...prev, exercises: updated } : prev)
  }

  return {
    templates,
    loading,
    selectedId,
    setSelectedId,
    detail,
    detailLoading,
    creating,
    setCreating,
    error,
    saveNewTemplate,
    renameTemplate,
    deleteTemplate,
    addExercise,
    removeExercise,
    updatePrescription,
    reorderExercise,
  }
}
