import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

export interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  equipment_type: string | null
  equipment_id: string | null
  description: string | null
  is_active: boolean
  is_custom: boolean
  is_favorite: boolean
  is_timed: boolean
  is_count: boolean
  source: string | null
  created_at: string
}

export interface NewExercise {
  name: string
  muscle_group: string
  equipment_type: string
  description?: string
  is_timed?: boolean
  is_count?: boolean
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ownedEquipmentTypes, setOwnedEquipmentTypes] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipmentTypes, setSelectedEquipmentTypes] = useState<string[]>([])
  const [myEquipmentOnly, setMyEquipmentOnly] = useState(true)
  const [bodyweightOnly, setBodyweightOnly] = useState(false)

  useEffect(() => {
    async function load() {
      const [exercisesResult, equipmentResult] = await Promise.all([
        supabase.from('exercises').select('*').order('name', { ascending: true }),
        supabase.from('equipment_inventory').select('equipment_type').eq('is_owned', true),
      ])

      if (exercisesResult.error) {
        setError(exercisesResult.error.message)
        setLoading(false)
        return
      }

      if (equipmentResult.error) {
        setError(equipmentResult.error.message)
        setLoading(false)
        return
      }

      setExercises(exercisesResult.data ?? [])
      setOwnedEquipmentTypes(
        (equipmentResult.data ?? []).map((r) => r.equipment_type as string).filter(Boolean)
      )
      setLoading(false)
    }

    load()
  }, [])

  const filteredExercises = useMemo(() => {
    let result = exercises

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((ex) => ex.name.toLowerCase().includes(q))
    }

    if (selectedMuscleGroups.length > 0) {
      result = result.filter((ex) => ex.muscle_group !== null && selectedMuscleGroups.includes(ex.muscle_group))
    }

    if (selectedEquipmentTypes.length > 0) {
      result = result.filter((ex) => ex.equipment_type !== null && selectedEquipmentTypes.includes(ex.equipment_type))
    } else if (bodyweightOnly) {
      result = result.filter((ex) => ex.equipment_type === 'bodyweight')
    } else if (myEquipmentOnly) {
      result = result.filter(
        (ex) =>
          ex.equipment_type === 'bodyweight' ||
          (ex.equipment_type !== null && ownedEquipmentTypes.includes(ex.equipment_type))
      )
    }

    return [...result].sort((a, b) => {
      if (a.is_favorite === b.is_favorite) return a.name.localeCompare(b.name)
      return a.is_favorite ? -1 : 1
    })
  }, [exercises, searchQuery, selectedMuscleGroups, selectedEquipmentTypes, myEquipmentOnly, bodyweightOnly, ownedEquipmentTypes])

  async function toggleFavorite(id: string, current: boolean) {
    // Optimistic update
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, is_favorite: !current } : ex))
    )
    const { error } = await supabase
      .from('exercises')
      .update({ is_favorite: !current })
      .eq('id', id)
    if (error) {
      // Revert
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, is_favorite: current } : ex))
      )
    }
  }

  async function addCustomExercise(data: NewExercise) {
    const payload = {
      name: data.name,
      muscle_group: data.muscle_group,
      equipment_type: data.equipment_type,
      description: data.description ?? null,
      is_active: true,
      is_custom: true,
      is_favorite: false,
      is_timed: data.is_timed ?? false,
      is_count: data.is_count ?? false,
      source: 'custom',
    }
    const { data: newRow, error } = await supabase
      .from('exercises')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setExercises((prev) => [newRow as Exercise, ...prev])
  }

  async function updateExercise(id: string, fields: Partial<Pick<Exercise, 'name' | 'muscle_group' | 'equipment_type' | 'description' | 'is_timed' | 'is_count'>>) {
    const prev = exercises.find((ex) => ex.id === id)
    if (!prev) return
    // Optimistic update
    setExercises((list) =>
      list.map((ex) => (ex.id === id ? { ...ex, ...fields } : ex))
    )
    const { error } = await supabase
      .from('exercises')
      .update(fields)
      .eq('id', id)
    if (error) {
      // Revert
      setExercises((list) =>
        list.map((ex) => (ex.id === id ? prev : ex))
      )
      throw new Error(error.message)
    }
  }

  async function deactivateExercise(id: string) {
    // Optimistic update
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, is_active: false } : ex))
    )
    const { error } = await supabase
      .from('exercises')
      .update({ is_active: false })
      .eq('id', id)
    if (error) {
      // Revert
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, is_active: true } : ex))
      )
    }
  }

  async function reactivateExercise(id: string) {
    // Optimistic update
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, is_active: true } : ex))
    )
    const { error } = await supabase
      .from('exercises')
      .update({ is_active: true })
      .eq('id', id)
    if (error) {
      // Revert
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, is_active: false } : ex))
      )
    }
  }

  return {
    exercises: filteredExercises,
    allExercises: exercises,
    loading,
    error,
    ownedEquipmentTypes,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedEquipmentTypes,
    setSelectedEquipmentTypes,
    myEquipmentOnly,
    setMyEquipmentOnly,
    bodyweightOnly,
    setBodyweightOnly,
    toggleFavorite,
    addCustomExercise,
    updateExercise,
    deactivateExercise,
    reactivateExercise,
  }
}
