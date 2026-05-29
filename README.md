# LAUDS — Daily Prayer & Discipline

A clean, masculine web app for Catholic men to pray with consistency and track
their spiritual discipline like a training log. Prayers are organized by
**morning**, **afternoon**, and **evening**; each one (and each task) is worth
points that build a daily total. Consistency is tracked with Anki/GitHub-style
visualizations.

![theme](https://img.shields.io/badge/theme-iron%20%26%20gold-c8a046)

## Features

- **Three prayer blocks** — Morning, Afternoon, Evening — seeded with the
  classic Catholic prayers (Morning Offering, the Angelus, Examination of
  Conscience, St. Michael, Act of Contrition, and more). Tap any prayer to read
  its full text, then mark it prayed.
- **Tasks / To-Dos** — a separate, non-prayer section for daily duties
  (read Scripture, an act of charity, train the body, …).
- **Points** — every prayer and task carries a point value (default 1, editable
  up to 100). Completing items grows your **daily total**.
- **Hide-on-complete (default)** — finished items disappear for the day to keep
  the list clean. Flip the *Show completed items* switch to keep them visible.
- **Add / remove anything** — toggle the built-in prayers on or off, add your own
  custom prayers (with text) or tasks, edit point values, and delete custom items.
- **Stats & visualizations**
  - Current streak, best streak, total points, days active, 30-day rate, average.
  - **Consistency heatmap** — a half-year calendar shaded by points earned.
  - **30-day points bar chart**.
  - **Habit strength** — per-item completion rate over the last 30 days.
- **Liturgical calendar awareness** — a banner on the Daily page shows the
  current **season**, **liturgical color** (with a color dot), the day's
  **celebration** (Sundays, solemnities/feasts, and a curated saint-of-the-day),
  a short seasonal note, and **fast/abstinence** badges. It's computed entirely
  offline from the Easter date, so it's correct for any year. Notes on scope:
  the saint list is a curated subset of major solemnities/feasts and popular
  memorials (not exhaustive), and **Ascension** & **Corpus Christi** use the
  universal-calendar Thursday (some countries, including most US dioceses,
  transfer them to the following Sunday).
- **Confession companion** — a dedicated tab with: a **last-confession tracker**
  ("days since," with a gentle nudge after a while); a structured **examination
  of conscience** by the Ten Commandments + Precepts of the Church, with a
  **state-in-life filter** (general / single / married / father / workplace) and
  checkable items that build a private "bring to confession" list; the
  step-by-step **rite of confession** (with the "it has been ___" line auto-filled
  from your tracker); and the **Act of Contrition**. The examination checkmarks
  are stored in a *separate* local key that is **never** part of the backup
  export and are cleared whenever you log a confession.
- **History navigation** — step back through previous days to log or review.
- **Private & local** — all data lives in your browser via `localStorage`.
  Export a JSON backup any time and re-import it later.

## Running it

It's a static site — no build step, no dependencies.

```bash
# from the repo root, any static server works:
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

### Deploying

Push to GitHub and enable **GitHub Pages** (serve from the repo root) — or drop
the folder onto Netlify, Vercel, or any static host.

## Project structure

```
index.html        markup & layout
src/styles.css     iron-&-gold theme
src/data.js        default Catholic prayer library (full prayer texts)
src/liturgical.js  offline liturgical calendar (Easter computus, seasons,
                   colors, feasts, fast/abstinence)
src/confession.js  confession companion content (examination of conscience,
                   the rite, Act of Contrition)
src/app.js         all logic: state, completions, streaks, charts, storage
```

## Data & privacy

Everything is stored locally under the `lauds.v1` key in `localStorage`. Nothing
is sent anywhere. Use **Manage → Export Backup** to save a copy, and
**Import Backup** to restore it (e.g. on another device or browser).

---

*"Pray without ceasing." — 1 Thessalonians 5:17*
