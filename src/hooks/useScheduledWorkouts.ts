import { supabase } from '@/lib/supabase'

export async function scheduleWorkout(
  date: string,
  workoutType: string | null,
  templateId: string | null,
  notes: string | null,
  exerciseIds?: string[],
) {
  const { data, error } = await supabase
    .from('scheduled_workouts')
    .insert({
      scheduled_date: date,
      workout_type: workoutType,
      template_id: templateId,
      notes: notes || null,
    })
    .select('id')
    .single()
  if (error) throw error

  if (exerciseIds && exerciseIds.length > 0) {
    const { error: exError } = await supabase
      .from('scheduled_workout_exercises')
      .insert(
        exerciseIds.map((eid, i) => ({
          scheduled_workout_id: data.id,
          exercise_id: eid,
          sort_order: i,
        }))
      )
    if (exError) throw exError
  }

  return data.id as string
}

export async function removeScheduledWorkout(id: string) {
  await supabase.from('scheduled_workouts').delete().eq('id', id)
}
