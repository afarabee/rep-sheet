/**
 * Seed exercises from free-exercise-db (yuhonas/free-exercise-db on GitHub)
 * Run: npx tsx scripts/seed-exercises.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const equipmentMap: Record<string, string> = {
  'barbell': 'barbell',
  'dumbbell': 'dumbbell',
  'cable': 'cable',
  'machine': 'machine',
  'body only': 'bodyweight',
  'bands': 'bands',
  'kettlebells': 'kettlebell',
  'foam roll': 'foam_roller',
  'e-z curl bar': 'ez_bar',
  'exercise ball': 'exercise_ball',
  'medicine ball': 'medicine_ball',
  'other': 'other',
}

type ExerciseRow = {
  name: string
  primaryMuscles: string[]
  equipment: string
  category: string
}

async function run() {
  // Check if already seeded
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'exercises_json')

  if ((count ?? 0) > 0) {
    console.log(`Already seeded: ${count} exercises. Skipping.`)
    return
  }

  console.log('Fetching exercises from free-exercise-db...')
  const response = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }

  const exercises: ExerciseRow[] = await response.json()
  console.log(`Fetched ${exercises.length} exercises`)

  const rows = exercises.map((ex) => ({
    name: ex.name,
    muscle_group: ex.primaryMuscles?.[0] ?? null,
    equipment_type: equipmentMap[ex.equipment?.toLowerCase() ?? ''] ?? 'other',
    is_active: true,
    is_custom: false,
    is_favorite: false,
    source: 'exercises_json',
  }))

  const BATCH_SIZE = 500
  let inserted = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('exercises').insert(batch)

    if (error) {
      console.error(`Error on batch starting at ${i}:`, error.message)
      process.exit(1)
    }

    inserted += batch.length
    console.log(`Inserted ${inserted} / ${rows.length}`)
  }

  console.log(`Done. ${inserted} exercises seeded.`)
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
