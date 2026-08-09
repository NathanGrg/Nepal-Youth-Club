// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// ---------- Players grid ----------
const AVATAR_COLORS = ['var(--navy)', 'var(--orange)', 'var(--gold)'];

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function renderPlayerCard(player, index) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const photo = player.photoUrl
    ? `<img src="${player.photoUrl}" alt="${player.name}" class="player-photo">`
    : `<div class="player-avatar" style="background:${color}">${initials(player.name)}</div>`;

  return `
    <article class="player-card">
      ${photo}
      <h3>${player.name}</h3>
      <p class="player-position">${player.position}</p>
    </article>`;
}

async function loadPlayers() {
  const grid = document.getElementById('playersGrid');
  const empty = document.getElementById('playersEmpty');
  try {
    const res = await fetch('/api/players');
    const players = await res.json();
    if (!players.length) {
      empty.style.display = 'block';
      return;
    }
    grid.innerHTML = players.map(renderPlayerCard).join('');
  } catch (err) {
    empty.textContent = 'Could not load the roster right now — please refresh.';
    empty.style.display = 'block';
  }
}

loadPlayers();