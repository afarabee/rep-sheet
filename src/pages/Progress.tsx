import { useState } from 'react'
import { Activity, Dumbbell, TrendingUp, Weight } from 'lucide-react'
import { cn } from '@/lib/utils'
import TimePeriodSelector from '@/components/charts/TimePeriodSelector'
import BodyCompCharts from '@/components/charts/BodyCompCharts'
import WorkoutFrequencyChart from '@/components/charts/WorkoutFrequencyChart'
import ExerciseWeightChart from '@/components/charts/ExerciseWeightChart'
import ExerciseVolumeChart from '@/components/charts/ExerciseVolumeChart'
import OneRepMaxChart from '@/components/charts/OneRepMaxChart'
import ExerciseChartPicker from '@/components/charts/ExerciseChartPicker'
import { useProgressData } from '@/hooks/useProgressData'
import { useExerciseOptions, useExerciseProgress } from '@/hooks/useExerciseProgress'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { TimePeriod } from '@/components/charts/chartTheme'

type Section = 'body' | 'frequency' | 'exercise'

const sections: { id: Section; label: string; Icon: typeof Activity }[] = [
  { id: 'body', label: 'Body Comp', Icon: Weight },
  { id: 'frequency', label: 'Frequency', Icon: Activity },
  { id: 'exercise', label: 'Exercises', Icon: Dumbbell },
]

export default function Progress() {
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<TimePeriod>('3m')
  const [section, setSection] = useState<Section>('body')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)

  const { bodyComp, frequency, loading } = useProgressData(period)
  const exerciseOptions = useExerciseOptions()
  const { data: exerciseData, loading: exLoading } = useExerciseProgress(selectedExercise, period)

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Pane — Section Nav + Exercise Picker */}
      <div className="w-full lg:w-56 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-card/50">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#E91E8C]" />
            <h1 className="text-base font-black uppercase tracking-wider text-foreground">
              Progress
            </h1>
          </div>

          {/* Section tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  section === s.id
                    ? 'bg-[#E91E8C] text-white shadow-[0_0_12px_rgba(233,30,140,0.3)]'
                    : 'text-[#9B8FB0] hover:bg-[#241838] hover:text-[#F0EAF4]',
                )}
              >
                <s.Icon size={16} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise picker (only in exercise section) */}
        {section === 'exercise' && (
          <div className="flex-1 overflow-hidden px-4 pt-3 pb-4 lg:pb-0 flex flex-col min-h-0">
            <ExerciseChartPicker
              exercises={exerciseOptions}
              selected={selectedExercise}
              onSelect={setSelectedExercise}
            />
          </div>
        )}
      </div>

      {/* Right Pane — Charts */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Time Period Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="text-[11px] font-black text-[#5E5278] uppercase tracking-[0.2em]">
              {section === 'body' && 'Body Composition'}
              {section === 'frequency' && 'Training Frequency'}
              {section === 'exercise' && (selectedExercise
                ? exerciseOptions.find((e) => e.id === selectedExercise)?.name ?? 'Exercise'
                : 'Select an Exercise')}
            </div>
            <TimePeriodSelector value={period} onChange={setPeriod} />
          </div>

          {loading || exLoading ? (
            <div className="flex items-center justify-center h-64 text-[#5E5278] text-sm">
              Loading...
            </div>
          ) : (
            <>
              {section === 'body' && <BodyCompCharts data={bodyComp} />}

              {section === 'frequency' && <WorkoutFrequencyChart data={frequency} />}

              {section === 'exercise' && (
                selectedExercise ? (
                  <div className="flex flex-col gap-4">
                    <ExerciseWeightChart data={exerciseData} />
                    <ExerciseVolumeChart data={exerciseData} />
                    <OneRepMaxChart data={exerciseData} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-[#5E5278] text-sm text-center px-4">
                    Pick an exercise from the {isMobile ? 'top panel' : 'left'} to see charts
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
