import { useState, useMemo } from 'react'
import { Target, Plus, Check, Trash2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/hooks/useGoals'
import { useExercises } from '@/hooks/useExercises'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MobileBackButton from '@/components/layout/MobileBackButton'

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  strength: { label: 'Strength', color: '#E91E8C', bg: 'rgba(233,30,140,0.12)', border: '#E91E8C' },
  body:     { label: 'Body',     color: '#00E5FF', bg: 'rgba(0,229,255,0.12)',   border: '#00E5FF' },
  free:     { label: 'Free',     color: '#9B8FB0', bg: 'rgba(155,143,176,0.12)', border: '#9B8FB0' },
} as const

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: Goal['goal_type'] }) {
  const cfg = TYPE_CONFIG[type]
  return (
    <span
      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}40` }}
    >
      {cfg.label}
    </span>
  )
}

function ProgressBar({ current, target }: { current: number | null; target: number | null }) {
  if (!target) return null
  const pct = Math.min(100, Math.round(((current ?? 0) / target) * 100))
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-[#5E5278] mb-1">
        <span>{current ?? 0} / {target}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#241838] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: '#E91E8C', boxShadow: '0 0 6px rgba(233,30,140,0.5)' }}
        />
      </div>
    </div>
  )
}

function GoalCard({
  goal,
  isSelected,
  onClick,
}: {
  goal: Goal
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3.5 border-b border-border cursor-pointer transition-colors border-l-2',
        isSelected
          ? 'border-l-[#E91E8C] bg-[#E91E8C]/5'
          : 'border-l-transparent hover:bg-[#E91E8C]/5'
      )}
    >
      <div className="flex items-start gap-2 mb-1">
        <TypeBadge type={goal.goal_type} />
        <span className="text-sm font-semibold text-foreground leading-snug flex-1">{goal.description}</span>
      </div>
      {goal.target_value && (
        <ProgressBar current={goal.current_value} target={goal.target_value} />
      )}
    </div>
  )
}

// ─── New Goal Form ───────────────────────────────────────────────────────────

function NewGoalForm({
  onSave,
  onCancel,
}: {
  onSave: (data: Omit<Goal, 'id' | 'created_at' | 'completed_at' | 'status'>) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<Goal['goal_type']>('strength')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [showExercisePicker, setShowExercisePicker] = useState(false)

  const { allExercises } = useExercises()

  const filteredExercises = useMemo(() => {
    if (!exerciseSearch.trim()) return allExercises.slice(0, 20)
    const q = exerciseSearch.toLowerCase()
    return allExercises.filter((ex) => ex.name.toLowerCase().includes(q)).slice(0, 20)
  }, [allExercises, exerciseSearch])

  const selectedExerciseName = useMemo(
    () => allExercises.find((ex) => ex.id === selectedExerciseId)?.name ?? null,
    [allExercises, selectedExerciseId]
  )

  const hasTarget = type === 'strength' || type === 'body'

  function handleSave() {
    if (!description.trim()) return
    onSave({
      goal_type: type,
      description: description.trim(),
      target_value: hasTarget && targetValue ? Number(targetValue) : null,
      current_value: currentValue ? Number(currentValue) : null,
      exercise_id: type === 'strength' ? selectedExerciseId : null,
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto">
      <div>
        <h2 className="font-display text-2xl uppercase tracking-wide text-foreground mb-1">
          New <span className="text-[#E91E8C] text-neon-glow">Goal</span>
        </h2>
        <p className="text-xs text-[#5E5278]">What are you working toward?</p>
      </div>

      {/* Type selector */}
      <div>
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
          Goal Type
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          {(['strength', 'body', 'free'] as Goal['goal_type'][]).map((t) => {
            const cfg = TYPE_CONFIG[t]
            const active = type === t
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all"
                style={{
                  borderColor: active ? cfg.border : '#3D2E5C',
                  color: active ? cfg.color : '#5E5278',
                  backgroundColor: active ? cfg.bg : 'transparent',
                }}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="goal-desc" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
          Description
        </Label>
        <Input
          id="goal-desc"
          placeholder={
            type === 'strength' ? 'e.g. Bench press 135 lbs'
            : type === 'body'   ? 'e.g. Reach 140 lbs body weight'
            :                     'e.g. Work out 4x per week'
          }
          value={description}
          onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
          className="bg-card border-border"
        />
      </div>

      {/* Exercise picker (Strength only) */}
      {type === 'strength' && (
        <div>
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
            Exercise (optional)
          </Label>
          {selectedExerciseName ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-[#E91E8C]/40 text-sm text-foreground">
                <Dumbbell size={13} className="text-[#E91E8C] shrink-0" />
                {selectedExerciseName}
              </div>
              <button
                onClick={() => { setSelectedExerciseId(null); setExerciseSearch('') }}
                className="text-xs text-[#5E5278] hover:text-foreground px-2 py-1"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Search exercises…"
                value={exerciseSearch}
                onChange={(e) => { setExerciseSearch((e.target as HTMLInputElement).value); setShowExercisePicker(true) }}
                onFocus={() => setShowExercisePicker(true)}
                className="bg-card border-border"
              />
              {showExercisePicker && filteredExercises.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-y-auto max-h-48 shadow-xl">
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onMouseDown={() => {
                        setSelectedExerciseId(ex.id)
                        setExerciseSearch('')
                        setShowExercisePicker(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-[#E91E8C]/10 border-b border-border last:border-0"
                    >
                      {ex.name}
                      {ex.muscle_group && (
                        <span className="ml-2 text-[10px] text-[#5E5278]">{ex.muscle_group}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Target + current value */}
      {hasTarget && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="goal-target" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
              Target {type === 'strength' ? '(lbs)' : type === 'body' ? '(lbs / %)' : ''}
            </Label>
            <Input
              id="goal-target"
              type="number"
              placeholder="0"
              value={targetValue}
              onChange={(e) => setTargetValue((e.target as HTMLInputElement).value)}
              className="bg-card border-border"
            />
          </div>
          <div>
            <Label htmlFor="goal-current" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
              Starting value
            </Label>
            <Input
              id="goal-current"
              type="number"
              placeholder="0"
              value={currentValue}
              onChange={(e) => setCurrentValue((e.target as HTMLInputElement).value)}
              className="bg-card border-border"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-black uppercase tracking-wider text-[#5E5278] hover:text-foreground hover:border-[#3D2E5C] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!description.trim()}
          className="flex-1 py-3 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Goal
        </button>
      </div>
    </div>
  )
}

// ─── Goal Detail ─────────────────────────────────────────────────────────────

function GoalDetail({
  goal,
  onUpdate,
  onComplete,
  onDelete,
  onClose,
}: {
  goal: Goal
  onUpdate: (id: string, fields: Partial<Goal>) => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [newCurrent, setNewCurrent] = useState(String(goal.current_value ?? ''))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { allExercises } = useExercises()

  const exerciseName = useMemo(
    () => allExercises.find((ex) => ex.id === goal.exercise_id)?.name ?? null,
    [allExercises, goal.exercise_id]
  )

  function handleUpdateCurrent() {
    const val = Number(newCurrent)
    if (!newCurrent.trim() || isNaN(val)) return
    onUpdate(goal.id, { current_value: val })
  }

  function handleDelete() {
    onDelete(goal.id)
    onClose()
  }

  const completedDate = goal.completed_at
    ? new Date(goal.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TypeBadge type={goal.goal_type} />
          {goal.status === 'completed' && (
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
              Complete
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl uppercase tracking-wide text-foreground leading-tight">
          {goal.description}
        </h2>
        {exerciseName && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Dumbbell size={12} className="text-[#5E5278]" />
            <span className="text-xs text-[#9B8FB0]">{exerciseName}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {goal.target_value && goal.status === 'active' && (
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-3">Progress</div>
          <ProgressBar current={goal.current_value} target={goal.target_value} />
        </div>
      )}

      {/* Completed note */}
      {goal.status === 'completed' && completedDate && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-[#7DFFC4]/5 border border-[#7DFFC4]/20">
          <Check size={14} className="text-[#7DFFC4] shrink-0" />
          <span className="text-sm text-[#7DFFC4]">Completed {completedDate}</span>
        </div>
      )}

      {/* Update current value */}
      {goal.target_value && goal.status === 'active' && (
        <div>
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] mb-2 block">
            Update Current Value
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              value={newCurrent}
              onChange={(e) => setNewCurrent((e.target as HTMLInputElement).value)}
              className="bg-card border-border flex-1"
              placeholder="Enter new value"
            />
            <button
              onClick={handleUpdateCurrent}
              className="px-4 py-2 rounded-xl bg-[#E91E8C] text-white text-xs font-black uppercase tracking-wider neon-glow hover:brightness-110 transition-all"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {goal.status === 'active' && (
        <button
          onClick={() => onComplete(goal.id)}
          className="w-full py-3 rounded-xl border border-[#7DFFC4]/40 text-[#7DFFC4] text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#7DFFC4]/10 transition-colors"
        >
          <Check size={14} />
          Mark as Complete
        </button>
      )}

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-black uppercase tracking-wider text-[#5E5278] hover:text-foreground hover:border-[#3D2E5C] transition-colors"
          >
            Keep
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl bg-[#FF4D6A]/20 border border-[#FF4D6A]/40 text-[#FF4D6A] text-sm font-black uppercase tracking-wider hover:bg-[#FF4D6A]/30 transition-colors"
          >
            Delete
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full py-3 rounded-xl border border-border text-sm font-black uppercase tracking-wider text-[#5E5278] flex items-center justify-center gap-2 hover:border-[#FF4D6A]/40 hover:text-[#FF4D6A] transition-colors"
        >
          <Trash2 size={13} />
          Delete Goal
        </button>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type RightPane = 'idle' | 'new_form' | 'detail'

export default function Goals() {
  const { activeGoals, completedGoals, loading, addGoal, updateGoal, completeGoal, deleteGoal } = useGoals()
  const isMobile = useIsMobile()
  const [rightPane, setRightPane] = useState<RightPane>('idle')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  function selectGoal(goal: Goal) {
    setSelectedGoal(goal)
    setRightPane('detail')
  }

  function openNewForm() {
    setSelectedGoal(null)
    setRightPane('new_form')
  }

  async function handleSave(data: Omit<Goal, 'id' | 'created_at' | 'completed_at' | 'status'>) {
    await addGoal(data)
    setRightPane('idle')
  }

  async function handleComplete(id: string) {
    await completeGoal(id)
    setSelectedGoal(null)
    setRightPane('idle')
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    setSelectedGoal(null)
    setRightPane('idle')
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left pane ── */}
      <div className={cn(
        'w-full lg:w-80 lg:shrink-0 flex flex-col border-r border-border bg-card h-full overflow-hidden',
        isMobile && rightPane !== 'idle' && 'hidden'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#5E5278]">
            Goals
          </span>
          <button
            onClick={openNewForm}
            className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#E91E8C] hover:text-[#FF6EC7] transition-colors"
          >
            <Plus size={13} />
            New
          </button>
        </div>

        {/* Goal list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-[#5E5278] font-display text-lg uppercase tracking-widest">Loading…</p>
            </div>
          )}

          {!loading && activeGoals.length === 0 && (
            <div className="py-12 px-5 text-center">
              <Target size={28} className="text-[#3D2E5C] mx-auto mb-3" />
              <p className="text-sm text-[#5E5278]">No active goals.</p>
              <button
                onClick={openNewForm}
                className="mt-3 text-xs text-[#E91E8C] hover:underline font-semibold"
              >
                + Add your first goal
              </button>
            </div>
          )}

          {!loading && activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isSelected={selectedGoal?.id === goal.id}
              onClick={() => selectGoal(goal)}
            />
          ))}

          {/* Completed section */}
          {!loading && completedGoals.length > 0 && (
            <>
              <div className="px-5 py-3 border-t border-border mt-2">
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#5E5278] hover:text-[#9B8FB0] transition-colors w-full"
                >
                  {showCompleted ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  Completed ({completedGoals.length})
                </button>
              </div>
              {showCompleted && completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={selectedGoal?.id === goal.id}
                  onClick={() => selectGoal(goal)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Right pane ── */}
      <div className={cn(
        'flex-1 overflow-y-auto bg-radial-purple',
        isMobile && rightPane === 'idle' && 'hidden'
      )}>
        {isMobile && rightPane !== 'idle' && (
          <div className="px-4 pt-3 sm:px-6 sm:pt-4">
            <MobileBackButton onBack={() => setRightPane('idle')} />
          </div>
        )}
        {rightPane === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 sm:px-10">
            <Target size={40} className="text-[#3D2E5C] mb-4" />
            <p className="text-sm text-[#5E5278] mb-6">Select a goal to view details, or add a new one.</p>
            <button
              onClick={openNewForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow hover:brightness-110 transition-all"
            >
              <Plus size={14} />
              New Goal
            </button>
          </div>
        )}

        {rightPane === 'new_form' && (
          <NewGoalForm
            onSave={handleSave}
            onCancel={() => setRightPane('idle')}
          />
        )}

        {rightPane === 'detail' && selectedGoal && (
          <GoalDetail
            key={selectedGoal.id}
            goal={activeGoals.find((g) => g.id === selectedGoal.id) ?? completedGoals.find((g) => g.id === selectedGoal.id) ?? selectedGoal}
            onUpdate={updateGoal}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onClose={() => setRightPane('idle')}
          />
        )}
      </div>
    </div>
  )
}
