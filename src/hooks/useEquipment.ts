import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface EquipmentItem {
  id: string
  name: string
  equipment_type: string
  is_owned: boolean
  is_custom: boolean
}

export const EQUIPMENT_TYPES = [
  { value: 'bands',          label: 'Resistance Bands'},
  { value: 'barbell',        label: 'Barbell'         },
  { value: 'bodyweight',     label: 'Bodyweight'      },
  { value: 'cable',          label: 'Cable'           },
  { value: 'dumbbell',       label: 'Dumbbell'        },
  { value: 'exercise_ball',  label: 'Exercise Ball'   },
  { value: 'ez_bar',         label: 'EZ Bar'          },
  { value: 'foam_roller',    label: 'Foam Roller'     },
  { value: 'kettlebell',     label: 'Kettlebell'      },
  { value: 'machine',        label: 'Machine'         },
  { value: 'medicine_ball',  label: 'Medicine Ball'   },
  { value: 'other',          label: 'Other'           },
]

export function useEquipment() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('equipment_inventory')
        .select('id, name, equipment_type, is_owned, is_custom')
        .order('is_custom', { ascending: true })
        .order('name', { ascending: true })
      setEquipment((data ?? []) as EquipmentItem[])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleOwned(id: string) {
    const item = equipment.find((e) => e.id === id)
    if (!item) return
    const next = !item.is_owned
    setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, is_owned: next } : e))
    await supabase.from('equipment_inventory').update({ is_owned: next }).eq('id', id)
  }

  async function addCustom(name: string, equipment_type: string) {
    const { data, error } = await supabase
      .from('equipment_inventory')
      .insert({ name, equipment_type, is_owned: true, is_custom: true })
      .select('id, name, equipment_type, is_owned, is_custom')
      .single()
    if (error || !data) return
    setEquipment((prev) => [...prev, data as EquipmentItem])
  }

  async function deleteCustom(id: string) {
    await supabase.from('equipment_inventory').delete().eq('id', id)
    setEquipment((prev) => prev.filter((e) => e.id !== id))
  }

  return { equipment, loading, toggleOwned, addCustom, deleteCustom }
}
