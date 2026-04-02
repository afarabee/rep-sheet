import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useGoals } from '@/hooks/useGoals'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RecentWorkout {
  id: string
  date: string
  type: string
  status: 'complete' | 'partial'
  exercises: string
  duration: string | null
}

interface HomeStats {
  totalWorkouts: number | null
  bodyWeight: number | null
  bodyFatPct: number | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getWorkoutRoute(type: string): string {
  if (type === 'five_by_five_a') return '/workout/5x5/active?label=A'
  if (type === 'five_by_five_b') return '/workout/5x5/active?label=B'
  return '/workout/active'
}

function formatWorkoutType(type: string): string {
  switch (type) {
    case 'five_by_five_a': return '5×5 Workout A'
    case 'five_by_five_b': return '5×5 Workout B'
    case 'freeform':       return 'Freeform'
    case 'template':       return 'Template'
    case 'stretch':        return 'Stretch'
    default:               return type
  }
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDuration(started: string | null, completed: string | null): string | null {
  if (!started || !completed) return null
  const mins = Math.round((new Date(completed).getTime() - new Date(started).getTime()) / 60000)
  return mins > 0 ? `${mins} min` : null
}

// ─── Components ────────────────────────────────────────────────────────────────

function WorkoutCard({ date, type, status, exercises, duration }: Omit<RecentWorkout, 'id'>) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border cursor-pointer transition-all duration-150 hover:border-[#3D2E5C]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">{type}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: status === 'complete' ? 'rgba(125, 255, 196, 0.15)' : 'rgba(255, 77, 106, 0.15)',
            color: status === 'complete' ? '#7DFFC4' : '#FF4D6A',
          }}
        >
          {status === 'complete' ? 'Complete' : 'Partial'}
        </span>
      </div>
      <div className="text-xs text-[#9B8FB0] mb-1.5">{exercises || '—'}</div>
      <div className="flex gap-3 text-xs text-[#5E5278]">
        <span>{date}</span>
        {duration && <><span>·</span><span>{duration}</span></>}
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, colorClass, glow }: {
  label: string; value: string; unit: string
  colorClass: string; glow: string
}) {
  return (
    <div className="flex-1 p-5 rounded-2xl bg-card border border-border">
      <div className="text-[10px] font-black text-[#5E5278] uppercase tracking-[0.2em] mb-1.5">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`weight-number text-3xl font-black ${colorClass}`} style={{ textShadow: `0 0 12px ${glow}` }}>
          {value}
        </span>
        <span className="text-xs text-[#9B8FB0]">{unit}</span>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const { activeGoals } = useGoals()
  const [nextLabel, setNextLabel] = useState<'A' | 'B'>('A')
  const [hasConfig, setHasConfig] = useState(false)
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
  const [stats, setStats] = useState<HomeStats>({ totalWorkouts: null, bodyWeight: null, bodyFatPct: null })
  const [activeWorkout, setActiveWorkout] = useState<{ id: string; type: string } | null>(null)
  const [showStretchForm, setShowStretchForm] = useState(false)
  const [stretchMinutes, setStretchMinutes] = useState('10')
  const [stretchNotes, setStretchNotes] = useState('')
  const [stretchSaving, setStretchSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [lastResult, configResult, workoutsResult, bodyCompResult, activeResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('workout_type')
          .in('workout_type', ['five_by_five_a', 'five_by_five_b'])
          .not('started_at', 'is', null)
          .order('started_at', { ascending: false })
          .limit(1),
        supabase
          .from('five_by_five_config')
          .select('id')
          .limit(1),
        supabase
          .from('workouts')
          .select('id, workout_type, started_at, completed_at')
          .not('started_at', 'is', null)
          .order('started_at', { ascending: false })
          .limit(4),
        supabase
          .from('body_comp_entries')
          .select('weight_lbs, body_fat_pct')
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('workouts')
          .select('id, workout_type')
          .not('started_at', 'is', null)
          .is('completed_at', null)
          .limit(1),
      ])

      // Active workout
      const active = activeResult.data?.[0]
      setActiveWorkout(active ? { id: active.id, type: active.workout_type } : null)

      // Next 5×5 label
      const last = lastResult.data?.[0]?.workout_type
      setNextLabel(last === 'five_by_five_a' ? 'B' : 'A')
      setHasConfig((configResult.data?.length ?? 0) > 0)

      // Recent workouts — fetch exercise names for each
      const workouts = workoutsResult.data ?? []
      if (workouts.length > 0) {
        const ids = workouts.map((w) => w.id)
        const { data: weData } = await supabase
          .from('workout_exercises')
          .select('workout_id, exercises(name)')
          .in('workout_id', ids)

        // Group exercise names by workout_id
        const namesByWorkout = new Map<string, string[]>()
        for (const we of (weData ?? [])) {
          const name = (we.exercises as unknown as { name: string } | null)?.name
          if (!name) continue
          if (!namesByWorkout.has(we.workout_id)) namesByWorkout.set(we.workout_id, [])
          namesByWorkout.get(we.workout_id)!.push(name)
        }

        const recent: RecentWorkout[] = workouts.map((w) => {
          const names = namesByWorkout.get(w.id) ?? []
          const displayed = names.slice(0, 4)
          const exerciseLabel = displayed.join(' · ') + (names.length > 4 ? ' …' : '')
          return {
            id: w.id,
            date: formatDate(w.started_at),
            type: formatWorkoutType(w.workout_type),
            status: w.completed_at ? 'complete' : 'partial',
            exercises: exerciseLabel,
            duration: formatDuration(w.started_at, w.completed_at),
          }
        })
        setRecentWorkouts(recent)
      }

      // Stats
      const { count: totalCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .not('completed_at', 'is', null)

      const latestBody = bodyCompResult.data?.[0]
      setStats({
        totalWorkouts: totalCount ?? 0,
        bodyWeight: latestBody?.weight_lbs ?? null,
        bodyFatPct: latestBody?.body_fat_pct ?? null,
      })
    }
    load()
  }, [])

  function handleStart5x5() {
    if (hasConfig) navigate(`/workout/5x5/active?label=${nextLabel}`)
    else navigate('/workout/5x5/setup')
  }

  async function handleLogStretch() {
    const mins = parseInt(stretchMinutes)
    if (!mins || mins <= 0) return
    setStretchSaving(true)
    const completedAt = new Date()
    const startedAt = new Date(completedAt.getTime() - mins * 60000)
    await supabase.from('workouts').insert({
      workout_type: 'stretch',
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      notes: stretchNotes.trim() || null,
    })
    setStretchSaving(false)
    setShowStretchForm(false)
    setStretchMinutes('10')
    setStretchNotes('')
    // Refresh recent workouts
    window.location.reload()
  }

  const statCards = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts != null ? String(stats.totalWorkouts) : '—',
      unit: 'logged',
      colorClass: 'text-[#E91E8C]',
      glow: 'rgba(233,30,140,0.2)',
    },
    {
      label: 'Body Weight',
      value: stats.bodyWeight != null ? stats.bodyWeight.toFixed(1) : '—',
      unit: 'lbs',
      colorClass: 'text-[#00E5FF]',
      glow: 'rgba(0,229,255,0.2)',
    },
    {
      label: 'Body Fat',
      value: stats.bodyFatPct != null ? stats.bodyFatPct.toFixed(1) : '—',
      unit: '%',
      colorClass: 'text-[#7DFFC4]',
      glow: 'rgba(125,255,196,0.2)',
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 px-4 lg:px-10 pt-6 lg:pt-8 pb-6">
        {/* Left: Title + Actions */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#E91E8C] text-neon-glow">
              Rep Sheet
            </span>
          </div>
          <h1 className="font-display text-5xl mb-1.5 leading-tight">
            Ready to lift,<br />
            <span className="text-gradient-hero">Super Aimee?</span>
          </h1>
          <div className="text-sm text-[#9B8FB0] mb-7">
            Next up:{' '}
            <span className="text-[#00E5FF] font-bold">5×5 Workout {nextLabel}</span>
          </div>
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleStart5x5}
              className="flex-1 py-4 px-6 rounded-xl bg-[#E91E8C] text-white text-sm font-black uppercase tracking-[0.15em] neon-glow-strong transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              Start 5×5 Workout {nextLabel}
            </button>
            <button
              onClick={() => navigate('/workout/active')}
              className="flex-1 py-4 px-6 rounded-xl bg-transparent border-2 border-[#00E5FF] text-[#00E5FF] text-sm font-black uppercase tracking-[0.15em] cyan-glow transition-all duration-150 hover:bg-[#00E5FF]/10 active:scale-[0.98]"
            >
              Start Freeform
            </button>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="w-full py-3.5 px-6 rounded-xl bg-card border border-border text-[#9B8FB0] text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-between transition-all duration-150 hover:border-[#3D2E5C] hover:text-foreground"
          >
            <span>Start from Template</span>
            <span className="text-[#5E5278] text-xs">View all →</span>
          </button>

          {/* Log Stretch */}
          <button
            onClick={() => setShowStretchForm((v) => !v)}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-card border border-border text-[#9B8FB0] text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-between transition-all duration-150 hover:border-[#7DFFC4]/50 hover:text-[#7DFFC4]"
          >
            <span>Log Stretch Session</span>
            <span className="text-[#5E5278] text-xs">Quick log →</span>
          </button>

          {showStretchForm && (
            <div className="mt-3 p-4 rounded-xl bg-card border border-border">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7DFFC4] mb-3">
                Stretch Session
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#5E5278] uppercase tracking-wider">Duration (min)</label>
                  <input
                    type="number"
                    value={stretchMinutes}
                    onChange={(e) => setStretchMinutes(e.target.value)}
                    className="w-20 h-9 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm font-bold text-center outline-none focus:border-[#7DFFC4] transition-colors"
                    inputMode="numeric"
                    min="1"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] text-[#5E5278] uppercase tracking-wider">Video / Notes (optional)</label>
                  <input
                    type="text"
                    value={stretchNotes}
                    onChange={(e) => setStretchNotes(e.target.value)}
                    placeholder="e.g. Tom Merrick 15min mobility"
                    className="h-9 rounded-lg bg-background border border-[#3D2E5C] text-foreground text-sm px-3 outline-none focus:border-[#7DFFC4] transition-colors placeholder:text-[#3D2E5C]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLogStretch}
                  disabled={stretchSaving || !stretchMinutes || parseInt(stretchMinutes) <= 0}
                  className="px-5 py-2 rounded-lg bg-[#7DFFC4] text-[#0F0A1A] text-xs font-black uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-40"
                >
                  {stretchSaving ? 'Saving…' : 'Log Stretch'}
                </button>
                <button
                  onClick={() => setShowStretchForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-[#5E5278] text-xs font-semibold hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Super Aimee Hero Image */}
        <div
          className="w-48 h-56 lg:w-64 lg:h-72 rounded-2xl flex-shrink-0 relative overflow-hidden hidden lg:block"
          style={{
            background: 'linear-gradient(135deg, #241838 0%, #1A1028 100%)',
            border: '1px solid #3D2E5C',
            boxShadow: 'inset 0 0 40px rgba(233,30,140,0.15), 0 0 30px rgba(233,30,140,0.2)',
          }}
        >
          <img src="/images/super-aimee-1.png" alt="Super Aimee" className="w-full h-full object-cover object-top" />
        </div>
      </div>

      {/* Active Workout Banner */}
      {activeWorkout && (
        <div className="mx-4 lg:mx-10 mb-4 p-4 rounded-2xl border border-[#7DFFC4]/30 bg-[#7DFFC4]/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex w-3 h-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DFFC4] opacity-75" />
              <span className="relative inline-flex w-3 h-3 rounded-full bg-[#7DFFC4]" />
            </span>
            <span className="text-sm font-bold text-[#7DFFC4]">Workout in progress</span>
          </div>
          <button
            onClick={() => navigate(getWorkoutRoute(activeWorkout.type))}
            className="text-xs font-black uppercase tracking-wider text-[#7DFFC4] border border-[#7DFFC4]/40 px-3 py-1.5 rounded-lg transition-all duration-150 hover:bg-[#7DFFC4]/10 active:scale-[0.98]"
          >
            Resume →
          </button>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="px-10 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-black text-[#5E5278] uppercase tracking-[0.25em]">
              Active Goals
            </div>
            <Link to="/goals" className="text-[10px] font-black uppercase tracking-wider text-[#E91E8C] hover:text-[#FF6EC7] transition-colors">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {activeGoals.slice(0, 3).map((goal) => {
              const typeColor = goal.goal_type === 'strength' ? '#E91E8C' : goal.goal_type === 'body' ? '#00E5FF' : '#9B8FB0'
              const typeBg = goal.goal_type === 'strength' ? 'rgba(233,30,140,0.12)' : goal.goal_type === 'body' ? 'rgba(0,229,255,0.12)' : 'rgba(155,143,176,0.12)'
              const pct = goal.target_value ? Math.min(100, Math.round(((goal.current_value ?? 0) / goal.target_value) * 100)) : null
              return (
                <Link
                  key={goal.id}
                  to="/goals"
                  className="p-4 rounded-2xl bg-card border border-border hover:border-[#3D2E5C] transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: typeBg, color: typeColor, border: `1px solid ${typeColor}40` }}
                    >
                      {goal.goal_type}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">{goal.description}</span>
                  </div>
                  {pct !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-[#241838] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: typeColor }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#5E5278] mt-1">
                        <span>{goal.current_value ?? 0} / {goal.target_value}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="px-4 lg:px-10 pb-8">
        <div className="text-[11px] font-black text-[#5E5278] uppercase tracking-[0.25em] mb-3">
          Recent Workouts
        </div>
        {recentWorkouts.length === 0 ? (
          <div className="p-5 rounded-2xl bg-card border border-border text-sm text-[#5E5278]">
            No workouts yet — start your first one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {recentWorkouts.map((w) => (
              <WorkoutCard key={w.id} {...w} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 lg:px-10 pb-8">
        <div className="flex flex-col lg:flex-row gap-3">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </div>
  )
}
