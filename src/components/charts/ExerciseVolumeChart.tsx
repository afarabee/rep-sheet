import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import ChartCard from './ChartCard'
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_STYLE, formatDate } from './chartTheme'
import type { ExerciseSessionPoint } from '@/hooks/useExerciseProgress'

interface Props {
  data: ExerciseSessionPoint[]
}

export default function ExerciseVolumeChart({ data }: Props) {
  return (
    <ChartCard
      title="Volume Per Session"
      color={CHART_COLORS.mint}
      empty={data.length === 0}
      emptyMessage="Select an exercise to see volume trend"
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.mint} stopOpacity={0.2} />
            <stop offset="100%" stopColor={CHART_COLORS.mint} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatDate}
          {...AXIS_STYLE}
        />
        <YAxis
          tickFormatter={(v: any) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
          width={45}
          {...AXIS_STYLE}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(v: any) => formatDate(v)}
          formatter={(v: any) => [`${v.toLocaleString()} lbs`, 'Volume']}
        />
        <Area
          type="monotone"
          dataKey="volume"
          stroke={CHART_COLORS.mint}
          strokeWidth={2}
          fill="url(#volumeGrad)"
          dot={{ fill: CHART_COLORS.mint, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CHART_COLORS.mint, stroke: '#1A1028', strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartCard>
  )
}
