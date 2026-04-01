import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import ChartCard from './ChartCard'
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_STYLE, formatDate } from './chartTheme'
import type { FrequencyPoint } from '@/hooks/useProgressData'

interface Props {
  data: FrequencyPoint[]
}

export default function WorkoutFrequencyChart({ data }: Props) {
  return (
    <ChartCard
      title="Workout Frequency"
      color={CHART_COLORS.magenta}
      empty={data.length === 0}
      emptyMessage="Complete a workout to see your frequency"
    >
      <BarChart data={data}>
        <XAxis
          dataKey="weekStart"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: any) => formatDate(v)}
          {...AXIS_STYLE}
        />
        <YAxis
          allowDecimals={false}
          width={30}
          {...AXIS_STYLE}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(v: any) => `Week of ${formatDate(v)}`}
          formatter={(v: any) => [`${v}`, 'Workouts']}
        />
        <Bar
          dataKey="count"
          fill={CHART_COLORS.magenta}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartCard>
  )
}
