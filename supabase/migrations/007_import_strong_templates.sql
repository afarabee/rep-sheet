-- Import workout templates from Strong app export data.
-- For each exercise, tries the Strong app name first, then the exercises.json
-- library name, and finally creates a custom exercise if no match is found.

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
  -- 1. Aesthetic Focus Session - Glutes
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Aesthetic Focus Session - Glutes') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Side step Banded walk'), 0, 3, 20),
    (tmpl_id, _find_or_create_exercise('Donkey kickbacks', 'Glute Kickback'), 1, 2, 40),
    (tmpl_id, _find_or_create_exercise('Hip Thrust (Bodyweight)'), 2, 2, 20);

  ---------------------------------------------------------------
  -- 2. Aesthetic Focus Session - Shoulder
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Aesthetic Focus Session - Shoulder') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Overhead Press (Barbell)', 'Standing Military Press'), 0, 3, 10),
    (tmpl_id, _find_or_create_exercise('Lateral Raise (Cable)', 'Cable Lateral Raise'), 1, 6, 10),
    (tmpl_id, _find_or_create_exercise('Reverse Fly (Cable)', 'Cable Rear Delt Fly'), 2, 3, 11),
    (tmpl_id, _find_or_create_exercise('Overhead press - PRECOR'), 3, 3, 10),
    (tmpl_id, _find_or_create_exercise('Bicep curl - single arm w/ cable'), 4, 6, 12),
    (tmpl_id, _find_or_create_exercise('Front Raise (Plate)', 'Front Plate Raise'), 5, 3, 10),
    (tmpl_id, _find_or_create_exercise('Lateral Raise (Machine)'), 6, 3, 14),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Dumbbell)', 'Dumbbell Bicep Curl'), 7, 3, 15);

  ---------------------------------------------------------------
  -- 3. Aesthetic Ph1 Foundational Day1
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Aesthetic Ph1 Foundational Day1') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Squat (Barbell)', 'Barbell Full Squat'), 0, 5, 5),
    (tmpl_id, _find_or_create_exercise('Romanian Deadlift (Barbell)', 'Romanian Deadlift'), 1, 3, 7),
    (tmpl_id, _find_or_create_exercise('Incline Bench Press (Barbell)', 'Barbell Incline Bench Press - Medium Grip'), 2, 4, 5),
    (tmpl_id, _find_or_create_exercise('Iso-lateral high row'), 3, 6, 8),
    (tmpl_id, _find_or_create_exercise('Shrug (Dumbbell)', 'Dumbbell Shrug'), 4, 2, 8),
    (tmpl_id, _find_or_create_exercise('Bench Press (Barbell)', 'Barbell Bench Press - Medium Grip'), 5, 3, 6),
    (tmpl_id, _find_or_create_exercise('Rear Lateral Raise (DB)', 'Bent Over Dumbbell Rear Delt Raise With Head On Bench'), 6, 1, 10);

  ---------------------------------------------------------------
  -- 4. Aesthetic Ph1 Foundational Day2
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Aesthetic Ph1 Foundational Day2') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Shrug (Dumbbell)', 'Dumbbell Shrug'), 0, 3, 8),
    (tmpl_id, _find_or_create_exercise('Pull Up (Assisted)', 'Band Assisted Pull-Up'), 1, 5, 8),
    (tmpl_id, _find_or_create_exercise('Lunge (Bodyweight)', 'Bodyweight Walking Lunge'), 2, 4, 10),
    (tmpl_id, _find_or_create_exercise('Incline Bench Press (Dumbbell)', 'Incline Dumbbell Press'), 3, 5, 8),
    (tmpl_id, _find_or_create_exercise('Arnold Press (Dumbbell)', 'Arnold Dumbbell Press'), 4, 4, 8),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Dumbbell)', 'Dumbbell Bicep Curl'), 5, 4, 10),
    (tmpl_id, _find_or_create_exercise('Chest Dip (Assisted)', 'Dips - Chest Version'), 6, 4, 8),
    (tmpl_id, _find_or_create_exercise('Sit Up', 'Sit-Up'), 7, 4, 9),
    (tmpl_id, _find_or_create_exercise('Seated Calf Raise (Plate Loaded)', 'Seated Calf Raise'), 8, 4, 18);

  ---------------------------------------------------------------
  -- 5. Aesthetic Ph1 Foundational Day3
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Aesthetic Ph1 Foundational Day3') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 0, 3, 9),
    (tmpl_id, _find_or_create_exercise('Seated Row (Cable)', 'Seated Cable Rows'), 1, 4, 8),
    (tmpl_id, _find_or_create_exercise('Bench Press (Dumbbell)', 'Dumbbell Bench Press'), 2, 4, 8);

  ---------------------------------------------------------------
  -- 6. Afternoon Workout
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Afternoon Workout') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Hip Abductor (Machine)', 'Thigh Abductor'), 0, 4, 28),
    (tmpl_id, _find_or_create_exercise('Hip Adductor (Machine)', 'Thigh Adductor'), 1, 4, 50),
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 2, 3, 15),
    (tmpl_id, _find_or_create_exercise('Squat (Barbell)', 'Barbell Full Squat'), 3, 9, 15);

  ---------------------------------------------------------------
  -- 7. Anterior Pelvic Tilt Corrections
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Anterior Pelvic Tilt Corrections') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Plank', 'Plank'), 0, 3, NULL),
    (tmpl_id, _find_or_create_exercise('Hip Thrust (Bodyweight)'), 1, 3, 20),
    (tmpl_id, _find_or_create_exercise('Dead bug', 'Dead Bug'), 2, 3, 18),
    (tmpl_id, _find_or_create_exercise('Bird dog', 'Bird Dog'), 3, 3, 20),
    (tmpl_id, _find_or_create_exercise('Lying pelvic tilts', 'Pelvic Tilt'), 4, 3, 20),
    (tmpl_id, _find_or_create_exercise('Child''s pose (forwards / backwards)', 'Child''s Pose'), 5, 2, NULL),
    (tmpl_id, _find_or_create_exercise('Cat-Cow', 'Cat Stretch'), 6, 3, 10),
    (tmpl_id, _find_or_create_exercise('Donkey kickbacks', 'Glute Kickback'), 7, 3, 20),
    (tmpl_id, _find_or_create_exercise('Side leg raises', 'Side Leg Raises'), 8, 3, 20),
    (tmpl_id, _find_or_create_exercise('Thread the needle'), 9, 1, 5),
    (tmpl_id, _find_or_create_exercise('Handcuff with rotation'), 10, 1, 5);

  ---------------------------------------------------------------
  -- 8. Back
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Back') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Lat Pulldown (Machine)', 'Wide-Grip Lat Pulldown'), 0, 5, 14),
    (tmpl_id, _find_or_create_exercise('Pull Up (Assisted)', 'Band Assisted Pull-Up'), 1, 4, 12),
    (tmpl_id, _find_or_create_exercise('Iso-Lateral Row (Machine)'), 2, 6, 10),
    (tmpl_id, _find_or_create_exercise('T Bar Row', 'Lying T-Bar Row'), 3, 4, 12),
    (tmpl_id, _find_or_create_exercise('Side Bend (Dumbbell)', 'Dumbbell Side Bend'), 4, 6, 17),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Dumbbell)', 'Dumbbell Bicep Curl'), 5, 4, 12),
    (tmpl_id, _find_or_create_exercise('Preacher Curl (Dumbbell)', 'Dumbbell Alternate Bicep Curl'), 6, 6, 11),
    (tmpl_id, _find_or_create_exercise('Iso-lateral high row'), 7, 6, 10),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Machine)', 'Machine Bicep Curl'), 8, 3, 9),
    (tmpl_id, _find_or_create_exercise('Goblet Squat (Kettlebell)', 'Goblet Squat'), 9, 4, 17);

  ---------------------------------------------------------------
  -- 9. Back/glutes
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Back/glutes') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Iso-Lateral Row (Machine)'), 0, 6, 12),
    (tmpl_id, _find_or_create_exercise('Romanian Deadlift (Barbell)', 'Romanian Deadlift'), 1, 6, 12),
    (tmpl_id, _find_or_create_exercise('Straight Arm Cable Pull Down', 'Straight-Arm Pulldown'), 2, 3, 14),
    (tmpl_id, _find_or_create_exercise('Good Morning (Barbell)', 'Good Morning'), 3, 3, 15),
    (tmpl_id, _find_or_create_exercise('T Bar Row', 'Lying T-Bar Row'), 4, 3, 13),
    (tmpl_id, _find_or_create_exercise('Single Leg RDLs'), 5, 8, 9),
    (tmpl_id, _find_or_create_exercise('Iso-lateral high row'), 6, 6, 14),
    (tmpl_id, _find_or_create_exercise('Hip Thrust (Bodyweight)'), 7, 2, 16),
    (tmpl_id, _find_or_create_exercise('Donkey kickbacks', 'Glute Kickback'), 8, 6, 18),
    (tmpl_id, _find_or_create_exercise('Side Bend (Dumbbell)', 'Dumbbell Side Bend'), 9, 6, 18),
    (tmpl_id, _find_or_create_exercise('Lat Pulldown (Cable)', 'Close-Grip Front Lat Pulldown'), 10, 3, 13),
    (tmpl_id, _find_or_create_exercise('Reverse Fly (Machine)', 'Reverse Flyes'), 11, 3, 11),
    (tmpl_id, _find_or_create_exercise('Pullover (Dumbbell)', 'Bent-Arm Dumbbell Pullover'), 12, 3, 16);

  ---------------------------------------------------------------
  -- 10. Chest
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Chest') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Bench Press (Dumbbell)', 'Dumbbell Bench Press'), 0, 3, 8),
    (tmpl_id, _find_or_create_exercise('Pec Deck (Machine)', 'Butterfly'), 1, 3, 10),
    (tmpl_id, _find_or_create_exercise('Dip machine'), 2, 3, 15),
    (tmpl_id, _find_or_create_exercise('Goblet Squat (Kettlebell)', 'Goblet Squat'), 3, 4, 17);

  ---------------------------------------------------------------
  -- 11. Lower Body A
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Lower Body A') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 0, 8, 5);

  ---------------------------------------------------------------
  -- 12. Midday Workout
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Midday Workout') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 0, 1, 10),
    (tmpl_id, _find_or_create_exercise('Bench Press (Barbell)', 'Barbell Bench Press - Medium Grip'), 1, 1, 5),
    (tmpl_id, _find_or_create_exercise('Trap Bar Deadlift', 'Trap Bar Deadlift'), 2, 1, 5),
    (tmpl_id, _find_or_create_exercise('Overhead Press (Barbell)', 'Standing Military Press'), 3, 1, 5);

  ---------------------------------------------------------------
  -- 13. Mobility
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Mobility') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('90/90 stretch', '90/90 Hamstring'), 0, 2, 10),
    (tmpl_id, _find_or_create_exercise('Lizard with rotation'), 1, 2, 10),
    (tmpl_id, _find_or_create_exercise('Dynamic hip rotation'), 2, 2, 10),
    (tmpl_id, _find_or_create_exercise('Dynamic frogger'), 3, 1, 10),
    (tmpl_id, _find_or_create_exercise('Dynamic toe touch'), 4, 2, 10),
    (tmpl_id, _find_or_create_exercise('Shoulder dislocated (w. stick)'), 5, 1, 10),
    (tmpl_id, _find_or_create_exercise('Thread the needle'), 6, 2, 5),
    (tmpl_id, _find_or_create_exercise('Wall press'), 7, 1, 10),
    (tmpl_id, _find_or_create_exercise('Wall circles'), 8, 2, 10),
    (tmpl_id, _find_or_create_exercise('No money drill'), 9, 1, 20),
    (tmpl_id, _find_or_create_exercise('Handcuff with rotation'), 10, 1, 3),
    (tmpl_id, _find_or_create_exercise('Adducter stretch (L-shape)', 'Adductor'), 11, 2, 10);

  ---------------------------------------------------------------
  -- 14. Morning Workout
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Morning Workout') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Front Squat (Barbell)', 'Front Barbell Squat'), 0, 2, 13),
    (tmpl_id, _find_or_create_exercise('Squat (Barbell)', 'Barbell Full Squat'), 1, 7, 13),
    (tmpl_id, _find_or_create_exercise('Pendulum Squat'), 2, 3, 10);

  ---------------------------------------------------------------
  -- 15. PT for hip/low back pain
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('PT for hip/low back pain') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('90/90 stretch', '90/90 Hamstring'), 0, 1, 10),
    (tmpl_id, _find_or_create_exercise('PT 5-second knee raise from all fours'), 1, 2, 10),
    (tmpl_id, _find_or_create_exercise('PT Kettlebell lean over to stretch hamstrings/lower back'), 2, 3, 10),
    (tmpl_id, _find_or_create_exercise('Superman', 'Superman'), 3, 2, 10),
    (tmpl_id, _find_or_create_exercise('PT walking CARS'), 4, 2, 20),
    (tmpl_id, _find_or_create_exercise('Back Extension (Machine)'), 5, 2, 10);

  ---------------------------------------------------------------
  -- 16. Saturday @ home
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Saturday @ home') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Bench Press (Barbell)', 'Barbell Bench Press - Medium Grip'), 0, 8, 8),
    (tmpl_id, _find_or_create_exercise('Deadlift (Barbell)', 'Barbell Deadlift'), 1, 8, 9),
    (tmpl_id, _find_or_create_exercise('Overhead Press (Barbell)', 'Standing Military Press'), 2, 6, 14);

  ---------------------------------------------------------------
  -- 17. Shoulders
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Shoulders') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Overhead Press (Barbell)', 'Standing Military Press'), 0, 5, 7),
    (tmpl_id, _find_or_create_exercise('Lateral Raise (Dumbbell)', 'Side Lateral Raise'), 1, 8, 12),
    (tmpl_id, _find_or_create_exercise('Shrug (Machine)'), 2, 4, 10),
    (tmpl_id, _find_or_create_exercise('Front Raise (Plate)', 'Front Plate Raise'), 3, 3, 10),
    (tmpl_id, _find_or_create_exercise('Upright Row (Barbell)', 'Upright Barbell Row'), 4, 3, 8),
    (tmpl_id, _find_or_create_exercise('Face Pull (Cable)', 'Face Pull'), 5, 3, 15),
    (tmpl_id, _find_or_create_exercise('Arnold Press (Dumbbell)', 'Arnold Dumbbell Press'), 6, 4, 16),
    (tmpl_id, _find_or_create_exercise('Rear Lateral Raise (DB)', 'Bent Over Dumbbell Rear Delt Raise With Head On Bench'), 7, 4, 18),
    (tmpl_id, _find_or_create_exercise('Hack Squat', 'Hack Squat'), 8, 7, 14);

  ---------------------------------------------------------------
  -- 18. Squat/Bench
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Squat/Bench') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Squat (Barbell)', 'Barbell Full Squat'), 0, 9, 10),
    (tmpl_id, _find_or_create_exercise('Bench Press (Barbell)', 'Barbell Bench Press - Medium Grip'), 1, 8, 10),
    (tmpl_id, _find_or_create_exercise('Ball Slams'), 2, 5, 20);

  ---------------------------------------------------------------
  -- 19. Sunday chest/glutes
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Sunday chest/glutes') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Bench Press (Dumbbell)', 'Dumbbell Bench Press'), 0, 6, 12),
    (tmpl_id, _find_or_create_exercise('Shrug (Machine)'), 1, 4, 11),
    (tmpl_id, _find_or_create_exercise('Goblet Squat (Kettlebell)', 'Goblet Squat'), 2, 6, 20),
    (tmpl_id, _find_or_create_exercise('Hack Squat', 'Hack Squat'), 3, 5, 13),
    (tmpl_id, _find_or_create_exercise('Chest Dip (Assisted)', 'Dips - Chest Version'), 4, 3, 15),
    (tmpl_id, _find_or_create_exercise('Lateral Raise (Dumbbell)', 'Side Lateral Raise'), 5, 8, 18),
    (tmpl_id, _find_or_create_exercise('Landmine squat'), 6, 3, 14);

  ---------------------------------------------------------------
  -- 20. Upper Body A
  ---------------------------------------------------------------
  INSERT INTO workout_templates (name) VALUES ('Upper Body A') RETURNING id INTO tmpl_id;
  INSERT INTO workout_template_exercises (template_id, exercise_id, sort_order, prescribed_sets, prescribed_reps) VALUES
    (tmpl_id, _find_or_create_exercise('Overhead Press (Dumbbell)', 'Dumbbell Shoulder Press'), 0, 5, 11),
    (tmpl_id, _find_or_create_exercise('Shrug (Dumbbell)', 'Dumbbell Shrug'), 1, 3, 13),
    (tmpl_id, _find_or_create_exercise('Face Pull (Cable)', 'Face Pull'), 2, 4, 15),
    (tmpl_id, _find_or_create_exercise('Lateral Raise (Dumbbell)', 'Side Lateral Raise'), 3, 4, 12),
    (tmpl_id, _find_or_create_exercise('Bench Press - Close Grip (Barbell)', 'Close-Grip Barbell Bench Press'), 4, 4, 15),
    (tmpl_id, _find_or_create_exercise('Lat Pulldown (Cable)', 'Close-Grip Front Lat Pulldown'), 5, 4, 15),
    (tmpl_id, _find_or_create_exercise('Iso-lateral high row'), 6, 6, 15),
    (tmpl_id, _find_or_create_exercise('Bicep Curl (Dumbbell)', 'Dumbbell Bicep Curl'), 7, 4, 13),
    (tmpl_id, _find_or_create_exercise('Triceps Pushdown (Cable - Straight Bar)', 'Triceps Pushdown'), 8, 4, 15);

END $$;

-- Clean up the helper function
DROP FUNCTION _find_or_create_exercise(text, text);
