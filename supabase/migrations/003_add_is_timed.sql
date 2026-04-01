-- Add is_timed flag to exercises for duration-based exercises (planks, wall sits, etc.)
-- When is_timed is true, the reps column stores seconds instead of rep count.

ALTER TABLE public.exercises
  ADD COLUMN is_timed boolean DEFAULT false NOT NULL;
