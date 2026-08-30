let token = localStorage.getItem('nyc_admin_token');
let editingEventId = null;
let editingPlayerId = null;
let editingReportId = null;
let editingPOTMId = null;
let requestsIntervalId = null;

const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

function showDashboard() {
  loginPanel.style.display = 'none';
  dashboard.style.display = 'block';
  logoutBtn.style.display = 'inline-block';
  loadEvents();
  loadPlayers();
  loadRequests();
  loadMatchReports();
  loadPOTM();
  // start polling for new requests every 10s
  if (!requestsIntervalId) requestsIntervalId = setInterval(loadRequests, 10000);
}

function showLogin() {
  loginPanel.style.display = 'block';
  dashboard.style.display = 'none';
  logoutBtn.style.display = 'none';
  if (requestsIntervalId) { clearInterval(requestsIntervalId); requestsIntervalId = null; }
}

if (token) showDashboard(); else showLogin();

// Broadcast channel for cross‑tab notifications
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

// Wraps fetch with admin token
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

// ---------- EVENTS ----------
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

// ---------- PLAYERS ----------
async function loadPlayers() {
  const res = await fetch('/api/players');
  const players = await res.json();
  window._players = players;

  const tbody = document.querySelector('#playersTable tbody');
  tbody.innerHTML = players
    .map(
      (player) => `
    <tr>
      <td>${player.name}</td>
      <td>${player.position}</td>
      <td>${player.photoUrl ? `<a href="${player.photoUrl}" target="_blank">View</a>` : '—'}</td>
      <td>
        <button onclick="editPlayer('${player._id}')">Edit</button>
        <button class="danger" onclick="deletePlayer('${player._id}')">Delete</button>
      </td>
    </tr>`
    )
    .join('');
}

window.editPlayer = function (id) {
  const player = window._players.find((p) => p._id === id);
  if (!player) return;
  editingPlayerId = id;
  document.getElementById('playerName').value = player.name;
  document.getElementById('playerPosition').value = player.position;
  document.getElementById('playerPhotoUrl').value = player.photoUrl || '';
  document.getElementById('playerFormTitle').textContent = 'Edit Player';
  document.getElementById('playerSubmitBtn').textContent = 'Save Changes';
  document.getElementById('playerCancelBtn').style.display = 'inline-block';
  document.getElementById('playerForm').scrollIntoView({ behavior: 'smooth' });
};

window.deletePlayer = async function (id) {
  if (!confirm('Delete this player?')) return;
  await authedFetch(`/api/players/${id}`, { method: 'DELETE' });
  loadPlayers();
};

document.getElementById('playerCancelBtn').addEventListener('click', resetPlayerForm);

function resetPlayerForm() {
  editingPlayerId = null;
  document.getElementById('playerForm').reset();
  document.getElementById('playerFormTitle').textContent = 'Add Player';
  document.getElementById('playerSubmitBtn').textContent = 'Add Player';
  document.getElementById('playerCancelBtn').style.display = 'none';
}

document.getElementById('playerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('playerName').value,
    position: document.getElementById('playerPosition').value,
    photoUrl: document.getElementById('playerPhotoUrl').value || undefined
  };

  try {
    if (editingPlayerId) {
      await authedFetch(`/api/players/${editingPlayerId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await authedFetch('/api/players', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    resetPlayerForm();
    loadPlayers();
  } catch (err) {
    alert('Could not save player.');
  }
});

// ---------- TRIAL REQUESTS (read-only) ----------
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

// ============================================================
//  MATCH REPORTS
// ============================================================
async function loadMatchReports() {
  const res = await authedFetch('/api/admin/match-reports');
  const reports = await res.json();
  window._reports = reports;

  const tbody = document.querySelector('#reportsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = reports
    .map(
      (r) => `
    <tr>
      <td>${r.match ? r.match.opponent : 'N/A'}</td>
      <td>${r.match ? new Date(r.match.date).toLocaleDateString() : 'N/A'}</td>
      <td>${r.bestPlayer ? r.bestPlayer.name : '—'}</td>
      <td>${r.summary.substring(0, 60)}${r.summary.length > 60 ? '…' : ''}</td>
      <td>
        <button onclick="editReport('${r._id}')">Edit</button>
        <button class="danger" onclick="deleteReport('${r._id}')">Delete</button>
      </td>
    </tr>`
    )
    .join('');
}

window.editReport = function (id) {
  const report = window._reports.find((r) => r._id === id);
  if (!report) return;
  editingReportId = id;

  document.getElementById('reportMatch').value = report.match?._id || '';
  document.getElementById('reportSummary').value = report.summary;
  document.getElementById('reportHighlights').value = report.highlights || '';
  document.getElementById('reportBestPlayer').value = report.bestPlayer?._id || '';
  document.getElementById('reportFeaturedImage').value = report.featuredImage || '';

  document.getElementById('reportFormTitle').textContent = 'Edit Match Report';
  document.getElementById('reportSubmitBtn').textContent = 'Save Changes';
  document.getElementById('reportCancelBtn').style.display = 'inline-block';
  document.getElementById('reportForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteReport = async function (id) {
  if (!confirm('Delete this match report?')) return;
  await authedFetch(`/api/admin/match-reports/${id}`, { method: 'DELETE' });
  loadMatchReports();
};

document.getElementById('reportCancelBtn')?.addEventListener('click', resetReportForm);

function resetReportForm() {
  editingReportId = null;
  document.getElementById('reportForm').reset();
  document.getElementById('reportFormTitle').textContent = 'Add Match Report';
  document.getElementById('reportSubmitBtn').textContent = 'Add Report';
  document.getElementById('reportCancelBtn').style.display = 'none';
}

document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    match: document.getElementById('reportMatch').value,
    summary: document.getElementById('reportSummary').value,
    highlights: document.getElementById('reportHighlights').value,
    bestPlayer: document.getElementById('reportBestPlayer').value || null,
    featuredImage: document.getElementById('reportFeaturedImage').value || null
  };

  try {
    if (editingReportId) {
      await authedFetch(`/api/admin/match-reports/${editingReportId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await authedFetch('/api/admin/match-reports', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    resetReportForm();
    loadMatchReports();
  } catch (err) {
    alert('Could not save match report.');
  }
});

// ============================================================
//  PLAYER OF THE MONTH
// ============================================================
async function loadPOTM() {
  const res = await authedFetch('/api/admin/player-of-the-month');
  const potmList = await res.json();
  window._potmList = potmList;

  const tbody = document.querySelector('#potmTable tbody');
  if (!tbody) return;
  tbody.innerHTML = potmList
    .map(
      (p) => `
    <tr>
      <td>${p.player ? p.player.name : 'N/A'}</td>
      <td>${p.month} ${p.year}</td>
      <td>${p.isFeatured ? '⭐ Featured' : '—'}</td>
      <td>${p.achievement ? p.achievement.substring(0, 40) + '…' : '—'}</td>
      <td>
        <button onclick="editPOTM('${p._id}')">Edit</button>
        <button class="danger" onclick="deletePOTM('${p._id}')">Delete</button>
      </td>
    </tr>`
    )
    .join('');
}

window.editPOTM = function (id) {
  const potm = window._potmList.find((p) => p._id === id);
  if (!potm) return;
  editingPOTMId = id;

  document.getElementById('potmPlayer').value = potm.player?._id || '';
  document.getElementById('potmMonth').value = potm.month;
  document.getElementById('potmYear').value = potm.year;
  document.getElementById('potmAchievement').value = potm.achievement || '';
  document.getElementById('potmStats').value = potm.stats || '';
  document.getElementById('potmQuote').value = potm.quote || '';
  document.getElementById('potmFeatured').checked = potm.isFeatured || false;

  document.getElementById('potmFormTitle').textContent = 'Edit Player of the Month';
  document.getElementById('potmSubmitBtn').textContent = 'Save Changes';
  document.getElementById('potmCancelBtn').style.display = 'inline-block';
  document.getElementById('potmForm').scrollIntoView({ behavior: 'smooth' });
};

window.deletePOTM = async function (id) {
  if (!confirm('Delete this Player of the Month?')) return;
  await authedFetch(`/api/admin/player-of-the-month/${id}`, { method: 'DELETE' });
  loadPOTM();
};

document.getElementById('potmCancelBtn')?.addEventListener('click', resetPOTMForm);

function resetPOTMForm() {
  editingPOTMId = null;
  document.getElementById('potmForm').reset();
  document.getElementById('potmFormTitle').textContent = 'Add Player of the Month';
  document.getElementById('potmSubmitBtn').textContent = 'Add POTM';
  document.getElementById('potmCancelBtn').style.display = 'none';
}

document.getElementById('potmForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    player: document.getElementById('potmPlayer').value,
    month: document.getElementById('potmMonth').value,
    year: parseInt(document.getElementById('potmYear').value, 10),
    achievement: document.getElementById('potmAchievement').value,
    stats: document.getElementById('potmStats').value,
    quote: document.getElementById('potmQuote').value,
    isFeatured: document.getElementById('potmFeatured').checked
  };

  try {
    if (editingPOTMId) {
      await authedFetch(`/api/admin/player-of-the-month/${editingPOTMId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await authedFetch('/api/admin/player-of-the-month', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    resetPOTMForm();
    loadPOTM();
  } catch (err) {
    alert('Could not save Player of the Month.');
  }
});

// ---------- Helper: populate dropdowns (called from admin.html) ----------
async function populateReportDropdowns() {
  try {
    const [matchesRes, playersRes] = await Promise.all([
      authedFetch('/api/admin/matches'),
      authedFetch('/api/admin/players')
    ]);
    const matches = await matchesRes.json();
    const players = await playersRes.json();

    const matchSelect = document.getElementById('reportMatch');
    if (matchSelect) {
      matchSelect.innerHTML = '<option value="">Select a match</option>' +
        matches.map(m => `<option value="${m._id}">${m.opponent} (${new Date(m.date).toLocaleDateString()})</option>`).join('');
    }

    const playerSelect = document.getElementById('reportBestPlayer');
    if (playerSelect) {
      playerSelect.innerHTML = '<option value="">Select best player</option>' +
        players.map(p => `<option value="${p._id}">${p.name} (${p.position})</option>`).join('');
    }

    const potmPlayerSelect = document.getElementById('potmPlayer');
    if (potmPlayerSelect) {
      potmPlayerSelect.innerHTML = '<option value="">Select a player</option>' +
        players.map(p => `<option value="${p._id}">${p.name} (${p.position})</option>`).join('');
    }
  } catch (error) {
    console.error('Error populating dropdowns:', error);
  }
}

// Call this after login or on page load
if (token) {
  populateReportDropdowns();
}
// ============================================
// MATCH REPORT MANAGEMENT
// ============================================

async function loadMatchReports() {
  try {
    const res = await fetch('/api/admin/match-reports');
    const reports = await res.json();
    // Render to admin table
    renderReportsTable(reports);
  } catch (error) {
    console.error('Error loading match reports:', error);
  }
}

async function createMatchReport(data) {
  try {
    const res = await fetch('/api/admin/match-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (error) {
    console.error('Error creating match report:', error);
  }
}

async function updateMatchReport(id, data) {
  try {
    const res = await fetch(`/api/admin/match-reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating match report:', error);
  }
}

async function deleteMatchReport(id) {
  try {
    const res = await fetch(`/api/admin/match-reports/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting match report:', error);
  }
}

// ============================================
// PLAYER OF THE MONTH MANAGEMENT
// ============================================

async function loadPOTM() {
  try {
    const res = await fetch('/api/admin/player-of-the-month');
    const potm = await res.json();
    renderPOTMTable(potm);
  } catch (error) {
    console.error('Error loading POTM:', error);
  }
}

async function createPOTM(data) {
  try {
    const res = await fetch('/api/admin/player-of-the-month', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (error) {
    console.error('Error creating POTM:', error);
  }
}

async function deletePOTM(id) {
  try {
    const res = await fetch(`/api/admin/player-of-the-month/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting POTM:', error);
  }
}