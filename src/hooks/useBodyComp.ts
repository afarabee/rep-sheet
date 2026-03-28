import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BodyCompEntry {
  id: string
  recorded_at: string
  source: string | null
  weight_lbs: number | null
  body_fat_pct: number | null
  bmr_kcal: number | null
  fat_mass_lbs: number | null
  body_age: number | null
  muscle_mass_lbs: number | null
  skeletal_muscle_pct: number | null
  subcutaneous_fat_pct: number | null
  visceral_fat: number | null
}

export function useBodyComp() {
  const [entries, setEntries] = useState<BodyCompEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [entriesResult, settingsResult] = await Promise.all([
        supabase
          .from('body_comp_entries')
          .select('id, recorded_at, source, weight_lbs, body_fat_pct, bmr_kcal, fat_mass_lbs, body_age, muscle_mass_lbs, skeletal_muscle_pct, subcutaneous_fat_pct, visceral_fat')
          .order('recorded_at', { ascending: false }),
        supabase
          .from('program_settings')
          .select('anthropic_api_key')
          .limit(1)
          .single(),
      ])

      setEntries((entriesResult.data ?? []) as BodyCompEntry[])
      setApiKey(settingsResult.data?.anthropic_api_key ?? null)
      setLoading(false)
    }
    load()
  }, [])

  async function saveEntry(data: Omit<BodyCompEntry, 'id' | 'recorded_at'> & { recorded_at?: string }) {
    const { recorded_at, ...rest } = data
    const payload: Record<string, unknown> = { ...rest }
    if (recorded_at) payload.recorded_at = recorded_at

    const { data: inserted, error } = await supabase
      .from('body_comp_entries')
      .insert(payload)
      .select('id, recorded_at, source, weight_lbs, body_fat_pct, bmr_kcal, fat_mass_lbs, body_age, muscle_mass_lbs, skeletal_muscle_pct, subcutaneous_fat_pct, visceral_fat')
      .single()

    if (error || !inserted) return null

    const entry = inserted as BodyCompEntry
    setEntries((prev) =>
      [entry, ...prev].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )
    )
    return entry
  }

  async function deleteEntry(id: string) {
    await supabase.from('body_comp_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function saveApiKey(key: string) {
    await supabase
      .from('program_settings')
      .update({ anthropic_api_key: key, updated_at: new Date().toISOString() })
      .not('id', 'is', null)
    setApiKey(key)
  }

  return { entries, loading, apiKey, saveEntry, deleteEntry, saveApiKey }
}
