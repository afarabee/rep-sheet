import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import ChartCard from './ChartCard'
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_STYLE, formatDate } from './chartTheme'
import type { ExerciseSessionPoint } from '@/hooks/useExerciseProgress'

interface Props {
  data: ExerciseSessionPoint[]
}

export default function OneRepMaxChart({ data }: Props) {
  return (
    <ChartCard
      title="Estimated 1RM"
      color={CHART_COLORS.magenta}
      empty={data.length === 0}
      emptyMessage="Select an exercise to see estimated 1RM"
    >
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatDate}
          {...AXIS_STYLE}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => `${v}`}
          width={45}
          {...AXIS_STYLE}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(v: number) => formatDate(v)}
          formatter={(v: number) => [`${v} lbs`, 'Est. 1RM (Epley)']}
        />
        <Line
          type="monotone"
          dataKey="estimated1RM"
          stroke={CHART_COLORS.magenta}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.magenta, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CHART_COLORS.magenta, stroke: '#1A1028', strokeWidth: 2 }}
        />
      </LineChart>
    </ChartCard>
  )
}
