import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'
import type { ExerciseOption } from '@/hooks/useExerciseProgress'

interface Props {
  exercises: ExerciseOption[]
  selected: string | null
  onSelect: (id: string) => void
}

export default function ExerciseChartPicker({ exercises, selected, onSelect }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : exercises

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-black text-[#5E5278] uppercase tracking-[0.2em]">
        Exercise
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E5278]" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#241838] border border-[#2A2040] text-sm text-foreground placeholder:text-[#5E5278] focus:outline-none focus:border-[#E91E8C]"
        />
      </div>
      <div className="flex flex-col gap-0.5 max-h-[calc(100vh-360px)] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-[#5E5278] text-xs py-3 text-center">
            {exercises.length === 0 ? 'Log sets to see exercises here' : 'No matches'}
          </div>
        )}
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex.id)}
            className={cn(
              'text-left px-3 py-2 rounded-lg text-sm transition-colors truncate',
              selected === ex.id
                ? 'bg-[#E91E8C] text-white'
                : 'text-[#9B8FB0] hover:bg-[#241838] hover:text-[#F0EAF4]',
            )}
          >
            {ex.name}
          </button>
        ))}
      </div>
    </div>
  )
}
