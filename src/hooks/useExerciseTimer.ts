import { useState, useEffect, useCallback } from 'react'
import {
  clearPersistedExerciseTimer,
  readPersistedExerciseTimer,
  writePersistedExerciseTimer,
} from '@/lib/workoutSession'

export type TimerState = 'idle' | 'running' | 'paused' | 'stopped'

interface PersistedTimerState {
  timerState: TimerState
  elapsedSeconds: number
  startedAtMs: number | null
}

const DEFAULT_TIMER: PersistedTimerState = {
  timerState: 'idle',
  elapsedSeconds: 0,
  startedAtMs: null,
}

function getElapsedSeconds(timer: PersistedTimerState) {
  if (timer.timerState !== 'running' || timer.startedAtMs === null) {
    return timer.elapsedSeconds
  }

  return timer.elapsedSeconds + Math.floor((Date.now() - timer.startedAtMs) / 1000)
}

export function useExerciseTimer(storageKey?: string | null) {
  const [timer, setTimer] = useState<PersistedTimerState>(() => {
    if (!storageKey) return DEFAULT_TIMER
    return readPersistedExerciseTimer(storageKey) ?? DEFAULT_TIMER
  })
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(timer))

  useEffect(() => {
    const nextTimer = storageKey
      ? readPersistedExerciseTimer(storageKey) ?? DEFAULT_TIMER
      : DEFAULT_TIMER

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimer(nextTimer)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsedSeconds(getElapsedSeconds(nextTimer))
  }, [storageKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsedSeconds(getElapsedSeconds(timer))

    if (timer.timerState !== 'running') return

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(timer))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    if (!storageKey) return

    if (timer.timerState === 'idle' && timer.elapsedSeconds === 0 && timer.startedAtMs === null) {
      clearPersistedExerciseTimer(storageKey)
      return
    }

    writePersistedExerciseTimer(storageKey, timer)
  }, [storageKey, timer])

  const start = useCallback(() => {
    const next = {
      timerState: 'running' as const,
      elapsedSeconds: 0,
      startedAtMs: Date.now(),
    }
    setTimer(next)
    setElapsedSeconds(0)
  }, [])

  const pause = useCallback(() => {
    setTimer((current) => {
      const next = {
        timerState: 'paused' as const,
        elapsedSeconds: getElapsedSeconds(current),
        startedAtMs: null,
      }
      setElapsedSeconds(next.elapsedSeconds)
      return next
    })
  }, [])

  const resume = useCallback(() => {
    setTimer((current) => ({
      timerState: 'running',
      elapsedSeconds: current.elapsedSeconds,
      startedAtMs: Date.now(),
    }))
  }, [])

  const stop = useCallback(() => {
    setTimer((current) => {
      const next = {
        timerState: 'stopped' as const,
        elapsedSeconds: getElapsedSeconds(current),
        startedAtMs: null,
      }
      setElapsedSeconds(next.elapsedSeconds)
      return next
    })
  }, [])

  const cancel = useCallback(() => {
    setTimer(DEFAULT_TIMER)
    setElapsedSeconds(0)
  }, [])

  return { timerState: timer.timerState, elapsedSeconds, start, pause, resume, stop, cancel }
}
