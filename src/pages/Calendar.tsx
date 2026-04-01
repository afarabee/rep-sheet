import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Dumbbell, Zap, LayoutTemplate, CalendarPlus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useCalendarData } from '@/hooks/useCalendarData'
import { scheduleWorkout, removeScheduledWorkout } from '@/hooks/useScheduledWorkouts'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileBackButton from '@/components/layout/MobileBackButton'
import type { CalendarWorkout, ScheduledWorkout } from '@/hooks/useCalendarData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const SCHEDULED_COLOR = '#FFD166'

function getWorkoutColor(type: string): string {
  if (type === 'five_by_five_a' || type === 'five_by_five_b') return '#E91E8C'
  if (type === 'stretch') return '#7DFFC4'
  return '#00E5FF'
}

function formatWorkoutType(type: string | null): string {
  switch (type) {
    case 'freeform': return 'Freeform'
    case 'five_by_five_a': return '5×5 A'
    case 'five_by_five_b': return '5×5 B'
    case 'template': return 'Template'
    case 'stretch': return 'Stretch'
    default: return type ?? 'Template'
  }
}

function formatDuration(started: string, completed: string | null): string | null {
  if (!completed) return null
  const mins = Math.round((new Date(completed).getTime() - new Date(started).getTime()) / 60000)
  if (mins < 1) return null
  return `${mins} min`
}

function getWorkoutRoute(type: string): string {
  if (type === 'five_by_five_a') return '/workout/5x5/active?label=A'
  if (type === 'five_by_five_b') return '/workout/5x5/active?label=B'
  return '/workout/active'
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ─── Day Cell ────────────────────────────────────────────────────────────────

function DayCell({
  day, isToday, isSelected, isTrainingDay, workouts, hasScheduled, onClick,
}: {
  day: number
  isToday: boolean
  isSelected: boolean
  isTrainingDay: boolean
  workouts: CalendarWorkout[]
  hasScheduled: boolean
  onClick: () => void
}) {
  const dotColors = [...new Set(workouts.map((w) => getWorkoutColor(w.workout_type)))]

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl h-12 transition-all duration-150',
        isSelected
          ? 'bg-[#E91E8C] text-white shadow-[0_0_12px_rgba(233,30,140,0.4)]'
          : isToday
            ? 'ring-2 ring-[#E91E8C]/60 text-foreground'
            : isTrainingDay
              ? 'bg-[#241838]/50 text-foreground'
              : 'text-[#9B8FB0] hover:bg-[#241838]/40',
      )}
    >
      <span className={cn('text-sm font-bold', isSelected && 'text-white')}>
        {day}
      </span>
      {(dotColors.length > 0 || hasScheduled) && (
        <div className="flex gap-0.5 mt-0.5">
          {dotColors.map((color) => (
            <span
              key={color}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isSelected ? '#fff' : color }}
            />
          ))}
          {hasScheduled && (
            <span
              className="w-1.5 h-1.5 rounded-full border"
              style={{
                borderColor: isSelected ? '#fff' : SCHEDULED_COLOR,
                backgroundColor: 'transparent',
              }}
            />
          )}
        </div>
      )}
    </button>
  )
}

// ─── Schedule Form ──────────────────────────────────────────────────────────

interface TemplateOption {
  id: string
  name: string
}

const SCHEDULE_TYPES = [
  { value: 'five_by_five_a', label: '5×5 A' },
  { value: 'five_by_five_b', label: '5×5 B' },
  { value: 'freeform', label: 'Freeform' },
  { value: 'template', label: 'Template' },
]

function ScheduleForm({ dateStr, onSaved, onCancel }: {
  dateStr: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [type, setType] = useState('five_by_five_a')
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadTemplates() {
      const { data } = await supabase
        .from('workout_templates')
        .select('id, name')
        .order('name', { ascending: true })
      setTemplates((data ?? []).map((t) => ({ id: t.id, name: t.name })))
    }
    loadTemplates()
  }, [])

  async function handleSave() {
    setSaving(true)
    const isTemplate = type === 'template'
    await scheduleWorkout(
      dateStr,
      isTemplate ? null : type,
      isTemplate ? templateId : null,
      notes || null,
    )
    setSaving(false)
    onSaved()
  }

  return (
    <div className="p-4 rounded-2xl bg-card border border-[#FFD166]/30">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD166]">
          Schedule Workout
        </div>
        <button onClick={onCancel} className="p-1 text-[#5E5278] hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SCHEDULE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              type === t.value
                ? 'bg-[#FFD166] text-[#0F0A1A]'
                : 'text-[#9B8FB0] border border-[#2A2040] hover:bg-[#241838]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Template picker */}
      {type === 'template' && (
        <select
          value={templateId ?? ''}
          onChange={(e) => setTemplateId(e.target.value || null)}
          className="w-full mb-3 bg-[#1A1028] border border-[#2A2040] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#FFD166]"
        >
          <option value="">Select a template…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}

      {/* Notes */}
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full mb-3 bg-[#1A1028] border border-[#2A2040] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#5E5278] focus:outline-none focus:border-[#FFD166]"
      />

      <button
        onClick={handleSave}
        disabled={saving || (type === 'template' && !templateId)}
        className="w-full py-2.5 rounded-xl bg-[#FFD166] text-[#0F0A1A] text-sm font-bold disabled:opacity-40 hover:brightness-110 transition-all"
      >
        {saving ? 'Saving…' : 'Schedule'}
      </button>
    </div>
  )
}

// ─── Day Detail Panel ────────────────────────────────────────────────────────

function DayDetail({
  day, month, year, workouts, scheduled, isTrainingDay, onScheduleChanged,
}: {
  day: number
  month: number
  year: number
  workouts: CalendarWorkout[]
  scheduled: ScheduledWorkout[]
  isTrainingDay: boolean
  onScheduleChanged: () => void
}) {
  const navigate = useNavigate()
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const dateLabel = new Date(year, month, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const dateStr = formatDateStr(year, month, day)

  async function handleRemoveScheduled(id: string) {
    await removeScheduledWorkout(id)
    onScheduleChanged()
  }

  function handleStartScheduled(s: ScheduledWorkout) {
    if (s.template_id) {
      navigate(`/workout/active?templateId=${s.template_id}`)
    } else if (s.workout_type) {
      navigate(getWorkoutRoute(s.workout_type))
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E91E8C] mb-1 text-neon-glow">
          {scheduled.length > 0 ? 'Scheduled' : isTrainingDay ? 'Training Day' : dateLabel.split(',')[0]}
        </div>
        <h2
          className="font-display text-3xl uppercase leading-tight"
          style={{
            background: 'linear-gradient(135deg, #F0EAF4 0%, #E91E8C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {dateLabel}
        </h2>
      </div>

      {/* Completed workouts */}
      {workouts.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {workouts.map((w) => {
            const duration = formatDuration(w.started_at, w.completed_at)
            const time = new Date(w.started_at).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit',
            })
            return (
              <button
                key={w.id}
                onClick={() => navigate('/history')}
                className="p-4 rounded-2xl bg-card border border-border hover:border-[#3D2E5C] transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getWorkoutColor(w.workout_type) }}
                    />
                    <span className="text-sm font-bold text-foreground">
                      {formatWorkoutType(w.workout_type)}
                    </span>
                  </div>
                  {w.completed_at ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#7DFFC4]/15 text-[#7DFFC4]">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF4D6A]/15 text-[#FF4D6A]">
                      Partial
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5E5278]">
                  <span>{time}</span>
                  {duration && (
                    <>
                      <span className="text-[#3D2E5C]">·</span>
                      <span>{duration}</span>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Scheduled workouts */}
      {scheduled.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD166]">
            Planned
          </div>
          {scheduled.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-card border border-[#FFD166]/20"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
                    style={{ borderColor: SCHEDULED_COLOR }}
                  />
                  <span className="text-sm font-bold text-foreground">
                    {s.template_name ?? formatWorkoutType(s.workout_type)}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FFD166]/15 text-[#FFD166]">
                  Planned
                </span>
              </div>
              {s.notes && (
                <p className="text-xs text-[#9B8FB0] mb-2">{s.notes}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleStartScheduled(s)}
                  className="flex-1 py-2 rounded-lg bg-[#FFD166] text-[#0F0A1A] text-xs font-bold hover:brightness-110 transition-all"
                >
                  Start
                </button>
                <button
                  onClick={() => handleRemoveScheduled(s.id)}
                  className="px-3 py-2 rounded-lg border border-[#2A2040] text-xs text-[#5E5278] hover:border-[#FF4D6A] hover:text-[#FF4D6A] transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule form */}
      {showScheduleForm && (
        <div className="mb-6">
          <ScheduleForm
            dateStr={dateStr}
            onSaved={() => { setShowScheduleForm(false); onScheduleChanged() }}
            onCancel={() => setShowScheduleForm(false)}
          />
        </div>
      )}

      {/* Action buttons */}
      {workouts.length === 0 && !showScheduleForm && (
        <div className="mt-2">
          <p className="text-sm text-[#5E5278] mb-4">
            {scheduled.length > 0 ? '' : 'No workout logged.'}
          </p>
          <div className="flex flex-col gap-2">
            {isTrainingDay && (
              <button
                onClick={() => navigate(getWorkoutRoute('five_by_five_a'))}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#E91E8C] text-white font-bold text-sm hover:bg-[#C4176F] transition-colors"
                style={{ boxShadow: '0 0 16px rgba(233,30,140,0.3)' }}
              >
                <Dumbbell size={16} />
                Start 5×5 Workout
              </button>
            )}
            <button
              onClick={() => navigate('/workout/active')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2A2040] text-sm font-semibold text-[#9B8FB0] hover:bg-[#241838] hover:text-foreground transition-colors"
            >
              <Zap size={16} />
              Start Freeform
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2A2040] text-sm font-semibold text-[#9B8FB0] hover:bg-[#241838] hover:text-foreground transition-colors"
            >
              <LayoutTemplate size={16} />
              Start from Template
            </button>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#FFD166]/30 text-sm font-semibold text-[#FFD166] hover:bg-[#FFD166]/10 transition-colors"
            >
              <CalendarPlus size={16} />
              Schedule Workout
            </button>
          </div>
        </div>
      )}

      {/* Schedule button when workouts exist but no form showing */}
      {workouts.length > 0 && !showScheduleForm && (
        <button
          onClick={() => setShowScheduleForm(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#FFD166]/30 text-sm font-semibold text-[#FFD166] hover:bg-[#FFD166]/10 transition-colors"
        >
          <CalendarPlus size={16} />
          Schedule Workout
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Calendar() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const { loading, getWorkoutsForDay, getScheduledForDay, isTrainingDay, reload } = useCalendarData(viewYear, viewMonth)
  const isMobile = useIsMobile()
  const [showDetail, setShowDetail] = useState(false)

  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth()
  const todayDate = now.getDate()

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  function goToPrevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
    setSelectedDay(null)
  }

  function goToNextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
    setSelectedDay(null)
  }

  function goToToday() {
    setViewYear(todayYear)
    setViewMonth(todayMonth)
    setSelectedDay(todayDate)
  }

  const isCurrentMonth = viewYear === todayYear && viewMonth === todayMonth

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* ── Left Pane: Calendar Grid ── */}
      <div className={cn(
        'w-full md:w-[360px] md:shrink-0 border-r border-border bg-card flex flex-col',
        isMobile && showDetail && 'hidden'
      )}>
        {/* Month header */}
        <div className="px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg text-[#5E5278] hover:bg-[#241838] hover:text-foreground transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-black uppercase tracking-wider text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg text-[#5E5278] hover:bg-[#241838] hover:text-foreground transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-[#E91E8C] hover:text-[#FF6EC7] transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_HEADERS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black uppercase tracking-wider text-[#5E5278] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <p className="text-[#5E5278] text-sm">Loading…</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayOfWeek = new Date(viewYear, viewMonth, day).getDay()
                const dayWorkouts = getWorkoutsForDay(day)
                const dayScheduled = getScheduledForDay(day)
                const isToday = isCurrentMonth && day === todayDate

                return (
                  <DayCell
                    key={day}
                    day={day}
                    isToday={isToday}
                    isSelected={selectedDay === day}
                    isTrainingDay={isTrainingDay(dayOfWeek)}
                    workouts={dayWorkouts}
                    hasScheduled={dayScheduled.length > 0}
                    onClick={() => { setSelectedDay(day); setShowDetail(true) }}
                  />
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-4 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E91E8C]" />
              <span className="text-[10px] text-[#5E5278]">5×5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
              <span className="text-[10px] text-[#5E5278]">Freeform</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7DFFC4]" />
              <span className="text-[10px] text-[#5E5278]">Stretch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border-2 border-[#FFD166]" />
              <span className="text-[10px] text-[#5E5278]">Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#241838]/50 border border-[#2A2040]" />
              <span className="text-[10px] text-[#5E5278]">Training day</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Pane: Day Detail ── */}
      <div className={cn(
        'flex-1 overflow-y-auto p-4 md:p-6 bg-radial-purple',
        isMobile && !showDetail && 'hidden'
      )}>
        {isMobile && showDetail && (
          <MobileBackButton onBack={() => setShowDetail(false)} />
        )}
        {selectedDay ? (
          <DayDetail
            day={selectedDay}
            month={viewMonth}
            year={viewYear}
            workouts={getWorkoutsForDay(selectedDay)}
            scheduled={getScheduledForDay(selectedDay)}
            isTrainingDay={isTrainingDay(new Date(viewYear, viewMonth, selectedDay).getDay())}
            onScheduleChanged={reload}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[#5E5278]">Select a day to see details.</p>
          </div>
        )}
      </div>
    </div>
  )
}
