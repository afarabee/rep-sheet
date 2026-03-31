import { cn } from '@/lib/utils'
import type { TimePeriod } from './chartTheme'

const periods: { value: TimePeriod; label: string }[] = [
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'ALL' },
]

interface TimePeriodSelectorProps {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
}

export default function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'h-9 px-3.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150',
            value === p.value
              ? 'bg-[#E91E8C] text-white shadow-[0_0_12px_rgba(233,30,140,0.4)]'
              : 'bg-transparent text-[#5E5278] border border-[#2A2040] hover:bg-[#241838] hover:text-[#F0EAF4]',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
