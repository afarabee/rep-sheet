import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTemplates } from '@/hooks/useTemplates'
import ExercisePicker from '@/components/workout/ExercisePicker'

interface DraftExercise {
  key: number           // local-only identity for list operations
  exercise_id: string
  name: string
  prescribed_sets: number | null
  prescribed_reps: number | null
}

// ─── Left pane: template list card ────────────────────────────────────────────

function TemplateCard({
  name, exerciseCount, isSelected, onClick, onDelete,
}: {
  name: string
  exerciseCount: number
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl mb-1.5 cursor-pointer transition-all duration-150 border-l-2 group relative',
        isSelected
          ? 'bg-[#241838] border-[#E91E8C]'
          : 'border-transparent hover:bg-[#1A1028]/80'
      )}
      style={isSelected ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
    >
      <div className={cn('text-sm font-bold pr-6 truncate', isSelected ? 'text-foreground' : 'text-[#9B8FB0]')}>
        {name}
      </div>
      <div className="text-[11px] text-[#5E5278] mt-0.5">
        {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-3 right-3 p-1 rounded text-[#3D2E5C] opacity-0 group-hover:opacity-100 hover:text-[#FF4D6A] transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Templates() {
  const navigate = useNavigate()
  const [showPicker, setShowPicker] = useState(false)

  // Draft state — local only, nothing touches DB until Save
  const [draftName, setDraftName] = useState('')
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([])
  const [draftKey, setDraftKey] = useState(0)  // incrementing key for list identity

  const {
    templates,
    loading,
    selectedId,
    setSelectedId,
    detail,
    detailLoading,
    creating,
    setCreating,
    saveNewTemplate,
    renameTemplate,
    deleteTemplate,
    addExercise,
    removeExercise,
    updatePrescription,
    reorderExercise,
  } = useTemplates()

  function handleStartCreating() {
    setCreating(true)
    setSelectedId(null)
    setDraftName('')
    setDraftExercises([])
    setShowPicker(false)
  }

  function handleCancelCreate() {
    setCreating(false)
    setDraftName('')
    setDraftExercises([])
    setShowPicker(false)
  }

  async function handleSaveTemplate() {
    if (!draftName.trim()) return
    const id = await saveNewTemplate(draftName.trim(), draftExercises)
    setDraftName('')
    setDraftExercises([])
    setCreating(false)
    setShowPicker(false)
    if (id) setSelectedId(id)
  }

  // Draft exercise operations (local only)
  function draftAddExercise(exerciseId: string, name: string) {
    const key = draftKey
    setDraftKey((k) => k + 1)
    setDraftExercises((prev) => [...prev, { key, exercise_id: exerciseId, name, prescribed_sets: 3, prescribed_reps: null }])
  }

  function draftRemoveExercise(key: number) {
    setDraftExercises((prev) => prev.filter((e) => e.key !== key))
  }

  function draftReorder(key: number, direction: 'up' | 'down') {
    setDraftExercises((prev) => {
      const idx = prev.findIndex((e) => e.key === key)
      if (idx === -1) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  function draftUpdatePrescription(key: number, sets: number | null, reps: number | null) {
    setDraftExercises((prev) =>
      prev.map((e) => e.key === key ? { ...e, prescribed_sets: sets, prescribed_reps: reps } : e)
    )
  }

  const alreadyAddedIds = creating
    ? draftExercises.map((e) => e.exercise_id)
    : detail?.exercises.map((e) => e.exercise_id) ?? []

  return (
    <div className="h-full flex flex-row overflow-hidden">

      {/* ── Left Pane ── */}
      <div className="w-80 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">
            Templates
          </span>
          {!creating && (
            <button
              onClick={handleStartCreating}
              className="text-[11px] font-black uppercase tracking-wider text-[#5E5278] hover:text-[#E91E8C] transition-colors"
            >
              + New
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loading && (
            <div className="py-16 flex items-center justify-center">
              <p className="text-[#5E5278] text-sm font-display uppercase tracking-widest">Loading…</p>
            </div>
          )}

          {!loading && templates.length === 0 && !creating && (
            <div className="py-12 text-center">
              <p className="text-sm text-[#5E5278]">No templates yet.</p>
              <button
                onClick={handleStartCreating}
                className="mt-3 text-xs text-[#E91E8C] hover:underline"
              >
                Create your first template →
              </button>
            </div>
          )}

          {!loading && templates.map((t) => (
            <TemplateCard
              key={t.id}
              name={t.name}
              exerciseCount={t.exercise_count}
              isSelected={t.id === selectedId}
              onClick={() => { setSelectedId(t.id); setCreating(false); setShowPicker(false) }}
              onDelete={() => deleteTemplate(t.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Right Pane ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Detail / create area */}
        <div className="flex-1 overflow-y-auto p-6 bg-radial-purple">

          {/* Empty state */}
          {!selectedId && !creating && (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <p className="text-sm text-[#5E5278]">Select a template or create a new one.</p>
              <button
                onClick={handleStartCreating}
                className="px-8 py-3 rounded-xl border-2 border-[#E91E8C] text-[#E91E8C] font-black uppercase tracking-[0.15em] text-sm neon-glow transition-all hover:bg-[#E91E8C]/10"
              >
                + New Template
              </button>
            </div>
          )}

          {/* ── Create new template (draft — nothing saved until Save) ── */}
          {creating && (
            <div className="max-w-2xl">
              {/* Header with name input + Save/Cancel */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] mb-1 text-neon-glow">
                    New Template
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTemplate() }}
                    placeholder="Template name…"
                    className="font-display text-3xl uppercase text-foreground bg-transparent outline-none border-b-2 border-[#3D2E5C] focus:border-[#E91E8C] w-full transition-colors pb-1 placeholder:text-[#3D2E5C]"
                  />
                </div>
                <div className="flex gap-2 shrink-0 mt-6">
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!draftName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow-strong transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    className="px-4 py-2.5 rounded-xl border border-border text-[#9B8FB0] text-sm font-semibold hover:text-foreground hover:border-[#3D2E5C] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Draft exercise list */}
              {draftExercises.length === 0 && (
                <div className="py-10 text-center border border-dashed border-[#3D2E5C] rounded-2xl mb-4">
                  <p className="text-sm text-[#5E5278]">No exercises yet.</p>
                  <button
                    onClick={() => setShowPicker(true)}
                    className="mt-2 text-xs text-[#E91E8C] hover:underline"
                  >
                    Add exercises →
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 mb-4">
                {draftExercises.map((ex, i) => (
                  <div key={ex.key} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => draftReorder(ex.key, 'up')}
                        disabled={i === 0}
                        className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => draftReorder(ex.key, 'down')}
                        disabled={i === draftExercises.length - 1}
                        className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{ex.name}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-[#9B8FB0]">
                      <input
                        type="number"
                        defaultValue={ex.prescribed_sets ?? ''}
                        placeholder="—"
                        onBlur={(e) => {
                          const val = e.target.value.trim()
                          draftUpdatePrescription(ex.key, val ? parseInt(val) : null, ex.prescribed_reps)
                        }}
                        className="w-12 h-8 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center outline-none focus:border-[#E91E8C] transition-colors"
                        inputMode="numeric"
                      />
                      <span>sets</span>
                      <span className="text-[#3D2E5C]">×</span>
                      <input
                        type="number"
                        defaultValue={ex.prescribed_reps ?? ''}
                        placeholder="—"
                        onBlur={(e) => {
                          const val = e.target.value.trim()
                          draftUpdatePrescription(ex.key, ex.prescribed_sets, val ? parseInt(val) : null)
                        }}
                        className="w-12 h-8 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center outline-none focus:border-[#E91E8C] transition-colors"
                        inputMode="numeric"
                      />
                      <span>reps</span>
                    </div>
                    <button
                      onClick={() => draftRemoveExercise(ex.key)}
                      className="p-1.5 rounded-lg text-[#3D2E5C] hover:text-[#FF4D6A] hover:bg-[#FF4D6A]/10 transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {draftExercises.length > 0 && (
                <button
                  onClick={() => setShowPicker(true)}
                  className="w-full py-3 rounded-xl border border-dashed border-[#3D2E5C] text-[#5E5278] text-sm font-semibold uppercase tracking-wider transition-all hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#E91E8C]/5"
                >
                  + Add Exercise
                </button>
              )}
            </div>
          )}

          {/* ── Existing template detail (auto-saves) ── */}
          {selectedId && !creating && (
            <>
              {detailLoading && (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[#5E5278] text-sm font-display uppercase tracking-widest">Loading…</p>
                </div>
              )}

              {!detailLoading && detail && (
                <div className="max-w-2xl">
                  <div className="flex items-start justify-between mb-6 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] mb-1 text-neon-glow">
                        Template
                      </div>
                      <input
                        type="text"
                        defaultValue={detail.name}
                        onBlur={(e) => {
                          const val = e.target.value.trim()
                          if (val && val !== detail.name) renameTemplate(detail.id, val)
                        }}
                        className="font-display text-3xl uppercase text-foreground bg-transparent outline-none border-b-2 border-transparent focus:border-[#E91E8C] w-full transition-colors pb-1"
                      />
                    </div>
                    <button
                      onClick={() => navigate(`/workout/active?templateId=${detail.id}`)}
                      disabled={detail.exercises.length === 0}
                      className="shrink-0 px-6 py-3 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-wider neon-glow-strong transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Start Workout
                    </button>
                  </div>

                  {detail.exercises.length === 0 && (
                    <div className="py-10 text-center border border-dashed border-[#3D2E5C] rounded-2xl mb-4">
                      <p className="text-sm text-[#5E5278]">No exercises yet.</p>
                      <button
                        onClick={() => setShowPicker(true)}
                        className="mt-2 text-xs text-[#E91E8C] hover:underline"
                      >
                        Add exercises →
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mb-4">
                    {detail.exercises.map((ex, i) => (
                      <div key={ex.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => reorderExercise(ex.id, 'up')}
                            disabled={i === 0}
                            className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => reorderExercise(ex.id, 'down')}
                            disabled={i === detail.exercises.length - 1}
                            className="p-1 rounded text-[#3D2E5C] hover:text-[#9B8FB0] disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">{ex.name}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-[#9B8FB0]">
                          <input
                            type="number"
                            defaultValue={ex.prescribed_sets ?? ''}
                            placeholder="—"
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              updatePrescription(ex.id, val ? parseInt(val) : null, ex.prescribed_reps)
                            }}
                            className="w-12 h-8 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center outline-none focus:border-[#E91E8C] transition-colors"
                            inputMode="numeric"
                          />
                          <span>sets</span>
                          <span className="text-[#3D2E5C]">×</span>
                          <input
                            type="number"
                            defaultValue={ex.prescribed_reps ?? ''}
                            placeholder="—"
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              updatePrescription(ex.id, ex.prescribed_sets, val ? parseInt(val) : null)
                            }}
                            className="w-12 h-8 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center outline-none focus:border-[#E91E8C] transition-colors"
                            inputMode="numeric"
                          />
                          <span>reps</span>
                        </div>
                        <button
                          onClick={() => removeExercise(ex.id)}
                          className="p-1.5 rounded-lg text-[#3D2E5C] hover:text-[#FF4D6A] hover:bg-[#FF4D6A]/10 transition-all shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

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
        </div>

        {/* Exercise picker panel */}
        {showPicker && (creating || detail) && (
          <div className="w-96 shrink-0 border-l border-border overflow-hidden">
            <ExercisePicker
              onAdd={(exerciseId, name) => {
                if (creating) {
                  draftAddExercise(exerciseId, name)
                } else if (detail) {
                  addExercise(detail.id, exerciseId, name)
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
