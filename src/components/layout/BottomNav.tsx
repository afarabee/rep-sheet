import { NavLink } from 'react-router-dom'
import { Home, ScrollText, BookOpen, LayoutTemplate, Settings, Dumbbell } from 'lucide-react'
import { useActiveWorkoutPresence } from '@/hooks/useActiveWorkoutPresence'

function getWorkoutRoute(type: string | null): string {
  if (type === 'five_by_five_a') return '/workout/5x5/active?label=A'
  if (type === 'five_by_five_b') return '/workout/5x5/active?label=B'
  return '/workout/active'
}

const navItems = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/library', label: 'Library', Icon: BookOpen, end: false },
  { to: '/templates', label: 'Templates', Icon: LayoutTemplate, end: false },
  { to: '/history', label: 'History', Icon: ScrollText, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

export default function BottomNav() {
  const { hasActiveWorkout, activeWorkoutType } = useActiveWorkoutPresence()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40">
      <div className="flex">
        {/* Live workout button */}
        {hasActiveWorkout && (
          <NavLink
            to={getWorkoutRoute(activeWorkoutType)}
            className="flex-1 flex flex-col items-center pt-2 pb-1.5 relative transition-colors text-[#7DFFC4]"
          >
            <span className="relative flex items-center justify-center mb-0.5">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#7DFFC4] opacity-30" />
              <Dumbbell size={18} className="relative" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.08em]">Live</span>
          </NavLink>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center pt-2 pb-1.5 relative transition-colors ${
                isActive
                  ? 'text-[#E91E8C]'
                  : 'text-[#5E5278] hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E91E8C]" />
                )}
                <item.Icon size={18} className="mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Safe area padding for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
