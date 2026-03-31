import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getStartDate } from '@/components/charts/chartTheme'
import type { TimePeriod } from '@/components/charts/chartTheme'

export interface TimePoint {
  date: number  // epoch ms
  value: number
}

export interface BodyCompSeries {
  weight: TimePoint[]
  bodyFat: TimePoint[]
  muscleMass: TimePoint[]
}

export interface FrequencyPoint {
  weekStart: number
  count: number
}

export function useProgressData(period: TimePeriod) {
  const [bodyComp, setBodyComp] = useState<BodyCompSeries>({ weight: [], bodyFat: [], muscleMass: [] })
  const [frequency, setFrequency] = useState<FrequencyPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const start = getStartDate(period)

      // Body comp
      let bcQuery = supabase
        .from('body_comp_entries')
        .select('recorded_at, weight_lbs, body_fat_pct, muscle_mass_lbs')
        .order('recorded_at', { ascending: true })
      if (start) bcQuery = bcQuery.gte('recorded_at', start.toISOString())
      const { data: bcData } = await bcQuery

      // Workouts (completed only)
      let wQuery = supabase
        .from('workouts')
        .select('started_at')
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: true })
      if (start) wQuery = wQuery.gte('started_at', start.toISOString())
      const { data: wData } = await wQuery

      if (cancelled) return

      // Parse body comp into series
      const weight: TimePoint[] = []
      const bodyFat: TimePoint[] = []
      const muscleMass: TimePoint[] = []
      for (const row of bcData ?? []) {
        const date = new Date(row.recorded_at).getTime()
        if (row.weight_lbs != null) weight.push({ date, value: Number(row.weight_lbs) })
        if (row.body_fat_pct != null) bodyFat.push({ date, value: Number(row.body_fat_pct) })
        if (row.muscle_mass_lbs != null) muscleMass.push({ date, value: Number(row.muscle_mass_lbs) })
      }
      setBodyComp({ weight, bodyFat, muscleMass })

      // Group workouts by week
      const weekMap = new Map<number, number>()
      for (const row of wData ?? []) {
        const d = new Date(row.started_at)
        // Get Monday of that week
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d.getFullYear(), d.getMonth(), diff)
        monday.setHours(0, 0, 0, 0)
        const key = monday.getTime()
        weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
      }
      const freq = Array.from(weekMap.entries())
        .map(([weekStart, count]) => ({ weekStart, count }))
        .sort((a, b) => a.weekStart - b.weekStart)
      setFrequency(freq)

      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [period])

  return { bodyComp, frequency, loading }
}
