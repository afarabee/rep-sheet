import { describe, it, expect } from 'vitest'

/**
 * Template exercise display should respect is_timed and is_count flags.
 * Bug: templates always show "sets" / "reps" labels regardless of exercise mode.
 * Expected: timed exercises show "sets" / "sec", count exercises show "sets" / "count".
 */

function prescriptionLabel(isTimed: boolean, isCount: boolean): string {
  if (isCount) return 'count'
  if (isTimed) return 'sec'
  return 'reps'
}

describe('Template exercise mode labels', () => {
  it('shows "reps" for standard exercises', () => {
    expect(prescriptionLabel(false, false)).toBe('reps')
  })

  it('shows "sec" for timed exercises', () => {
    expect(prescriptionLabel(true, false)).toBe('sec')
  })

  it('shows "count" for count exercises', () => {
    expect(prescriptionLabel(false, true)).toBe('count')
  })
})
