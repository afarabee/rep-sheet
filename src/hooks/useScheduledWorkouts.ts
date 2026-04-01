import { supabase } from '@/lib/supabase'

export async function scheduleWorkout(
  date: string,
  workoutType: string | null,
  templateId: string | null,
  notes: string | null,
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
  return data.id as string
}

export async function removeScheduledWorkout(id: string) {
  await supabase.from('scheduled_workouts').delete().eq('id', id)
}
