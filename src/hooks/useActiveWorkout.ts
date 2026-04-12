import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  clearPersistedExerciseTimersForWorkout,
  clearPersistedWorkoutPauseState,
  getPersistedWorkoutPauseState,
  getWorkoutElapsedSeconds,
  pausePersistedWorkout,
  resumePersistedWorkout,
  setActiveWorkoutSummary,
} from '@/lib/workoutSession'

export interface WorkoutSet {
  id: string
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
}

export interface WorkoutExercise {
  id: string         // workout_exercises.id
  exercise_id: string
  sort_order: number
  name: string       // denormalized from exercises
  equipment_type: string | null
  is_timed: boolean
  is_count: boolean
  sets: WorkoutSet[]
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 440
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // AudioContext not available — silently skip
  }
}

export function useActiveWorkout(templateId?: string, scheduledId?: string) {
  const workoutType = templateId ? 'template' : 'freeform'
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null)
  const [status, setStatus] = useState<'creating' | 'planning' | 'active' | 'ended'>('creating')
  const [isPaused, setIsPaused] = useState(false)
  const [initialNotes, setInitialNotes] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [templateNotes, setTemplateNotes] = useState<string | null>(null)

  // Load template notes for read-only display when templateId is provided.
  useEffect(() => {
    if (!templateId) return
    supabase
      .from('workout_templates')
      .select('notes')
      .eq('id', templateId)
      .single()
      .then(({ data }) => {
        if (data?.notes) setTemplateNotes(data.notes)
      })
  }, [templateId])

  useEffect(() => {
    async function init() {
      // Check for an existing in-progress freeform/template workout
      const { data: existing } = await supabase
        .from('workouts')
        .select('id, workout_type, started_at, notes')
        .in('workout_type', ['freeform', 'template'])
        .not('started_at', 'is', null)
        .is('completed_at', null)
        .limit(1)
        .maybeSingle()

      if (existing) {
        // Resume existing workout
        const wid = existing.id
        setWorkoutId(wid)

        // Restore elapsed time from started_at
        if (existing.started_at) {
          setElapsedSeconds(getWorkoutElapsedSeconds(existing.started_at, wid))
          setIsPaused(getPersistedWorkoutPauseState(wid).isPaused)
        }

        const { data: weData } = await supabase
          .from('workout_exercises')
          .select('id, exercise_id, sort_order, exercises(name, equipment_type, is_timed, is_count)')
          .eq('workout_id', wid)
          .order('sort_order', { ascending: true })

        if (weData && weData.length > 0) {
          const weIds = weData.map((we) => we.id)
          const { data: setsData } = await supabase
            .from('workout_sets')
            .select('id, workout_exercise_id, set_number, weight_lbs, reps, completed')
            .in('workout_exercise_id', weIds)
            .order('set_number', { ascending: true })

          const setsByWe = new Map<string, WorkoutSet[]>()
          for (const s of (setsData ?? [])) {
            if (!setsByWe.has(s.workout_exercise_id)) setsByWe.set(s.workout_exercise_id, [])
            setsByWe.get(s.workout_exercise_id)!.push({
              id: s.id,
              set_number: s.set_number,
              weight_lbs: s.weight_lbs,
              reps: s.reps,
              completed: s.completed,
            })
          }

          const exs: WorkoutExercise[] = weData.map((we) => {
            const ex = we.exercises as unknown as { name: string; equipment_type: string | null; is_timed: boolean; is_count: boolean } | null
            return {
              id: we.id,
              exercise_id: we.exercise_id,
              sort_order: we.sort_order,
              name: ex?.name ?? 'Unknown',
              equipment_type: ex?.equipment_type ?? null,
              is_timed: ex?.is_timed ?? false,
              is_count: ex?.is_count ?? false,
              sets: setsByWe.get(we.id) ?? [],
            }
          })

          setWorkoutExercises(exs)
        }

        if (existing.notes) setInitialNotes(existing.notes)
        setActiveWorkoutSummary({
          workoutId: wid,
          workoutType: existing.workout_type ?? 'freeform',
        })
        setStatus('active')
        return
      }

      // No existing workout — create new
      const insertPayload: Record<string, string | null> = { workout_type: workoutType, started_at: null }
      if (templateId) insertPayload.template_id = templateId

      const { data, error } = await supabase
        .from('workouts')
        .insert(insertPayload)
        .select('id')
        .single()
      if (error) { setError(error.message); return }
      const wid = data.id
      setWorkoutId(wid)

      if (templateId) {
        const { data: teData } = await supabase
          .from('workout_template_exercises')
          .select('exercise_id, sort_order, prescribed_sets, prescribed_reps, exercises(name, equipment_type, is_timed, is_count)')
          .eq('template_id', templateId)
          .order('sort_order', { ascending: true })

        if (teData && teData.length > 0) {
          const { data: weData } = await supabase
            .from('workout_exercises')
            .insert(
              teData.map((te) => ({
                workout_id: wid,
                exercise_id: te.exercise_id,
                sort_order: te.sort_order,
                prescribed_sets: te.prescribed_sets,
                prescribed_reps: te.prescribed_reps,
              }))
            )
            .select('id, exercise_id, sort_order')

          const exs: WorkoutExercise[] = (weData ?? [])
            .map((we) => {
              const te = teData.find((t) => t.exercise_id === we.exercise_id)
              const ex = te?.exercises as unknown as { name: string; equipment_type: string | null; is_timed: boolean; is_count: boolean } | null
              return {
                id: we.id,
                exercise_id: we.exercise_id,
                sort_order: we.sort_order,
                name: ex?.name ?? 'Unknown',
                equipment_type: ex?.equipment_type ?? null,
                is_timed: ex?.is_timed ?? false,
                is_count: ex?.is_count ?? false,
                sets: [],
              }
            })
            .sort((a, b) => a.sort_order - b.sort_order)

          setWorkoutExercises(exs)
        }
      } else if (scheduledId) {
        // Load exercises from scheduled workout and copy notes
        const [{ data: schData }, { data: sweData }] = await Promise.all([
          supabase.from('scheduled_workouts').select('notes').eq('id', scheduledId).single(),
          supabase
            .from('scheduled_workout_exercises')
            .select('exercise_id, sort_order, exercises(name, equipment_type, is_timed, is_count)')
            .eq('scheduled_workout_id', scheduledId)
            .order('sort_order', { ascending: true }),
        ])

        if (schData?.notes) {
          setInitialNotes(schData.notes)
          await supabase.from('workouts').update({ notes: schData.notes }).eq('id', wid)
        }

        if (sweData && sweData.length > 0) {
          const { data: weData } = await supabase
            .from('workout_exercises')
            .insert(
              sweData.map((swe) => ({
                workout_id: wid,
                exercise_id: swe.exercise_id,
                sort_order: swe.sort_order,
              }))
            )
            .select('id, exercise_id, sort_order')

          const exs: WorkoutExercise[] = (weData ?? [])
            .map((we) => {
              const swe = sweData.find((s) => s.exercise_id === we.exercise_id)
              const ex = swe?.exercises as unknown as { name: string; equipment_type: string | null; is_timed: boolean; is_count: boolean } | null
              return {
                id: we.id,
                exercise_id: we.exercise_id,
                sort_order: we.sort_order,
                name: ex?.name ?? 'Unknown',
                equipment_type: ex?.equipment_type ?? null,
                is_timed: ex?.is_timed ?? false,
                is_count: ex?.is_count ?? false,
                sets: [],
              }
            })
            .sort((a, b) => a.sort_order - b.sort_order)

          setWorkoutExercises(exs)
        }

        // Remove the scheduled workout — plan fulfilled
        await supabase.from('scheduled_workouts').delete().eq('id', scheduledId)
      }

      setStatus('planning')
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Elapsed timer — counts up while workout is active and not paused
  useEffect(() => {
    if (status !== 'active' || isPaused) return
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [status, isPaused])

  // Rest timer countdown
  useEffect(() => {
    if (restSecondsLeft === null) return
    if (restSecondsLeft <= 0) {
      playBeep()
      return
    }
    const t = setTimeout(() => setRestSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [restSecondsLeft])

  async function addExercise(exerciseId: string, name: string, equipmentType?: string | null, isTimed?: boolean, isCount?: boolean) {
    if (!workoutId) return
    const sortOrder = workoutExercises.reduce((max, exercise) => Math.max(max, exercise.sort_order), -1) + 1
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({ workout_id: workoutId, exercise_id: exerciseId, sort_order: sortOrder })
      .select('id')
      .single()
    if (error) { setError(error.message); return }
    const newEx: WorkoutExercise = {
      id: data.id,
      exercise_id: exerciseId,
      sort_order: sortOrder,
      name,
      equipment_type: equipmentType ?? null,
      is_timed: isTimed ?? false,
      is_count: isCount ?? false,
      sets: [],
    }
    setWorkoutExercises((prev) => {
      const next = [...prev, newEx]
      setActiveExerciseIndex(next.length - 1)
      return next
    })
  }

  async function removeExercise(workoutExerciseId: string) {
    setError(null)
    const { error } = await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId)
    if (error) { setError(error.message); return }

    const removedIndex = workoutExercises.findIndex((exercise) => exercise.id === workoutExerciseId)
    const reordered = workoutExercises
      .filter((exercise) => exercise.id !== workoutExerciseId)
      .map((exercise, index) => ({ ...exercise, sort_order: index }))

    const reorderResults = await Promise.all(
      reordered
        .filter((exercise) => {
          const previous = workoutExercises.find((candidate) => candidate.id === exercise.id)
          return previous?.sort_order !== exercise.sort_order
        })
        .map((exercise) =>
          supabase
            .from('workout_exercises')
            .update({ sort_order: exercise.sort_order })
            .eq('id', exercise.id)
        )
    )

    const reorderError = reorderResults.find((result) => result.error)?.error
    if (reorderError) {
      setError(reorderError.message)
      return
    }

    setWorkoutExercises(reordered)
    setActiveExerciseIndex((currentIndex) => {
      if (reordered.length === 0) return 0
      if (removedIndex === -1 || removedIndex > currentIndex) return currentIndex
      if (removedIndex < currentIndex) return currentIndex - 1
      return Math.min(currentIndex, reordered.length - 1)
    })
  }

  async function logSet(workoutExerciseId: string, weightLbs: number | null, reps: number | null) {
    const exercise = workoutExercises.find((ex) => ex.id === workoutExerciseId)
    if (!exercise) return
    const setNumber = exercise.sets.length + 1
    const { data, error } = await supabase
      .from('workout_sets')
      .insert({
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        weight_lbs: weightLbs,
        reps,
        completed: true,
      })
      .select('id, set_number, weight_lbs, reps, completed')
      .single()
    if (error) { setError(error.message); return }
    const newSet: WorkoutSet = {
      id: data.id,
      set_number: data.set_number,
      weight_lbs: data.weight_lbs,
      reps: data.reps,
      completed: data.completed,
    }
    setWorkoutExercises((prev) =>
      prev.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
      )
    )
    setRestSecondsLeft(120)
  }

  function adjustRestTimer(delta: number) {
    setRestSecondsLeft((s) => Math.max(0, (s ?? 0) + delta))
  }

  function skipRestTimer() {
    setRestSecondsLeft(null)
  }

  function pauseWorkout() {
    if (!workoutId) return
    pausePersistedWorkout(workoutId)
    setIsPaused(true)
  }

  function resumeWorkout() {
    if (!workoutId) return
    resumePersistedWorkout(workoutId)
    setIsPaused(false)
  }

  async function startWorkout() {
    if (!workoutId) return
    clearPersistedWorkoutPauseState(workoutId)
    await supabase
      .from('workouts')
      .update({ started_at: new Date().toISOString() })
      .eq('id', workoutId)
    setActiveWorkoutSummary({ workoutId, workoutType })
    setStatus('active')
  }

  async function endWorkout() {
    if (!workoutId) return
    await supabase
      .from('workouts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workoutId)
    clearPersistedWorkoutPauseState(workoutId)
    clearPersistedExerciseTimersForWorkout(workoutId)
    setActiveWorkoutSummary(null)
    setStatus('ended')
  }

  async function saveNotes(notes: string) {
    if (!workoutId) return
    await supabase.from('workouts').update({ notes }).eq('id', workoutId)
  }

  async function cancelWorkout() {
    if (!workoutId) return
    await supabase.from('workouts').delete().eq('id', workoutId)
    clearPersistedWorkoutPauseState(workoutId)
    clearPersistedExerciseTimersForWorkout(workoutId)
    setActiveWorkoutSummary(null)
    setStatus('ended')
  }

  return {
    workoutId,
    workoutExercises,
    activeExerciseIndex,
    setActiveExerciseIndex,
    elapsedSeconds,
    restSecondsLeft,
    status,
    isPaused,
    error,
    templateNotes,
    addExercise,
    removeExercise,
    logSet,
    adjustRestTimer,
    skipRestTimer,
    pauseWorkout,
    resumeWorkout,
    startWorkout,
    saveNotes,
    endWorkout,
    cancelWorkout,
    initialNotes,
  }
}
