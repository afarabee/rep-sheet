import { useState, useMemo } from 'react'
import { Search, X, Star, Dumbbell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useExercises } from '@/hooks/useExercises'

interface ExercisePickerProps {
  onAdd: (exerciseId: string, name: string, equipmentType: string | null) => void
  onClose: () => void
  alreadyAddedIds: string[]
}

export default function ExercisePicker({ onAdd, onClose, alreadyAddedIds }: ExercisePickerProps) {
  const {
    exercises,
    allExercises,
    loading,
    searchQuery,
    setSearchQuery,
    myEquipmentOnly,
    setMyEquipmentOnly,
    bodyweightOnly,
    setBodyweightOnly,
    selectedMuscleGroups,
    setSelectedMuscleGroups,
  } = useExercises()
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const displayed = favoritesOnly ? exercises.filter((ex) => ex.is_favorite) : exercises

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>()
    allExercises.forEach((ex) => { if (ex.muscle_group) groups.add(ex.muscle_group) })
    return Array.from(groups).sort()
  }, [allExercises])

  function toggleMuscleGroup(group: string) {
    setSelectedMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )
  }

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h2 className="font-display text-xl uppercase tracking-wide text-foreground">
          Add <span className="text-[#E91E8C] text-neon-glow">Exercise</span>
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[#5E5278] hover:text-foreground hover:bg-[#241838] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search + favorites + my gym */}
      <div className="px-6 py-3 border-b border-border shrink-0 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E5278] pointer-events-none" />
          <Input
            placeholder="Search exercises…"
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            className="pl-8 h-9 bg-card border-border"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5E5278] hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
            favoritesOnly
              ? 'border-[#E91E8C] text-[#E91E8C] bg-[#E91E8C]/10 neon-glow'
              : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
          )}
        >
          <Star size={12} className={cn(favoritesOnly && 'fill-[#E91E8C]')} />
          Favorites
        </button>
        <button
          onClick={() => setMyEquipmentOnly((v) => !v)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
            myEquipmentOnly
              ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 cyan-glow'
              : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
          )}
        >
          <Dumbbell size={12} />
          My gym
        </button>
        <button
          onClick={() => setBodyweightOnly((v) => !v)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
            bodyweightOnly
              ? 'border-[#7DFFC4] text-[#7DFFC4] bg-[#7DFFC4]/10'
              : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
          )}
        >
          Bodyweight
        </button>
      </div>

      {/* Muscle group chips */}
      {muscleGroups.length > 0 && (
        <div className="px-6 py-2.5 border-b border-border shrink-0 flex flex-wrap gap-1.5">
          {muscleGroups.map((group) => (
            <button
              key={group}
              onClick={() => toggleMuscleGroup(group)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
                selectedMuscleGroups.includes(group)
                  ? 'border-[#E91E8C] text-[#E91E8C] bg-[#E91E8C]/10'
                  : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
              )}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto pb-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-[#5E5278] font-display text-lg uppercase tracking-widest">Loading…</p>
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="py-16 text-center px-6">
            <p className="text-sm text-[#5E5278]">
              {searchQuery ? `No exercises match "${searchQuery}"` : 'No exercises found.'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-[#E91E8C] hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && displayed.map((ex) => {
          const alreadyAdded = alreadyAddedIds.includes(ex.id)
          return (
            <div
              key={ex.id}
              onClick={() => { if (!alreadyAdded) onAdd(ex.id, ex.name, ex.equipment_type) }}
              className={cn(
                'flex items-center gap-3 px-6 py-3 border-b border-border min-h-[52px] transition-colors',
                alreadyAdded
                  ? 'opacity-50'
                  : 'cursor-pointer hover:bg-[#E91E8C]/5 active:bg-[#E91E8C]/10'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {ex.is_favorite && (
                    <Star size={11} className="text-[#E91E8C] fill-[#E91E8C] shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-foreground truncate">{ex.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {ex.muscle_group && (
                    <span className="text-[10px] text-[#9B8FB0] capitalize">{ex.muscle_group}</span>
                  )}
                  {ex.muscle_group && ex.equipment_type && (
                    <span className="text-[10px] text-[#3D2E5C]">·</span>
                  )}
                  {ex.equipment_type && (
                    <span className="text-[10px] text-[#5E5278]">
                      {ex.equipment_type.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>

              {alreadyAdded && (
                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
                  Added
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
