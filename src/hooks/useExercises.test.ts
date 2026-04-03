import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Supabase before importing the hook
const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({
  select: mockSelect,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => {
      mockFrom(...args)
      return {
        select: (...sArgs: unknown[]) => {
          mockSelect(...sArgs)
          return {
            order: () => ({
              data: mockExercises,
              error: null,
            }),
            eq: () => ({
              data: mockEquipment,
              error: null,
            }),
          }
        },
      }
    },
  },
}))

import { useExercises } from './useExercises'

const mockExercises = [
  { id: '1', name: 'Barbell Squat', muscle_group: 'quadriceps', equipment_type: 'barbell', is_active: true, is_custom: false, is_favorite: true, is_timed: false, is_count: false, description: null, equipment_id: null, source: 'seed', created_at: '2026-01-01' },
  { id: '2', name: 'Dumbbell Curl', muscle_group: 'biceps', equipment_type: 'dumbbell', is_active: true, is_custom: false, is_favorite: false, is_timed: false, is_count: false, description: null, equipment_id: null, source: 'seed', created_at: '2026-01-01' },
  { id: '3', name: 'Push-Up', muscle_group: 'chest', equipment_type: 'bodyweight', is_active: true, is_custom: false, is_favorite: false, is_timed: false, is_count: false, description: null, equipment_id: null, source: 'seed', created_at: '2026-01-01' },
  { id: '4', name: 'Band Pull-Apart', muscle_group: 'shoulders', equipment_type: 'bands', is_active: true, is_custom: true, is_favorite: false, is_timed: false, is_count: true, description: null, equipment_id: null, source: 'custom', created_at: '2026-04-01' },
  { id: '5', name: 'Plank', muscle_group: 'abdominals', equipment_type: 'bodyweight', is_active: true, is_custom: true, is_favorite: true, is_timed: true, is_count: false, description: null, equipment_id: null, source: 'custom', created_at: '2026-04-01' },
]

const mockEquipment = [
  { equipment_type: 'barbell' },
  { equipment_type: 'dumbbell' },
]

describe('useExercises — filtering', () => {
  it('returns all exercises by default', async () => {
    const { result } = renderHook(() => useExercises())
    // Wait for async load
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exercises.length).toBe(5)
  })

  it('filters by search query (case insensitive)', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSearchQuery('squat'))
    expect(result.current.exercises.length).toBe(1)
    expect(result.current.exercises[0].name).toBe('Barbell Squat')
  })

  it('filters by muscle group', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSelectedMuscleGroups(['biceps']))
    expect(result.current.exercises.length).toBe(1)
    expect(result.current.exercises[0].name).toBe('Dumbbell Curl')
  })

  it('filters by multiple muscle groups', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSelectedMuscleGroups(['biceps', 'chest']))
    expect(result.current.exercises.length).toBe(2)
  })

  it('filters by equipment type', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSelectedEquipmentTypes(['bodyweight']))
    expect(result.current.exercises.length).toBe(2) // Push-Up + Plank
  })

  it('bodyweightOnly shows only bodyweight exercises', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setBodyweightOnly(true))
    expect(result.current.exercises.every((ex) => ex.equipment_type === 'bodyweight')).toBe(true)
  })

  it('myEquipmentOnly shows bodyweight + owned equipment', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setMyEquipmentOnly(true))
    // owned: barbell, dumbbell + always includes bodyweight
    const types = result.current.exercises.map((ex) => ex.equipment_type)
    expect(types.every((t) => ['barbell', 'dumbbell', 'bodyweight'].includes(t!))).toBe(true)
    expect(result.current.exercises.length).toBe(4) // Squat, Curl, Push-Up, Plank
  })

  it('customOnly shows only custom exercises', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setCustomOnly(true))
    expect(result.current.exercises.every((ex) => ex.is_custom)).toBe(true)
    expect(result.current.exercises.length).toBe(2) // Band Pull-Apart + Plank
  })

  it('equipment type chips override myEquipmentOnly', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.setMyEquipmentOnly(true)
      result.current.setSelectedEquipmentTypes(['bands'])
    })
    // Equipment chips should win — show bands even though not in "my gym"
    expect(result.current.exercises.length).toBe(1)
    expect(result.current.exercises[0].name).toBe('Band Pull-Apart')
  })

  it('combines search + muscle group filters', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.setSearchQuery('p')
      result.current.setSelectedMuscleGroups(['chest'])
    })
    expect(result.current.exercises.length).toBe(1)
    expect(result.current.exercises[0].name).toBe('Push-Up')
  })

  it('sorts favorites first', async () => {
    const { result } = renderHook(() => useExercises())
    await vi.waitFor(() => expect(result.current.loading).toBe(false))
    const firstTwo = result.current.exercises.slice(0, 2)
    expect(firstTwo.every((ex) => ex.is_favorite)).toBe(true)
  })
})
