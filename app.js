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
  const d = new Date(currentYear, currentMonth, 1);
  const month = d.toLocaleString('default', { month: 'long' });
  document.getElementById('month-year-label').innerHTML =
    `<strong>${month}</strong> ${currentYear}`;
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

  const dayEvents = getEventsForDate(dateStr);
  const maxVisible = 3;
  dayEvents.slice(0, maxVisible).forEach(evt => {
    const chip = document.createElement('div');
    chip.className = 'event-chip';
    chip.dataset.id = evt.id;
    chip.style.backgroundColor = evt.color || '#007aff';
    chip.title = evt.title;

    const dot = document.createElement('span');
    dot.className = 'event-dot';

    const label = document.createElement('span');
    label.className = 'event-label';
    label.textContent = evt.startTime ? `${evt.startTime} ${evt.title}` : evt.title;

    chip.appendChild(dot);
    chip.appendChild(label);
    eventList.appendChild(chip);
  });

  if (dayEvents.length > maxVisible) {
    const more = document.createElement('span');
    more.className = 'event-more';
    more.textContent = `+${dayEvents.length - maxVisible} more`;
    eventList.appendChild(more);
  }

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

function setSelectedColor(color) {
  document.getElementById('field-color').value = color;
  document.querySelectorAll('.color-option').forEach(btn => {
    if (btn.dataset.color === color) {
      btn.style.boxShadow = `0 0 0 2px #fff, 0 0 0 4px ${color}`;
    } else {
      btn.style.boxShadow = 'none';
    }
  });
}

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
      setSelectedColor(evt.color || '#34c759');
    }
    document.getElementById('btn-delete').classList.remove('hidden');
  } else {
    document.getElementById('event-form').reset();
    document.getElementById('field-date').value = dateStr;
    document.getElementById('btn-delete').classList.add('hidden');
    setSelectedColor('#34c759');
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
  const color = document.getElementById('field-color').value || '#34c759';

  // Soft warning: end before start
  if (startTime && endTime && endTime < startTime) {
    document.getElementById('error-time').textContent = 'End time is before start time.';
  } else {
    document.getElementById('error-time').textContent = '';
  }

  if (editingId) {
    const idx = events.findIndex(e => e.id === editingId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], title, date, startTime, endTime, description, color };
    }
  } else {
    events.push({ id: generateId(), title, date, startTime, endTime, description, color });
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

  // Color picker
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => setSelectedColor(btn.dataset.color));
  });

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
