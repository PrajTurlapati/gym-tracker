# Gym Tracker

A small single-page workout tracker. Pick a day, log your sets (reps and weight) against a fixed weekly plan, and see your last session's numbers for each exercise while you train. Finished workouts are saved to history and can be organized into folders.

## Features

- Weekly workout plan (Monday–Sunday) with sets, target reps, and rest days
- Log reps/weight per set, add extra sets on the fly
- Progress bar showing sets logged vs. total for the day
- "Last time" reference pulled from your most recent session for that day
- History view with folders for organizing past sessions

## Running it

This is a static site with no build step or dependencies. Open `GymTracker.html` directly in a browser, or serve the folder locally, e.g.:

```
npx serve .
```

## Data storage

All drafts, history, and folders are stored in the browser's `localStorage` — nothing leaves your device.

## Editing the workout plan

The weekly plan lives in `WORKOUT_PLAN` at the top of [app.js](app.js). Each day maps to a label and a list of exercises with `sets`, `targetReps`, and optional `note`/`bodyweight` flags.
