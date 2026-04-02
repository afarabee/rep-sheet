import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActiveWorkout } from '@/hooks/useActiveWorkout'
import { useIsMobile } from '@/hooks/useIsMobile'
import ExercisePicker from '@/components/workout/ExercisePicker'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Set Dot indicator ────────────────────────────────────────────────────────

function SetDots({ count }: { count: number }) {
  // Show logged sets (mint) + 1 pending (dark)
  const dots = Array.from({ length: count + 1 }, (_, i) => i < count)
  return (
    <div className="flex gap-1 mt-1.5 flex-wrap">
      {dots.map((done, i) => (
        <div
          key={i}
          className={cn(
            'w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black',
            done
              ? 'bg-[#7DFFC4] text-[#0F0A1A]'
              : 'bg-[#2A2040] text-[#5E5278] border border-[#3D2E5C]'
          )}
        >
          {done ? '✓' : i + 1}
        </div>
      ))}
    </div>
  )
}

// ─── NumericInput ─────────────────────────────────────────────────────────────

interface NumericInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  step: number
  placeholder?: string
}

function NumericInput({ label, value, onChange, step, placeholder }: NumericInputProps) {
  function adjust(delta: number) {
    const current = parseFloat(value) || 0
    const next = Math.max(0, current + delta)
    // Preserve decimals for weight (step=5 keeps whole numbers, step=2.5 keeps .5)
    onChange(step % 1 === 0 ? String(next) : next.toFixed(1))
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9B8FB0]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjust(-step)}
          className="w-10 h-11 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-24 h-11 rounded-xl bg-background border-2 border-[#3D2E5C] text-foreground text-xl font-black text-center weight-number outline-none transition-colors focus:border-[#E91E8C]"
          style={{ caretColor: '#E91E8C' }}
          inputMode="decimal"
        />
        <button
          onClick={() => adjust(step)}
          className="w-10 h-11 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId') ?? undefined
  const {
    workoutExercises,
    activeExerciseIndex,
    setActiveExerciseIndex,
    elapsedSeconds,
    restSecondsLeft,
    status,
    error,
    addExercise,
    removeExercise,
    logSet,
    adjustRestTimer,
    skipRestTimer,
    pauseWorkout,
    resumeWorkout,
    startWorkout,
    saveNotes,
    endWorkout,
    cancelWorkout,
    isPaused,
  } = useActiveWorkout(templateId)

  const isMobile = useIsMobile()
  const [showPicker, setShowPicker] = useState(false)
  const [showExerciseList, setShowExerciseList] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [notes, setNotes] = useState('')

  const activeExercise = workoutExercises[activeExerciseIndex] ?? null

  // Carry forward weight/reps when switching exercises
  useEffect(() => {
    if (!activeExercise) return
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1]
    setWeightInput(lastSet?.weight_lbs != null ? String(lastSet.weight_lbs) : '')
    setRepsInput(lastSet?.reps != null ? String(lastSet.reps) : '')
  }, [activeExerciseIndex, activeExercise?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate away when workout ends
  useEffect(() => {
    if (status === 'ended') navigate('/')
  }, [status, navigate])

  async function handleLogSet() {
    if (!activeExercise) return
    const weight = weightInput !== '' ? parseFloat(weightInput) : null
    const reps = repsInput !== '' ? parseInt(repsInput, 10) : null
    await logSet(activeExercise.id, isNaN(weight as number) ? null : weight, isNaN(reps as number) ? null : reps)
  }

  async function handleEndWorkout() {
    await endWorkout()
  }

  const alreadyAddedIds = workoutExercises.map((ex) => ex.exercise_id)
  const nextSetNumber = (activeExercise?.sets.length ?? 0) + 1
  const isBodyweight = activeExercise?.equipment_type === 'bodyweight'
  const isTimed = activeExercise?.is_timed ?? false
  const isCount = activeExercise?.is_count ?? false

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#FF4D6A]">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">

      {/* ── Left Pane: Exercise List ── */}
      <div className={cn(
        'w-full lg:w-80 lg:shrink-0 border-r border-border bg-card flex flex-col',
        isMobile && !showExerciseList && 'hidden'
      )}>

        {/* Workout header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">
            Freeform
          </span>
          <span className={cn('weight-number text-sm', status === 'active' && !isPaused ? 'text-[#00E5FF]' : status === 'active' && isPaused ? 'text-[#5E5278]' : 'text-[#3D2E5C]')}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {workoutExercises.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-[#5E5278]">No exercises yet</p>
            </div>
          )}

          {workoutExercises.map((ex, i) => {
            const isActive = i === activeExerciseIndex
            return (
              <div
                key={ex.id}
                onClick={() => { setActiveExerciseIndex(i); setShowPicker(false); setShowExerciseList(false) }}
                className={cn(
                  'p-4 rounded-xl mb-1.5 cursor-pointer transition-all duration-150 relative group',
                  isActive
                    ? 'bg-[#241838] border-l-2 border-[#E91E8C]'
                    : 'hover:bg-[#1A1028]/80 border-l-2 border-transparent'
                )}
                style={isActive ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
              >
                <div className={cn(
                  'text-sm font-semibold pr-6 truncate',
                  isActive ? 'text-foreground' : 'text-[#9B8FB0]'
                )}>
                  {ex.name}
                </div>
                <SetDots count={ex.sets.length} />

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeExercise(ex.id) }}
                  className="absolute top-3 right-3 p-1 rounded text-[#3D2E5C] opacity-0 group-hover:opacity-100 hover:text-[#FF4D6A] transition-all"
                  aria-label="Remove exercise"
                >
                  <X size={13} />
                </button>
              </div>
            )
          })}

          {/* Add exercise button */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full py-3 rounded-xl border border-dashed border-[#3D2E5C] text-[#5E5278] text-sm font-semibold uppercase tracking-wider mt-1 transition-all hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/5"
          >
            + Add Exercise
          </button>
        </div>

        {/* Start / End workout */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          {status === 'planning' ? (
            <button
              onClick={startWorkout}
              className="w-full py-3 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow-strong transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Start Workout
            </button>
          ) : confirmEnd ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEndWorkout}
                className="w-full py-3 rounded-xl bg-[#7DFFC4] text-[#0F0A1A] text-sm font-black uppercase tracking-wider transition-all hover:brightness-105"
              >
                Save & End
              </button>
              <button
                onClick={async () => { await cancelWorkout() }}
                className="w-full py-3 rounded-xl border-2 border-[#FF4D6A] text-[#FF4D6A] text-sm font-black uppercase tracking-wider transition-all hover:bg-[#FF4D6A]/10"
              >
                Discard Workout
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                className="w-full py-2 text-[#5E5278] text-xs font-bold uppercase tracking-wider hover:text-[#9B8FB0] transition-colors"
              >
                Keep Going
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {status === 'active' && (
                <button
                  onClick={isPaused ? resumeWorkout : pauseWorkout}
                  className="w-full py-3 rounded-xl border border-[#5E5278] text-[#9B8FB0] text-sm font-black uppercase tracking-wider transition-all hover:border-[#9B8FB0] hover:text-foreground flex items-center justify-center gap-2"
                >
                  {isPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
                </button>
              )}
              <button
                onClick={() => setConfirmEnd(true)}
                className="w-full py-3 rounded-xl border-2 border-[#FF4D6A] text-[#FF4D6A] text-sm font-black uppercase tracking-wider transition-all hover:bg-[#FF4D6A]/10"
              >
                End Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Pane: Exercise Picker or Set Logging ── */}
      {showPicker ? (
        <div className={cn('flex-1 overflow-hidden', isMobile && showExerciseList && 'hidden')}>
          <ExercisePicker
            onAdd={(exerciseId, name, equipmentType, isTimed, isCount) => addExercise(exerciseId, name, equipmentType, isTimed, isCount)}
            onClose={() => setShowPicker(false)}
            alreadyAddedIds={alreadyAddedIds}
          />
        </div>
      ) : (
        <div className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 bg-radial-purple',
          isMobile && showExerciseList && 'hidden'
        )}>

          {/* Empty state */}
          {workoutExercises.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <p className="text-[#5E5278] text-sm">Add an exercise to start logging sets.</p>
              <button
                onClick={() => setShowPicker(true)}
                className="px-8 py-4 rounded-xl border-2 border-[#E91E8C] text-[#E91E8C] font-black uppercase tracking-[0.15em] text-sm neon-glow transition-all hover:bg-[#E91E8C]/10"
              >
                + Add Exercise
              </button>
            </div>
          )}

          {/* Active exercise logging */}
          {activeExercise && (
            <div className="max-w-2xl">

              {/* Mobile: switch exercise button */}
              {isMobile && (
                <button
                  onClick={() => setShowExerciseList(true)}
                  className="lg:hidden mb-3 text-xs font-semibold text-[#9B8FB0] hover:text-foreground transition-colors"
                >
                  ← Exercises
                </button>
              )}

              {/* Exercise title */}
              <div className="mb-6">
                <h1
                  className="font-display text-4xl uppercase leading-tight"
                  style={{
                    background: 'linear-gradient(135deg, #F0EAF4 0%, #E91E8C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {activeExercise.name}
                </h1>
                <p className="text-sm text-[#9B8FB0] mt-1">
                  Set <span className="text-foreground font-bold">{nextSetNumber}</span>
                  {activeExercise.sets.length > 0 && (
                    <span className="text-[#5E5278]"> · {activeExercise.sets.length} logged</span>
                  )}
                </p>
              </div>

              {/* Rest Timer */}
              {restSecondsLeft !== null && (
                <div
                  className="rounded-2xl p-5 mb-5 neon-glow"
                  style={{
                    backgroundColor: '#1A1028',
                    border: '2px solid #E91E8C',
                    boxShadow: '0 0 20px rgba(233,30,140,0.25), inset 0 0 20px rgba(233,30,140,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">
                      Rest
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => adjustRestTimer(-30)}
                        className="w-12 h-12 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] transition-colors"
                      >
                        −
                      </button>
                      <span
                        className="font-display text-5xl text-[#E91E8C] min-w-[130px] text-center"
                        style={{ textShadow: '0 0 20px rgba(233,30,140,0.4)' }}
                      >
                        {formatTime(restSecondsLeft)}
                      </span>
                      <button
                        onClick={() => adjustRestTimer(30)}
                        className="w-12 h-12 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={skipRestTimer}
                      className="px-4 py-2 rounded-xl border border-[#3D2E5C] text-[#9B8FB0] text-xs font-bold uppercase tracking-wider hover:border-[#5E5278] hover:text-foreground transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Log Set card */}
              <div className="bg-card border border-border rounded-2xl p-7 mb-5">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#00E5FF] mb-5 text-cyan-glow">
                  Log Set {nextSetNumber}
                </div>

                <div className="flex gap-6 items-end">
                  {!isBodyweight && (
                    <NumericInput
                      label="Weight (lbs)"
                      value={weightInput}
                      onChange={setWeightInput}
                      step={5}
                      placeholder="—"
                    />
                  )}
                  <NumericInput
                    label={isCount ? 'Count' : isTimed ? 'Time (sec)' : 'Reps'}
                    value={repsInput}
                    onChange={setRepsInput}
                    step={isTimed ? 5 : 1}
                    placeholder="—"
                  />

                  {/* Log Set button */}
                  <button
                    onClick={handleLogSet}
                    className="h-11 px-6 rounded-xl bg-[#E91E8C] text-white font-black uppercase tracking-[0.2em] text-sm whitespace-nowrap neon-glow-strong transition-all hover:brightness-110 active:scale-[0.97]"
                  >
                    Log Set
                  </button>
                </div>

                {/* Bodyweight toggle — hidden for bodyweight exercises */}
                {!isBodyweight && (
                  <button
                    onClick={() => setWeightInput('')}
                    className="mt-3 text-[11px] text-[#5E5278] hover:text-[#9B8FB0] transition-colors underline-offset-2 hover:underline"
                  >
                    Bodyweight (no weight)
                  </button>
                )}
              </div>

              {/* Set History */}
              {activeExercise.sets.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#5E5278] mb-4">
                    Set History
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeExercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-background border border-border"
                      >
                        {/* Set number dot */}
                        <div className="w-8 h-8 rounded-lg bg-[#7DFFC4] text-[#0F0A1A] flex items-center justify-center text-xs font-black shrink-0">
                          {set.set_number}
                        </div>

                        {/* Weight × reps */}
                        <div className="flex-1">
                          <span className="text-base font-bold weight-number text-foreground">
                            {set.weight_lbs != null
                              ? `${set.weight_lbs} lbs`
                              : 'Bodyweight'}
                            {set.reps != null && (
                              <span className="text-[#9B8FB0]"> × {isCount ? `${set.reps} count` : isTimed ? `${set.reps}s` : `${set.reps} reps`}</span>
                            )}
                          </span>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-[#7DFFC4]">
                          Complete
                        </span>
                      </div>
                    ))}

                    {/* Pending next set slot */}
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-dashed border-[#2A2040]">
                      <div className="w-8 h-8 rounded-lg bg-[#2A2040] border border-[#3D2E5C] flex items-center justify-center text-xs font-black text-[#5E5278] shrink-0">
                        {nextSetNumber}
                      </div>
                      <span className="text-sm text-[#5E5278]">—</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Notes */}
              <div className="bg-card border border-border rounded-2xl p-5 mt-5">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#5E5278] mb-3">
                  Session Notes
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => saveNotes(notes)}
                  placeholder="How did it feel? Anything to remember..."
                  rows={3}
                  className="w-full bg-background border border-[#3D2E5C] rounded-xl px-4 py-3 text-sm text-foreground resize-none outline-none focus:border-[#E91E8C] transition-colors placeholder:text-[#3D2E5C]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
