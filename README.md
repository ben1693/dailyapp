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
src/app.js         all logic: state, completions, streaks, charts, storage
```

## Data & privacy

Everything is stored locally under the `lauds.v1` key in `localStorage`. Nothing
is sent anywhere. Use **Manage → Export Backup** to save a copy, and
**Import Backup** to restore it (e.g. on another device or browser).

---

*"Pray without ceasing." — 1 Thessalonians 5:17*
