import { useState, useMemo } from 'react'
import { Search, X, Star, Dumbbell, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useExercises } from '@/hooks/useExercises'
import type { NewExercise } from '@/hooks/useExercises'

const MUSCLE_GROUPS = [
  'chest', 'lats', 'middle back', 'lower back', 'shoulders', 'traps',
  'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abductors', 'adductors',
  'abdominals', 'neck', 'mobility',
]

const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'bodyweight', 'cable', 'machine',
  'kettlebell', 'bands', 'ez_bar', 'exercise_ball',
  'medicine_ball', 'foam_roller', 'other',
]

function formatLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ExercisePickerProps {
  onAdd: (exerciseId: string, name: string, equipmentType: string | null, isTimed: boolean, isCount: boolean) => void
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
    customOnly,
    setCustomOnly,
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedEquipmentTypes,
    setSelectedEquipmentTypes,
    addCustomExercise,
  } = useExercises()
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Inline create form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formMuscleGroup, setFormMuscleGroup] = useState('')
  const [formEquipmentType, setFormEquipmentType] = useState('')
  const [formIsTimed, setFormIsTimed] = useState(false)
  const [formIsCount, setFormIsCount] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreateForm() {
    setFormName(searchQuery)
    setFormMuscleGroup('')
    setFormEquipmentType('')
    setFormIsTimed(false)
    setFormIsCount(false)
    setFormError(null)
    setShowCreateForm(true)
  }

  async function handleCreateExercise() {
    if (!formName.trim() || !formMuscleGroup) return
    setFormSaving(true)
    setFormError(null)
    try {
      const data: NewExercise = {
        name: formName.trim(),
        muscle_group: formMuscleGroup,
        equipment_type: formEquipmentType || 'other',
        is_timed: formIsTimed,
        is_count: formIsCount,
      }
      const newExercise = await addCustomExercise(data)
      onAdd(newExercise.id, newExercise.name, newExercise.equipment_type, newExercise.is_timed, newExercise.is_count)
      setShowCreateForm(false)
      setSearchQuery('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create exercise')
    } finally {
      setFormSaving(false)
    }
  }

  const displayed = favoritesOnly ? exercises.filter((ex) => ex.is_favorite) : exercises

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>()
    allExercises.forEach((ex) => { if (ex.muscle_group) groups.add(ex.muscle_group) })
    return Array.from(groups).sort()
  }, [allExercises])

  const equipmentTypes = useMemo(() => {
    const types = new Set<string>()
    allExercises.forEach((ex) => { if (ex.equipment_type) types.add(ex.equipment_type) })
    return Array.from(types).sort()
  }, [allExercises])

  function toggleMuscleGroup(group: string) {
    setSelectedMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )
  }

  function toggleEquipmentType(type: string) {
    setSelectedEquipmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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

      {/* Search + filters */}
      <div className="px-6 py-3 border-b border-border shrink-0 space-y-2">
        <div className="relative">
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all',
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
              'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all',
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
              'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all',
              bodyweightOnly
                ? 'border-[#7DFFC4] text-[#7DFFC4] bg-[#7DFFC4]/10'
                : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
            )}
          >
            Bodyweight
          </button>
          <button
            onClick={() => setCustomOnly((v) => !v)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all',
              customOnly
                ? 'border-[#9B8FB0] text-[#9B8FB0] bg-[#9B8FB0]/10'
                : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
            )}
          >
            Custom
          </button>
        </div>
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

      {/* Equipment type chips */}
      {equipmentTypes.length > 0 && (
        <div className="px-6 py-2.5 border-b border-border shrink-0 flex flex-wrap gap-1.5">
          {equipmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleEquipmentType(type)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
                selectedEquipmentTypes.includes(type)
                  ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10'
                  : 'border-border text-[#5E5278] hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
              )}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Exercise list / Create form */}
      <div className="flex-1 overflow-y-auto pb-6">
        {showCreateForm ? (
          <div className="px-6 py-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7DFFC4] mb-4">
              New Custom Exercise
            </div>
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName((e.target as HTMLInputElement).value)}
                  placeholder="e.g. Cable Face Pull"
                  className="bg-card border-border"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Muscle Group *</Label>
                <select
                  value={formMuscleGroup}
                  onChange={(e) => setFormMuscleGroup(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:border-[#E91E8C] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/25 dark:bg-[#1A1028]"
                >
                  <option value="">Select…</option>
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>{formatLabel(mg)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Equipment</Label>
                <select
                  value={formEquipmentType}
                  onChange={(e) => setFormEquipmentType(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:border-[#E91E8C] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/25 dark:bg-[#1A1028]"
                >
                  <option value="">Select…</option>
                  {EQUIPMENT_TYPES.map((eq) => (
                    <option key={eq} value={eq}>{formatLabel(eq)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span
                  onClick={() => { setFormIsTimed((v) => !v); setFormIsCount(false) }}
                  className={cn(
                    'size-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                    formIsTimed ? 'border-[#00E5FF] bg-[#00E5FF]' : 'border-[#5E5278]'
                  )}
                >
                  {formIsTimed && <Check size={10} className="text-[#0F0A1A]" />}
                </span>
                <span className="text-xs text-muted-foreground" onClick={() => { setFormIsTimed((v) => !v); setFormIsCount(false) }}>
                  Timed
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span
                  onClick={() => { setFormIsCount((v) => !v); setFormIsTimed(false) }}
                  className={cn(
                    'size-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                    formIsCount ? 'border-[#7DFFC4] bg-[#7DFFC4]' : 'border-[#5E5278]'
                  )}
                >
                  {formIsCount && <Check size={10} className="text-[#0F0A1A]" />}
                </span>
                <span className="text-xs text-muted-foreground" onClick={() => { setFormIsCount((v) => !v); setFormIsTimed(false) }}>
                  Count
                </span>
              </label>
            </div>
            {formError && <p className="text-xs text-[#FF4D6A] mb-3">{formError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-[#5E5278] hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExercise}
                disabled={formSaving || !formName.trim() || !formMuscleGroup}
                className="px-4 py-2 rounded-lg bg-[#E91E8C] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 disabled:opacity-40 transition-all"
              >
                {formSaving ? 'Saving…' : 'Create & Add'}
              </button>
            </div>
          </div>
        ) : (
        <>
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
            <div className="flex flex-col items-center gap-2 mt-3">
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-[#E91E8C] hover:underline">
                  Clear search
                </button>
              )}
              <button
                onClick={openCreateForm}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#7DFFC4] hover:underline"
              >
                <Plus size={12} />
                Create custom exercise{searchQuery ? ` "${searchQuery}"` : ''}
              </button>
            </div>
          </div>
        )}

        {!loading && displayed.map((ex) => {
          const alreadyAdded = alreadyAddedIds.includes(ex.id)
          return (
            <div
              key={ex.id}
              onClick={() => { if (!alreadyAdded) onAdd(ex.id, ex.name, ex.equipment_type, ex.is_timed, ex.is_count) }}
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
        </>
        )}
      </div>
    </div>
  )
}
