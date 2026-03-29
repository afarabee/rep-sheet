# Rep Sheet

A tablet-optimized workout tracker built for the Amazon Fire HD 10. Tracks 5×5 strength programs, freeform sessions, body composition, and exercise history — all in a single-user, no-login app with a cyberpunk neon aesthetic.

Live: **[repsheet.ai-with-aims.studio](https://repsheet.ai-with-aims.studio)**

---

## Features

**Workout Tracking**
- 5×5 Strength Program — customizable A/B workout pairs with working weights, progressive overload suggestions, and rest timers
- Freeform Workouts — log any exercise, any order, any rep scheme
- Template Workouts — save and reuse workout structures
- Live workout indicator in the sidebar; pause/resume the session timer at any time
- Navigate away mid-workout and resume without losing data

**Exercise Library**
- 2,500+ exercises from the open-source exercises.json dataset
- Filter by muscle group, equipment, or favorites
- "My gym only" filter (on by default) — shows only exercises matching your owned equipment
- Add custom exercises

**Body Composition**
- Log entries from Fitdays screenshots, DEXA scans, Fitnescity reports, or manual entry
- AI parsing via Supabase Edge Function + Claude Haiku (vision) for automatic data extraction from images and PDFs
- Date picker for past-dated entries
- Tracks weight, body fat %, muscle mass, and more

**Settings**
- Equipment inventory — toggle what you own to power the exercise filter
- Rest timer duration, 5×5 weight increments
- Working weights per exercise
- Anthropic API key (for body comp AI parsing)
- CSV data export

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
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

## Architecture Notes

- **No authentication** — single-user app, no `user_id` columns anywhere
- **No global state** — each workout page manages its own state via custom hooks
- **Workout resumption** — hooks check Supabase for an in-progress workout on mount before creating a new one
- **Body comp parsing** — Supabase Edge Function reads the Anthropic API key from the `program_settings` table (set in app Settings), then calls Claude Haiku with source-specific prompts for Fitdays, DEXA, and Fitnescity formats

---

## Project Structure

```
src/
  components/
    layout/       # AppShell, SidebarNav
    ui/           # shadcn primitives
    workout/      # ExercisePicker
  hooks/          # useActiveWorkout, use5x5Workout, useExercises, useBodyComp, etc.
  pages/          # One file per route
  lib/
    supabase.ts   # Supabase client
```

---

Built by Aimee Farabee · [ai-with-aims.studio](https://ai-with-aims.studio)
