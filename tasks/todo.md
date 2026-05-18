# Calendar App — Todo Checklist

## Tasks

### Step 0 — Project setup
- [x] Create `tasks/todo.md` with checklist and acceptance criteria

### Step 1 — `index.html`
- [x] Create HTML shell with all required DOM IDs
- [x] Include modal markup (overlay, form, all fields)
- [x] Link `style.css` and `app.js`

**Acceptance criteria:**
- File opens in browser with no console errors
- All DOM IDs exist: `#btn-prev`, `#btn-next`, `#btn-today`, `#month-year-label`, `#calendar-grid`, `#modal-overlay`, `#modal-title`, `#event-form`, `#field-title`, `#field-date`, `#field-start`, `#field-end`, `#field-description`, `#field-event-id`, `#error-title`, `#error-date`, `#btn-delete`, `#btn-save`, `#btn-close-modal`

### Step 2 — `style.css`
- [x] CSS custom properties (color palette)
- [x] Body / `#app` base styles (max-width, centered, font)
- [x] `#calendar-header` (flex row, nav buttons)
- [x] `#weekday-labels` (7-column grid, centered text)
- [x] `#calendar-grid` (CSS Grid, 7 columns, minmax row height)
- [x] `.day-cell` (flex column, border, padding, hover)
- [x] `.today` (highlighted border/background)
- [x] `.other-month` (muted text)
- [x] `.event-chip` (pill shape, truncated text)
- [x] `.btn-add-event` (absolute position, hover-only visibility)
- [x] `.hidden` utility class
- [x] Modal styles (`#modal-overlay`, `#modal`)
- [x] Form styles (labels, inputs, error spans, action buttons)
- [x] Responsive breakpoints (640px, 380px)

**Acceptance criteria:**
- 7-column grid renders correctly at 1280px, 768px, and 375px
- `.today` cell visually distinct from others
- `.other-month` cells have muted text
- Modal is centered and dismisses correctly (tested after JS is wired)
- Event chips truncate with ellipsis when text overflows

### Step 3 — `app.js` Storage layer
- [x] Declare `currentYear`, `currentMonth`, `events`, `editingId` at module top
- [x] `loadEvents()` — safe JSON.parse with try/catch, returns `[]` on error
- [x] `saveEvents(events)` — JSON.stringify to `calendarEvents` key
- [x] `generateId()` — timestamp + 4-digit random suffix

**Acceptance criteria:**
- `loadEvents()` returns `[]` when localStorage is empty or corrupt
- `saveEvents()` followed by `loadEvents()` round-trips correctly (verifiable in browser console)
- `generateId()` produces unique strings on repeated calls

### Step 4 — `app.js` Calendar rendering
- [x] `updateHeader()` — updates `#month-year-label` with formatted month/year
- [x] `getEventsForDate(dateStr)` — filters `events` by exact `YYYY-MM-DD` match
- [x] `buildDayCell(dateStr, dayNumber, isToday, isCurrentMonth)` — returns `.day-cell` div
- [x] `buildCalendarGrid()` — 42 fixed cells, correct first-day offset
- [x] `renderCalendar()` — calls `updateHeader()` + `buildCalendarGrid()`

**Acceptance criteria:**
- Grid always shows exactly 42 cells (6 rows × 7 cols)
- First cell of the grid is Sunday of the week containing the 1st
- Cells before day 1 and after last day have `.other-month` class with correct adjacent-month dates
- Today's cell has `.today` class
- Events appear as `.event-chip` elements in their correct cells

### Step 5 — `app.js` Navigation
- [x] `prevMonth()` — decrement month, wrap Dec→Jan (year decrement)
- [x] `nextMonth()` — increment month, wrap Jan→Dec (year increment)  
- [x] `goToToday()` — reset to current system month/year

**Acceptance criteria:**
- Clicking `<` from January 2026 shows December 2025
- Clicking `>` from December 2025 shows January 2026
- "Today" button always lands on the current real month

### Step 6 — `app.js` Modal & CRUD
- [x] `openModal(dateStr, eventId)` — pre-fills date, populates fields on edit, shows `#btn-delete` on edit
- [x] `closeModal()` — hides overlay, resets form, clears `editingId`
- [x] `validateForm()` — checks title (required) and date (required), sets error spans
- [x] `handleFormSubmit(e)` — validates, creates or updates event, saves, re-renders
- [x] `deleteEvent(eventId)` — removes from array, saves, closes modal, re-renders

**Acceptance criteria:**
- Clicking `+` on a cell opens modal with that date pre-filled and title "Add Event"
- Submitting with empty title shows inline error on `#error-title`
- Submitting with empty date shows inline error on `#error-date`
- Valid submission creates a chip on the correct cell and persists on refresh
- Clicking a chip opens modal with "Edit Event" and all fields populated
- Saving edit updates the chip text
- Clicking Delete removes the chip and event

### Step 7 — `app.js` init() & event wiring
- [x] Bind nav buttons (`#btn-prev`, `#btn-next`, `#btn-today`)
- [x] Bind modal close (`#btn-close-modal`, backdrop click, Escape key)
- [x] Bind form submit (`#event-form`)
- [x] Bind delete button (`#btn-delete`)
- [x] Event delegation on `#calendar-grid` for `+` button and chip clicks
- [x] Call `renderCalendar()` at end of `init()`
- [x] Call `init()` on `DOMContentLoaded`

**Acceptance criteria:**
- All interactions work without page reload
- Clicking outside the modal (on the dark overlay) closes it
- Pressing Escape closes the modal
- Event delegation correctly routes clicks to `openModal` with the right date and eventId

### Step 8 — Validation polish
- [x] Clear `#error-title` when user types in `#field-title`
- [x] Clear `#error-date` when user changes `#field-date`
- [x] Show soft warning when end time is before start time

**Acceptance criteria:**
- Error message disappears as soon as the user starts correcting the field
- End-before-start warning appears below the time fields (does not block save)

---

### Step 9 — Accessibility (a11y) audit & fixes

#### A. Keyboard access — Critical
- [x] A1: Convert event chips from `<div>` to `<button>` in `buildDayCell()` so they are focusable and activatable via keyboard
- [x] A2: Convert `.event-more` span to `<button>` so "+N more" is keyboard reachable
- [x] A3: Make `.btn-add-event` visible to keyboard users — show it on `:focus-visible` in addition to `:hover`

#### B. Focus indicators — Critical
- [x] B1: Remove `outline: none` from `.color-option` in `style.css`; add `:focus-visible` ring (`outline: 2px solid var(--blue); outline-offset: 2px`)
- [x] B2: Remove `outline: none` from form inputs; added `outline` via `:focus-visible` instead of suppressing it entirely

#### C. ARIA & semantics — High
- [x] C1: Added `role="grid"` and `aria-labelledby="month-year-label"` to `#calendar-grid`; row wrappers (`div.calendar-row[role="row"]` with `display:contents`) added in JS
- [x] C2: Added `role="row"` to `#weekday-labels` and `role="columnheader"` + full `aria-label` to each `<span>`
- [x] C3: In `buildDayCell()`, added `role="gridcell"`, `aria-label` (full date string), `aria-current="date"` on today; day number marked `aria-hidden`
- [x] C4: Added `aria-live="polite" aria-atomic="true"` to `#month-year-label`
- [x] C5: Added `role="alert"` to `#error-title`, `#error-date`, `#error-time`
- [x] C6: Added `aria-describedby="error-title"` to `#field-title` and `aria-describedby="error-date"` to `#field-date`
- [x] C7: Added `required` and `aria-required="true"` to `#field-title` and `#field-date`
- [x] C8: Added `id="color-label"` to Color label; `#color-picker` gets `role="group" aria-labelledby="color-label"`

#### D. Focus management — High
- [x] D1: `lastFocused = document.activeElement` saved on `openModal()`; restored in `closeModal()`
- [x] D2: `trapFocus()` function added; attached on modal open, removed on modal close; cycles Tab/Shift+Tab within modal focusable elements

#### E. Color contrast — Medium
- [x] E1: Changed `--color-muted` from `#8e8e93` (~3.5:1) to `#6e6e73` (~4.6:1 on white) — passes WCAG AA for all text sizes

---

## Acceptance Criteria Summary

| # | Criterion | Tested? |
|---|---|---|
| AC-1 | Month grid shows correct days for any month/year | ✅ |
| AC-2 | Navigation wraps correctly at Jan/Dec boundaries | ✅ |
| AC-3 | Events persist across page refresh via localStorage | ✅ |
| AC-4 | Title and date are required; inline errors shown | ✅ |
| AC-5 | Add, edit, and delete all work without page reload | ✅ |
| AC-6 | Today's cell is visually distinct | ✅ |
| AC-7 | Modal opens/closes via button, backdrop click, and Escape | ✅ |
| AC-8 | Layout is readable at 375px viewport width | ✅ |
| AC-9 | Event chips truncate cleanly; `+` button visible on hover | ✅ |
| AC-10 | Error messages clear when user corrects the field | ✅ |
| AC-11 | All interactive elements reachable and operable by keyboard alone | ✅ |
| AC-12 | All interactive elements have a visible focus indicator | ✅ |
| AC-13 | Screen reader announces month changes and form errors | ✅ |
| AC-14 | Modal traps focus and restores it on close | ✅ |
| AC-15 | Text contrast meets WCAG AA (4.5:1 for normal, 3:1 for large) | ✅ |

---

## Review

### What was built
Three files, no dependencies, no build step — open `index.html` in any browser.

| File | Size | Responsibility |
|---|---|---|
| `index.html` | ~60 lines | App shell + modal markup |
| `style.css` | ~280 lines | CSS Grid calendar, modal overlay, responsive styles |
| `app.js` | ~200 lines | State, storage, rendering, CRUD, event wiring |

### Changes made
- **`index.html`** — complete HTML skeleton with all DOM IDs; modal with form fields for title (required), date (required), start/end time, and notes
- **`style.css`** — CSS custom property color palette; 7-column CSS Grid for the calendar; fixed 42-cell grid (6 rows) to prevent height shifts during navigation; modal overlay using `position: fixed; inset: 0`; responsive breakpoints at 640px (compressed cells) and 380px (chips become dots)
- **`app.js`** — localStorage persistence under key `calendarEvents`; calendar rendering builds 42 cells with correct prev/next month padding; event delegation on `#calendar-grid` (one listener instead of 42+); `editingId` state variable drives add vs. edit modal mode; soft validation with inline error spans; Escape key and backdrop click close modal

### All acceptance criteria passed
- AC-1: Grid correct for any month/year, including Jan/Dec year-wrap
- AC-2: Navigation wraps correctly at boundaries
- AC-3: Events persist across page refresh
- AC-4: Title and date required; inline errors shown and cleared on correction
- AC-5: Add, edit, delete all work without page reload
- AC-6: Today's cell highlighted (blue circle on day number)
- AC-7: Modal closes via X button, backdrop click, and Escape key
- AC-8: Layout readable at 375px
- AC-9: Event chips truncate with ellipsis; `+` button appears on hover
- AC-10: Error messages clear as user corrects the field
