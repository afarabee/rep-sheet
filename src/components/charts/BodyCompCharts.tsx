import { LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts'
import ChartCard from './ChartCard'
import { CHART_COLORS, AXIS_STYLE, TOOLTIP_STYLE, formatDate } from './chartTheme'
import type { BodyCompSeries } from '@/hooks/useProgressData'

interface Props {
  data: BodyCompSeries
}

export default function BodyCompCharts({ data }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Weight Trend */}
      <ChartCard
        title="Body Weight"
        color={CHART_COLORS.cyan}
        empty={data.weight.length === 0}
        emptyMessage="Log a weigh-in to see your weight trend"
      >
        <AreaChart data={data.weight}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.2} />
              <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
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
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${v}`}
            width={45}
            {...AXIS_STYLE}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            labelFormatter={(v: number) => formatDate(v)}
            formatter={(v: number) => [`${v} lbs`, 'Weight']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.cyan}
            strokeWidth={2}
            fill="url(#weightGrad)"
            dot={{ fill: CHART_COLORS.cyan, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_COLORS.cyan, stroke: '#1A1028', strokeWidth: 2 }}
          />
        </AreaChart>
      </ChartCard>

      {/* Body Fat % */}
      <ChartCard
        title="Body Fat %"
        color={CHART_COLORS.magenta}
        empty={data.bodyFat.length === 0}
        emptyMessage="Log a weigh-in to see body fat trend"
      >
        <LineChart data={data.bodyFat}>
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
            tickFormatter={(v: number) => `${v}%`}
            width={45}
            {...AXIS_STYLE}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            labelFormatter={(v: number) => formatDate(v)}
            formatter={(v: number) => [`${v}%`, 'Body Fat']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.magenta}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.magenta, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_COLORS.magenta, stroke: '#1A1028', strokeWidth: 2 }}
          />
        </LineChart>
      </ChartCard>

      {/* Muscle Mass */}
      <ChartCard
        title="Muscle Mass"
        color={CHART_COLORS.mint}
        empty={data.muscleMass.length === 0}
        emptyMessage="Log a weigh-in to see muscle mass trend"
      >
        <LineChart data={data.muscleMass}>
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
            formatter={(v: number) => [`${v} lbs`, 'Muscle Mass']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.mint}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.mint, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_COLORS.mint, stroke: '#1A1028', strokeWidth: 2 }}
          />
        </LineChart>
      </ChartCard>
    </div>
  )
}
