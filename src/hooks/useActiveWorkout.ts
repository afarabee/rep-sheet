import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useActiveWorkout(templateId?: string) {
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null)
  const [status, setStatus] = useState<'creating' | 'planning' | 'active' | 'ended'>('creating')
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      // Check for an existing in-progress freeform/template workout
      const { data: existing } = await supabase
        .from('workouts')
        .select('id, started_at')
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
          const elapsed = Math.floor((Date.now() - new Date(existing.started_at).getTime()) / 1000)
          setElapsedSeconds(Math.max(0, elapsed))
        }

        const { data: weData } = await supabase
          .from('workout_exercises')
          .select('id, exercise_id, sort_order, exercises(name)')
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

          const exs: WorkoutExercise[] = weData.map((we) => ({
            id: we.id,
            exercise_id: we.exercise_id,
            sort_order: we.sort_order,
            name: (we.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
            sets: setsByWe.get(we.id) ?? [],
          }))

          setWorkoutExercises(exs)
        }

        setStatus('active')
        return
      }

      // No existing workout — create new
      const workoutType = templateId ? 'template' : 'freeform'
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
          .select('exercise_id, sort_order, prescribed_sets, prescribed_reps, exercises(name)')
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
              return {
                id: we.id,
                exercise_id: we.exercise_id,
                sort_order: we.sort_order,
                name: (te?.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
                sets: [],
              }
            })
            .sort((a, b) => a.sort_order - b.sort_order)

          setWorkoutExercises(exs)
        }
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

  async function addExercise(exerciseId: string, name: string) {
    if (!workoutId) return
    const sortOrder = workoutExercises.length
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
      sets: [],
    }
    setWorkoutExercises((prev) => {
      const next = [...prev, newEx]
      setActiveExerciseIndex(next.length - 1)
      return next
    })
  }

  async function removeExercise(workoutExerciseId: string) {
    await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId)
    setWorkoutExercises((prev) => {
      const filtered = prev.filter((ex) => ex.id !== workoutExerciseId)
      const reordered = filtered.map((ex, i) => ({ ...ex, sort_order: i }))
      setActiveExerciseIndex((idx) => Math.min(idx, Math.max(0, reordered.length - 1)))
      return reordered
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

  function pauseWorkout() { setIsPaused(true) }
  function resumeWorkout() { setIsPaused(false) }

  async function startWorkout() {
    if (!workoutId) return
    await supabase
      .from('workouts')
      .update({ started_at: new Date().toISOString() })
      .eq('id', workoutId)
    setStatus('active')
  }

  async function endWorkout() {
    if (!workoutId) return
    await supabase
      .from('workouts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workoutId)
    setStatus('ended')
  }

  async function saveNotes(notes: string) {
    if (!workoutId) return
    await supabase.from('workouts').update({ notes }).eq('id', workoutId)
  }

  async function cancelWorkout() {
    if (!workoutId) return
    await supabase.from('workouts').delete().eq('id', workoutId)
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
  }
}
