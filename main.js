/* ================================================
   ShowTime — main.js
   Handles: events data, rendering, filtering,
            seat map, form validation, confirmation
================================================ */

/* ---------- EVENTS DATA ---------- */
const events = [
  { id: 1, title: "Interstellar Returns", category: "movie",  emoji: "🎬", bg: "#1a0533", date: "Apr 25, 2025", venue: "PVR IMAX, Hyderabad",       price: "₹350",  priceVal: 350  },
  { id: 2, title: "IPL — RCB vs MI",     category: "sports", emoji: "🏏", bg: "#001a10", date: "Apr 27, 2025", venue: "Chinnaswamy Stadium",          price: "₹800",  priceVal: 800  },
  { id: 3, title: "Arijit Singh Live",    category: "music",  emoji: "🎤", bg: "#1a0020", date: "May 3, 2025",  venue: "HITEX Exhibition, Hyderabad",  price: "₹1200", priceVal: 1200 },
  { id: 4, title: "Kapil Sharma Show",    category: "comedy", emoji: "😂", bg: "#1a1000", date: "May 5, 2025",  venue: "Shilpakala Vedika",            price: "₹600",  priceVal: 600  },
  { id: 5, title: "Dune: Part III",       category: "movie",  emoji: "🎬", bg: "#1a0d00", date: "May 10, 2025", venue: "Cinepolis, Banjara Hills",    price: "₹300",  priceVal: 300  },
  { id: 6, title: "FC Hyderabad Derby",   category: "sports", emoji: "⚽", bg: "#000e1a", date: "May 12, 2025", venue: "GMC Balayogi Stadium",         price: "₹400",  priceVal: 400  },
  { id: 7, title: "AR Rahman Concert",    category: "music",  emoji: "🎶", bg: "#080018", date: "May 18, 2025", venue: "Gachibowli Stadium",           price: "₹1500", priceVal: 1500 },
  { id: 8, title: "Zakir Khan Live",      category: "comedy", emoji: "🎭", bg: "#180a00", date: "May 20, 2025", venue: "N Convention, Madhapur",       price: "₹700",  priceVal: 700  },
];

/* ---------- STATE ---------- */
let activeFilter    = 'all';
let selectedEventId = null;
let selectedSeats   = [];

/* ================================================
   INDEX.HTML — EVENT CARDS
================================================ */

/* Render event cards into the grid */
function renderCards(list) {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `
      <p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:3rem 0;font-size:0.9rem;">
        No events found. Try a different search or filter.
      </p>`;
    return;
  }

  list.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="card-img-placeholder" style="background:${ev.bg}">
        <span style="font-size:3.5rem">${ev.emoji}</span>
        <div class="card-badge badge-${ev.category}">${ev.category.toUpperCase()}</div>
      </div>
      <div class="card-body">
        <p class="card-meta">${ev.date}</p>
        <h2 class="card-title">${ev.title}</h2>
        <div class="card-info">
          <span class="card-venue">📍 ${ev.venue}</span>
          <span class="card-price">${ev.price}</span>
        </div>
        <button class="card-btn" onclick="goToBooking(${ev.id})">Book Tickets →</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* Set active filter and re-render */
function setFilter(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = cat;
  filterCards();
}

/* Filter by category + search query */
function filterCards() {
  const input = document.getElementById('searchInput');
  const q = input ? input.value.toLowerCase().trim() : '';

  const filtered = events.filter(ev => {
    const matchCat = activeFilter === 'all' || ev.category === activeFilter;
    const matchQ   = !q || ev.title.toLowerCase().includes(q) || ev.venue.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  renderCards(filtered);
}

/* Navigate to booking page, save selected event in sessionStorage */
function goToBooking(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  sessionStorage.setItem('selectedEvent', JSON.stringify(ev));
  window.location.href = 'booking.html';
}

/* ================================================
   BOOKING.HTML — SEAT MAP + FORM + SUMMARY
================================================ */

/* Build the seat grid (6 rows × 8 cols, random taken seats) */
function buildSeatMap() {
  const grid = document.getElementById('seatGrid');
  if (!grid) return;

  const rows    = ['A','B','C','D','E','F'];
  const cols    = 8;
  const takenSet = new Set();

  // Randomly mark ~25% seats as taken
  while (takenSet.size < 12) {
    const r = rows[Math.floor(Math.random() * rows.length)];
    const c = Math.floor(Math.random() * cols) + 1;
    takenSet.add(`${r}${c}`);
  }

  grid.innerHTML = '';

  rows.forEach(row => {
    for (let col = 1; col <= cols; col++) {
      const seatId = `${row}${col}`;
      const seat   = document.createElement('div');
      seat.className = takenSet.has(seatId) ? 'seat taken' : 'seat available';
      seat.dataset.seat = seatId;
      seat.textContent  = seatId;

      if (!takenSet.has(seatId)) {
        seat.addEventListener('click', () => toggleSeat(seat, seatId));
      }

      grid.appendChild(seat);
    }
  });
}

/* Toggle seat selection */
function toggleSeat(seatEl, seatId) {
  if (seatEl.classList.contains('selected')) {
    seatEl.classList.remove('selected');
    seatEl.classList.add('available');
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else {
    seatEl.classList.remove('available');
    seatEl.classList.add('selected');
    selectedSeats.push(seatId);
  }
  updateSelectedSeatsLabel();
}

/* Update the "Selected:" label below the seat map */
function updateSelectedSeatsLabel() {
  const label = document.getElementById('selectedSeatsText');
  if (!label) return;
  label.textContent = selectedSeats.length ? selectedSeats.join(', ') : 'None';
}

/* Load event info into booking page */
function loadBookingEvent() {
  const ev = JSON.parse(sessionStorage.getItem('selectedEvent') || 'null');
  if (!ev) return;

  setById('bookingEmoji',    ev.emoji);
  setById('bookingCategory', ev.category.toUpperCase());
  setById('bookingTitle',    ev.title);
  setById('bookingDate',     `📅 ${ev.date}`);
  setById('bookingVenue',    `📍 ${ev.venue}`);
  setById('bookingPrice',    ev.price);

  // Pre-fill base price in the order summary
  updateSummary();
}

/* Update order summary on ticket type / qty change */
function updateSummary() {
  const typeEl = document.getElementById('ticketType');
  const qtyEl  = document.getElementById('quantity');
  if (!typeEl || !qtyEl) return;

  const pricePerTicket = parseInt(typeEl.value);
  const qty            = parseInt(qtyEl.value);
  const convenience    = 30;
  const total          = pricePerTicket * qty + convenience;

  const typeName = typeEl.options[typeEl.selectedIndex].text.split(' —')[0];

  setById('sumType',  typeName);
  setById('sumQty',   qty);
  setById('sumUnit',  `₹${pricePerTicket}`);
  setById('sumTotal', `₹${total}`);
}

/* ================================================
   BOOKING.HTML — FORM VALIDATION
================================================ */

function submitBooking(e) {
  e.preventDefault();
  let valid = true;

  // Name
  const name = document.getElementById('fullName');
  if (!name.value.trim() || name.value.trim().length < 3) {
    showError('nameError', 'fullName');
    valid = false;
  } else {
    clearError('nameError', 'fullName');
  }

  // Email
  const email = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    showError('emailError', 'email');
    valid = false;
  } else {
    clearError('emailError', 'email');
  }

  // Phone
  const phone = document.getElementById('phone');
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.value.trim())) {
    showError('phoneError', 'phone');
    valid = false;
  } else {
    clearError('phoneError', 'phone');
  }

  if (!valid) return;

  // Save booking data to sessionStorage
  const typeEl     = document.getElementById('ticketType');
  const qtyEl      = document.getElementById('quantity');
  const pricePerTicket = parseInt(typeEl.value);
  const qty        = parseInt(qtyEl.value);
  const typeName   = typeEl.options[typeEl.selectedIndex].text.split(' —')[0];
  const total      = pricePerTicket * qty + 30;

  const bookingData = {
    name:     name.value.trim(),
    email:    email.value.trim(),
    phone:    phone.value.trim(),
    type:     typeName,
    qty,
    total:    `₹${total}`,
    seats:    selectedSeats.length ? selectedSeats.join(', ') : 'Any Available',
    bookingId: generateBookingId(),
  };

  sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
  window.location.href = 'confirmation.html';
}

/* Show validation error */
function showError(errId, inputId) {
  const errEl   = document.getElementById(errId);
  const inputEl = document.getElementById(inputId);
  if (errEl)   errEl.classList.add('visible');
  if (inputEl) inputEl.classList.add('error');
}

/* Clear validation error */
function clearError(errId, inputId) {
  const errEl   = document.getElementById(errId);
  const inputEl = document.getElementById(inputId);
  if (errEl)   errEl.classList.remove('visible');
  if (inputEl) inputEl.classList.remove('error');
}

/* Generate a fake booking ID */
function generateBookingId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  return `STX-${dateStr}-${rand}`;
}

/* ================================================
   CONFIRMATION.HTML — LOAD DETAILS
================================================ */

function loadConfirmation() {
  const ev      = JSON.parse(sessionStorage.getItem('selectedEvent') || 'null');
  const booking = JSON.parse(sessionStorage.getItem('bookingData')   || 'null');

  if (ev) {
    setById('confirmEmoji',    ev.emoji);
    setById('confirmTitle',    ev.title);
    setById('confirmCategory', ev.category.toUpperCase());
    setById('confirmDate',     ev.date);
    setById('confirmVenue',    ev.venue);
  }

  if (booking) {
    setById('confirmName',      booking.name);
    setById('confirmSeats',     booking.seats);
    setById('confirmType',      booking.type);
    setById('confirmTotal',     booking.total);
    setById('confirmBookingId', booking.bookingId);

    const idNum = booking.bookingId.split('-').pop();
    setById('barcodeNum', `**** **** **** ${idNum}`);
  }
}

/* ================================================
   UTILS
================================================ */

/* Safely set text content by element ID */
function setById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ================================================
   PAGE INIT — detect which page we're on
================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '' || page === '/') {
    // Homepage
    renderCards(events);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
  }

  if (page === 'booking.html') {
    // Booking page
    loadBookingEvent();
    buildSeatMap();
    updateSummary();
  }

  if (page === 'confirmation.html') {
    // Confirmation page
    loadConfirmation();
  }
});
