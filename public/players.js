// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav on link click (mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Player Data (Static Fallback) ----------
const DEFAULT_PLAYERS = [
  {
    name: "Ramesh Gurung",
    position: "Setter",
    photoUrl: null, // Use null to show avatar instead
    number: 7
  },
  {
    name: "Durga Thapa",
    position: "Outside Hitter",
    photoUrl: null,
    number: 12
  },
  {
    name: "Krishna Rai",
    position: "Libero",
    photoUrl: null,
    number: 3
  },
  {
    name: "Saroj Sharma",
    position: "Middle Blocker",
    photoUrl: null,
    number: 8
  },
  {
    name: "Prakash Adhikari",
    position: "Opposite",
    photoUrl: null,
    number: 15
  },
  {
    name: "Kumar Karki",
    position: "Setter",
    photoUrl: null,
    number: 2
  },
  {
    name: "Bikash Tamang",
    position: "Outside Hitter",
    photoUrl: null,
    number: 10
  },
  {
    name: "Himal Limbu",
    position: "Libero",
    photoUrl: null,
    number: 5
  }
];

// ---------- Avatar Colors ----------
const AVATAR_COLORS = [
  'var(--orange)',
  'var(--gold)', 
  'var(--navy)',
  '#773831',
  '#2e3bcc',
  '#975f28',
  '#9b59b6',
  '#842989'
];

// ---------- Helper Functions ----------
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function getRandomColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ---------- Render Player Card ----------
function renderPlayerCard(player, index) {
  const color = getRandomColor(index);
  const hasPhoto = player.photoUrl && player.photoUrl.trim() !== '';

  const photoHtml = hasPhoto
    ? `<img src="${player.photoUrl}" alt="${player.name}" class="player-photo" loading="lazy">`
    : `<div class="player-avatar" style="background:${color}">${getInitials(player.name)}</div>`;

  const numberHtml = player.number
    ? `<span class="player-number">#${player.number}</span>`
    : '';

  return `
    <article class="player-card">
      ${photoHtml}
      ${numberHtml}
      <h3>${player.name}</h3>
      <p class="player-position">${player.position}</p>
    </article>
  `;
}

// ---------- Load Players (API with static fallback) ----------
async function loadPlayers() {
  const grid = document.getElementById('playersGrid');
  const empty = document.getElementById('playersEmpty');
  
  if (!grid) return;

  try {
    // Try to fetch from API
    const res = await fetch('/api/players');
    
    if (res.ok) {
      const players = await res.json();
      
      if (players && players.length > 0) {
        grid.innerHTML = players.map(renderPlayerCard).join('');
        return;
      }
    }
    
    // If API fails or returns empty, use static data
    console.log('Using static player data (API unavailable)');
    grid.innerHTML = DEFAULT_PLAYERS.map(renderPlayerCard).join('');
    
  } catch (err) {
    // API error — use static data
    console.warn('Could not fetch players from API, using static data:', err);
    grid.innerHTML = DEFAULT_PLAYERS.map(renderPlayerCard).join('');
  }
}

// ---------- Run on page load ----------
document.addEventListener('DOMContentLoaded', loadPlayers);