-- Fix: Make started_at nullable so workouts aren't treated as "active"
-- until the user explicitly clicks "Start Workout".
-- Previously, DEFAULT now() NOT NULL caused every inserted workout to
-- immediately appear as in-progress, leading to phantom auto-started
-- workouts in history.

ALTER TABLE public.workouts
  ALTER COLUMN started_at DROP NOT NULL,
  ALTER COLUMN started_at DROP DEFAULT;
