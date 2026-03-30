import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface FiveByFiveSet {
  id: string
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
}

export interface FiveByFiveExercise {
  workoutExerciseId: string
  exerciseId: string
  sort_order: number
  name: string
  workingWeight: number | null
  sets: FiveByFiveSet[]
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
  } catch { /* ignore */ }
}

export function use5x5Workout(label: 'A' | 'B') {
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<FiveByFiveExercise[]>([])
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null)
  const [status, setStatus] = useState<'loading' | 'planning' | 'active' | 'complete' | 'ab_circuit' | 'ended'>('loading')
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      // Check for an existing in-progress 5x5 workout
      const { data: existing } = await supabase
        .from('workouts')
        .select('id, workout_type, started_at')
        .in('workout_type', ['five_by_five_a', 'five_by_five_b'])
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

        const [weResult, weightsResult] = await Promise.all([
          supabase
            .from('workout_exercises')
            .select('id, exercise_id, sort_order, exercises(name)')
            .eq('workout_id', wid)
            .order('sort_order', { ascending: true }),
          supabase.from('working_weights').select('exercise_id, weight_lbs'),
        ])

        const weData = weResult.data ?? []
        const weightsMap = new Map(
          (weightsResult.data ?? []).map((w) => [w.exercise_id, w.weight_lbs as number | null])
        )

        if (weData.length > 0) {
          const weIds = weData.map((we) => we.id)
          const { data: setsData } = await supabase
            .from('workout_sets')
            .select('id, workout_exercise_id, set_number, weight_lbs, reps, completed')
            .in('workout_exercise_id', weIds)
            .order('set_number', { ascending: true })

          const setsByWe = new Map<string, FiveByFiveSet[]>()
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

          const exs: FiveByFiveExercise[] = weData
            .map((we) => ({
              workoutExerciseId: we.id,
              exerciseId: we.exercise_id,
              sort_order: we.sort_order,
              name: (we.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
              workingWeight: weightsMap.get(we.exercise_id) ?? null,
              sets: setsByWe.get(we.id) ?? [],
            }))
            .sort((a, b) => a.sort_order - b.sort_order)

          setExercises(exs)
        }

        setStatus('active')
        return
      }

      // No existing workout — create new
      const [configResult, weightsResult] = await Promise.all([
        supabase
          .from('five_by_five_config')
          .select('id, exercise_id, sort_order, exercises(name)')
          .eq('workout_label', label)
          .order('sort_order', { ascending: true }),
        supabase.from('working_weights').select('exercise_id, weight_lbs'),
      ])

      if (configResult.error) { setError(configResult.error.message); return }

      const config = configResult.data ?? []
      const weightsMap = new Map(
        (weightsResult.data ?? []).map((w) => [w.exercise_id, w.weight_lbs as number | null])
      )

      const workoutType = label === 'A' ? 'five_by_five_a' : 'five_by_five_b'
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({ workout_type: workoutType, started_at: null })
        .select('id')
        .single()

      if (workoutError) { setError(workoutError.message); return }
      const wid = workoutData.id
      setWorkoutId(wid)

      if (config.length > 0) {
        const { data: weData, error: weError } = await supabase
          .from('workout_exercises')
          .insert(
            config.map((c) => ({
              workout_id: wid,
              exercise_id: c.exercise_id,
              sort_order: c.sort_order,
              prescribed_sets: 5,
              prescribed_reps: 5,
            }))
          )
          .select('id, exercise_id, sort_order')

        if (weError) { setError(weError.message); return }

        const exs: FiveByFiveExercise[] = (weData ?? [])
          .map((we) => {
            const cfg = config.find((c) => c.exercise_id === we.exercise_id)
            return {
              workoutExerciseId: we.id,
              exerciseId: we.exercise_id,
              sort_order: we.sort_order,
              name: (cfg?.exercises as unknown as { name: string } | null)?.name ?? 'Unknown',
              workingWeight: weightsMap.get(we.exercise_id) ?? null,
              sets: [],
            }
          })
          .sort((a, b) => a.sort_order - b.sort_order)

        setExercises(exs)
      }

      setStatus('planning')
    }

    init()
  }, [label])

  // Elapsed timer — counts up while active and not paused
  useEffect(() => {
    if (status !== 'active' || isPaused) return
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [status, isPaused])

  // Rest timer countdown
  useEffect(() => {
    if (restSecondsLeft === null) return
    if (restSecondsLeft <= 0) { playBeep(); return }
    const t = setTimeout(() => setRestSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [restSecondsLeft])

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

  async function logSet(workoutExerciseId: string, weightLbs: number | null, reps: number | null) {
    const exercise = exercises.find((ex) => ex.workoutExerciseId === workoutExerciseId)
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

    const newSet: FiveByFiveSet = {
      id: data.id,
      set_number: data.set_number,
      weight_lbs: data.weight_lbs,
      reps: data.reps,
      completed: data.completed,
    }

    setExercises((prev) =>
      prev.map((ex) =>
        ex.workoutExerciseId === workoutExerciseId
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      )
    )
    setRestSecondsLeft(120)
  }

  function advanceToNext() {
    const nextIdx = activeExerciseIndex + 1
    if (nextIdx < exercises.length) {
      setActiveExerciseIndex(nextIdx)
    } else {
      setStatus('complete')
    }
  }

  async function addExercise(exerciseId: string, name: string) {
    if (!workoutId) return
    const sortOrder = exercises.length
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({ workout_id: workoutId, exercise_id: exerciseId, sort_order: sortOrder })
      .select('id')
      .single()
    if (error) { setError(error.message); return }

    const newEx: FiveByFiveExercise = {
      workoutExerciseId: data.id,
      exerciseId,
      sort_order: sortOrder,
      name,
      workingWeight: null,
      sets: [],
    }
    setExercises((prev) => {
      const next = [...prev, newEx]
      setActiveExerciseIndex(next.length - 1)
      return next
    })
  }

  function adjustRestTimer(delta: number) {
    setRestSecondsLeft((s) => Math.max(0, (s ?? 0) + delta))
  }

  function skipRestTimer() {
    setRestSecondsLeft(null)
  }

  async function updateWorkingWeight(exerciseId: string, weight: number) {
    await supabase
      .from('working_weights')
      .upsert(
        { exercise_id: exerciseId, weight_lbs: weight, updated_at: new Date().toISOString() },
        { onConflict: 'exercise_id' }
      )
    setExercises((prev) =>
      prev.map((ex) => ex.exerciseId === exerciseId ? { ...ex, workingWeight: weight } : ex)
    )
  }

  function startAbCircuit() {
    setStatus('ab_circuit')
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

  async function endWorkout() {
    if (!workoutId) return
    await supabase
      .from('workouts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workoutId)
    setStatus('ended')
  }

  return {
    workoutId,
    exercises,
    activeExerciseIndex,
    setActiveExerciseIndex,
    elapsedSeconds,
    restSecondsLeft,
    status,
    isPaused,
    error,
    startWorkout,
    logSet,
    advanceToNext,
    addExercise,
    adjustRestTimer,
    skipRestTimer,
    pauseWorkout,
    resumeWorkout,
    updateWorkingWeight,
    startAbCircuit,
    saveNotes,
    cancelWorkout,
    endWorkout,
  }
}
