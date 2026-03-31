export const CHART_COLORS = {
  magenta: '#E91E8C',
  cyan: '#00E5FF',
  mint: '#7DFFC4',
  muted: '#5E5278',
  grid: '#2A2040',
  background: '#1A1028',
  text: '#9B8FB0',
  white: '#F0EAF4',
}

export const AXIS_STYLE = {
  tick: { fill: '#5E5278', fontSize: 11 },
  axisLine: { stroke: '#2A2040' },
}

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1A1028',
    border: '1px solid #2A2040',
    borderRadius: '12px',
    color: '#F0EAF4',
    fontSize: '13px',
    padding: '8px 12px',
  },
  cursor: { stroke: '#5E5278', strokeDasharray: '4 4' },
}

export type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y' | 'all'

export function getStartDate(period: TimePeriod): Date | null {
  if (period === 'all') return null
  const offsets: Record<Exclude<TimePeriod, 'all'>, number> = {
    '1w': 7, '1m': 30, '3m': 90, '6m': 180, '1y': 365,
  }
  const d = new Date()
  d.setDate(d.getDate() - offsets[period])
  return d
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}
