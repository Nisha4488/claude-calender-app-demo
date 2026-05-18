# Calendar App

A simple month-view calendar built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — open `index.html` in any browser.

## Features

- Month grid view with prev/next navigation
- Add, edit, and delete events
- Events stored in `localStorage` (persist across page refreshes)
- Add-event modal with basic validation
- Responsive layout (desktop, tablet, mobile)

## Getting Started

```bash
git clone https://github.com/Nisha4488/claude-calender-app-demo.git
cd claude-calender-app-demo
open index.html
```

No `npm install` or dev server needed.

## Usage

| Action | How |
|---|---|
| Add event | Hover over a day cell → click `+` |
| Edit event | Click an event chip on the calendar |
| Delete event | Open an event → click **Delete event** |
| Navigate months | Click `‹` / `›` arrows |
| Jump to today | Click **Today** button |
| Close modal | Click `×`, press `Escape`, or click the backdrop |

## Project Structure

```
calender-app-demo/
├── index.html      # App shell and modal markup
├── style.css       # CSS Grid calendar, modal, responsive styles
├── app.js          # State, rendering, localStorage CRUD, event wiring
└── tasks/
    └── todo.md     # Implementation checklist and acceptance criteria
```

## Data Format

Events are stored in `localStorage` under the key `calendarEvents` as a JSON array:

```json
[
  {
    "id": "1716038400000-4821",
    "title": "Team standup",
    "date": "2026-05-18",
    "startTime": "09:00",
    "endTime": "09:30",
    "description": "Daily sync"
  }
]
```
