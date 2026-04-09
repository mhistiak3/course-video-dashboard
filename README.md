# Course Video Dashboard

A modern, clean, developer-friendly dashboard for organizing course videos that are posted in a private Facebook group.

- **No auto-fetching**: you manually paste Facebook video URLs into a local JSON file.
- **Week-based browsing**: collapsible weeks with a fast video list.
- **Search + filter**: find videos instantly by title/topic/week.
- **Watched + notes**: stored locally in your browser (`localStorage`).

## Run locally

```bash
cd course-video-dashboard
npm install
npm run dev
```

Then open the local URL shown in your terminal.

## Data format (very important)

Edit the local file:

- `src/data/weeks.json`

The **top-level value must be an array of weeks**. Each week contains its own videos:

```json
[
  {
    "week": "Week 1",
    "startDate": "2026-04-09",
    "endDate": "2026-04-15",
    "videos": [
      {
        "date": "2026-04-09",
        "title": "Orientation Class (Live)",
        "topic": "Introduction",
        "url": "https://facebook.com/..."
      }
    ]
  }
]
```

### Optional fields (supported)

- **`endDate`** (week): shown as a date range in the UI
- **`addedAt`** (video): ISO datetime string; videos added in the last 7 days get a **New** badge

## Notes

- **One-click open**: the **Open** button launches the Facebook video in a new tab.
- **Privacy**: watched state + notes never leave your machine (browser storage only).

