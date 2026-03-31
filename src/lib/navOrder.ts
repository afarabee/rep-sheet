import { Home, ScrollText, Calendar, Target, Activity, BookOpen, LayoutTemplate, Settings, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end: boolean
}

export const defaultNavItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/history', label: 'History', Icon: ScrollText, end: false },
  { to: '/calendar', label: 'Calendar', Icon: Calendar, end: false },
  { to: '/goals', label: 'Goals', Icon: Target, end: false },
  { to: '/progress', label: 'Progress', Icon: TrendingUp, end: false },
  { to: '/body-comp', label: 'Body', Icon: Activity, end: false },
  { to: '/library', label: 'Exercises', Icon: BookOpen, end: false },
  { to: '/templates', label: 'Templates', Icon: LayoutTemplate, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

const STORAGE_KEY = 'rep-sheet-nav-order'

export function loadNavOrder(): NavItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultNavItems
    const order: string[] = JSON.parse(stored)
    const itemsByRoute = new Map(defaultNavItems.map((item) => [item.to, item]))
    const sorted: NavItem[] = []
    for (const route of order) {
      const item = itemsByRoute.get(route)
      if (item) {
        sorted.push(item)
        itemsByRoute.delete(route)
      }
    }
    for (const item of itemsByRoute.values()) {
      sorted.push(item)
    }
    return sorted
  } catch {
    return defaultNavItems
  }
}

export function saveNavOrder(items: NavItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.to)))
}

export function resetNavOrder() {
  localStorage.removeItem(STORAGE_KEY)
}
