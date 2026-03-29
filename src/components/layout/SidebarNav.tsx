import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, ScrollText, Calendar, Activity, BookOpen, LayoutTemplate, Settings } from 'lucide-react'
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

export default function SidebarNav() {
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false)

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from('workouts')
        .select('id')
        .not('started_at', 'is', null)
        .is('completed_at', null)
        .limit(1)
      setHasActiveWorkout((data?.length ?? 0) > 0)
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
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#E91E8C] animate-pulse border-2 border-background" />
        )}
      </div>

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
