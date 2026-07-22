# Gym Tracker

A small single-page workout tracker. For any day, pick a workout type, optionally add abs and/or a post-workout run/jog, and log your sets (reps and weight) while you train. Finished workouts are saved to history and can be organized into folders.

## Features

- Pick one of 5 workout types per day (Chest/Triceps, Back/Biceps, Legs, Shoulders & Legs, Rest) — not tied to the calendar weekday
- Independent Abs toggle (one exercise block by default, "+ Add Abs Exercise" for more) and Run/Jog toggle (duration, speed, incline)
- Each workout type has its own color, shown on the picker, as a left-border accent on exercise cards, and as a dot in history
- Log reps/weight per set, add or delete sets on the fly (2-set minimum per exercise)
- Exercise cards turn green once every set has both reps and weight logged, red if partially filled
- Collapsible exercise cards and history entries to keep long lists manageable
- "Last time" reference pulled from your most recent session for that exercise
- Editable session date (defaults to today) for backdating a session you didn't log same-day
- History view, sorted by session date, with folders for organizing past sessions

## Running it

This is a static site with no build step or dependencies. Open `GymTracker.html` directly in a browser, or serve the folder locally, e.g.:

```
npx serve .
```

## Data storage

All drafts, history, and folders are stored in the browser's `localStorage` — nothing leaves your device.

## Editing workout types and colors

The 5 workout types live in `WORKOUT_TYPES` at the top of [app.js](app.js). Each maps to a label and a list of exercises with `targetReps` and optional `note`/`bodyweight` flags. The abs exercise definition (`ABS_EXERCISE_DEF`) and run-tracker fields (`RUN_FIELDS`) are defined nearby.

Per-type colors are CSS variables (`--type-chest`, `--type-back`, etc.) in [style.css](style.css), matched to type names via `WORKOUT_TYPE_SLUGS` in app.js.
