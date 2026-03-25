## New Project Scaffold: Rep Sheet — Workout Tracker

### What I Want

Rep Sheet is a mobile-first workout tracking app built for an experienced lifter. The foundation is a comprehensive exercise library (500+ exercises organized by body part and equipment type). The user can run a structured 5x5 program OR do any workout they want -- log any exercise, any sets, any reps, any weight. Nothing is forced. Nothing is locked. The app tracks body composition via smart scale screenshot uploads parsed by AI. Built with Supabase for backend/auth and designed for extensibility.

### Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui (Lovable defaults)
- **Backend:** Supabase (new project -- do NOT connect to any existing Supabase instance)
- **Auth:** Supabase auth with email/password. Single user for now but build auth properly so multi-user support is possible later.
- **Mobile-first:** All layouts designed for phone screens. Desktop should work but phone is the priority.

### Core Design Principles

1. **Nothing is forced.** Every screen should have a way to skip, override, or exit. The user is an experienced lifter who knows what they're doing.
2. **No assumptions about weight, reps, or exercises.** Don't default working weights. Don't pre-fill anything the user hasn't explicitly set. Empty fields are fine.
3. **The exercise library is the backbone.** Every exercise the user logs comes from the library (or gets added to it ad-hoc). The library is browsable by body part and filterable by equipment type.
4. **5x5 is a mode, not the whole app.** The user can start a 5x5 workout OR start a freeform workout and pick whatever exercises they want.

### How It Should Work

**Step 1: Exercise Library**

The exercise library is the core data structure. Every exercise in the app lives here. Exercises are organized by:

- **Body part** (8 categories): Quads, Hamstrings/Glutes, Back, Chest, Shoulders, Biceps, Triceps, Core
- **Equipment type** (5 categories): Bodyweight, Resistance Bands, Dumbbells, Barbells, Gym Equipment

Each exercise stores: name, body_part, equipment_type, notes (optional), is_active (default true), is_custom (whether user-added or from seed data).

The library should be seeded with the full exercise list provided (see Seed Data section below -- approximately 520 exercises). The user can also add custom exercises at any time, both from the Exercise Library screen in settings AND inline during a workout (an "Add exercise" option at the bottom of any exercise picker).

The Exercise Library screen (accessible from Settings) lets the user:
- Browse exercises by body part, then filter by equipment type
- Search exercises by name
- Add a new custom exercise (name + body part + equipment type + optional notes)
- Edit or deactivate any exercise (deactivated exercises are hidden from pickers but preserved in history)
- See which exercises are custom vs. seed data
- **Favorite exercises:** The user can tap a star/heart icon to mark any exercise as a favorite. Favorited exercises appear in a "Favorites" section at the top of any exercise picker for quick access. Favorites are also browsable as their own filtered view in the Exercise Library screen.

**Step 2: Home Screen**

- App title: "Rep Sheet"
- Two primary action buttons:
  - **"Start 5x5 Workout"** -- starts the structured 5x5 flow (see Step 3)
  - **"Start Freeform Workout"** -- opens a blank workout where the user picks exercises from the library (see Step 4)
- Below the primary buttons, a **"Start from Template"** button that shows the user's saved workout templates (see Step 5). If no templates exist yet, this can be a smaller/secondary button.
- Below that, a quick view of recent workout history (last 3-5 sessions showing date, workout label/type, and completion status)
- Navigation to: Workout History, Body Comp, Settings

**Step 3: 5x5 Workout Flow**

The 5x5 program alternates two workouts:

- **Workout A:** Squat, Bench Press, Hex Bar Deadlift
- **Workout B:** Squat, Shoulder Exercise (user picks from Shoulders body part), Deadlift (1x5 only)

The app should auto-alternate A/B workouts. The home screen shows which is next. The user can override and pick either one.

When starting a 5x5 workout:
- If Workout B, show an exercise picker filtered to Shoulders body part so the user can choose their shoulder exercise for the session
- Show the exercise list with any previously set working weights. If no weight has been set for an exercise, show the weight field as empty -- do NOT default to any value. Let the user enter their weight on the first set.
- The 5x5 program structure is enforced: show 5 set indicators per exercise (numbered 1-5), each tracking completion status (pending, complete, failed). For Workout B deadlift, show 1 set indicator only. This guided set-by-set flow is the whole point of the 5x5 mode.
- The user logs sets one at a time by entering weight and reps for the current set. Weight carries forward from the previous set (so you only type it once unless you change it). Reps default to 5 but the user can change them.
- After logging a set, the configurable rest timer starts (see Step 7)
- Once all sets for an exercise are logged, auto-advance to the next exercise
- The user can also: skip ahead to the next exercise, go back to a previous exercise, or add an ad-hoc exercise to the current workout at any time
- After all main lifts, move to the Ab Circuit phase (see Step 6)
- The user can end the workout at any time. Partially completed workouts are saved as-is.

**Progressive overload (optional, for 5x5 only):**
- When the user completes all prescribed sets and reps for a 5x5 exercise, the app can suggest a weight increase. The increment amounts are configurable in Settings.
- This is a SUGGESTION only. The user can accept, change, or ignore it.
- If the user fails to complete all reps for 3 consecutive sessions on the same exercise, the app can suggest a deload. Again, suggestion only.

**Step 4: Freeform Workout**

A blank workout with no preset exercises. The user builds the workout as they go:

- Tap "Add Exercise" to open the exercise picker (browse by body part, filter by equipment, search by name)
- Select an exercise. It's added to the workout.
- Log sets for that exercise: enter weight and reps per set. No prescribed number of sets -- the user adds as many as they want.
- Tap "Add Exercise" again to add another exercise
- The user can also add a custom exercise on the fly if it's not in the library (this adds it to the library permanently)
- Rest timer is available between sets (same configurable timer as 5x5)
- The user can reorder, remove, or skip exercises freely
- End the workout whenever done. Partial saves are fine.

**Step 5: Workout Templates**

Templates let the user save and reuse workout structures. Two ways to create them:

**Save from history:** After completing any workout (5x5 or freeform), the user can tap a "Save as Template" option from the workout detail in history. This captures the exercise list, order, and prescribed sets/reps per exercise. It does NOT save the weights -- those change over time.

**Create from scratch:** In Settings > Templates, the user can create a new template by:
- Giving it a name (e.g., "Push Day", "Upper Body Accessories", "Sunday Shoulder Rehab")
- Adding exercises from the library picker (same picker used everywhere)
- Setting prescribed sets and reps per exercise (optional -- can be left blank for flexibility)
- Reordering or removing exercises

**Starting a workout from a template:** From the home screen, tap "Start from Template," select a template, and the workout opens pre-populated with those exercises and prescribed sets/reps. The user can still modify everything during the workout -- add exercises, skip exercises, change reps. The template is a starting point, not a constraint.

**Managing templates:** Settings > Templates shows all saved templates. The user can edit, rename, duplicate, or delete templates.

**Step 6: Ab Circuit**

After the main lifts in a 5x5 workout (or added manually in a freeform workout), the Ab Circuit shows:
- A checklist of exercises pulled from the user's ab circuit list (configured in Settings, sourced from the Core body part in the exercise library)
- The user checks off exercises as they complete them
- A round counter (how many rounds of the circuit)
- If no ab exercises are configured, show a message: "No ab exercises configured. Add some in Settings or skip."
- The user can always skip the ab circuit entirely

**Step 7: Rest Timer**

The rest timer appears after logging any set (in both 5x5 and freeform workouts):

- Default starting time is configurable in Settings (default: 2 minutes)
- While the timer is running, show +/- buttons that adjust by 30-second increments
- A "Cancel" button stops the timer immediately and returns to set logging
- Timer plays a sound/vibrate when done
- The timer is always optional -- the user can cancel it or just start logging the next set without waiting

**Step 8: Voice Entry**

- A microphone button on the active workout screen (both 5x5 and freeform)
- User taps mic and says something like "225 for 5" or "135 for 3"
- App parses the weight and rep count from the voice input
- App fills in the current set with that weight and rep count
- If parsing fails, show an inline error: "Couldn't understand that. Try again or tap to enter manually."
- Use the Web Speech API (browser native) for speech recognition. No third-party speech services.

**Step 9: Workout History**

- A scrollable list of past workouts showing: date, workout label (5x5 A, 5x5 B, Template Name, or Freeform), and completion status
- Tapping a workout opens a full detail view showing: every exercise performed, each set's weight and reps, whether sets were completed or failed, the shoulder exercise chosen (if Workout B), ab circuit rounds completed, and any workout notes
- The detail view includes a "Save as Template" button that captures the exercise list and prescribed sets/reps into a new template
- A back button returns to the history list
- No charts or analytics for V1. Just the log.

**Step 10: Body Composition Tracking (Fitdays Screenshot Upload)**

The user weighs in weekly using a Fitdays smart scale. The Fitdays app does not export data, only screenshots. Rep Sheet lets the user upload a Fitdays screenshot and auto-extract the data using the Anthropic Claude API (vision).

Flow:
- In the app navigation, add a "Body Comp" section
- The Body Comp screen shows a history of past entries (date, weight, body fat %, muscle mass) in a simple list, most recent first
- A "Log Weigh-In" button opens an upload flow
- User uploads a screenshot from their Fitdays app (photo from camera roll)
- The app sends the image to the Anthropic Claude API (model: claude-sonnet-4-20250514) with a prompt asking it to extract these specific metrics from the screenshot: Weight (lbs), Body Fat %, BMR (kcal), Fat Mass (lbs), Body Age, Muscle Mass (lbs), Skeletal Muscle (%), Subcutaneous Fat (%), Visceral Fat
- The API response populates a confirmation form showing all extracted values. The user can review and correct any values before saving.
- On save, the entry is stored in Supabase
- If the image parse fails or returns incomplete data, show a message: "Couldn't read all values from the screenshot. Please fill in any missing fields manually." Pre-fill whatever was successfully extracted and leave the rest as empty fields for manual entry.

API Key Handling:
- Store the Anthropic API key in Supabase as a user-level setting (in program_settings or a separate secrets table)
- The API call should be made from a Supabase Edge Function (not client-side) to keep the key secure
- Add an "API Key" field in Settings where the user can paste their Anthropic API key

Do NOT build charts or trend visualizations for body comp data in V1. Just the log and the screenshot parser.

**Step 11: Settings**

All settings are fully editable inline. Every field should have appropriate edit controls. Changes save immediately with a brief "Saved" toast confirmation.

**Exercise Library:**
- Browse all exercises by body part, filter by equipment type
- Search by name
- Add new custom exercises (name + body part + equipment type + notes)
- Edit or deactivate exercises
- Toggle favorite status on any exercise (star/heart icon)
- Filter view to show only favorites
- This is the master exercise list that feeds all pickers throughout the app

**Workout Templates:**
- List all saved templates showing name, exercise count, and when created
- Create a new template from scratch: name it, add exercises from the library, set optional prescribed sets/reps per exercise, reorder exercises
- Edit any existing template: rename, add/remove exercises, change sets/reps
- Duplicate a template (useful for creating variations)
- Delete a template
- Templates can also be created from the workout history detail view ("Save as Template")

**Ab Circuit Configuration:**
- Pick which exercises from the library (filtered to Core body part) are in the user's ab circuit rotation
- Add, remove, reorder exercises in the circuit
- These exercises appear as the ab circuit checklist during workouts

**Working Weights:**
- Shows exercises that have a saved working weight
- Each exercise has an editable weight field -- the user types whatever value they want
- The user can clear a weight or set a new one
- No defaults, no resets, no assumptions. Just an editable number field per exercise.

**5x5 Program Settings:**
- **Training days:** Multi-select day picker (Mon-Sun). Tap to toggle. Default: Mon/Wed/Fri.
- **Weight increment suggestions:** Editable fields for upper body, squat, and deadlift increment amounts (used for progressive overload suggestions only)
- **Workout A exercises:** Shows Squat, Bench Press, Hex Bar Deadlift. In the future this could be configurable, but for V1 these are fixed.
- **Workout B exercises:** Shows Squat, [Shoulder -- picked per session], Deadlift (1x5). Fixed for V1.

**Rest Timer Settings:**
- Default rest time (editable, default 2:00)
- Increment amount (editable, default 30 seconds)

**API Settings:**
- Anthropic API key field (for Fitdays screenshot parsing)
- Stored securely in Supabase (not local storage)
- Masked after saving (show last 4 characters only)
- Clear key button to remove

### Database Schema (Supabase)

Create these tables:

**profiles** — id (uuid, FK to auth.users), created_at

**exercises** — id (uuid), user_id (FK), name (text), body_part (enum: quads, hamstrings_glutes, back, chest, shoulders, biceps, triceps, core), equipment_type (enum: bodyweight, resistance_bands, dumbbells, barbells, gym_equipment), notes (text, nullable), is_active (boolean, default true), is_custom (boolean, default false), is_favorite (boolean, default false), created_at

**program_settings** — id (uuid), user_id (FK), training_days (text array, default ['monday','wednesday','friday']), rest_seconds_default (integer, default 120), rest_seconds_increment (integer, default 30), increment_upper_lbs (numeric, default 5), increment_squat_lbs (numeric, default 5), increment_deadlift_lbs (numeric, default 10), created_at, updated_at

**working_weights** — id (uuid), user_id (FK), exercise_id (FK to exercises), weight_lbs (numeric), updated_at

**workout_templates** — id (uuid), user_id (FK), name (text), notes (text, nullable), created_at, updated_at

**workout_template_exercises** — id (uuid), template_id (FK to workout_templates), exercise_id (FK to exercises), sort_order (integer), prescribed_sets (integer, nullable), prescribed_reps (integer, nullable)

**workouts** — id (uuid), user_id (FK), workout_type (enum: five_by_five_a, five_by_five_b, freeform, template), template_id (FK to workout_templates, nullable), started_at (timestamptz), completed_at (timestamptz, nullable), notes (text, nullable)

**workout_exercises** — id (uuid), workout_id (FK), exercise_id (FK), sort_order (integer), prescribed_sets (integer, nullable), prescribed_reps (integer, nullable), created_at

**workout_sets** — id (uuid), workout_exercise_id (FK to workout_exercises), set_number (integer), weight_lbs (numeric, nullable), reps (integer, nullable), completed (boolean, default false), created_at

**ab_circuit_config** — id (uuid), user_id (FK), exercise_id (FK to exercises), sort_order (integer)

**ab_circuit_logs** — id (uuid), workout_id (FK), rounds_completed (integer), notes (text, nullable)

**failed_attempts** — id (uuid), user_id (FK), exercise_id (FK), consecutive_failures (integer, default 0), last_failed_at (timestamptz)

**body_comp_entries** — id (uuid), user_id (FK), recorded_at (timestamptz), weight_lbs (numeric, nullable), body_fat_pct (numeric, nullable), bmr_kcal (numeric, nullable), fat_mass_lbs (numeric, nullable), body_age (integer, nullable), muscle_mass_lbs (numeric, nullable), skeletal_muscle_pct (numeric, nullable), subcutaneous_fat_pct (numeric, nullable), visceral_fat (numeric, nullable), screenshot_url (text, nullable), created_at

Enable Row Level Security on all tables. Policies: users can only read/write their own data (where user_id = auth.uid()).

### Important Notes

- This is V1. Do NOT build charts, analytics, PR tracking, or any reporting features yet. This includes body composition trend charts. Those all come later.
- Do NOT add social features, sharing, or multi-user competition.
- The app should feel fast and minimal. No unnecessary animations or loading screens. A lifter between sets wants to tap, log, and get back to lifting.
- Color scheme: dark mode by default (easier to read in a garage gym). Clean, high-contrast. No neon or overly styled UI. Think "digital logbook" not "fitness influencer app."
- All weight values are in pounds (lbs). No metric conversion needed for V1.
- **NOTHING IS FORCED.** The user can skip any step, leave any field empty, end any workout early, override any suggestion. Do not build mandatory workflows or forced sequences. Every screen needs an exit.

### Seed Data

On first login / account creation, auto-seed the exercise library with the full list below. Set is_custom = false for all seeded exercises.

**QUADS:**
Bodyweight: Squats, Lunges, Bulgarian Split Squats, Pistol Squats, Jump Squats, Step-Ups, Sissy Squats, Wall Sit, Box Jumps, Walking Lunges
Resistance Bands: Band Squats, Band Leg Press, Band Lunges, Band Leg Extensions, Band Front Squats, Band Bulgarian Split Squats, Band Step-Ups, Band Terminal Knee Extension, Band Pistol Squats, Band Side Squats
Dumbbells: Dumbbell Squats, Dumbbell Lunges, Dumbbell Step-Ups, Dumbbell Bulgarian Split Squats, Dumbbell Front Squats, Dumbbell Goblet Squats, Dumbbell Sumo Squats, Dumbbell Squat Jumps, Dumbbell Side Lunges, Dumbbell Sissy Squats
Barbells: Barbell Back Squats, Barbell Front Squats, Barbell Lunges, Barbell Step-Ups, Barbell Bulgarian Split Squats, Barbell Hack Squats, Barbell Zercher Squats, Barbell Overhead Squats, Barbell Squat Jumps, Barbell Box Squats
Gym Equipment: Leg Press Machine, Leg Extension Machine, Smith Machine Squats, Hack Squat Machine, Pendulum Squat Machine, Vertical Leg Press, Sissy Squat Machine, Leg Press (Single-Leg), Cable Squats, Plate-Loaded Squat Machine, Smith Machine Front Squats, Smith Machine Lunges, Smith Machine Step-Ups, Smith Machine Bulgarian Split Squats, Leg Press (High Foot Placement), Leg Press (Narrow Stance), Leg Press (Wide Stance), Cable Lunges, Cable Step-Ups, Cable Bulgarian Split Squats

**HAMSTRINGS / GLUTES:**
Bodyweight: Glute Bridges, Hip Thrusts, Single-Leg Glute Bridges, Romanian Deadlifts (Bodyweight), Nordic Hamstring Curls, Single-Leg Deadlifts, Squat Jumps (focus on glutes), Reverse Lunges, Bulgarian Split Squats (Glute Focus), Donkey Kicks
Resistance Bands: Band Hip Thrusts, Band Glute Bridges, Band Romanian Deadlifts, Band Leg Curls, Band Pull Throughs, Band Lateral Walks, Band Standing Glute Kickbacks, Band Good Mornings, Band Single-Leg Hip Thrusts, Band Seated Abductions
Dumbbells: Dumbbell Romanian Deadlifts, Dumbbell Hip Thrusts, Dumbbell Glute Bridges, Dumbbell Deadlifts, Dumbbell Lunges (Glute Focus), Dumbbell Step-Ups (Glute Focus), Dumbbell Sumo Squats (Glute Focus), Dumbbell Bulgarian Split Squats (Glute Focus), Dumbbell Single-Leg Deadlifts, Dumbbell Good Mornings
Barbells: Barbell Deadlifts, Barbell Hip Thrusts, Barbell Romanian Deadlifts, Barbell Glute Bridges, Barbell Good Mornings, Barbell Sumo Deadlifts, Barbell Lunges (Glute Focus), Barbell Bulgarian Split Squats (Glute Focus), Barbell Stiff-Leg Deadlifts, Barbell Squats (Glute Focus)
Gym Equipment: Leg Curl Machine, Hip Thrust Machine, Glute Drive Machine, Cable Pull Throughs, Cable Kickbacks, Romanian Deadlift Machine, Seated Leg Curl Machine, Lying Leg Curl Machine, Smith Machine Deadlifts, Smith Machine Hip Thrusts, Cable Hip Abduction, Cable Glute Kickback, Glute Master Machine, Reverse Hyperextension Machine, Pendulum Quadruped Hip Extension, Prone Leg Curl Machine, Standing Leg Curl Machine, Smith Machine Squats (Glute Focus), Smith Machine Lunges (Glute Focus), Smith Machine Bulgarian Split Squats (Glute Focus)

**BACK:**
Bodyweight: Pull-ups, Chin-ups, Inverted Rows, Bodyweight Back Extensions, Superman Lifts, Reverse Snow Angels, Prone Y-T-I Raises, Doorway Row, Archer Pull-ups, Australian Pull-ups
Resistance Bands: Band Pull Aparts, Bent-over Band Rows, Band Lat Pulldowns, Band Deadlifts, Standing Band Rows, Single-arm Band Rows, Band Good Mornings, Band Assisted Pull-ups, Face Pulls with Resistance Band, Band Straight Arm Pulldowns
Dumbbells: Single-arm Dumbbell Rows, Bent-over Dumbbell Rows, Dumbbell Deadlifts, Renegade Rows, Dumbbell Pullovers, Incline Bench Rows, Dumbbell Shrugs, Dumbbell Reverse Flyes, Chest Supported Dumbbell Row, Dumbbell High Pull
Barbells: Barbell Deadlifts, Bent-over Barbell Rows, Pendlay Rows, Barbell Shrugs, T-bar Rows, Inverted Barbell Rows, Barbell Good Mornings, Seal Rows, Barbell High Pull, Rack Pulls
Gym Equipment: Lat Pulldown Machine, Seated Cable Row, Cable Face Pulls, Smith Machine Rows, Back Extension Machine, Hammer Strength Iso-Lateral Row, T-Bar Row Machine, Chest Supported Row Machine, Cable Straight Arm Pulldown, Pull-up/Dip Station, Cable Pullover, Single-arm Cable Row, Machine High Row, Machine Low Row, Lat Pushdown, Cable Scapular Retraction, Incline Lever Row, Iso-Lateral High Row, Smith Machine Deadlift, Smith Machine Shrugs

**CHEST:**
Bodyweight: Push-ups, Dips, Bodyweight Chest Flyes, Plyometric Push-ups, Isometric Chest Squeezes, Elevated Push-ups, Archer Push-ups, Pseudo Planche Push-ups, Explosive Push-ups, Rotational Push-ups
Resistance Bands: Band Chest Press, Band Chest Flyes, Band Pullovers, Resistance Band Push-ups, Single-arm Band Chest Press, Band Crossover Flyes, Decline Band Press, Incline Band Flyes, Standing Band Chest Squeeze, Band Around-the-Worlds
Dumbbells: Dumbbell Bench Press, Dumbbell Flyes, Single-arm Dumbbell Bench Press, Dumbbell Pullover, Dumbbell Squeeze Press, Alternating Dumbbell Press, Dumbbell Around-the-Worlds, Dumbbell Floor Press, Incline Dumbbell Pullover, Twisting Dumbbell Bench Press
Barbells: Barbell Bench Press, Close Grip Bench Press, Guillotine Press, Reverse Grip Bench Press, Barbell Pullover, Wide Grip Bench Press, Barbell Decline Press, Incline Barbell Press, Landmine Press, Barbell Floor Press
Gym Equipment: Chest Press Machine, Pec Deck Machine, Cable Crossover, Smith Machine Bench Press, Seated Chest Press Machine, Leverage Chest Press, Cable Flyes, Machine Flyes, Iso-Lateral Chest Press, Vertical Chest Press Machine, Hammer Strength Chest Press, Plate-Loaded Chest Press, Selectorized Chest Press, Cable Chest Press, Assisted Dip Machine, Incline Chest Press Machine, Decline Chest Press Machine, Chest Dip Machine, Standing Chest Press Machine, Converging Chest Press

**SHOULDERS:**
Bodyweight: Pike Push-ups, Handstand Push-ups, Dive Bomber Push-ups, Wall Walks, Inverted Shoulder Press, Bear Crawl, Plank to Downward Dog, Shoulder Tap Push-ups, Yoga Push-ups, Crab Walk
Resistance Bands: Band Pull Aparts, Standing Band Overhead Press, Band Lateral Raises, Band Front Raises, Band Upright Rows, Band Rear Delt Flyes, Band Shrugs, Band Face Pulls, Band External Rotations, Band High Pull
Dumbbells: Dumbbell Overhead Press, Dumbbell Lateral Raises, Dumbbell Front Raises, Arnold Press, Dumbbell Shrugs, Dumbbell Reverse Flyes, Seated Dumbbell Press, Dumbbell Upright Rows, Bent-over Dumbbell Lateral Raises, Dumbbell Cuban Press
Barbells: Barbell Overhead Press, Barbell Push Press, Barbell Upright Rows, Barbell Front Raise, Barbell Shrugs, Bradford Press, Barbell High Pull, Behind the Neck Press, Seated Barbell Press, Z Press
Gym Equipment: Shoulder Press Machine, Cable Lateral Raises, Cable Front Raises, Cable Rear Delt Flyes, Cable Upright Rows, Smith Machine Overhead Press, Pec Deck Rear Deltoid Machine, Leverage Shoulder Press, Cable Face Pulls, Cable Shrugs, Iso-Lateral Shoulder Press Machine, Cable Scapular Retraction, Cable External Rotation, Cable Internal Rotation, Cable Diagonal Raises, Cable High Pull, Machine Lateral Raise, Machine Front Raise, Machine Reverse Flyes, Smith Machine Upright Row

**BICEPS:**
Bodyweight: Chin-ups, Underhand Bodyweight Rows, Commando Pull-ups, Inverted Bicep Curls, Isometric Chin-up Hold, Doorway Bicep Curls, Towel Bicep Curls, Pelican Curls, Head Bangers, Diamond Push-ups (bicep focus)
Resistance Bands: Band Bicep Curls, Band Hammer Curls, Band Preacher Curls, Band Concentration Curls, Band Resistance Curls, Band Zottman Curls, Band Drag Curls, Band Cross Body Curls, Standing Band Curl (overhead anchor), Band Curl with Static Hold
Dumbbells: Dumbbell Bicep Curls, Hammer Curls, Concentration Curls, Preacher Curls, Incline Dumbbell Curls, Zottman Curls, Alternating Dumbbell Curls, Cross Body Hammer Curls, Dumbbell Spider Curls, Dumbbell Supination Curls
Barbells: Barbell Bicep Curls, EZ Bar Curls, Preacher Curls with Barbell, Reverse Grip Barbell Curls, Barbell Drag Curls, Standing Cambered Bar Curls, Seated Barbell Curls, Barbell Spider Curls, Wide Grip Barbell Curls, Close Grip EZ Bar Curls
Gym Equipment: Cable Bicep Curls, Cable Hammer Curls, Preacher Curl Machine, Bicep Curl Machine, Cable Concentration Curls, Cable High Bicep Curls, Seated Cable Curl, Cable Rope Hammer Curls, Dual Cable Bicep Curls, Cable Cross Curls, Iso-Lateral Bicep Curl Machine, Standing One-arm Cable Curl, Cable Curl with Bar Attachment, Cable Drag Curls, Cable Zottman Curls, Cable Supination Curls, Cable Bicep 21s, Cable Reverse Curls, Cable Bicep Curl with Static Hold, Cable Curl Drop Set

**TRICEPS:**
Bodyweight: Diamond Push-ups, Tricep Dips, Bench Dips, Close Grip Push-ups, Pike Push-ups, Bodyweight Skull Crushers, Tricep Plank Extensions, Tiger Bend Push-ups, Overhead Tricep Extension (bodyweight), One-arm Tricep Push-ups
Resistance Bands: Band Tricep Pushdowns, Band Overhead Tricep Extensions, Band Tricep Kickbacks, Band Single-arm Tricep Extensions, Band Lying Tricep Extensions, Band Tricep Press, Band Skull Crushers, Band Reverse Grip Pushdowns, Band Tricep Pulldowns, Band Tricep Dips
Dumbbells: Dumbbell Overhead Tricep Extensions, Dumbbell Skull Crushers, Dumbbell Kickbacks, Dumbbell Tricep Press, Single-arm Dumbbell Overhead Extensions, Dumbbell Tate Press, Dumbbell Floor Press, Dumbbell Close Grip Bench Press, Dumbbell Rolling Tricep Extensions, Dumbbell One-arm Tricep Extensions
Barbells: Close Grip Bench Press, Barbell Skull Crushers, Barbell Overhead Tricep Extension, Barbell Tricep Rollbacks, Barbell Floor Press, Reverse Grip Bench Press, Barbell JM Press, Barbell Tricep Extension to Chin, Barbell Lying Tricep Extension, Barbell Tate Press
Gym Equipment: Cable Tricep Pushdown, Cable Overhead Tricep Extension, Tricep Dip Machine, Cable Tricep Kickbacks, Cable Rope Overhead Extensions, Smith Machine Close Grip Bench Press, Cable Single-arm Tricep Extension, Cable Skull Crushers, Cable Reverse Grip Pushdown, Cable Tricep Press, Tricep Extension Machine, Cable V-bar Pushdown, Cable Tricep Pulldown, Cable Tricep 21s, Cable Tricep Dips, Cable Cross Tricep Extension, Cable Lying Tricep Extension, Cable Tricep Extension with Static Hold, Cable Tricep Extension Drop Set, Cable Tricep Overhead Press

**CORE:**
Bodyweight: Planks, Side Planks, Russian Twists, Leg Raises, Mountain Climbers, Bicycle Crunches, Reverse Crunches, Flutter Kicks, Hollow Body Hold, V-Ups
Resistance Bands: Band Pallof Press, Band Twist, Band Woodchoppers, Standing Band Crunches, Band Kneeling Crunches, Band Oblique Crunches, Band Plank Hold, Band Pull-Downs, Band Russian Twists, Band Leg Raises
Dumbbells: Dumbbell Side Bends, Dumbbell Russian Twists, Dumbbell Woodchoppers, Weighted Planks, Dumbbell Deadbugs, Dumbbell V-Sits, Dumbbell Leg Raises, Dumbbell Flutter Kicks, Dumbbell Hollow Body Hold, Dumbbell Toe Touches
Barbells: Barbell Rollouts, Barbell Russian Twists, Barbell Side Bends, Landmine Twists, Landmine 180s, Barbell Suitcase Deadlifts, Barbell Hip Thrusts (Core Stability), Barbell Back Squat (Core Stability), Barbell Overhead Press (Core Stability), Barbell Deadlift (Core Stability)
Gym Equipment: Cable Crunches, Cable Woodchoppers, Cable Russian Twists, Hanging Leg Raises, Ab Roller Machine, Roman Chair Sit-ups, Captain's Chair Leg Raises, Weighted Crunch Machine, Seated Torso Rotation Machine, Decline Bench Sit-ups, GHD Sit-ups, Incline Leg Raises, Cable Pallof Press, Cable Oblique Crunches, Cable Diagonal Crunches, Cable Reverse Crunches, Cable Hip Twists, Cable Standing Leg Raises, Cable Kneeling Crunches, Cable Plank Hold

Also seed default program settings with Mon/Wed/Fri training days and 2:00 default rest timer. Do NOT seed any working weights -- leave them empty until the user sets them.
