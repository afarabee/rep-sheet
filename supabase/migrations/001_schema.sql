-- Rep Sheet — Database Schema
-- Run this against a fresh Supabase project to set up all tables.
-- After running, seed the exercise library by importing exercises.json
-- (see README for instructions).

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE public.exercises (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  muscle_group text,
  equipment_type text,
  equipment_id uuid,
  description text,
  is_active boolean DEFAULT true NOT NULL,
  is_custom boolean DEFAULT false NOT NULL,
  is_favorite boolean DEFAULT false NOT NULL,
  source text DEFAULT 'exercises_json' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.equipment_inventory (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  equipment_type text NOT NULL,
  is_owned boolean DEFAULT false NOT NULL,
  is_custom boolean DEFAULT false NOT NULL
);

CREATE TABLE public.workouts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workout_type text NOT NULL,
  template_id uuid,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text
);

CREATE TABLE public.workout_exercises (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workout_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  prescribed_sets integer,
  prescribed_reps integer
);

CREATE TABLE public.workout_sets (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workout_exercise_id uuid NOT NULL,
  set_number integer NOT NULL,
  weight_lbs numeric,
  reps integer,
  completed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.workout_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.workout_template_exercises (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  template_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  prescribed_sets integer,
  prescribed_reps integer
);

CREATE TABLE public.five_by_five_config (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workout_label text NOT NULL,
  exercise_id uuid NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL
);

CREATE TABLE public.working_weights (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exercise_id uuid NOT NULL,
  weight_lbs numeric NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.failed_attempts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exercise_id uuid NOT NULL,
  consecutive_failures integer DEFAULT 0 NOT NULL,
  last_failed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.ab_circuit_config (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exercise_id uuid NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL
);

CREATE TABLE public.ab_circuit_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  workout_id uuid NOT NULL,
  rounds_completed integer NOT NULL,
  notes text
);

CREATE TABLE public.body_comp_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  recorded_at timestamp with time zone DEFAULT now() NOT NULL,
  weight_lbs numeric,
  body_fat_pct numeric,
  bmr_kcal integer,
  fat_mass_lbs numeric,
  body_age integer,
  muscle_mass_lbs numeric,
  skeletal_muscle_pct numeric,
  subcutaneous_fat_pct numeric,
  visceral_fat numeric,
  screenshot_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  source text
);

CREATE TABLE public.body_measurements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  recorded_at timestamp with time zone DEFAULT now() NOT NULL,
  measurement_type text NOT NULL,
  value_inches numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.goals (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  goal_type text NOT NULL,
  description text NOT NULL,
  target_value numeric,
  current_value numeric,
  exercise_id uuid,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone
);

CREATE TABLE public.program_settings (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  training_days text[] DEFAULT ARRAY['monday','wednesday','friday'] NOT NULL,
  rest_seconds_default integer DEFAULT 120 NOT NULL,
  rest_seconds_increment integer DEFAULT 30 NOT NULL,
  increment_upper_lbs numeric DEFAULT 5 NOT NULL,
  increment_squat_lbs numeric DEFAULT 5 NOT NULL,
  increment_deadlift_lbs numeric DEFAULT 10 NOT NULL,
  theme text DEFAULT 'dark' NOT NULL,
  anthropic_api_key text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.reminder_settings (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email_enabled boolean DEFAULT false NOT NULL,
  calendar_enabled boolean DEFAULT false NOT NULL,
  reminder_time text DEFAULT '06:00' NOT NULL,
  email_address text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Primary Keys ─────────────────────────────────────────────────────────────

ALTER TABLE public.ab_circuit_config ADD PRIMARY KEY (id);
ALTER TABLE public.ab_circuit_logs ADD PRIMARY KEY (id);
ALTER TABLE public.body_comp_entries ADD PRIMARY KEY (id);
ALTER TABLE public.body_measurements ADD PRIMARY KEY (id);
ALTER TABLE public.equipment_inventory ADD PRIMARY KEY (id);
ALTER TABLE public.exercises ADD PRIMARY KEY (id);
ALTER TABLE public.failed_attempts ADD PRIMARY KEY (id);
ALTER TABLE public.five_by_five_config ADD PRIMARY KEY (id);
ALTER TABLE public.goals ADD PRIMARY KEY (id);
ALTER TABLE public.program_settings ADD PRIMARY KEY (id);
ALTER TABLE public.reminder_settings ADD PRIMARY KEY (id);
ALTER TABLE public.working_weights ADD PRIMARY KEY (id);
ALTER TABLE public.workout_exercises ADD PRIMARY KEY (id);
ALTER TABLE public.workout_sets ADD PRIMARY KEY (id);
ALTER TABLE public.workout_template_exercises ADD PRIMARY KEY (id);
ALTER TABLE public.workout_templates ADD PRIMARY KEY (id);
ALTER TABLE public.workouts ADD PRIMARY KEY (id);

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

ALTER TABLE public.exercises ADD CONSTRAINT exercises_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment_inventory(id);
ALTER TABLE public.ab_circuit_config ADD CONSTRAINT ab_circuit_config_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.ab_circuit_logs ADD CONSTRAINT ab_circuit_logs_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id);
ALTER TABLE public.failed_attempts ADD CONSTRAINT failed_attempts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.five_by_five_config ADD CONSTRAINT five_by_five_config_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.goals ADD CONSTRAINT goals_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.working_weights ADD CONSTRAINT working_weights_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id);
ALTER TABLE public.workout_sets ADD CONSTRAINT workout_sets_workout_exercise_id_fkey FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id);
ALTER TABLE public.workout_template_exercises ADD CONSTRAINT workout_template_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);
ALTER TABLE public.workout_template_exercises ADD CONSTRAINT workout_template_exercises_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workout_templates(id);
ALTER TABLE public.workouts ADD CONSTRAINT workouts_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workout_templates(id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_body_comp_entries_recorded_at ON public.body_comp_entries USING btree (recorded_at DESC);
CREATE INDEX idx_exercises_is_active ON public.exercises USING btree (is_active);
CREATE INDEX idx_exercises_is_favorite ON public.exercises USING btree (is_favorite);
CREATE INDEX idx_exercises_muscle_group ON public.exercises USING btree (muscle_group);
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises USING btree (workout_id);
CREATE INDEX idx_workout_sets_workout_exercise_id ON public.workout_sets USING btree (workout_exercise_id);
CREATE INDEX idx_workouts_started_at ON public.workouts USING btree (started_at DESC);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

-- Equipment inventory — toggle is_owned to match your home gym setup
INSERT INTO public.equipment_inventory (name, equipment_type, is_owned) VALUES
  ('Ab Wheel',         'bodyweight',    false),
  ('Barbell',          'barbell',       false),
  ('Bench',            'other',         false),
  ('Cable Machine',    'cable',         false),
  ('Dip Bars',         'bodyweight',    false),
  ('Dumbbells',        'dumbbell',      false),
  ('Exercise Ball',    'exercise_ball', false),
  ('Flat Bench',       'bench',         false),
  ('Foam Roller',      'recovery',      false),
  ('Hex Bar / Trap Bar','barbell',      false),
  ('Kettlebell',       'kettlebell',    false),
  ('Medicine Ball',    'medicine_ball', false),
  ('Pull-up Bar',      'bodyweight',    false),
  ('Resistance Bands', 'bands',         false),
  ('Squat Rack',       'rack',          false);

-- Default program settings (single row)
INSERT INTO public.program_settings (
  training_days, rest_seconds_default, rest_seconds_increment,
  increment_upper_lbs, increment_squat_lbs, increment_deadlift_lbs, theme
) VALUES (
  ARRAY['monday','wednesday','friday'], 120, 30, 5, 5, 10, 'dark'
);

-- Default reminder settings (single row)
INSERT INTO public.reminder_settings (email_enabled, calendar_enabled, reminder_time)
VALUES (false, false, '06:00');
