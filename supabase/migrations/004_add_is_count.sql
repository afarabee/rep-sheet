-- When is_count is true, the reps column stores a simple count (no weight required, but weight is optional).
ALTER TABLE exercises ADD COLUMN is_count boolean DEFAULT false NOT NULL;
