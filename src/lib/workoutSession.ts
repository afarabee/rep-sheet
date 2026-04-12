export type ExerciseTimerState = 'idle' | 'running' | 'paused' | 'stopped'

export interface ActiveWorkoutSummary {
  workoutId: string
  workoutType: string
}

export interface PersistedExerciseTimer {
  timerState: ExerciseTimerState
  elapsedSeconds: number
  startedAtMs: number | null
}

interface PersistedWorkoutPauseState {
  isPaused: boolean
  pausedAtMs: number | null
  totalPausedMs: number
}

const ACTIVE_WORKOUT_KEY = 'rep-sheet.active-workout'
const ACTIVE_WORKOUT_EVENT = 'rep-sheet:active-workout-changed'
const EXERCISE_TIMER_PREFIX = 'rep-sheet.exercise-timer:'
const WORKOUT_PAUSE_PREFIX = 'rep-sheet.workout-pause:'

const DEFAULT_PAUSE_STATE: PersistedWorkoutPauseState = {
  isPaused: false,
  pausedAtMs: null,
  totalPausedMs: 0,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures and fall back to in-memory React state.
  }
}

function removeKey(key: string) {
  if (!canUseStorage()) return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage failures and fall back to in-memory React state.
  }
}

function dispatchActiveWorkoutChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(ACTIVE_WORKOUT_EVENT))
}

function getWorkoutPauseKey(workoutId: string) {
  return `${WORKOUT_PAUSE_PREFIX}${workoutId}`
}

export function getExerciseTimerStorageKey(workoutId: string, workoutExerciseId: string) {
  return `${EXERCISE_TIMER_PREFIX}${workoutId}:${workoutExerciseId}`
}

export function readPersistedExerciseTimer(storageKey?: string | null): PersistedExerciseTimer | null {
  if (!storageKey) return null
  return readJson<PersistedExerciseTimer>(storageKey)
}

export function writePersistedExerciseTimer(storageKey: string, timer: PersistedExerciseTimer) {
  writeJson(storageKey, timer)
}

export function clearPersistedExerciseTimer(storageKey?: string | null) {
  if (!storageKey) return
  removeKey(storageKey)
}

export function clearPersistedExerciseTimersForWorkout(workoutId: string) {
  if (!canUseStorage()) return

  const prefix = `${EXERCISE_TIMER_PREFIX}${workoutId}:`
  const keysToDelete: string[] = []

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (key?.startsWith(prefix)) keysToDelete.push(key)
  }

  keysToDelete.forEach(removeKey)
}

export function getActiveWorkoutSummary() {
  return readJson<ActiveWorkoutSummary>(ACTIVE_WORKOUT_KEY)
}

export function setActiveWorkoutSummary(summary: ActiveWorkoutSummary | null) {
  if (summary) writeJson(ACTIVE_WORKOUT_KEY, summary)
  else removeKey(ACTIVE_WORKOUT_KEY)

  dispatchActiveWorkoutChange()
}

export function subscribeToActiveWorkoutSummary(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ACTIVE_WORKOUT_KEY) callback()
  }

  window.addEventListener(ACTIVE_WORKOUT_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(ACTIVE_WORKOUT_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

export function getPersistedWorkoutPauseState(workoutId: string): PersistedWorkoutPauseState {
  return readJson<PersistedWorkoutPauseState>(getWorkoutPauseKey(workoutId)) ?? DEFAULT_PAUSE_STATE
}

function writeWorkoutPauseState(workoutId: string, state: PersistedWorkoutPauseState) {
  writeJson(getWorkoutPauseKey(workoutId), state)
}

export function clearPersistedWorkoutPauseState(workoutId: string) {
  removeKey(getWorkoutPauseKey(workoutId))
}

export function pausePersistedWorkout(workoutId: string) {
  const current = getPersistedWorkoutPauseState(workoutId)
  if (current.isPaused) return current

  const next = {
    ...current,
    isPaused: true,
    pausedAtMs: Date.now(),
  }

  writeWorkoutPauseState(workoutId, next)
  return next
}

export function resumePersistedWorkout(workoutId: string) {
  const current = getPersistedWorkoutPauseState(workoutId)
  if (!current.isPaused) return current

  const pausedDuration = current.pausedAtMs ? Date.now() - current.pausedAtMs : 0
  const next = {
    isPaused: false,
    pausedAtMs: null,
    totalPausedMs: current.totalPausedMs + pausedDuration,
  }

  writeWorkoutPauseState(workoutId, next)
  return next
}

export function getWorkoutElapsedSeconds(startedAt: string, workoutId: string) {
  const pauseState = getPersistedWorkoutPauseState(workoutId)
  const startedAtMs = new Date(startedAt).getTime()
  const nowMs = pauseState.isPaused && pauseState.pausedAtMs ? pauseState.pausedAtMs : Date.now()
  const elapsedMs = Math.max(0, nowMs - startedAtMs - pauseState.totalPausedMs)

  return Math.floor(elapsedMs / 1000)
}

