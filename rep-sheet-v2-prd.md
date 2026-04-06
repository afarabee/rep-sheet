# Rep Sheet V2 — Product Requirements Document

**Author:** Aimee Farabee
**Date:** March 26, 2026
**Build Tool:** Claude Code
**Target Device:** Amazon Fire HD 10 (10.1" screen), both orientations
**Backend:** Supabase (no auth — single-user app)
**Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
**Exercise Data:** exercises.json open-source dataset (2,500+ exercises, names and metadata only — no images/videos)

---

## Problem Statement

The existing Rep Sheet V1 was scaffolded with an over-engineered spec, hard-coded exercise data, and a phone-first layout that doesn't match the actual use case: a dedicated tablet mounted in a home gym. V2 is a ground-up rebuild optimized for a 10.1" tablet screen, powered by an external exercise dataset instead of hand-rolled seed data, with no auth overhead (single user), and expanded to include progress visualization, body measurements, goal tracking, and other features that were explicitly excluded from V1.

The user is an experienced lifter who trains in a home gym with specific equipment. The app needs to be fast, opinionated about UX, and respectful of the user's knowledge — no hand-holding, no forced flows, no assumptions about what weight to lift.

## Target User

Single user (Aimee). Experienced lifter. Trains in a home gym with a defined set of equipment. Uses a 5x5 program as the primary structure but also does freeform workouts. Tracks body composition via Fitdays smart scale. Wants to see progress over time without social features or gamification.

---

## Goals

1. **Replace the phone-first V1 with a tablet-optimized app** that takes full advantage of the Fire HD 10's 10.1" screen in both portrait and landscape orientations.
2. **Eliminate manual exercise data management** by using the exercises.json open-source dataset (2,500+ exercises, names and metadata only) instead of hand-seeding 520 exercises.
3. **Enable progress tracking over time** with charts, 1RM calculations, body measurement trends, and goal tracking — features explicitly excluded from V1.
4. **Make workout logging as fast as possible** — tap, log, rest, next. Large touch targets, minimal screen interactions between sets.
5. **Build a single-user app with no auth** — skip login, skip user management, go straight to the app.

## Non-Goals

1. **Social features** — no friend connections, workout sharing, community forums, or social media integration. This is a personal tool.
2. **Gamification** — no badges, achievements, streaks, or rewards. The weights going up is the reward.
3. **Multi-user support** — no auth, no user accounts, no plans to add them. Single user, single device.
4. **Superset/circuit grouping** — maybe later, but not in any initial phase. Log exercises in order.
5. **Exercise images/videos** — the library is names and metadata only. No form images, no videos, no media assets. The user knows how to do the exercises.
6. **Voice entry** — removed from scope. Tap-to-enter is sufficient for a tablet with large touch targets.
7. **Drag-and-drop** — deferred. Tap-to-add and manual reorder buttons for now. Drag-and-drop can be added later as a UX enhancement.
8. **Offline support** — descoped. The tablet will have WiFi access in the gym.
9. **Progress photos** — descoped. No photo upload or storage features.
10. **Push notifications** — descoped. Reminders will use email and calendar integration instead.
11. **Phone layout** — this is tablet-first. If it also works on a phone, great, but we're not designing for it.

---

## Design Principles

1. **Nothing is forced.** Every screen has a way to skip, override, or exit. The user knows what they're doing.
2. **No assumptions about weight, reps, or exercises.** Don't default working weights. Don't pre-fill anything the user hasn't explicitly set.
3. **Fast between sets.** A lifter resting between sets wants to tap, log, and get back to lifting. Minimize interactions.
4. **Tablet-native.** Sidebar navigation, multi-pane layouts, large touch targets. This is not a scaled-up phone app.
5. **Purpose-built but not locked down.** The app should feel like it was built for this tablet and this gym, but it's still a regular app with standard navigation patterns.

---

## Tablet UI Specifications

**Device:** Amazon Fire HD 10 (10.1", 1920x1200 resolution)
**Orientations:** Both portrait and landscape, optimized layouts for each
**Navigation:** Persistent sidebar (collapsible in portrait mode to maximize screen space)
**Touch targets:** Minimum 48x48px for all interactive elements — larger for primary actions during workouts
**Keyboard:** Numeric keypad for weight/rep entry (contextual)
**Theme:** "Super Aimee" — cyberpunk neon aesthetic inspired by the user's personal avatar/mascot character. Dark mode default with light mode toggle.

**Super Aimee Visual Identity:**
- **Color palette:** Deep purple/navy backgrounds (#0F0A1A, #1A1028), hot magenta accent (#E91E8C), cyan/teal secondary (#00E5FF), mint green for success states (#7DFFC4), warm white text (#F0EAF4)
- **Style:** Neon glow effects on key elements (accent borders, active states, timers), subtle radial gradients, cyberpunk energy without being overwhelming
- **Avatar placement:** Super Aimee illustrations appear throughout the app — hero image on home screen, small avatar in sidebar nav, contextual appearances in empty states and workout completion screens
- **Image assets:** Existing Super Aimee illustrations are saved at `C:\Users\aimee\rep-sheet\images\`. Mix of these existing illustrations and new ones generated for specific app contexts (lifting, resting, celebrating, etc.)
- **Typography:** Bold, athletic, uppercase headers with generous letter-spacing. Tabular numerals for weight/rep displays.

### Layout Strategy

**Landscape mode (primary for propped-on-stand use):**
- Sidebar nav on left (always visible)
- Main content area with multi-pane layouts where useful (e.g., exercise list + exercise detail side by side)
- During active workout: exercise list on left, current set logging on right

**Portrait mode (for hand-held use):**
- Sidebar collapses to icon-only rail or hamburger menu
- Full-width content area
- Bottom action bar for primary workout actions (log set, next exercise)

---

## Feature Requirements by Phase

### Phase 1: Foundation (Must Ship)

Everything needed to log a workout on the tablet.

#### 1.1 Exercise Library (P0) - DONE
**Source:** exercises.json open-source dataset (~2,500 exercises, names and metadata only)

- Import and index the exercises.json dataset into Supabase (exercise names, muscle groups, equipment types — no images or videos)
- Browse exercises by muscle group and equipment type
- Search exercises by name
- Each exercise can be tied to a specific piece of equipment from the user's inventory (e.g., "Bench Press" → "Barbell" + "Flat Bench")
- Mark exercises as favorites for quick access
- Add custom exercises (name + muscle group + equipment + optional notes)
- Edit or deactivate any exercise (deactivated = hidden from pickers, preserved in history)
- Favorites section appears at the top of all exercise pickers

**Acceptance Criteria:**
- [ ] All exercises from exercises.json are importable and browsable
- [ ] Search returns results as the user types (no submit button needed)
- [ ] Exercises can be associated with equipment from the user's inventory
- [ ] Favorites persist across sessions
- [ ] Custom exercises appear alongside dataset exercises with a "custom" indicator
- [ ] Deactivated exercises are hidden from pickers but visible in workout history

#### 1.2 Equipment Inventory (P0) - DONE
- User defines what equipment they have in their home gym (expected: fewer than a dozen items)
- Simple checklist: barbell, dumbbells, resistance bands, pull-up bar, bench, squat rack, etc.
- Exercises in pickers can be filtered to "my equipment only"
- Global toggle: show all exercises vs. show only exercises matching my equipment
- Equipment inventory is editable in Settings
- Exercises can be linked to specific equipment pieces (see 1.1)

**Acceptance Criteria:**
- [ ] User can select/deselect equipment they own from a predefined list
- [ ] User can add custom equipment items
- [ ] Exercise pickers respect the equipment filter when enabled
- [ ] Filter is a toggle, not permanent — user can always browse everything
- [ ] Equipment selection persists across sessions

#### 1.3 Freeform Workout (P0) - DONE
- Start a blank workout with no preset exercises
- Add exercises from the library picker (browse, search, favorites)
- Log sets per exercise: weight (lbs) + reps per set, unlimited sets
- Add custom exercises on the fly (adds to library permanently)
- Reorder (up/down buttons), remove, or skip exercises freely
- End workout at any time — partial saves are fine

**Acceptance Criteria:**
- [ ] Workout starts immediately with an empty exercise list
- [ ] Exercise picker is accessible at all times during the workout
- [ ] Sets log with weight and reps; weight field allows empty (bodyweight exercises)
- [ ] Reorder via up/down buttons works
- [ ] Workout auto-saves periodically (no data loss on crash/close)
- [ ] "End Workout" saves whatever was logged

#### 1.4 5x5 Structured Program (P0) - DONE
- Two customizable workouts: Workout A and Workout B
- User configures which exercises go in each workout (in Settings)
- App auto-alternates A/B; home screen shows which is next
- User can override and pick either one
- Guided set-by-set logging: 5 sets x 5 reps per exercise (configurable per exercise)
- Weight carries forward from previous set (type once unless changing)
- Reps default to 5 but user can change
- Rest timer auto-starts after logging a set
- Auto-advance to next exercise when all sets are done
- User can skip ahead, go back, or add ad-hoc exercises at any time
- After main lifts, move to Ab Circuit phase
- End workout at any time — partial saves are fine

**Acceptance Criteria:**
- [ ] User can configure exercises in Workout A and Workout B from Settings
- [ ] Home screen shows which workout (A or B) is next based on history
- [ ] Override is always available — user can pick A or B regardless
- [ ] Set indicators show pending/complete/failed status
- [ ] Weight persists across sets within an exercise
- [ ] Ad-hoc exercises can be added mid-workout
- [ ] Partial workouts save as-is

#### 1.5 Progressive Overload (P0) - DONE
- When user completes all prescribed sets/reps for a 5x5 exercise, app suggests a weight increase
- Increment amounts are configurable per exercise category (upper body, squat, deadlift)
- If user fails to complete all reps for 3 consecutive sessions on the same exercise, app suggests a deload
- All suggestions are skippable — never forced

**Acceptance Criteria:**
- [ ] Suggestion appears as a dismissible prompt, not a modal that blocks
- [ ] User can accept, modify, or ignore the suggestion
- [ ] Consecutive failure count resets when user completes all sets
- [ ] Increment amounts are editable in Settings

#### 1.6 Ab Circuit (P0) - DONE
- After 5x5 main lifts (or added manually in freeform)
- Shows checklist of exercises from user's configured ab circuit list
- Round counter (how many rounds of the circuit)
- Configurable in Settings (pick exercises from Core muscle group)
- Skippable entirely
- If no ab exercises configured: "No ab exercises configured. Add some in Settings or skip."

**Acceptance Criteria:**
- [ ] Ab circuit config pulls from Core exercises in the library
- [ ] Checklist items can be checked off individually
- [ ] Round counter increments and is editable
- [ ] Skip button is always visible

#### 1.7 Rest Timer (P0) - DONE
- Configurable default rest time (default: 2 minutes)
- Auto-starts after logging any set (both 5x5 and freeform)
- +/- buttons adjust by configurable increment (default: 30 seconds)
- Cancel button stops timer immediately
- Sound/vibrate alert when timer completes
- Timer is always optional — user can start logging next set without waiting

**Acceptance Criteria:**
- [ ] Timer counts down with large, readable display
- [ ] +/- buttons adjust live during countdown
- [ ] Audio/vibration alert fires on completion
- [ ] Timer does not block set logging — user can dismiss and log anytime
- [ ] Default time and increment are configurable in Settings

#### 1.8 Workout History (P0) - need to confirm
- Scrollable list of past workouts: date, type (5x5 A, 5x5 B, Template Name, Freeform), completion status
- Tap to see full detail: exercises, sets, weights, reps, completion/failure status, ab circuit rounds, notes
- "Save as Template" from any workout detail
- Search and filter by date, exercise, workout type

**Acceptance Criteria:**
- [ ] History list loads quickly even with 100+ workouts
- [ ] Detail view shows all logged data for that session
- [ ] "Save as Template" captures exercise list and prescribed sets/reps (not weights)
- [ ] Filter by workout type works
- [ ] Search by exercise name works

#### 1.9 Workout Templates (P0) - DONE
- Save workouts as templates from history
- Create templates from scratch: name, add exercises from picker, set optional prescribed sets/reps, reorder (up/down buttons)
- Start a workout from a template (pre-populated but fully editable during workout)
- Edit, rename, duplicate, delete templates in Settings

**Acceptance Criteria:**
- [ ] Templates store exercise list, order, and prescribed sets/reps — NOT weights
- [ ] Starting from a template opens a live workout with the template's exercises pre-loaded
- [ ] User can modify everything during a template-based workout
- [ ] Reorder via up/down buttons works in template builder

#### 1.10 Workout Notes (P0) - DONE
- Freeform text field on each workout
- Notes persist in workout history

#### 1.11 Settings (P0) - DONE
All settings editable inline. Changes save immediately with a brief "Saved" toast.

Sections:
- **Equipment Inventory**: select/deselect equipment you own
- **5x5 Program Config**: configure Workout A and B exercises, training days (day picker), weight increment amounts
- **Rest Timer**: default time, increment amount
- **Ab Circuit**: pick Core exercises for the circuit, reorder
- **Working Weights**: editable weight per exercise (no defaults, no assumptions)
- **Templates**: manage all templates
- **Exercise Library**: full library management (also accessible as its own top-level nav item)
- **Body Comp API Key**: Anthropic API key for Fitdays parsing (stored in Supabase, masked after save)
- **Theme**: dark/light mode toggle
- **Data Export**: export workout data as CSV

**Acceptance Criteria:**
- [ ] All sections are accessible and editable
- [ ] Changes auto-save with visual confirmation
- [ ] Settings page is well-organized for tablet UX (not a single long scroll)
- [ ] API key is masked (show last 4 characters only)

#### 1.12 Sidebar Navigation (P0)
- Persistent sidebar with sections: Home, Active Workout (when in progress), History, Calendar, Body Comp, Exercise Library, Settings
- Landscape: full sidebar with labels
- Portrait: collapsible to icon-only rail
- Active workout indicator when a workout is in progress - DONE

#### 1.13 Home Screen (P0) - DONE
- App title: "Rep Sheet"
- Primary action: "Start 5x5 Workout" (shows A or B based on auto-alternation)
- Secondary action: "Start Freeform Workout"
- "Start from Template" button showing saved templates
- Quick view of recent workout history (last 3-5 sessions)
- Next training day indicator based on configured schedule

#### 1.14 Dark/Light Mode (P1)
- Dark mode as default
- Light mode toggle in Settings
- Theme persists across sessions

---

### Phase 2: Body & Progress Tracking

#### 2.1 Body Comp / Fitdays Screenshot Parsing (P0)  DONE
- "Body Comp" section in sidebar nav
- History of past entries (date, weight, body fat %, muscle mass, etc.) — most recent first
- "Log Weigh-In" button opens upload flow
- Upload Fitdays screenshot → Anthropic Claude API (vision) extracts: Weight (lbs), Body Fat %, BMR (kcal), Fat Mass (lbs), Body Age, Muscle Mass (lbs), Skeletal Muscle %, Subcutaneous Fat %, Visceral Fat
- Confirmation form with all extracted values — user reviews and corrects before saving
- Parse failure: pre-fill what was extracted, leave rest as empty fields for manual entry
- API call via Supabase Edge Function (key stored server-side)

**Acceptance Criteria:**
- [ ] Screenshot upload accepts images from device gallery
- [ ] API call succeeds and returns parsed values
- [ ] User can correct any value before saving
- [ ] Partial parse results are handled gracefully
- [ ] Entries stored in Supabase and appear in history list

#### 2.2 Body Measurements Tracking (P1)
- Manual entry for body measurements: chest, waist, arms (L/R), legs (L/R), hips, neck
- Date-stamped entries
- History view with entries over time
- Measurement categories are configurable (user can add/remove measurement types)

#### 2.3 Progress Charts & Visualization (P0)
- **Workout charts:** Weight lifted over time per exercise, volume (sets × reps × weight) over time, workout frequency
- **Body comp charts:** Weight trend, body fat % trend, muscle mass trend
- **1RM tracking:** Estimated 1RM per exercise over time (calculated from logged sets using Epley or Brzycki formula)
- Charts are interactive: zoom, select time periods, tap data points for detail
- Optimized for 10.1" tablet display

**Acceptance Criteria:**
- [ ] Charts render smoothly with months of data
- [ ] Time period selector: 1 week, 1 month, 3 months, 6 months, 1 year, all time
- [ ] 1RM calculation uses a recognized formula and is clearly labeled as an estimate
- [ ] Charts work in both portrait and landscape

#### 2.4 Goal Setting & Tracking (P1)
- Set specific goals: target weight for an exercise, target body weight, target body fat %, target measurement, custom goal
- Track progress toward each goal with a visual indicator (progress bar or similar)
- Goals appear on the home screen or a dedicated Goals section
- Mark goals as completed or abandoned
- No deadlines required (but optional)

---

### Phase 3: Quality of Life

#### 3.1 Calendar View (P1)
- Calendar view of past workouts (which days you trained, what type)
- Planned/scheduled future workouts based on training day config
- Tap a day to see workout detail or start a workout for that day

#### 3.2 Workout Reminders (P1)
- Email reminders on configured training days
- Google Calendar integration: auto-create calendar events for training days
- Configurable reminder time (e.g., "Remind me at 6 AM on training days")
- No push notifications — rely on email and calendar alerts

#### 3.3 Data Export (P1)
- Export all workout data as CSV
- Export body comp data as CSV
- Export from Settings page

---

## Database Schema (Supabase)

No auth tables needed. Single user — all data is global (no user_id foreign keys).

**exercises** — id (uuid), name (text), muscle_group (text), equipment_type (text), equipment_id (FK to equipment_inventory, nullable), description (text, nullable), is_active (boolean, default true), is_custom (boolean, default false), is_favorite (boolean, default false), source (text, default 'exercises_json'), created_at

**equipment_inventory** — id (uuid), name (text), equipment_type (text), is_owned (boolean, default false), is_custom (boolean, default false)

**program_settings** — id (uuid), training_days (text array, default ['monday','wednesday','friday']), rest_seconds_default (integer, default 120), rest_seconds_increment (integer, default 30), increment_upper_lbs (numeric, default 5), increment_squat_lbs (numeric, default 5), increment_deadlift_lbs (numeric, default 10), theme (text, default 'dark'), anthropic_api_key (text, nullable), updated_at

**five_by_five_config** — id (uuid), workout_label (text, 'A' or 'B'), exercise_id (FK to exercises), sort_order (integer)

**working_weights** — id (uuid), exercise_id (FK to exercises), weight_lbs (numeric), updated_at

**workout_templates** — id (uuid), name (text), notes (text, nullable), created_at, updated_at

**workout_template_exercises** — id (uuid), template_id (FK), exercise_id (FK), sort_order (integer), prescribed_sets (integer, nullable), prescribed_reps (integer, nullable)

**workouts** — id (uuid), workout_type (text: 'five_by_five_a', 'five_by_five_b', 'freeform', 'template'), template_id (FK, nullable), started_at (timestamptz), completed_at (timestamptz, nullable), notes (text, nullable)

**workout_exercises** — id (uuid), workout_id (FK), exercise_id (FK), sort_order (integer), prescribed_sets (integer, nullable), prescribed_reps (integer, nullable)

**workout_sets** — id (uuid), workout_exercise_id (FK), set_number (integer), weight_lbs (numeric, nullable), reps (integer, nullable), completed (boolean, default false), created_at

**ab_circuit_config** — id (uuid), exercise_id (FK), sort_order (integer)

**ab_circuit_logs** — id (uuid), workout_id (FK), rounds_completed (integer), notes (text, nullable)

**failed_attempts** — id (uuid), exercise_id (FK), consecutive_failures (integer, default 0), last_failed_at (timestamptz)

**body_comp_entries** — id (uuid), recorded_at (timestamptz), weight_lbs (numeric, nullable), body_fat_pct (numeric, nullable), bmr_kcal (numeric, nullable), fat_mass_lbs (numeric, nullable), body_age (integer, nullable), muscle_mass_lbs (numeric, nullable), skeletal_muscle_pct (numeric, nullable), subcutaneous_fat_pct (numeric, nullable), visceral_fat (numeric, nullable), screenshot_url (text, nullable), created_at

**body_measurements** — id (uuid), recorded_at (timestamptz), measurement_type (text), value_inches (numeric), created_at

**goals** — id (uuid), goal_type (text), description (text), target_value (numeric, nullable), current_value (numeric, nullable), exercise_id (FK, nullable), status (text, default 'active'), created_at, completed_at (timestamptz, nullable)

**reminder_settings** — id (uuid), email_enabled (boolean, default false), calendar_enabled (boolean, default false), reminder_time (text, default '06:00'), email_address (text, nullable), updated_at

---

## Open Questions

1. **exercises.json data structure** — Need to clone the repo and inspect the actual data structure and coverage for home gym equipment categories. Are resistance bands, bodyweight exercises, and home gym equipment well-represented? We only need names and metadata (no images/videos). *(Owner: Build)*

2. **Supabase Edge Function for Claude API** — With no auth, the Edge Function for Fitdays screenshot parsing will be publicly callable. **Decision: Accept the risk.** This is a single-user personal app. Mitigate by rate-limiting the function if needed. *(Resolved)*

3. **Visual identity** — **Resolved.** V2 uses the "Super Aimee" cyberpunk neon theme based on Aimee's personal avatar/mascot. Color palette: deep purple backgrounds, magenta accent, cyan secondary, mint success states. Super Aimee illustrations placed throughout the app (home hero, sidebar avatar, empty states, workout completion). Mix of existing and newly generated illustrations.

4. **Google Calendar integration for reminders** — What's the simplest way to create calendar events from the app? Options: Google Calendar API (requires OAuth), or generate .ics files the user can import manually. *(Owner: Build)*

5. **Email reminders architecture** — Sending email reminders requires a backend service (Supabase Edge Function + email service like Resend, or a scheduled task). Need to decide on the approach. *(Owner: Build)*

---

## Phasing Summary

| Phase | What Ships | Priority |
|-------|-----------|----------|
| **Phase 1** | Exercise library (names only), equipment inventory, freeform workouts, 5x5 mode, templates, ab circuit, rest timer, workout history, settings, sidebar nav, home screen, dark/light mode | P0 — the app doesn't work without this |
| **Phase 2** | Body comp/Fitdays parsing, body measurements, charts & visualization, 1RM tracking, goal setting | P0-P1 — progress tracking is a key upgrade from V1 |
| **Phase 3** | Calendar view, workout reminders (email + calendar), data export | P1 — quality of life improvements |

### Deferred (Future Consideration)
- **Drag-and-drop** — reorder exercises via drag instead of up/down buttons
- **Voice entry** — "225 for 5" hands-free logging via Web Speech API
- **Superset/circuit grouping** — group exercises into supersets
- **Progress photos** — upload and compare photos over time
- **Offline support** — service worker for no-WiFi usage
- **Push notifications** — browser-based push alerts

---

## Timeline Considerations

- No hard deadlines — this is a personal project
- Phase 1 is the build target for the first Claude Code session(s)
- Phase 2 can follow immediately or after Phase 1 is stable
- Phase 3 is "when I get to it" territory
- The designer skill in Claude Code should be invoked for visual identity before building UI components
