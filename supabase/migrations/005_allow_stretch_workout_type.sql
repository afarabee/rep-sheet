-- Add 'stretch' to the allowed workout_type values
ALTER TABLE workouts DROP CONSTRAINT workouts_workout_type_check;
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_type_check
  CHECK (workout_type = ANY (ARRAY['five_by_five_a', 'five_by_five_b', 'freeform', 'template', 'stretch']));
