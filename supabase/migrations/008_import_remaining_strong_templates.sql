-- Import remaining workout templates from Strong app screenshots.
-- These templates had no logged sessions in the CSV export, so prescribed_sets
-- and prescribed_reps are left NULL.

-- Helper function: look up exercise by Strong name, then alt name, then create custom
CREATE OR REPLACE FUNCTION _find_or_create_exercise(
  p_strong_name text,
  p_alt_name text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  ex_id uuid;
BEGIN
  SELECT id INTO ex_id FROM exercises WHERE lower(name) = lower(p_strong_name) LIMIT 1;
  IF ex_id IS NULL AND p_alt_name IS NOT NULL THEN
    SELECT id INTO ex_id FROM exercises WHERE lower(name) = lower(p_alt_name) LIMIT 1;
  END IF;
  IF ex_id IS NULL THEN
    INSERT INTO exercises (name, is_custom, is_active, source)
      VALUES (COALESCE(p_alt_name, p_strong_name), true, true, 'custom')
      RETURNING id INTO ex_id;
  END IF;
  RETURN ex_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tmpl_id uuid;
BEGIN

  ---------------------------------------------------------------
  -- 1. Glutes
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Glutes') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Romanian Deadlift (Barbell)', 'Romanian Deadlift'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Romanian Deadlift (Dumbbell)'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Glute Kickback (Machine)', 'Glute Kickback'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hip Abductor (Machine)', 'Thigh Abductor'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hip Adductor (Machine)', 'Thigh Adductor'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hip Thrust (Bodyweight)'), 5, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Good Morning (Barbell)', 'Good Morning'), 6, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Thruster (Barbell)', 'Barbell Thruster'), 7, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Single Leg Bridge', 'Single Leg Glute Bridge'), 8, NULL, NULL);

  ---------------------------------------------------------------
  -- 2. Sunday Funday
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Sunday Funday') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Ball Slams'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Jump Squat', 'Freehand Jump Squat'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Kettlebell Swing', 'One-Arm Kettlebell Swings'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Lunge (Dumbbell)', 'Dumbbell Lunges'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Plank', 'Plank'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Side Bend (Dumbbell)', 'Dumbbell Side Bend'), 5, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Single Leg Bridge', 'Single Leg Glute Bridge'), 6, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hip Thrust (Bodyweight)'), 7, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Side step Banded walk'), 8, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Tire Flips', 'Tire Flip'), 9, NULL, NULL);

  ---------------------------------------------------------------
  -- 3. Legs
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Legs') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Bulgarian Split Squat'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Cable Pull Through', 'Pull Through'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hack Squat', 'Hack Squat'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Leg Press', 'Leg Press'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Goblet Squat (Kettlebell)', 'Goblet Squat'), 5, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Step-up', 'Dumbbell Step Ups'), 6, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Single Leg Leg Press', 'Single Leg Press'), 7, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Side step Banded walk'), 8, NULL, NULL);

  ---------------------------------------------------------------
  -- 4. Bis
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Bis') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Dumbbell)', 'Dumbbell Bicep Curl'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Concentration Curl (Dumbbell)', 'Concentration Curls'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Hammer Curl (Dumbbell)', 'Hammer Curls'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Incline Curl (Dumbbell)', 'Incline Dumbbell Curl'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Preacher Curl (Dumbbell)', 'Dumbbell Alternate Bicep Curl'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Cable)', 'Standing Biceps Cable Curl'), 5, NULL, NULL);

  ---------------------------------------------------------------
  -- 5. Core
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Core') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Crunch (Stability Ball)', 'Exercise Ball Crunch'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Crunch (Machine)', 'Ab Crunch Machine'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Flat Leg Raise', 'Flat Bench Lying Leg Raise'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Knee Raise (Captain''s Chair)', 'Captains Chair Leg Raise'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Plank', 'Plank'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Side Plank'), 5, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Pallof Press'), 6, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Deadbug kettlebell pullover'), 7, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Suitcase Carry'), 8, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Trap bar figure 8 carry'), 9, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('RKC Plank'), 10, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Medicine Ball Slam'), 11, NULL, NULL);

  ---------------------------------------------------------------
  -- 6. Leg day warm up
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Leg day warm up') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Cat-Cow', 'Cat Stretch'), 0, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Knee to Chest stretch'), 1, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Lying pelvic tilts', 'Pelvic Tilt'), 2, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('PT walking CARS'), 3, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Dead bug', 'Dead Bug'), 4, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Dynamic hip rotation'), 5, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Dynamic toe touch'), 6, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Runners lunge'), 7, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Side Lunges', 'Side Lunge'), 8, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Pigeon stretch'), 9, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Combat stretch (for ankles)'), 10, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Kneeling hip flexor stretch', 'Kneeling Hip Flexor'), 11, NULL, NULL),
    (tmpl_id, _find_or_create_exercise('Superman', 'Superman'), 12, NULL, NULL);

END $$;

-- Clean up the helper function
DROP FUNCTION _find_or_create_exercise(text, text);
