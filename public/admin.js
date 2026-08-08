let token = localStorage.getItem('nyc_admin_token');
let editingEventId = null;
let requestsIntervalId = null;

const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

function showDashboard() {
  loginPanel.style.display = 'none';
  dashboard.style.display = 'block';
  logoutBtn.style.display = 'inline-block';
  loadEvents();
  loadRequests();
  // start polling for new requests every 10s
  if (!requestsIntervalId) requestsIntervalId = setInterval(loadRequests, 10000);
}

function showLogin() {
  loginPanel.style.display = 'block';
  dashboard.style.display = 'none';
  logoutBtn.style.display = 'none';
  // stop polling when logged out
  if (requestsIntervalId) { clearInterval(requestsIntervalId); requestsIntervalId = null; }
}

if (token) showDashboard(); else showLogin();

// Listen for notifications from other tabs (e.g. when a new trial request is submitted)
if ('BroadcastChannel' in window) {
  const bc = new BroadcastChannel('nyc_channel');
  bc.addEventListener('message', (ev) => {
    if (ev.data && ev.data.type === 'new-trial-request') loadRequests();
  });
} else {
  window.addEventListener('nyc:new-trial-request', loadRequests);
}

// ---------- Login / logout ----------
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    token = data.token;
    localStorage.setItem('nyc_admin_token', token);
    errorEl.textContent = '';
    showDashboard();
  } catch (err) {
    errorEl.textContent = 'Invalid username or password.';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('nyc_admin_token');
  token = null;
  showLogin();
});

// Wraps fetch with the admin token attached; drops back to login on 401
async function authedFetch(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(url, options);
  if (res.status === 401) {
    showLogin();
    throw new Error('Unauthorized');
  }
  return res;
}

// ---------- Events ----------
async function loadEvents() {
  const res = await fetch('/api/events');
  const events = await res.json();
  window._events = events;

  const tbody = document.querySelector('#eventsTable tbody');
  tbody.innerHTML = events
    .map(
      (ev) => `
    <tr>
      <td>${new Date(ev.date).toLocaleDateString()}</td>
      <td>${ev.title}</td>
      <td>${ev.venue}</td>
      <td>
        <button onclick="editEvent('${ev._id}')">Edit</button>
        <button class="danger" onclick="deleteEvent('${ev._id}')">Delete</button>
      </td>
    </tr>`
    )
    .join('');
}

window.editEvent = function (id) {
  const ev = window._events.find((e) => e._id === id);
  if (!ev) return;
  editingEventId = id;
  document.getElementById('eventTitle').value = ev.title;
  document.getElementById('eventDate').value = ev.date.slice(0, 10);
  document.getElementById('eventVenue').value = ev.venue;
  document.getElementById('eventDescription').value = ev.description;
  document.getElementById('eventFormTitle').textContent = 'Edit Event';
  document.getElementById('eventSubmitBtn').textContent = 'Save Changes';
  document.getElementById('eventCancelBtn').style.display = 'inline-block';
  document.getElementById('eventForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteEvent = async function (id) {
  if (!confirm('Delete this event?')) return;
  await authedFetch(`/api/events/${id}`, { method: 'DELETE' });
  loadEvents();
};

document.getElementById('eventCancelBtn').addEventListener('click', resetEventForm);

function resetEventForm() {
  editingEventId = null;
  document.getElementById('eventForm').reset();
  document.getElementById('eventFormTitle').textContent = 'Add Event';
  document.getElementById('eventSubmitBtn').textContent = 'Add Event';
  document.getElementById('eventCancelBtn').style.display = 'none';
}

document.getElementById('eventForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('eventTitle').value,
    date: document.getElementById('eventDate').value,
    venue: document.getElementById('eventVenue').value,
    description: document.getElementById('eventDescription').value
  };

  try {
    if (editingEventId) {
      await authedFetch(`/api/events/${editingEventId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await authedFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    resetEventForm();
    loadEvents();
  } catch (err) {
    alert('Could not save event.');
  }
});

// ---------- Trial requests (read-only) ----------
async function loadRequests() {
  const res = await authedFetch('/api/trial-requests');
  const requests = await res.json();

  const tbody = document.querySelector('#requestsTable tbody');
  tbody.innerHTML = requests
    .map(
      (r) => `
    <tr>
      <td>${r.name}</td>
      <td>${r.position}</td>
      <td>${r.contact}</td>
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
    </tr>`
    )
    .join('');
}