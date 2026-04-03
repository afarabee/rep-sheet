-- The upsert on working_weights uses onConflict: 'exercise_id' which requires
-- a unique constraint. Without it, upserts silently fail.
ALTER TABLE working_weights ADD CONSTRAINT working_weights_exercise_id_unique UNIQUE (exercise_id);
