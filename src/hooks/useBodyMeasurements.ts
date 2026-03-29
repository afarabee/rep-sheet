import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export interface BodyMeasurement {
  id: string
  recorded_at: string
  measurement_type: string
  value_inches: number
}

export interface MeasurementSession {
  date: string        // YYYY-MM-DD
  displayDate: string // "Mar 29, 2026"
  measurements: BodyMeasurement[]
}

export function useBodyMeasurements() {
  const [rows, setRows] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('body_measurements')
        .select('*')
        .order('recorded_at', { ascending: false })
      setRows((data ?? []) as BodyMeasurement[])
      setLoading(false)
    }
    load()
  }, [])

  const sessions = useMemo<MeasurementSession[]>(() => {
    const map = new Map<string, BodyMeasurement[]>()
    for (const row of rows) {
      const date = row.recorded_at.slice(0, 10)
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(row)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, measurements]) => ({
        date,
        displayDate: new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
        measurements,
      }))
  }, [rows])

  async function saveSession(date: string, items: { type: string; value: number }[]) {
    // Remove existing rows for this date then insert fresh
    const existing = rows.filter((r) => r.recorded_at.slice(0, 10) === date)
    if (existing.length > 0) {
      await supabase.from('body_measurements').delete().in('id', existing.map((r) => r.id))
    }

    const timestamp = new Date(date + 'T12:00:00').toISOString()
    const { data } = await supabase
      .from('body_measurements')
      .insert(items.map((item) => ({
        recorded_at: timestamp,
        measurement_type: item.type,
        value_inches: item.value,
      })))
      .select('*')

    const kept = rows.filter((r) => r.recorded_at.slice(0, 10) !== date)
    setRows([...((data ?? []) as BodyMeasurement[]), ...kept].sort((a, b) =>
      b.recorded_at.localeCompare(a.recorded_at)
    ))
  }

  async function deleteSession(date: string) {
    const ids = rows.filter((r) => r.recorded_at.slice(0, 10) === date).map((r) => r.id)
    if (ids.length === 0) return
    await supabase.from('body_measurements').delete().in('id', ids)
    setRows((prev) => prev.filter((r) => r.recorded_at.slice(0, 10) !== date))
  }

  return { sessions, loading, saveSession, deleteSession }
}
