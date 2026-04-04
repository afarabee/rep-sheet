import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Search, LayoutTemplate, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { formatDate, formatDuration, formatWorkoutType } from '@/lib/formatters'
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileBackButton from '@/components/layout/MobileBackButton'
import ResizableLayout from '@/components/layout/ResizableLayout'
import type { WorkoutSummary, WorkoutDetail } from '@/hooks/useWorkoutHistory'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WORKOUT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'five_by_five_a', label: '5×5 A' },
  { value: 'five_by_five_b', label: '5×5 B' },
  { value: 'freeform', label: 'Freeform' },
  { value: 'template', label: 'Template' },
  { value: 'stretch', label: 'Stretch' },
]


// ─── Left pane: workout list card ─────────────────────────────────────────────

function WorkoutCard({ workout, isSelected, onClick }: {
  workout: WorkoutSummary
  isSelected: boolean
  onClick: () => void
}) {
  const duration = formatDuration(workout.started_at, workout.completed_at)
  const isComplete = !!workout.completed_at

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl mb-1.5 cursor-pointer transition-all duration-150 border-l-2',
        isSelected
          ? 'bg-[#241838] border-[#E91E8C]'
          : 'border-transparent hover:bg-[#1A1028]/80'
      )}
      style={isSelected ? { boxShadow: 'inset 0 0 20px rgba(233,30,140,0.06)' } : {}}
    >
      {/* Type + status */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          'text-sm font-bold',
          isSelected ? 'text-foreground' : 'text-[#9B8FB0]'
        )}>
          {formatWorkoutType(workout.workout_type)}
        </span>
        {isComplete ? (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
            Done
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF4D6A]/15 text-[#FF4D6A]">
            Partial
          </span>
        )}
      </div>

      {/* Date */}
      <div className="text-xs text-[#8B7FA6] mb-1">
        {formatDate(workout.started_at, { withYear: true })}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 text-[11px] text-[#5E5278]">
        <span>{workout.exercise_count} exercise{workout.exercise_count !== 1 ? 's' : ''}</span>
        {duration && (
          <>
            <span className="text-[#3D2E5C]">·</span>
            <span>{duration}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Right pane: workout detail ────────────────────────────────────────────────

function WorkoutDetailView({ detail, onDelete }: { detail: WorkoutDetail; onDelete: (id: string) => void }) {
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)
  const duration = formatDuration(detail.started_at, detail.completed_at)

  async function handleSaveAsTemplate() {
    if (!templateName.trim() || detail.exercises.length === 0) return
    setSavingTemplate(true)

    const { data, error } = await supabase
      .from('workout_templates')
      .insert({ name: templateName.trim(), notes: null })
      .select('id')
      .single()

    if (error || !data) { setSavingTemplate(false); return }

    const exercises = detail.exercises.map((ex, i) => ({
      template_id: data.id,
      exercise_id: ex.exercise_id,
      sort_order: i,
      prescribed_sets: ex.sets.length || null,
      prescribed_reps: ex.sets[0]?.reps ?? null,
    }))

    await supabase.from('workout_template_exercises').insert(exercises)
    setSavingTemplate(false)
    setShowTemplateForm(false)
    setTemplateName('')
    setTemplateSaved(true)
    setTimeout(() => setTemplateSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] mb-1 text-neon-glow">
          {formatWorkoutType(detail.workout_type)}
        </div>
        <h1
          className="font-display text-4xl uppercase leading-tight mb-2"
          style={{
            background: 'linear-gradient(135deg, #F0EAF4 0%, #E91E8C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {formatDate(detail.started_at, { withYear: true })}
        </h1>
        <div className="flex items-center gap-3 text-sm text-[#5E5278]">
          {detail.completed_at ? (
            <span className="text-[#7DFFC4] font-semibold">Complete</span>
          ) : (
            <span className="text-[#FF4D6A] font-semibold">Partial</span>
          )}
          {duration && (
            <>
              <span className="text-[#3D2E5C]">·</span>
              <span>{duration}</span>
            </>
          )}
        </div>
        {detail.notes && (
          <p className="mt-3 text-sm text-[#9B8FB0] bg-card border border-border rounded-xl px-4 py-3">
            {detail.notes}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Save as Template */}
          {detail.exercises.length > 0 && detail.workout_type !== 'stretch' && !templateSaved && (
            !showTemplateForm ? (
              <button
                onClick={() => setShowTemplateForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-[#5E5278] hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-150"
              >
                <LayoutTemplate size={12} />
                Save as Template
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveAsTemplate()}
                  placeholder="Template name"
                  autoFocus
                  className="w-40 bg-[#1A1028] border border-[#3D2E5C] rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-[#3D2E5C] focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim() || savingTemplate}
                  className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#0F0A1A] text-xs font-bold disabled:opacity-40 hover:bg-[#00C8E0] transition-colors"
                >
                  {savingTemplate ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setShowTemplateForm(false); setTemplateName('') }}
                  className="p-1.5 text-[#5E5278] hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            )
          )}
          {templateSaved && (
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7DFFC4]/30 bg-[#7DFFC4]/10 text-xs font-bold text-[#7DFFC4]"
            >
              <LayoutTemplate size={12} />
              Template saved — view →
            </button>
          )}

          {/* Delete */}
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-[#5E5278] hover:border-[#FF4D6A] hover:text-[#FF4D6A] transition-all duration-150"
            >
              <Trash2 size={12} />
              Delete Workout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onDelete(detail.id); setConfirmingDelete(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF4D6A] bg-[#FF4D6A]/10 text-xs font-bold text-[#FF4D6A] hover:bg-[#FF4D6A]/20 transition-all duration-150"
              >
                <Trash2 size={12} />
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-[#5E5278] hover:text-foreground transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercises */}
      {detail.exercises.length === 0 && (
        <p className="text-sm text-[#5E5278]">No exercises logged.</p>
      )}
      <div className="flex flex-col gap-4">
        {detail.exercises.map((ex) => (
          <div key={ex.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00E5FF] mb-3 text-cyan-glow">
              {ex.exercise_name}
            </div>

            {ex.sets.length === 0 && (
              <p className="text-xs text-[#5E5278]">No sets logged</p>
            )}

            <div className="flex flex-col gap-2">
              {ex.sets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-background border border-border"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#7DFFC4] text-[#0F0A1A] flex items-center justify-center text-xs font-black shrink-0">
                    {set.set_number}
                  </div>
                  <span className="flex-1 text-sm font-bold weight-number text-foreground">
                    {set.weight_lbs != null ? `${set.weight_lbs} lbs` : 'Bodyweight'}
                    {set.reps != null && (
                      <span className="text-[#9B8FB0] font-normal"> × {ex.is_count ? `${set.reps} count` : ex.is_timed ? `${set.reps}s` : `${set.reps} reps`}</span>
                    )}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7DFFC4]">
                    Complete
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function History() {
  const { workouts, loading, selectedId, setSelectedId, detail, detailLoading, deleteWorkout } = useWorkoutHistory()
  const isMobile = useIsMobile()
  const [showDetail, setShowDetail] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Filter workouts
  const filtered = workouts.filter((w) => {
    if (typeFilter !== 'all' && w.workout_type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchType = formatWorkoutType(w.workout_type).toLowerCase().includes(q)
      const matchDate = formatDate(w.started_at).toLowerCase().includes(q)
      const matchNotes = w.notes?.toLowerCase().includes(q)
      if (!matchType && !matchDate && !matchNotes) return false
    }
    return true
  })

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      <ResizableLayout id="history-layout" isMobile={isMobile} leftDefault={25} leftPanel={
      <div className={cn(
        'w-full h-full border-r border-border bg-card flex flex-col',
        isMobile && showDetail && 'hidden'
      )}>
        <div className="px-5 py-4 border-b border-border shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] text-neon-glow">
            History
          </span>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E5278]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#241838] border border-[#2A2040] text-xs text-foreground placeholder:text-[#5E5278] focus:outline-none focus:border-[#E91E8C]"
            />
          </div>

          {/* Type filter chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={cn(
                  'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                  typeFilter === t.value
                    ? 'bg-[#E91E8C] text-white'
                    : 'text-[#5E5278] hover:bg-[#241838] hover:text-[#9B8FB0]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loading && (
            <div className="py-16 flex items-center justify-center">
              <p className="text-[#5E5278] font-display text-sm uppercase tracking-widest">Loading…</p>
            </div>
          )}

          {!loading && workouts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#5E5278]">No workouts yet.</p>
              <p className="text-xs text-[#3D2E5C] mt-1">Complete a workout to see it here.</p>
            </div>
          )}

          {!loading && workouts.length > 0 && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#5E5278]">No matching workouts.</p>
            </div>
          )}

          {!loading && filtered.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              isSelected={w.id === selectedId}
              onClick={() => { setSelectedId(w.id); setShowDetail(true) }}
            />
          ))}
        </div>
      </div>

      } rightPanel={
      <div className={cn(
        'h-full overflow-y-auto p-4 lg:p-6 bg-radial-purple',
        isMobile && !showDetail && 'hidden'
      )}>
        {isMobile && showDetail && (
          <MobileBackButton onBack={() => setShowDetail(false)} />
        )}
        {!selectedId && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[#5E5278]">Select a workout to view details.</p>
          </div>
        )}

        {selectedId && detailLoading && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#5E5278] font-display text-sm uppercase tracking-widest">Loading…</p>
          </div>
        )}

        {selectedId && !detailLoading && detail && (
          <WorkoutDetailView detail={detail} onDelete={deleteWorkout} />
        )}
      </div>
      } />
    </div>
  )
}
