import { NavLink } from 'react-router-dom'

function IconHome({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 10L10 3L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5V16H8.5V12H11.5V16H15V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconHistory({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6.5" y1="7" x2="13.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6.5" y1="13" x2="10.5" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconScale({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="10" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.66 4.34L14.24 5.76M5.76 14.24L4.34 15.66M15.66 15.66L14.24 14.24M5.76 5.76L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const navItems = [
  { to: '/', label: 'Home', Icon: IconHome },
  { to: '/history', label: 'History', Icon: IconHistory },
  { to: '/body-comp', label: 'Body', Icon: IconScale },
  { to: '/settings', label: 'Settings', Icon: IconGear },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center pt-2.5 pb-2 relative transition-colors ${
                isActive
                  ? 'text-iron'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator — sharp top bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-iron" />
                )}
                <item.Icon className="mb-1" />
                <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
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
