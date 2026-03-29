import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, ScrollText, Calendar, Activity, BookOpen, LayoutTemplate, Settings, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const navItems = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/history', label: 'History', Icon: ScrollText, end: false },
  { to: '/calendar', label: 'Calendar', Icon: Calendar, end: false },
  { to: '/body-comp', label: 'Body', Icon: Activity, end: false },
  { to: '/library', label: 'Library', Icon: BookOpen, end: false },
  { to: '/templates', label: 'Templates', Icon: LayoutTemplate, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

function getWorkoutRoute(type: string | null): string {
  if (type === 'five_by_five_a') return '/workout/5x5/active?label=A'
  if (type === 'five_by_five_b') return '/workout/5x5/active?label=B'
  return '/workout/active'
}

export default function SidebarNav() {
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false)
  const [activeWorkoutType, setActiveWorkoutType] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from('workouts')
        .select('id, workout_type')
        .not('started_at', 'is', null)
        .is('completed_at', null)
        .limit(1)
      const found = (data?.length ?? 0) > 0
      setHasActiveWorkout(found)
      setActiveWorkoutType(found ? (data![0].workout_type ?? null) : null)
    }
    check()
  }, [])

  return (
    <nav className="flex flex-col items-center w-16 landscape:w-[76px] bg-card border-r border-border h-full pt-4 pb-6 gap-1 shrink-0">
      {/* Super Aimee Avatar */}
      <div className="relative w-11 h-11 rounded-full mb-5 border-2 border-[#E91E8C] neon-glow overflow-visible shrink-0">
        <img
          src="/images/super-aimee-circle-emblem.png"
          alt="Super Aimee"
          className="w-full h-full object-cover rounded-full overflow-hidden"
        />
        {hasActiveWorkout && (
          <span className="absolute bottom-0 right-0 flex w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DFFC4] opacity-75" />
            <span className="relative inline-flex w-3 h-3 rounded-full bg-[#7DFFC4] border-2 border-background" />
          </span>
        )}
      </div>

      {/* Live Workout Tab — only shown when a workout is active */}
      {hasActiveWorkout && (
        <NavLink
          to={getWorkoutRoute(activeWorkoutType)}
          className="w-full rounded-xl flex flex-col items-center justify-center gap-0.5 py-2.5 mb-1 bg-[#7DFFC4]/10 border border-[#7DFFC4]/30 transition-all duration-150 hover:bg-[#7DFFC4]/20"
        >
          <span className="relative flex w-5 h-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#7DFFC4] opacity-30" />
            <Dumbbell size={18} className="relative text-[#7DFFC4]" />
          </span>
          <span className="hidden landscape:block text-[8px] font-bold uppercase tracking-[0.06em] leading-none text-[#7DFFC4]">
            Live
          </span>
        </NavLink>
      )}

      {/* Nav Items */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'w-full rounded-xl flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-[#E91E8C] text-white neon-glow'
                  : 'bg-transparent text-[#5E5278] hover:bg-[#241838] hover:text-[#F0EAF4]'
              )
            }
          >
            <item.Icon size={20} />
            <span className="hidden landscape:block text-[8px] font-bold uppercase tracking-[0.06em] leading-none">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
