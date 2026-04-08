import { describe, it, expect } from 'vitest'
import { formatDate, formatDuration, formatWorkoutType, formatTime, formatDurationFromSeconds, fmt } from './formatters'

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns "—" for null input', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formats a date without year by default', () => {
    const result = formatDate('2026-04-03T10:30:00Z')
    expect(result).toMatch(/Apr\s+3/)
    expect(result).not.toContain('2026')
  })

  it('includes year when withYear option is true', () => {
    const result = formatDate('2026-04-03T10:30:00Z', { withYear: true })
    expect(result).toMatch(/Apr\s+3/)
    expect(result).toContain('2026')
  })
})

// ─── formatDuration ──────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('returns null when started is null', () => {
    expect(formatDuration(null, '2026-04-03T11:00:00Z')).toBeNull()
  })

  it('returns null when completed is null', () => {
    expect(formatDuration('2026-04-03T10:00:00Z', null)).toBeNull()
  })

  it('returns null for zero-minute duration', () => {
    expect(formatDuration('2026-04-03T10:00:00Z', '2026-04-03T10:00:00Z')).toBeNull()
  })

  it('calculates minutes between two timestamps', () => {
    expect(formatDuration('2026-04-03T10:00:00Z', '2026-04-03T10:45:00Z')).toBe('45 min')
  })

  it('rounds to nearest minute', () => {
    expect(formatDuration('2026-04-03T10:00:00Z', '2026-04-03T10:30:29Z')).toBe('30 min')
  })
})

// ─── formatWorkoutType ───────────────────────────────────────────────────────

describe('formatWorkoutType', () => {
  it('maps five_by_five_a to display label', () => {
    expect(formatWorkoutType('five_by_five_a')).toBe('5×5 Workout A')
  })

  it('maps five_by_five_b to display label', () => {
    expect(formatWorkoutType('five_by_five_b')).toBe('5×5 Workout B')
  })

  it('maps freeform', () => {
    expect(formatWorkoutType('freeform')).toBe('Freeform')
  })

  it('maps template', () => {
    expect(formatWorkoutType('template')).toBe('Template')
  })

  it('maps stretch', () => {
    expect(formatWorkoutType('stretch')).toBe('Stretch')
  })

  it('returns unknown types as-is', () => {
    expect(formatWorkoutType('something_new')).toBe('something_new')
  })
})

// ─── formatTime ──────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('0:45')
  })

  it('formats exact minutes', () => {
    expect(formatTime(120)).toBe('2:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(185)).toBe('3:05')
  })

  it('pads single-digit seconds', () => {
    expect(formatTime(61)).toBe('1:01')
  })

  it('formats hours when >= 3600 seconds', () => {
    expect(formatTime(3600)).toBe('1:00:00')
  })

  it('formats hours with minutes and seconds', () => {
    expect(formatTime(3661)).toBe('1:01:01')
  })

  it('formats multi-hour durations', () => {
    expect(formatTime(5445)).toBe('1:30:45')
  })

  it('pads minutes and seconds in hour format', () => {
    expect(formatTime(3605)).toBe('1:00:05')
  })
})

// ─── formatDurationFromSeconds ──────────────────────────────────────────────

describe('formatDurationFromSeconds', () => {
  it('formats zero seconds', () => {
    expect(formatDurationFromSeconds(0)).toBe('0s')
  })

  it('formats seconds only', () => {
    expect(formatDurationFromSeconds(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDurationFromSeconds(150)).toBe('2m 30s')
  })

  it('formats exact minutes', () => {
    expect(formatDurationFromSeconds(120)).toBe('2m 0s')
  })

  it('formats hours, minutes, and seconds', () => {
    expect(formatDurationFromSeconds(5445)).toBe('1h 30m 45s')
  })

  it('formats exact hours', () => {
    expect(formatDurationFromSeconds(3600)).toBe('1h 0m 0s')
  })

  it('formats hours and seconds without minutes', () => {
    expect(formatDurationFromSeconds(3605)).toBe('1h 0m 5s')
  })
})

// ─── fmt ─────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('returns "—" for null', () => {
    expect(fmt(null)).toBe('—')
  })

  it('returns "—" for undefined', () => {
    expect(fmt(undefined)).toBe('—')
  })

  it('formats with 1 decimal by default', () => {
    expect(fmt(185.456)).toBe('185.5')
  })

  it('respects custom decimal places', () => {
    expect(fmt(185.456, 2)).toBe('185.46')
  })

  it('formats zero', () => {
    expect(fmt(0)).toBe('0.0')
  })
})
