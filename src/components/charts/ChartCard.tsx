import { ResponsiveContainer } from 'recharts'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  color?: string
  height?: number
  children: ReactNode
  empty?: boolean
  emptyMessage?: string
}

export default function ChartCard({ title, color = '#5E5278', height = 280, children, empty, emptyMessage }: ChartCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div
        className="text-[11px] font-black uppercase tracking-[0.2em] mb-4"
        style={{ color }}
      >
        {title}
      </div>
      {empty ? (
        <div className="flex items-center justify-center text-[#5E5278] text-sm" style={{ height }}>
          {emptyMessage || 'No data yet'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  )
}
