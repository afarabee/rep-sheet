import { useState } from 'react'
import { Star, Search, Plus, X, ChevronDown, Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useExercises, type Exercise, type NewExercise } from '@/hooks/useExercises'

// ─── Constants ────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
  'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
  'mobility', 'neck', 'quadriceps', 'shoulders', 'traps', 'triceps',
]

const EQUIPMENT_TYPES = [
  'bands', 'barbell', 'bodyweight', 'cable', 'dumbbell',
  'exercise_ball', 'ez_bar', 'foam_roller', 'kettlebell',
  'machine', 'medicine_ball', 'other',
]

function formatLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="py-2 pt-5">
      <span className="text-[10px] font-black text-[#5E5278] uppercase tracking-[0.25em]">
        {label}
      </span>
    </div>
  )
}

interface ExerciseRowProps {
  exercise: Exercise
  onToggleFavorite: (id: string, current: boolean) => Promise<void>
  onDeactivate: (id: string) => Promise<void>
  onReactivate: (id: string) => Promise<void>
  onEdit: (exercise: Exercise) => void
}

function ExerciseRow({ exercise, onToggleFavorite, onDeactivate, onReactivate, onEdit }: ExerciseRowProps) {
  const [showActions, setShowActions] = useState(false)
  const isInactive = !exercise.is_active

  return (
    <div
      className={cn(
        'flex flex-wrap items-start gap-3 py-3 border-b border-border min-h-[56px] transition-colors sm:items-center',
        isInactive ? 'opacity-40' : 'hover:bg-[#1A1028]/60'
      )}
    >
      {/* Star toggle */}
      <button
        onClick={() => onToggleFavorite(exercise.id, exercise.is_favorite)}
        className="shrink-0 p-1 rounded transition-colors hover:bg-[#241838]"
        aria-label={exercise.is_favorite ? 'Unfavorite' : 'Favorite'}
      >
        <Star
          size={18}
          className={cn(
            'transition-colors',
            exercise.is_favorite
              ? 'text-[#E91E8C] fill-[#E91E8C]'
              : 'text-[#3D2E5C]'
          )}
        />
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-[12rem]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-sm font-semibold text-foreground truncate',
              isInactive && 'line-through text-[#5E5278]'
            )}
          >
            {exercise.name}
          </span>
          {exercise.is_custom && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
              Custom
            </span>
          )}
          {isInactive && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF4D6A]/15 text-[#FF4D6A]">
              Inactive
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {exercise.muscle_group && (
            <span className="text-[10px] text-[#9B8FB0] capitalize">{exercise.muscle_group}</span>
          )}
          {exercise.muscle_group && exercise.equipment_type && (
            <span className="text-[#3D2E5C] text-[10px]">·</span>
          )}
          {exercise.equipment_type && (
            <span className="text-[10px] text-[#5E5278]">{formatLabel(exercise.equipment_type)}</span>
          )}
        </div>
      </div>

      {/* Right actions */}
      {isInactive ? (
        <div className="w-full sm:w-auto sm:shrink-0 flex justify-end">
          <button
            onClick={() => onReactivate(exercise.id)}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#7DFFC4]/15 text-[#7DFFC4] hover:bg-[#7DFFC4]/25 transition-colors"
          >
            Reactivate
          </button>
        </div>
      ) : (
        <div className="w-full sm:w-auto sm:shrink-0 flex items-center justify-end gap-1">
          {showActions ? (
            <>
              <button
                onClick={() => {
                  onDeactivate(exercise.id)
                  setShowActions(false)
                }}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#FF4D6A]/15 text-[#FF4D6A] hover:bg-[#FF4D6A]/25 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={() => setShowActions(false)}
                className="p-1 rounded text-[#5E5278] hover:text-foreground hover:bg-[#241838] transition-colors"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(exercise)}
                className="p-1.5 rounded text-[#3D2E5C] hover:text-[#00E5FF] hover:bg-[#241838] transition-colors"
                aria-label="Edit exercise"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setShowActions(true)}
                className="p-1.5 rounded text-[#3D2E5C] hover:text-[#9B8FB0] hover:bg-[#241838] transition-colors"
                aria-label="More options"
              >
                <ChevronDown size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Library() {
  const {
    exercises,
    allExercises,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedEquipmentTypes,
    setSelectedEquipmentTypes,
    myEquipmentOnly,
    setMyEquipmentOnly,
    bodyweightOnly,
    setBodyweightOnly,
    customOnly,
    setCustomOnly,
    toggleFavorite,
    addCustomExercise,
    updateExercise,
    deactivateExercise,
    reactivateExercise,
  } = useExercises()

  // Form state (shared between add and edit)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const isEditing = editingExercise !== null
  const showForm = showAddForm || isEditing
  const [formName, setFormName] = useState('')
  const [formMuscleGroup, setFormMuscleGroup] = useState('')
  const [formEquipmentType, setFormEquipmentType] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsTimed, setFormIsTimed] = useState(false)
  const [formIsCount, setFormIsCount] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function handleCancelForm() {
    setShowAddForm(false)
    setEditingExercise(null)
    setFormName('')
    setFormMuscleGroup('')
    setFormEquipmentType('')
    setFormDescription('')
    setFormIsTimed(false)
    setFormIsCount(false)
    setFormError(null)
    setFormSaving(false)
  }

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise)
    setShowAddForm(false)
    setFormName(exercise.name)
    setFormMuscleGroup(exercise.muscle_group ?? '')
    setFormEquipmentType(exercise.equipment_type ?? '')
    setFormDescription(exercise.description ?? '')
    setFormIsTimed(exercise.is_timed ?? false)
    setFormIsCount(exercise.is_count ?? false)
    setFormError(null)
  }

  async function handleSaveForm() {
    if (!formName.trim() || !formMuscleGroup) return
    setFormSaving(true)
    setFormError(null)
    try {
      if (isEditing) {
        await updateExercise(editingExercise.id, {
          name: formName.trim(),
          muscle_group: formMuscleGroup,
          equipment_type: formEquipmentType || 'other',
          description: formDescription.trim() || null,
          is_timed: formIsTimed,
          is_count: formIsCount,
        })
      } else {
        const data: NewExercise = {
          name: formName.trim(),
          muscle_group: formMuscleGroup,
          equipment_type: formEquipmentType || 'other',
          description: formDescription.trim() || undefined,
          is_timed: formIsTimed,
          is_count: formIsCount,
        }
        await addCustomExercise(data)
      }
      handleCancelForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save exercise')
      setFormSaving(false)
    }
  }

  function handleClearFilters() {
    setSearchQuery('')
    setSelectedMuscleGroups([])
    setSelectedEquipmentTypes([])
    setMyEquipmentOnly(false)
    setCustomOnly(false)
  }

  const favorites = exercises.filter((ex) => ex.is_favorite)
  const nonFavorites = exercises.filter((ex) => !ex.is_favorite)
  const hasFavorites = favorites.length > 0

  const selectClass =
    'h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground ' +
    'focus:border-[#E91E8C] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/25 ' +
    'dark:bg-[#1A1028]'

  return (
    <div className="flex flex-col h-full">

      {/* ── Header Bar ── */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 lg:gap-4">
        <h1 className="font-display text-2xl text-foreground shrink-0 uppercase tracking-wide">
          Exercise{' '}
          <span className="text-[#E91E8C] text-neon-glow">Library</span>
        </h1>

        {/* Search */}
        <div className="w-full sm:flex-1 flex items-center relative sm:max-w-md sm:ml-2 lg:ml-4">
          <Search size={14} className="absolute left-2.5 text-[#5E5278] pointer-events-none z-10" />
          <Input
            placeholder="Search exercises…"
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            className="pl-8 h-9 bg-card border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-[#5E5278] hover:text-foreground z-10"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Add Custom button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm((v) => !v)}
          className={cn(
            'w-full sm:w-auto sm:ml-auto shrink-0 gap-1.5 transition-colors',
            showAddForm && 'border-[#E91E8C] text-[#E91E8C]'
          )}
        >
          <Plus size={14} />
          Add Custom
        </Button>
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="border-b border-border bg-card px-4 lg:px-8 py-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-4">
            {isEditing ? 'Edit Exercise' : 'New Custom Exercise'}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-3 mb-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName((e.target as HTMLInputElement).value)}
                placeholder="e.g. Cable Face Pull"
                className="bg-background"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Muscle Group *</Label>
              <select
                value={formMuscleGroup}
                onChange={(e) => setFormMuscleGroup(e.target.value)}
                className={selectClass}
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
                className={selectClass}
              >
                <option value="">Select…</option>
                {EQUIPMENT_TYPES.map((eq) => (
                  <option key={eq} value={eq}>{formatLabel(eq)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
            <Input
              value={formDescription}
              onChange={(e) => setFormDescription((e.target as HTMLInputElement).value)}
              placeholder="Any notes about form, variations, etc."
              className="bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
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
                Timed exercise (log seconds instead of reps)
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
                Count exercise (log count, weight optional)
              </span>
            </label>
          </div>
          {formError && <p className="text-xs text-[#FF4D6A] mb-3">{formError}</p>}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancelForm}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveForm}
              disabled={formSaving || !formName.trim() || !formMuscleGroup}
              className="bg-[#E91E8C] text-white hover:bg-[#E91E8C]/80 disabled:opacity-50"
            >
              {formSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Exercise'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="z-10 bg-background border-b border-border px-4 lg:px-8 pt-3 pb-3 flex flex-col gap-2 sm:sticky sm:top-[73px]">
        {/* Muscle group chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {['all', ...MUSCLE_GROUPS].map((mg) => {
            const isAll = mg === 'all'
            const isActive = isAll ? selectedMuscleGroups.length === 0 : selectedMuscleGroups.includes(mg)
            return (
              <button
                key={mg}
                onClick={() => {
                  if (isAll) {
                    setSelectedMuscleGroups([])
                  } else {
                    setSelectedMuscleGroups(
                      selectedMuscleGroups.includes(mg)
                        ? selectedMuscleGroups.filter((g) => g !== mg)
                        : [...selectedMuscleGroups, mg]
                    )
                  }
                }}
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 border whitespace-nowrap',
                  isActive
                    ? 'bg-[#E91E8C] border-[#E91E8C] text-white neon-glow'
                    : 'bg-card border-border text-[#9B8FB0] hover:border-[#3D2E5C] hover:text-foreground'
                )}
              >
                {isAll ? 'All' : formatLabel(mg)}
              </button>
            )
          })}
        </div>

        {/* Equipment type chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {['all', ...EQUIPMENT_TYPES].map((eq) => {
            const isAll = eq === 'all'
            const isActive = isAll ? selectedEquipmentTypes.length === 0 : selectedEquipmentTypes.includes(eq)
            return (
              <button
                key={eq}
                onClick={() => {
                  if (isAll) {
                    setSelectedEquipmentTypes([])
                  } else {
                    setSelectedEquipmentTypes(
                      selectedEquipmentTypes.includes(eq)
                        ? selectedEquipmentTypes.filter((e) => e !== eq)
                        : [...selectedEquipmentTypes, eq]
                    )
                  }
                }}
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 border whitespace-nowrap',
                  isActive
                    ? 'bg-[#00E5FF] border-[#00E5FF] text-[#0F0A1A] cyan-glow'
                    : 'bg-card border-border text-[#9B8FB0] hover:border-[#3D2E5C] hover:text-foreground'
                )}
              >
                {isAll ? 'All Equipment' : formatLabel(eq)}
              </button>
            )
          })}
        </div>

        {/* Equipment toggle + result count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMyEquipmentOnly((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150',
                myEquipmentOnly
                  ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 cyan-glow'
                  : 'border-border text-[#5E5278] bg-card hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
              )}
            >
              <span
                className={cn(
                  'size-3.5 rounded-sm border flex items-center justify-center shrink-0',
                  myEquipmentOnly ? 'border-[#00E5FF] bg-[#00E5FF]' : 'border-[#5E5278]'
                )}
              >
                {myEquipmentOnly && <Check size={9} className="text-[#0F0A1A]" />}
              </span>
              My gym only
            </button>
            <button
              onClick={() => setBodyweightOnly((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150',
                bodyweightOnly
                  ? 'border-[#7DFFC4] text-[#7DFFC4] bg-[#7DFFC4]/10'
                  : 'border-border text-[#5E5278] bg-card hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
              )}
            >
              <span
                className={cn(
                  'size-3.5 rounded-sm border flex items-center justify-center shrink-0',
                  bodyweightOnly ? 'border-[#7DFFC4] bg-[#7DFFC4]' : 'border-[#5E5278]'
                )}
              >
                {bodyweightOnly && <Check size={9} className="text-[#0F0A1A]" />}
              </span>
              Bodyweight
            </button>
            <button
              onClick={() => setCustomOnly((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150',
                customOnly
                  ? 'border-[#9B8FB0] text-[#9B8FB0] bg-[#9B8FB0]/10'
                  : 'border-border text-[#5E5278] bg-card hover:border-[#3D2E5C] hover:text-[#9B8FB0]'
              )}
            >
              <span
                className={cn(
                  'size-3.5 rounded-sm border flex items-center justify-center shrink-0',
                  customOnly ? 'border-[#9B8FB0] bg-[#9B8FB0]' : 'border-[#5E5278]'
                )}
              >
                {customOnly && <Check size={9} className="text-[#0F0A1A]" />}
              </span>
              Custom
            </button>
          </div>

          <span className="text-xs text-[#5E5278] sm:text-right">
            {exercises.length === allExercises.length
              ? `${allExercises.length} exercises`
              : `${exercises.length} of ${allExercises.length} matching`}
          </span>
        </div>
      </div>

      {/* ── Exercise List ── */}
      <div className="flex-1 px-3 sm:px-4 lg:px-8 pb-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="font-display text-xl uppercase tracking-widest text-[#5E5278]">
              Loading…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-sm text-[#FF4D6A]">{error}</p>
          </div>
        )}

        {!loading && !error && exercises.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-[#5E5278]">
              No exercises match{searchQuery ? ` "${searchQuery}"` : ' these filters'}.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 text-xs text-[#E91E8C] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && exercises.length > 0 && (
          <>
            {hasFavorites && (
              <>
                <SectionHeader label="Favorites" />
                {favorites.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    onToggleFavorite={toggleFavorite}
                    onDeactivate={deactivateExercise}
                    onReactivate={reactivateExercise}
                    onEdit={handleEdit}
                  />
                ))}
              </>
            )}

            {nonFavorites.length > 0 && (
              <>
                {hasFavorites && <SectionHeader label="All Exercises" />}
                {nonFavorites.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    onToggleFavorite={toggleFavorite}
                    onDeactivate={deactivateExercise}
                    onReactivate={reactivateExercise}
                    onEdit={handleEdit}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
