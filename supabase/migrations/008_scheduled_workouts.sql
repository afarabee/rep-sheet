-- Create scheduled_workouts table (referenced in code but never created)
CREATE TABLE public.scheduled_workouts (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  scheduled_date date NOT NULL,
  workout_type text,
  template_id uuid REFERENCES public.workout_templates(id),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_scheduled_workouts_date ON public.scheduled_workouts USING btree (scheduled_date);

-- Junction table for exercises in a scheduled freeform workout
CREATE TABLE public.scheduled_workout_exercises (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  scheduled_workout_id uuid NOT NULL REFERENCES public.scheduled_workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  sort_order integer DEFAULT 0 NOT NULL
);

CREATE INDEX idx_swe_scheduled_workout_id ON public.scheduled_workout_exercises USING btree (scheduled_workout_id);
