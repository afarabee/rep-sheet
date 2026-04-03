import { useState, useEffect, useCallback } from 'react'

export type TimerState = 'idle' | 'running' | 'paused' | 'stopped'

export function useExerciseTimer() {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (timerState !== 'running') return
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [timerState])

  const start = useCallback(() => {
    setElapsedSeconds(0)
    setTimerState('running')
  }, [])

  const pause = useCallback(() => setTimerState('paused'), [])
  const resume = useCallback(() => setTimerState('running'), [])
  const stop = useCallback(() => setTimerState('stopped'), [])

  const cancel = useCallback(() => {
    setTimerState('idle')
    setElapsedSeconds(0)
  }, [])

  return { timerState, elapsedSeconds, start, pause, resume, stop, cancel }
}
