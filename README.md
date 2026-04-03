# Rep Sheet

A tablet-optimized workout tracker built for the Amazon Fire HD 10. Tracks 5×5 strength programs, freeform sessions, body composition, and exercise history — all in a single-user, no-login app with a cyberpunk neon aesthetic.

Live: **[repsheet.ai-with-aims.studio](https://repsheet.ai-with-aims.studio)**

---

## Features

**Workout Tracking**
- 5×5 Strength Program — customizable A/B workout pairs with working weights, progressive overload suggestions, and rest timers
- Freeform Workouts — log any exercise, any order, any rep scheme
- Template Workouts — save and reuse workout structures
- Stretch Sessions — quick-log mobility work with duration and notes
- Three exercise modes: standard (weight + reps), timed (inline count-up timer), and count (for bands/bodyweight)
- Visual "Count Mode" / "Timed Mode" badges on the log set card so you always know the active mode
- Live workout indicator in the sidebar; pause/resume the session timer at any time
- Navigate away mid-workout and resume without losing data

**Calendar**
- Month grid view with workout indicators per day
- Day detail panel showing completed workouts
- Schedule workouts for future dates

**Exercise Library**
- 2,500+ exercises from the open-source exercises.json dataset
- Filter by muscle group, equipment type, favorites, or custom exercises
- Equipment type filter chips (Barbell, Dumbbell, Cable, etc.)
- "My gym only" toggle — shows only exercises matching your owned equipment
- Add custom exercises from the Library or inline from the exercise picker during template/workout config
- Inline creation pre-fills the exercise name from your search term and auto-adds it to your template/workout on save

**Body Composition**
- Log entries from Fitdays screenshots, DEXA scans, Fitnescity reports, or manual entry
- AI parsing via Supabase Edge Function + Claude Haiku (vision) for automatic data extraction from images and PDFs
- Date picker for past-dated entries
- Tracks weight, body fat %, muscle mass, and more

**Settings**
- Equipment inventory — toggle what you own to power the exercise filter
- Rest timer duration, 5×5 weight increments
- Working weights per exercise (auto-saved after each set)
- Anthropic API key (for body comp AI parsing)
- CSV data export

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 (route-based lazy loading + vendor/charts chunk splitting) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Lucide icons |
| Backend | Supabase (Postgres + Edge Functions) |
| AI | Claude Haiku via Anthropic API (body comp parsing) |
| Hosting | Cloudflare Pages |
| Fonts | Teko, Saira, Martian Mono |

---

## Local Development

**Prerequisites:** Node.js 18+, a Supabase project

```bash
git clone https://github.com/afarabee/rep-sheet.git
cd rep-sheet
npm install
```

Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deployment

Hosted on Cloudflare Pages, connected to this GitHub repo. Every push to `main` triggers an automatic deploy.

Build settings:
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Environment variables required in Cloudflare Pages settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Deploy Your Own

Rep Sheet is designed to be self-hosted. Each person runs their own instance with their own database — no shared data, no accounts.

### What you'll need

- A [Supabase](https://supabase.com) account (free tier works)
- A [Cloudflare Pages](https://pages.cloudflare.com) account (free tier works)
- An [Anthropic API key](https://console.anthropic.com) (only needed for body comp AI parsing — optional)

### Step 1 — Set up the database

1. Create a new Supabase project
2. Open the SQL Editor in your Supabase dashboard
3. Paste and run the contents of [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql)

### Step 2 — Seed the exercise library

The exercise library uses the open-source [exercises.json](https://github.com/wrkout/exercises.json) dataset (2,500+ exercises, public domain).

1. Download `exercises.json` from that repo
2. Write a short import script (or use the Supabase dashboard CSV import) to load exercise `name`, `muscles` (→ `muscle_group`), and `equipment` (→ `equipment_type`) into the `exercises` table

### Step 3 — Deploy the Edge Function

The body comp AI parsing runs as a Supabase Edge Function. Deploy it with the Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase functions deploy parse-fitdays --project-ref YOUR_PROJECT_REF
```

Or paste the contents of [`supabase/functions/parse-fitdays/index.ts`](supabase/functions/parse-fitdays/index.ts) directly into the Supabase Edge Functions editor.

### Step 4 — Deploy the app

1. Fork this repo on GitHub
2. Connect it to Cloudflare Pages (Settings → Builds & Deployments → Connect to Git)
3. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in Cloudflare Pages settings:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

Deploy. Your instance is live with a clean database — no one else's data.

### Step 5 — Configure the app

Once deployed, open Settings in the app:
- Toggle the equipment you own (powers the "My gym only" exercise filter)
- Add your Anthropic API key if you want AI body comp parsing
- Set your 5×5 working weights

---

## Architecture Notes

- **No authentication** — single-user app, no `user_id` columns anywhere
- **No global state** — each workout page manages its own state via custom hooks
- **Workout resumption** — hooks check Supabase for an in-progress workout on mount before creating a new one
- **Shared formatters** — `src/lib/formatters.ts` centralizes date, duration, workout type, and number formatting across all pages
- **Shared NumericInput** — `src/components/workout/NumericInput.tsx` used by ActiveWorkout, FiveByFiveWorkout, and the inline exercise timer
- **Route-based lazy loading** — pages load on demand via `React.lazy()` + `Suspense`, keeping the entry bundle at ~13KB
- **Body comp parsing** — Supabase Edge Function reads the Anthropic API key from the `program_settings` table (set in app Settings), then calls Claude Haiku with source-specific prompts for Fitdays, DEXA, and Fitnescity formats

---

## Project Structure

```
src/
  components/
    layout/       # AppShell, SidebarNav, BottomNav, MobileBackButton
    ui/           # shadcn primitives
    workout/      # ExercisePicker (with inline create), NumericInput
  hooks/          # useActiveWorkout, use5x5Workout, useExercises, useExerciseTimer, etc.
  pages/          # One file per route (Home, Library, ActiveWorkout, Calendar, etc.)
  lib/
    supabase.ts   # Supabase client
    formatters.ts # Shared date/time/workout formatting
```

---

Built by Aimee Farabee · [ai-with-aims.studio](https://ai-with-aims.studio)
