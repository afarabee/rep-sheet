-- Add is_favorite and is_active columns to workout_templates
ALTER TABLE public.workout_templates
  ADD COLUMN is_favorite boolean DEFAULT false NOT NULL,
  ADD COLUMN is_active boolean DEFAULT true NOT NULL;
