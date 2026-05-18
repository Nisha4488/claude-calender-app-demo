// ── A: State ──────────────────────────────────────────────────────────────────

let currentYear;
let currentMonth; // 0-indexed
let events = [];
let editingId = null;

// ── B: Storage ────────────────────────────────────────────────────────────────

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem('calendarEvents')) || [];
  } catch {
    return [];
  }
}

function saveEvents(evts) {
  localStorage.setItem('calendarEvents', JSON.stringify(evts));
}

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

// ── C: Calendar Rendering ─────────────────────────────────────────────────────

function updateHeader() {
  const label = new Date(currentYear, currentMonth, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('month-year-label').textContent = label;
}

function getEventsForDate(dateStr) {
  return events.filter(e => e.date === dateStr);
}

function padDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildDayCell(dateStr, dayNumber, isToday, isCurrentMonth) {
  const cell = document.createElement('div');
  cell.className = 'day-cell' + (isToday ? ' today' : '') + (isCurrentMonth ? '' : ' other-month');
  cell.dataset.date = dateStr;

  const numSpan = document.createElement('span');
  numSpan.className = 'day-number';
  numSpan.textContent = dayNumber;
  cell.appendChild(numSpan);

  const eventList = document.createElement('div');
  eventList.className = 'event-list';

  getEventsForDate(dateStr).forEach(evt => {
    const chip = document.createElement('span');
    chip.className = 'event-chip';
    chip.dataset.id = evt.id;
    chip.textContent = evt.startTime ? `${evt.startTime} ${evt.title}` : evt.title;
    chip.title = evt.title;
    eventList.appendChild(chip);
  });

  cell.appendChild(eventList);

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-event';
  addBtn.type = 'button';
  addBtn.dataset.date = dateStr;
  addBtn.setAttribute('aria-label', 'Add event');
  addBtn.textContent = '+';
  cell.appendChild(addBtn);

  return cell;
}

function buildCalendarGrid() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const today = new Date();
  const todayStr = padDate(today.getFullYear(), today.getMonth(), today.getDate());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Days from previous month to fill the first row
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const fragment = document.createDocumentFragment();

  // 42 cells: 6 rows × 7 cols
  for (let i = 0; i < 42; i++) {
    let dateStr, dayNumber, isCurrentMonth;

    if (i < firstDay) {
      // Previous month padding
      const day = prevMonthDays - firstDay + i + 1;
      const d = new Date(currentYear, currentMonth - 1, day);
      dateStr = padDate(d.getFullYear(), d.getMonth(), day);
      dayNumber = day;
      isCurrentMonth = false;
    } else if (i < firstDay + daysInMonth) {
      // Current month
      const day = i - firstDay + 1;
      dateStr = padDate(currentYear, currentMonth, day);
      dayNumber = day;
      isCurrentMonth = true;
    } else {
      // Next month padding
      const day = i - firstDay - daysInMonth + 1;
      const d = new Date(currentYear, currentMonth + 1, day);
      dateStr = padDate(d.getFullYear(), d.getMonth(), day);
      dayNumber = day;
      isCurrentMonth = false;
    }

    const isToday = dateStr === todayStr;
    fragment.appendChild(buildDayCell(dateStr, dayNumber, isToday, isCurrentMonth));
  }

  grid.appendChild(fragment);
}

function renderCalendar() {
  updateHeader();
  buildCalendarGrid();
}

// ── D: Navigation ─────────────────────────────────────────────────────────────

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function goToToday() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  renderCalendar();
}

// ── E: Modal & CRUD ───────────────────────────────────────────────────────────

function openModal(dateStr, eventId) {
  editingId = eventId || null;

  document.getElementById('modal-title').textContent = editingId ? 'Edit Event' : 'Add Event';
  document.getElementById('field-event-id').value = editingId || '';
  document.getElementById('error-title').textContent = '';
  document.getElementById('error-date').textContent = '';
  document.getElementById('error-time').textContent = '';

  if (editingId) {
    const evt = events.find(e => e.id === editingId);
    if (evt) {
      document.getElementById('field-title').value = evt.title;
      document.getElementById('field-date').value = evt.date;
      document.getElementById('field-start').value = evt.startTime || '';
      document.getElementById('field-end').value = evt.endTime || '';
      document.getElementById('field-description').value = evt.description || '';
    }
    document.getElementById('btn-delete').classList.remove('hidden');
  } else {
    document.getElementById('event-form').reset();
    document.getElementById('field-date').value = dateStr;
    document.getElementById('btn-delete').classList.add('hidden');
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('field-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('event-form').reset();
  document.getElementById('error-title').textContent = '';
  document.getElementById('error-date').textContent = '';
  document.getElementById('error-time').textContent = '';
  document.getElementById('btn-delete').classList.add('hidden');
  editingId = null;
}

function validateForm() {
  let valid = true;

  const title = document.getElementById('field-title').value.trim();
  if (!title) {
    document.getElementById('error-title').textContent = 'Title is required.';
    valid = false;
  }

  const date = document.getElementById('field-date').value;
  if (!date) {
    document.getElementById('error-date').textContent = 'Date is required.';
    valid = false;
  }

  return valid;
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const title = document.getElementById('field-title').value.trim();
  const date = document.getElementById('field-date').value;
  const startTime = document.getElementById('field-start').value;
  const endTime = document.getElementById('field-end').value;
  const description = document.getElementById('field-description').value.trim();

  // Soft warning: end before start
  if (startTime && endTime && endTime < startTime) {
    document.getElementById('error-time').textContent = 'End time is before start time.';
  } else {
    document.getElementById('error-time').textContent = '';
  }

  if (editingId) {
    const idx = events.findIndex(e => e.id === editingId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], title, date, startTime, endTime, description };
    }
  } else {
    events.push({ id: generateId(), title, date, startTime, endTime, description });
  }

  saveEvents(events);
  closeModal();
  renderCalendar();
}

function deleteEvent(eventId) {
  events = events.filter(e => e.id !== eventId);
  saveEvents(events);
  closeModal();
  renderCalendar();
}

// ── F: Initialization ─────────────────────────────────────────────────────────

function init() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  events = loadEvents();

  // Navigation buttons
  document.getElementById('btn-prev').addEventListener('click', prevMonth);
  document.getElementById('btn-next').addEventListener('click', nextMonth);
  document.getElementById('btn-today').addEventListener('click', goToToday);

  // Modal close paths
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Form submit & delete
  document.getElementById('event-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('btn-delete').addEventListener('click', () => deleteEvent(editingId));

  // Validation: clear errors on input
  document.getElementById('field-title').addEventListener('input', () => {
    document.getElementById('error-title').textContent = '';
  });
  document.getElementById('field-date').addEventListener('change', () => {
    document.getElementById('error-date').textContent = '';
  });

  // Event delegation on calendar grid
  document.getElementById('calendar-grid').addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add-event');
    if (addBtn) {
      const dateStr = addBtn.dataset.date;
      openModal(dateStr, null);
      return;
    }

    const chip = e.target.closest('.event-chip');
    if (chip) {
      const cell = chip.closest('.day-cell');
      openModal(cell.dataset.date, chip.dataset.id);
      return;
    }
  });

  renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);
