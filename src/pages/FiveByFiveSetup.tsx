import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronUp, ChevronDown, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { use5x5Config } from '@/hooks/use5x5Config'
import { useAbCircuit } from '@/hooks/useAbCircuit'
import ExercisePicker from '@/components/workout/ExercisePicker'

type Tab = 'A' | 'B' | 'ab'

export default function FiveByFiveSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'ab' ? 'ab' : 'A'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab as Tab)
  const [showPicker, setShowPicker] = useState(false)

  const { configA, configB, loading: loadingAB, addExercise: addABExercise, removeExercise, setWorkingWeight, reorderExercise } = use5x5Config()
  const { config: abConfig, loading: loadingAb, addExercise: addAbExercise, removeExercise: removeAbExercise, reorderExercise: reorderAbExercise } = useAbCircuit()

  const isAbTab = activeTab === 'ab'
  const config5x5 = activeTab === 'A' ? configA : activeTab === 'B' ? configB : []
  const loading = isAbTab ? loadingAb : loadingAB

  const alreadyAddedIds = isAbTab
    ? abConfig.map((e) => e.exercise_id)
    : config5x5.map((e) => e.exercise_id)

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0 bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-[#5E5278] hover:text-foreground hover:bg-[#241838] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-xl uppercase tracking-wide text-foreground">
            <span className="text-[#E91E8C] text-neon-glow">5×5</span> Setup
          </h1>
        </div>
        {!isAbTab && (
          <button
            onClick={() => navigate(`/workout/5x5/active?label=${activeTab}`)}
            disabled={config5x5.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-[0.15em] neon-glow-strong transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save & Start {activeTab}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 bg-card">
        {(['A', 'B', 'ab'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowPicker(false) }}
            className={cn(
              'flex-1 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all',
              activeTab === tab
                ? 'text-[#E91E8C] border-b-2 border-[#E91E8C]'
                : 'text-[#5E5278] hover:text-[#9B8FB0]'
            )}
          >
            {tab === 'ab' ? 'Ab Circuit' : `Workout ${tab}`}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Config list */}
        <div className={cn(
          'flex-1 overflow-y-auto p-4 sm:p-6 bg-radial-purple',
          showPicker && 'hidden lg:block'
        )}>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-[#5E5278] text-sm font-display uppercase tracking-widest">Loading…</p>
            </div>
          )}

          {/* Ab Circuit tab */}
          {!loading && isAbTab && (
            <>
              {abConfig.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-5">
                  <p className="text-[#5E5278] text-sm">No ab exercises configured.</p>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="px-8 py-3 rounded-xl border-2 border-[#E91E8C] text-[#E91E8C] font-black uppercase tracking-[0.15em] text-sm neon-glow transition-all hover:bg-[#E91E8C]/10"
                  >
                    + Add Exercise
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl flex flex-col gap-3">
                  {abConfig.map((entry, i) => (
                    <div
                      key={entry.id}
                      className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex flex-row sm:flex-col gap-1 shrink-0">
                        <button
                          onClick={() => reorderAbExercise(entry.id, 'up')}
                          disabled={i === 0}
                          className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => reorderAbExercise(entry.id, 'down')}
                          disabled={i === abConfig.length - 1}
                          className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{entry.name}</div>
                        <div className="text-[11px] text-[#5E5278] mt-0.5">Ab circuit exercise</div>
                      </div>
                      <button
                        onClick={() => removeAbExercise(entry.id)}
                        className="p-1.5 rounded-lg text-[#3D2E5C] hover:text-[#FF4D6A] hover:bg-[#FF4D6A]/10 transition-all shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPicker(true)}
                    className="w-full py-3 rounded-xl border border-dashed border-[#3D2E5C] text-[#5E5278] text-sm font-semibold uppercase tracking-wider transition-all hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/5"
                  >
                    + Add Exercise
                  </button>
                </div>
              )}
            </>
          )}

          {/* Workout A / B tab */}
          {!loading && !isAbTab && config5x5.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-5">
              <p className="text-[#5E5278] text-sm">No exercises configured for Workout {activeTab}.</p>
              <button
                onClick={() => setShowPicker(true)}
                className="px-8 py-3 rounded-xl border-2 border-[#E91E8C] text-[#E91E8C] font-black uppercase tracking-[0.15em] text-sm neon-glow transition-all hover:bg-[#E91E8C]/10"
              >
                + Add Exercise
              </button>
            </div>
          )}

          {!loading && !isAbTab && config5x5.length > 0 && (
            <div className="max-w-2xl flex flex-col gap-3">
              {config5x5.map((entry, i) => (
                <div
                  key={entry.id}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex flex-row sm:flex-col gap-1 shrink-0">
                    <button
                      onClick={() => reorderExercise(activeTab as 'A' | 'B', entry.id, 'up')}
                      disabled={i === 0}
                      className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => reorderExercise(activeTab as 'A' | 'B', entry.id, 'down')}
                      disabled={i === config5x5.length - 1}
                      className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{entry.name}</div>
                    <div className="text-[11px] text-[#5E5278] mt-0.5">5 sets × 5 reps</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <label className="text-[11px] text-[#9B8FB0] uppercase tracking-wider">Weight</label>
                    <input
                      type="number"
                      defaultValue={entry.working_weight ?? ''}
                      placeholder="—"
                      onBlur={(e) => {
                        const val = e.target.value.trim()
                        setWorkingWeight(entry.exercise_id, val ? parseFloat(val) : null)
                      }}
                      className="w-20 h-9 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center weight-number outline-none focus:border-[#E91E8C] transition-colors"
                      inputMode="decimal"
                    />
                    <span className="text-[11px] text-[#5E5278]">lbs</span>
                  </div>
                  <button
                    onClick={() => removeExercise(entry.id, activeTab as 'A' | 'B')}
                    className="p-1.5 rounded-lg text-[#3D2E5C] hover:text-[#FF4D6A] hover:bg-[#FF4D6A]/10 transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowPicker(true)}
                className="w-full py-3 rounded-xl border border-dashed border-[#3D2E5C] text-[#5E5278] text-sm font-semibold uppercase tracking-wider transition-all hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/5"
              >
                + Add Exercise
              </button>
            </div>
          )}
        </div>

        {/* Exercise picker panel */}
        {showPicker && (
          <div className="w-full lg:w-96 lg:shrink-0 border-t lg:border-t-0 lg:border-l border-border overflow-hidden">
            <ExercisePicker
              onAdd={(exerciseId, name) => {
                if (isAbTab) {
                  addAbExercise(exerciseId, name)
                } else {
                  addABExercise(activeTab as 'A' | 'B', exerciseId, name)
                }
              }}
              onClose={() => setShowPicker(false)}
              alreadyAddedIds={alreadyAddedIds}
            />
          </div>
        )}
      </div>
    </div>
  )
}
