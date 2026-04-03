import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Settings, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/formatters'
import { use5x5Workout } from '@/hooks/use5x5Workout'
import { useAbCircuit } from '@/hooks/useAbCircuit'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useExerciseTimer } from '@/hooks/useExerciseTimer'
import { supabase } from '@/lib/supabase'
import ExercisePicker from '@/components/workout/ExercisePicker'
import NumericInput from '@/components/workout/NumericInput'

// ─── Five Fixed Dots ──────────────────────────────────────────────────────────

function FiveByFiveDots({ logged }: { logged: number }) {
  return (
    <div className="flex gap-1 mt-1.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black',
            i < logged
              ? 'bg-[#7DFFC4] text-[#0F0A1A]'
              : 'bg-[#2A2040] text-[#5E5278] border border-[#3D2E5C]'
          )}
        >
          {i < logged ? '✓' : i + 1}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FiveByFiveWorkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const label = (searchParams.get('label') === 'B' ? 'B' : 'A') as 'A' | 'B'

  const {
    workoutId,
    exercises,
    activeExerciseIndex,
    setActiveExerciseIndex,
    elapsedSeconds,
    restSecondsLeft,
    status,
    error,
    startWorkout,
    logSet,
    advanceToNext,
    addExercise,
    adjustRestTimer,
    skipRestTimer,
    pauseWorkout,
    resumeWorkout,
    updateWorkingWeight,
    startAbCircuit,
    saveNotes,
    cancelWorkout,
    endWorkout,
    isPaused,
  } = use5x5Workout(label)

  const { config: abConfig } = useAbCircuit()
  const [notes, setNotes] = useState('')
  const [abRounds, setAbRounds] = useState(0)
  const [abChecked, setAbChecked] = useState<Set<string>>(new Set())

  const isMobile = useIsMobile()
  const [showPicker, setShowPicker] = useState(false)
  const [showExerciseList, setShowExerciseList] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('5')
  const { timerState, elapsedSeconds: timerSeconds, start: startTimer, pause: pauseTimer, resume: resumeTimer, stop: stopTimer, cancel: cancelTimer } = useExerciseTimer()

  const activeExercise = exercises[activeExerciseIndex] ?? null
  const isCurrentComplete = activeExercise ? activeExercise.sets.length >= 5 : false
  const nextSetNumber = Math.min((activeExercise?.sets.length ?? 0) + 1, 5)
  const isBodyweight = activeExercise?.equipment_type === 'bodyweight'
  const isTimed = activeExercise?.is_timed ?? false
  const isCount = activeExercise?.is_count ?? false

  // Progressive overload suggestion — show when all 5 sets had reps >= 5
  const allSetsSuccessful = isCurrentComplete &&
    activeExercise != null &&
    activeExercise.sets.every((s) => (s.reps ?? 0) >= 5)
  const showSuggestion = allSetsSuccessful &&
    activeExercise != null &&
    !dismissedSuggestions.has(activeExercise.exerciseId)
  const suggestedWeight = activeExercise != null && activeExercise.workingWeight != null
    ? activeExercise.workingWeight + 5
    : null

  // Pre-fill weight/reps when switching exercises
  useEffect(() => {
    if (!activeExercise) return
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1]
    if (lastSet) {
      setWeightInput(lastSet.weight_lbs != null ? String(lastSet.weight_lbs) : '')
      setRepsInput(lastSet.reps != null ? String(lastSet.reps) : '5')
    } else {
      setWeightInput(activeExercise.workingWeight != null ? String(activeExercise.workingWeight) : '')
      setRepsInput('5')
    }
    cancelTimer()
  }, [activeExerciseIndex, activeExercise?.workoutExerciseId]) // eslint-disable-line

  // Auto-populate repsInput when exercise timer stops
  useEffect(() => {
    if (timerState === 'stopped') setRepsInput(String(timerSeconds))
  }, [timerState]) // eslint-disable-line

  // Auto-advance 2s after exercise completes
  useEffect(() => {
    if (!isCurrentComplete || status !== 'active') return
    const t = setTimeout(() => advanceToNext(), 2000)
    return () => clearTimeout(t)
  }, [isCurrentComplete, activeExerciseIndex, status]) // eslint-disable-line

  // Navigate home when workout ends
  useEffect(() => {
    if (status === 'ended') navigate('/')
  }, [status, navigate])

  async function handleAbDone() {
    if (workoutId && abRounds > 0) {
      await supabase.from('ab_circuit_logs').insert({ workout_id: workoutId, rounds_completed: abRounds })
    }
    await endWorkout()
  }

  async function handleLogSet() {
    if (!activeExercise) return
    const weight = weightInput !== '' ? parseFloat(weightInput) : null
    const reps = repsInput !== '' ? parseInt(repsInput, 10) : null
    await logSet(
      activeExercise.workoutExerciseId,
      isNaN(weight as number) ? null : weight,
      isNaN(reps as number) ? null : reps
    )
    cancelTimer()
  }

  const alreadyAddedIds = exercises.map((ex) => ex.exerciseId)
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight_lbs ?? 0) * (set.reps ?? 0), 0),
    0
  )

  if (error) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[#FF4D6A] text-sm">{error}</p>
    </div>
  )

  if (status === 'loading') return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[#5E5278] font-display text-lg uppercase tracking-widest">Loading…</p>
    </div>
  )

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">

      {/* ── Left Pane ── */}
      <div className={cn(
        'w-full lg:w-80 lg:shrink-0 border-r border-border bg-card flex flex-col',
        isMobile && !showExerciseList && 'hidden'
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">
            5×5 {label}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn('weight-number text-sm', status === 'active' && !isPaused ? 'text-[#00E5FF]' : status === 'active' && isPaused ? 'text-[#5E5278]' : 'text-[#3D2E5C]')}>
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={() => navigate('/workout/5x5/setup')}
              className="p-1.5 rounded-lg text-[#3D2E5C] hover:text-[#9B8FB0] hover:bg-[#241838] transition-colors"
              title="Configure 5×5"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {exercises.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-[#5E5278]">No exercises configured.</p>
            </div>
          )}

          {exercises.map((ex, i) => {
            const isActive = i === activeExerciseIndex
            const done = ex.sets.length >= 5
            return (
              <div
                key={ex.workoutExerciseId}
                onClick={() => { setActiveExerciseIndex(i); setShowPicker(false); setShowExerciseList(false) }}
                className={cn(
                  'p-4 rounded-xl mb-1.5 cursor-pointer transition-all duration-150 border-l-2',
                  isActive
                    ? 'bg-[#241838] border-[#E91E8C]'
                    : done
                      ? 'border-[#7DFFC4]/40 hover:bg-[#1A1028]/80'
                      : 'border-transparent hover:bg-[#1A1028]/80'
                )}
                style={isActive ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
              >
                <div className={cn(
                  'text-sm font-semibold pr-2 truncate',
                  done ? 'text-[#7DFFC4]' : isActive ? 'text-foreground' : 'text-[#9B8FB0]'
                )}>
                  {done && <span className="mr-1.5">✓</span>}
                  {ex.name}
                </div>
                <FiveByFiveDots logged={ex.sets.length} />
              </div>
            )
          })}

          {/* Ad-hoc add */}
          {(status === 'active' || status === 'complete') && (
            <button
              onClick={() => setShowPicker(true)}
              className="w-full py-3 rounded-xl border border-dashed border-[#3D2E5C] text-[#5E5278] text-sm font-semibold uppercase tracking-wider mt-1 transition-all hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/5"
            >
              + Add Exercise
            </button>
          )}

          {/* AB CIRCUIT row */}
          {(status === 'complete' || status === 'ab_circuit') && (
            <div
              className={cn(
                'p-4 rounded-xl mt-1.5 border-l-2 transition-all duration-150',
                status === 'ab_circuit'
                  ? 'bg-[#0F1F1A] border-[#7DFFC4]'
                  : 'border-transparent'
              )}
              style={status === 'ab_circuit' ? { boxShadow: 'inset 0 0 20px rgba(125,255,196,0.06)' } : {}}
            >
              <div className={cn(
                'text-[11px] font-black uppercase tracking-[0.2em]',
                status === 'ab_circuit' ? 'text-[#7DFFC4]' : 'text-[#3D2E5C]'
              )}>
                Ab Circuit
              </div>
              {abRounds > 0 && (
                <div className="text-[10px] text-[#7DFFC4] mt-1 font-bold">
                  {abRounds} round{abRounds !== 1 ? 's' : ''} done
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start / End button */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          {status === 'planning' ? (
            <button
              onClick={startWorkout}
              className="w-full py-3 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow-strong transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Start Workout
            </button>
          ) : status === 'complete' || status === 'ab_circuit' ? (
            null
          ) : confirmEnd ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => { await endWorkout() }}
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

      {/* ── Right Pane ── */}
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

          {/* Mobile: switch exercise button */}
          {isMobile && status === 'active' && activeExercise && (
            <button
              onClick={() => setShowExerciseList(true)}
              className="lg:hidden mb-3 text-xs font-semibold text-[#9B8FB0] hover:text-foreground transition-colors"
            >
              ← Exercises
            </button>
          )}

          {/* Planning state — exercise preview */}
          {status === 'planning' && (
            <div className="max-w-2xl">
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] mb-2 text-neon-glow">
                5×5 Workout {label}
              </div>
              <h1
                className="font-display text-4xl uppercase leading-tight mb-8"
                style={{ background: 'linear-gradient(135deg, #F0EAF4 0%, #E91E8C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Ready to lift?
              </h1>

              {exercises.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#5E5278] text-sm mb-4">No exercises configured for Workout {label}.</p>
                  <button
                    onClick={() => navigate('/workout/5x5/setup')}
                    className="px-6 py-3 rounded-xl border-2 border-[#E91E8C] text-[#E91E8C] font-black uppercase tracking-[0.15em] text-sm neon-glow transition-all hover:bg-[#E91E8C]/10"
                  >
                    Go to Setup
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-8">
                    {exercises.map((ex) => (
                      <div key={ex.workoutExerciseId} className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4">
                        <div>
                          <div className="text-sm font-bold text-foreground">{ex.name}</div>
                          <div className="text-[11px] text-[#5E5278] mt-0.5">5 sets × 5 reps</div>
                        </div>
                        {ex.workingWeight != null && (
                          <div className="text-right">
                            <div className="weight-number text-xl font-black text-[#00E5FF]">{ex.workingWeight}</div>
                            <div className="text-[10px] text-[#5E5278]">lbs</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={startWorkout}
                    className="w-full py-4 rounded-xl bg-[#E91E8C] text-white font-black uppercase tracking-[0.2em] text-sm neon-glow-strong transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Start Workout
                  </button>
                </>
              )}
            </div>
          )}

          {/* Workout complete screen */}
          {status === 'complete' && (
            <div className="h-full flex flex-col items-center justify-center gap-8">
              <div className="text-7xl">💪</div>
              <h1
                className="font-display text-5xl uppercase text-center leading-tight"
                style={{ background: 'linear-gradient(135deg, #7DFFC4 0%, #00E5FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Workout<br />Complete!
              </h1>
              <div className="flex gap-8 text-center">
                <div>
                  <div className="weight-number text-4xl font-black text-[#E91E8C]">{totalSets}</div>
                  <div className="text-xs text-[#5E5278] uppercase tracking-wider mt-1">Sets Logged</div>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <div className="weight-number text-4xl font-black text-[#00E5FF]">{totalVolume.toLocaleString()}</div>
                  <div className="text-xs text-[#5E5278] uppercase tracking-wider mt-1">Total Volume (lbs)</div>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveNotes(notes)}
                placeholder="How did it feel? Anything to remember…"
                rows={3}
                className="w-72 bg-card border border-[#3D2E5C] rounded-xl px-4 py-3 text-sm text-foreground resize-none outline-none focus:border-[#E91E8C] transition-colors placeholder:text-[#3D2E5C]"
              />

              <div className="flex flex-col items-center gap-3 w-72">
                {abConfig.length > 0 ? (
                  <button
                    onClick={startAbCircuit}
                    className="w-full py-4 rounded-xl border-2 border-[#00E5FF] text-[#00E5FF] font-black uppercase tracking-[0.15em] text-sm cyan-glow transition-all hover:bg-[#00E5FF]/10 active:scale-[0.98]"
                  >
                    Start Ab Circuit
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/workout/5x5/setup?tab=ab')}
                    className="w-full py-4 rounded-xl border-2 border-[#00E5FF] text-[#00E5FF] font-black uppercase tracking-[0.15em] text-sm cyan-glow transition-all hover:bg-[#00E5FF]/10 active:scale-[0.98]"
                  >
                    Configure Ab Circuit →
                  </button>
                )}
                <button
                  onClick={async () => { await endWorkout() }}
                  className="w-full py-4 rounded-xl border border-[#3D2E5C] text-[#5E5278] font-black uppercase tracking-[0.15em] text-sm transition-all hover:text-[#9B8FB0] hover:border-[#5E5278]"
                >
                  Skip — End Workout
                </button>
              </div>
            </div>
          )}

          {/* Ab circuit screen */}
          {status === 'ab_circuit' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#7DFFC4] mb-2">
                  Ab Circuit
                </div>
                <h1
                  className="font-display text-4xl uppercase leading-tight"
                  style={{ background: 'linear-gradient(135deg, #7DFFC4 0%, #00E5FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  Round {abRounds + 1}
                </h1>
              </div>

              {abConfig.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#5E5278] text-sm mb-6">No ab exercises configured.</p>
                  <button
                    onClick={handleAbDone}
                    className="px-10 py-4 rounded-xl border-2 border-[#00E5FF] text-[#00E5FF] font-black uppercase tracking-[0.15em] text-sm cyan-glow transition-all hover:bg-[#00E5FF]/10"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Exercise checklist */}
                  <div className="flex flex-col gap-2 mb-6">
                    {abConfig.map((entry) => {
                      const checked = abChecked.has(entry.id)
                      return (
                        <button
                          key={entry.id}
                          onClick={() => setAbChecked((prev) => {
                            const next = new Set(prev)
                            if (next.has(entry.id)) next.delete(entry.id)
                            else next.add(entry.id)
                            return next
                          })}
                          className={cn(
                            'flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all',
                            checked
                              ? 'bg-[#0F1F1A] border-[#7DFFC4]/50'
                              : 'bg-card border-border hover:border-[#3D2E5C]'
                          )}
                        >
                          <div className={cn(
                            'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 text-xs font-black transition-all',
                            checked
                              ? 'bg-[#7DFFC4] border-[#7DFFC4] text-[#0F0A1A]'
                              : 'border-[#3D2E5C] text-transparent'
                          )}>
                            ✓
                          </div>
                          <span className={cn(
                            'text-sm font-semibold transition-all',
                            checked ? 'text-[#7DFFC4] line-through decoration-[#7DFFC4]/50' : 'text-foreground'
                          )}>
                            {entry.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Complete round */}
                  <button
                    onClick={() => {
                      setAbRounds((r) => r + 1)
                      setAbChecked(new Set())
                    }}
                    disabled={abChecked.size < abConfig.length}
                    className="w-full py-4 rounded-xl bg-[#E91E8C] text-white font-black uppercase tracking-[0.2em] text-sm mb-3 neon-glow-strong transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Complete Round
                  </button>

                  {/* Done */}
                  <button
                    onClick={handleAbDone}
                    className="w-full py-4 rounded-xl border-2 border-[#00E5FF] text-[#00E5FF] font-black uppercase tracking-[0.15em] text-sm cyan-glow transition-all hover:bg-[#00E5FF]/10 mb-3"
                  >
                    Done ({abRounds} round{abRounds !== 1 ? 's' : ''})
                  </button>

                  {/* Skip */}
                  <button
                    onClick={async () => { await endWorkout() }}
                    className="w-full py-2 text-[#5E5278] text-xs font-bold uppercase tracking-wider hover:text-[#9B8FB0] transition-colors"
                  >
                    Skip
                  </button>
                </>
              )}
            </div>
          )}

          {/* Active exercise logging */}
          {(status === 'active') && activeExercise && (
            <div className="max-w-2xl">

              {/* Title */}
              <div className="mb-6">
                <h1
                  className="font-display text-4xl uppercase leading-tight"
                  style={{ background: 'linear-gradient(135deg, #F0EAF4 0%, #E91E8C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {activeExercise.name}
                </h1>
                <p className="text-sm text-[#9B8FB0] mt-1">
                  Set <span className="text-foreground font-bold">{nextSetNumber}</span> of 5
                  {activeExercise.sets.length > 0 && (
                    <span className="text-[#5E5278]"> · {activeExercise.sets.length} logged</span>
                  )}
                </p>
              </div>

              {/* Exercise complete banner */}
              {isCurrentComplete && (
                <div
                  className="rounded-2xl p-5 mb-5"
                  style={{ backgroundColor: 'rgba(125,255,196,0.08)', border: '2px solid #7DFFC4', boxShadow: '0 0 20px rgba(125,255,196,0.15)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#7DFFC4] mb-1">
                        Exercise Complete!
                      </div>
                      <div className="text-xs text-[#5E5278]">
                        {showSuggestion ? 'All reps hit — see suggestion below.' : 'Advancing to next exercise…'}
                      </div>
                    </div>
                    <button
                      onClick={() => advanceToNext()}
                      className="px-5 py-2.5 rounded-xl bg-[#7DFFC4] text-[#0F0A1A] text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all active:scale-95"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Progressive overload suggestion */}
                  {showSuggestion && suggestedWeight != null && activeExercise != null && (
                    <div className="mt-4 pt-4 border-t border-[#7DFFC4]/20 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Next session: try{' '}
                          <span className="weight-number text-[#7DFFC4]">{suggestedWeight} lbs</span>
                        </div>
                        <div className="text-[11px] text-[#5E5278] mt-0.5">+5 lbs from {activeExercise.workingWeight} lbs</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            updateWorkingWeight(activeExercise.exerciseId, suggestedWeight)
                            setDismissedSuggestions((prev) => new Set(prev).add(activeExercise.exerciseId))
                          }}
                          className="px-4 py-2 rounded-xl bg-[#7DFFC4] text-[#0F0A1A] text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => setDismissedSuggestions((prev) => new Set(prev).add(activeExercise.exerciseId))}
                          className="px-4 py-2 rounded-xl border border-[#3D2E5C] text-[#9B8FB0] text-xs font-semibold hover:text-foreground transition-all"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rest timer */}
              {restSecondsLeft !== null && (
                <div
                  className="rounded-2xl p-5 mb-5"
                  style={{ backgroundColor: '#1A1028', border: '2px solid #E91E8C', boxShadow: '0 0 20px rgba(233,30,140,0.25), inset 0 0 20px rgba(233,30,140,0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">Rest</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => adjustRestTimer(-30)} className="w-12 h-12 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] transition-colors">−</button>
                      <span className="font-display text-5xl text-[#E91E8C] min-w-[130px] text-center" style={{ textShadow: '0 0 20px rgba(233,30,140,0.4)' }}>
                        {formatTime(restSecondsLeft)}
                      </span>
                      <button onClick={() => adjustRestTimer(30)} className="w-12 h-12 rounded-xl bg-[#241838] border border-[#3D2E5C] text-foreground text-xl font-bold flex items-center justify-center hover:border-[#E91E8C] transition-colors">+</button>
                    </div>
                    <button onClick={skipRestTimer} className="px-4 py-2 rounded-xl border border-[#3D2E5C] text-[#9B8FB0] text-xs font-bold uppercase tracking-wider hover:border-[#5E5278] hover:text-foreground transition-colors">Skip</button>
                  </div>
                </div>
              )}

              {/* Log set card — hidden when exercise is complete */}
              {!isCurrentComplete && (
                <div className={cn(
                  'bg-card border rounded-2xl p-7 mb-5',
                  isCount ? 'border-[#7DFFC4]/40' : isTimed ? 'border-[#00E5FF]/40' : 'border-border'
                )}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn(
                      'text-[11px] font-black uppercase tracking-[0.25em]',
                      isCount ? 'text-[#7DFFC4]' : isTimed ? 'text-[#00E5FF] text-cyan-glow' : 'text-[#00E5FF] text-cyan-glow'
                    )}>
                      Log Set {nextSetNumber} of 5
                    </div>
                    {(isCount || isTimed) && (
                      <span className={cn(
                        'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded',
                        isCount ? 'bg-[#7DFFC4]/15 text-[#7DFFC4]' : 'bg-[#00E5FF]/15 text-[#00E5FF]'
                      )}>
                        {isCount ? 'Count Mode' : 'Timed Mode'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-6 items-end flex-wrap">
                    {!isBodyweight && (
                      <NumericInput label="Weight (lbs)" value={weightInput} onChange={setWeightInput} step={5} placeholder="—" />
                    )}
                    {isTimed ? (
                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#B8AECE]">Time</label>
                        <span
                          className="font-display text-5xl min-w-[130px] text-center"
                          style={{
                            color: timerState === 'running' ? '#00E5FF' : timerState === 'paused' ? '#FFD700' : '#B8AECE',
                            textShadow: timerState === 'running' ? '0 0 20px rgba(0,229,255,0.4)' : 'none',
                          }}
                        >
                          {formatTime(timerState === 'idle' || timerState === 'running' || timerState === 'paused' ? timerSeconds : parseInt(repsInput) || 0)}
                        </span>
                        <div className="flex gap-2">
                          {timerState === 'idle' && (
                            <button onClick={startTimer} className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#0F0A1A] text-xs font-black uppercase tracking-wider transition-all hover:brightness-110">Start</button>
                          )}
                          {timerState === 'running' && (
                            <button onClick={pauseTimer} className="px-4 py-2 rounded-xl bg-[#FFD700] text-[#0F0A1A] text-xs font-black uppercase tracking-wider transition-all hover:brightness-110">Pause</button>
                          )}
                          {timerState === 'paused' && (
                            <button onClick={resumeTimer} className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#0F0A1A] text-xs font-black uppercase tracking-wider transition-all hover:brightness-110">Resume</button>
                          )}
                          {(timerState === 'running' || timerState === 'paused') && (
                            <button onClick={stopTimer} className="px-4 py-2 rounded-xl border border-[#3D2E5C] text-[#B8AECE] text-xs font-bold uppercase tracking-wider hover:border-[#8B7FA6] hover:text-foreground transition-colors">Stop</button>
                          )}
                          {timerState !== 'idle' && (
                            <button onClick={cancelTimer} className="px-4 py-2 rounded-xl border border-[#3D2E5C] text-[#FF4D6A] text-xs font-bold uppercase tracking-wider hover:border-[#FF4D6A] transition-colors">Cancel</button>
                          )}
                        </div>
                        {timerState === 'stopped' && (
                          <NumericInput label="Adjust (sec)" value={repsInput} onChange={setRepsInput} step={5} placeholder="—" />
                        )}
                      </div>
                    ) : (
                      <NumericInput label={isCount ? 'Count' : 'Reps'} value={repsInput} onChange={setRepsInput} step={1} placeholder={isCount ? '10' : '5'} />
                    )}
                    <button
                      onClick={handleLogSet}
                      className="h-16 px-8 rounded-xl bg-[#E91E8C] text-white font-black uppercase tracking-[0.2em] text-sm whitespace-nowrap neon-glow-strong transition-all hover:brightness-110 active:scale-[0.97]"
                    >
                      Log Set
                    </button>
                  </div>
                  {!isBodyweight && (
                    <button
                      onClick={() => setWeightInput('')}
                      className="mt-3 text-[11px] text-[#5E5278] hover:text-[#9B8FB0] transition-colors underline-offset-2 hover:underline"
                    >
                      Bodyweight (no weight)
                    </button>
                  )}
                </div>
              )}

              {/* Set history */}
              {activeExercise.sets.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#5E5278] mb-4">Set History</div>
                  <div className="flex flex-col gap-2">
                    {activeExercise.sets.map((set) => (
                      <div key={set.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-background border border-border">
                        <div className="w-8 h-8 rounded-lg bg-[#7DFFC4] text-[#0F0A1A] flex items-center justify-center text-xs font-black shrink-0">
                          {set.set_number}
                        </div>
                        <div className="flex-1">
                          <span className="text-base font-bold weight-number text-foreground">
                            {set.weight_lbs != null ? `${set.weight_lbs} lbs` : 'Bodyweight'}
                            {set.reps != null && <span className="text-[#9B8FB0]"> × {isCount ? `${set.reps} count` : isTimed ? `${set.reps}s` : `${set.reps} reps`}</span>}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#7DFFC4]">Complete</span>
                      </div>
                    ))}
                    {!isCurrentComplete && (
                      <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-dashed border-[#2A2040]">
                        <div className="w-8 h-8 rounded-lg bg-[#2A2040] border border-[#3D2E5C] flex items-center justify-center text-xs font-black text-[#5E5278] shrink-0">
                          {nextSetNumber}
                        </div>
                        <span className="text-sm text-[#5E5278]">—</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
