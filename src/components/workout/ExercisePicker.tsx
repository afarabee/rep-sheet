import { useState } from 'react'
import { Search, X, Plus, Star, Dumbbell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useExercises } from '@/hooks/useExercises'

interface ExercisePickerProps {
  onAdd: (exerciseId: string, name: string) => void
  onClose: () => void
  alreadyAddedIds: string[]
}

export default function ExercisePicker({ onAdd, onClose, alreadyAddedIds }: ExercisePickerProps) {
  const { exercises, loading, searchQuery, setSearchQuery, myEquipmentOnly, setMyEquipmentOnly } = useExercises()
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const displayed = favoritesOnly ? exercises.filter((ex) => ex.is_favorite) : exercises

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

      {/* Search + favorites toggle */}
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
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-[#5E5278] font-display text-lg uppercase tracking-widest">Loading…</p>
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#5E5278]">
              {searchQuery ? `No exercises match "${searchQuery}"` : 'No favorites yet.'}
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
              className="flex items-center gap-3 py-3 border-b border-border min-h-[52px]"
            >
              {/* Info */}
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

              {/* Add / Added */}
              {alreadyAdded ? (
                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
                  Added
                </span>
              ) : (
                <button
                  onClick={() => onAdd(ex.id, ex.name)}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-border text-[#5E5278] hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/10 transition-all"
                  aria-label={`Add ${ex.name}`}
                >
                  <Plus size={15} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
