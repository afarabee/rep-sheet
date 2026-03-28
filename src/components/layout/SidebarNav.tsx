import { NavLink } from 'react-router-dom'
import { Home, ScrollText, Calendar, Activity, BookOpen, LayoutTemplate, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  return (
    <nav className="flex flex-col items-center w-16 landscape:w-[76px] bg-card border-r border-border h-full pt-4 pb-6 gap-1 shrink-0">
      {/* Super Aimee Avatar */}
      <div className="w-11 h-11 rounded-full mb-5 border-2 border-[#E91E8C] neon-glow overflow-hidden shrink-0">
        <img
          src="/images/super-aimee-circle-emblem.png"
          alt="Super Aimee"
          className="w-full h-full object-cover"
        />
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
