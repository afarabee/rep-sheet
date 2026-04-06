/** Format a timestamp as "Apr 3" or "Apr 3, 2026" with year. */
export function formatDate(ts: string | null, opts?: { withYear?: boolean }): string {
  if (!ts) return '—'
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (opts?.withYear) options.year = 'numeric'
  return new Date(ts).toLocaleDateString('en-US', options)
}

/** Format duration between two timestamps as "12 min". */
export function formatDuration(started: string | null, completed: string | null): string | null {
  if (!started || !completed) return null
  const mins = Math.round((new Date(completed).getTime() - new Date(started).getTime()) / 60000)
  return mins > 0 ? `${mins} min` : null
}

/** Map workout_type DB value to display label. Use { short: true } for compact labels. */
export function formatWorkoutType(type: string | null, opts?: { short?: boolean }): string {
  switch (type) {
    case 'five_by_five_a': return opts?.short ? '5×5 A' : '5×5 Workout A'
    case 'five_by_five_b': return opts?.short ? '5×5 B' : '5×5 Workout B'
    case 'freeform':       return 'Freeform'
    case 'template':       return 'Template'
    case 'stretch':        return 'Stretch'
    default:               return type ?? 'Template'
  }
}

/** Format seconds as "m:ss". */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Format a number with fixed decimals, or "—" for null/undefined. */
export function fmt(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return val.toFixed(decimals)
}
