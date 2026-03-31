import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, ScrollText, Calendar, Target, Activity, BookOpen, LayoutTemplate, Settings, Dumbbell, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end: boolean
}

const defaultNavItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/history', label: 'History', Icon: ScrollText, end: false },
  { to: '/calendar', label: 'Calendar', Icon: Calendar, end: false },
  { to: '/goals', label: 'Goals', Icon: Target, end: false },
  { to: '/body-comp', label: 'Body', Icon: Activity, end: false },
  { to: '/library', label: 'Exercises', Icon: BookOpen, end: false },
  { to: '/templates', label: 'Templates', Icon: LayoutTemplate, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

const STORAGE_KEY = 'rep-sheet-nav-order'

function loadNavOrder(): NavItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultNavItems
    const order: string[] = JSON.parse(stored)
    // Rebuild from stored route order, dropping stale entries and appending new ones
    const itemsByRoute = new Map(defaultNavItems.map((item) => [item.to, item]))
    const sorted: NavItem[] = []
    for (const route of order) {
      const item = itemsByRoute.get(route)
      if (item) {
        sorted.push(item)
        itemsByRoute.delete(route)
      }
    }
    // Append any new nav items not in the stored order
    for (const item of itemsByRoute.values()) {
      sorted.push(item)
    }
    return sorted
  } catch {
    return defaultNavItems
  }
}

function saveNavOrder(items: NavItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.to)))
}

function getWorkoutRoute(type: string | null): string {
  if (type === 'five_by_five_a') return '/workout/5x5/active?label=A'
  if (type === 'five_by_five_b') return '/workout/5x5/active?label=B'
  return '/workout/active'
}

/* ── Sortable nav link ── */
function SortableNavItem({ item }: { item: NavItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.to })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full relative group">
      {/* Drag handle — visible on hover / during drag */}
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 focus:opacity-60 transition-opacity z-10 touch-none"
        tabIndex={-1}
        aria-label={`Drag ${item.label}`}
      >
        <GripVertical size={10} className="text-muted-foreground" />
      </button>

      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'w-full rounded-xl flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-150 cursor-pointer',
            isActive
              ? 'bg-[#E91E8C] text-white neon-glow'
              : 'bg-transparent text-[#5E5278] hover:bg-[#241838] hover:text-[#F0EAF4]',
          )
        }
      >
        <item.Icon size={20} />
        <span className="hidden landscape:block text-[8px] font-bold uppercase tracking-[0.06em] leading-none">
          {item.label}
        </span>
      </NavLink>
    </div>
  )
}

/* ── Sidebar ── */
export default function SidebarNav() {
  const location = useLocation()
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false)
  const [activeWorkoutType, setActiveWorkoutType] = useState<string | null>(null)
  const [navItems, setNavItems] = useState<NavItem[]>(loadNavOrder)

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
  }, [location.pathname])

  // Require a small drag distance before starting, so taps still navigate
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setNavItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.to === active.id)
        const newIndex = prev.findIndex((i) => i.to === over.id)
        const next = arrayMove(prev, oldIndex, newIndex)
        saveNavOrder(next)
        return next
      })
    }
  }

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

      {/* Draggable Nav Items */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={navItems.map((i) => i.to)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col items-center gap-1 w-full px-2">
            {navItems.map((item) => (
              <SortableNavItem key={item.to} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </nav>
  )
}
