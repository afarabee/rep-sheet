import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExerciseTimer } from './useExerciseTimer'

describe('useExerciseTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle state with 0 seconds', () => {
    const { result } = renderHook(() => useExerciseTimer())
    expect(result.current.timerState).toBe('idle')
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('transitions to running on start', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    expect(result.current.timerState).toBe('running')
  })

  it('counts up every second while running', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.elapsedSeconds).toBe(3)
  })

  it('freezes elapsed time on pause', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.pause())
    expect(result.current.timerState).toBe('paused')
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.elapsedSeconds).toBe(5) // should NOT have increased
  })

  it('resumes counting after pause', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.pause())
    act(() => result.current.resume())
    expect(result.current.timerState).toBe('running')
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.elapsedSeconds).toBe(8)
  })

  it('transitions to stopped on stop (preserves elapsed time)', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10000))
    act(() => result.current.stop())
    expect(result.current.timerState).toBe('stopped')
    expect(result.current.elapsedSeconds).toBe(10)
  })

  it('resets to idle with 0 seconds on cancel', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.cancel())
    expect(result.current.timerState).toBe('idle')
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('resets elapsed to 0 on a fresh start', () => {
    const { result } = renderHook(() => useExerciseTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    act(() => result.current.stop())
    act(() => result.current.start()) // start again
    expect(result.current.elapsedSeconds).toBe(0)
  })
})
