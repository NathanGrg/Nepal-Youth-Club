const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

const form = document.getElementById('recruitForm');
const recruitNote = form.querySelector('.form-note') || document.getElementById('recruitNote');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  if (recruitNote) recruitNote.textContent = '';

  const payload = {
    name: form.name.value,
    position: form.position.value,
    contact: form.contact.value
  };

  try {
    const res = await fetch('/api/trial-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    if (recruitNote) recruitNote.textContent = "Your request has been submitted. We'll be in touch.";
    form.reset();

    // Notify other tabs (admin) that a new request was created
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('nyc_channel');
      bc.postMessage({ type: 'new-trial-request' });
      bc.close();
    } else {
      window.dispatchEvent(new CustomEvent('nyc:new-trial-request'));
    }
  } catch (err) {
    console.error('Failed to submit trial request', err);
    if (recruitNote) recruitNote.textContent = 'Failed to submit request. Please try again later.';
  } finally {
    submitBtn.disabled = false;
  }
});

/* Carousel autoplay + controls */
(function () {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  if (!track) return;
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  let current = 0;
  const intervalMs = parseInt(track.dataset.interval, 10) || 4000;

  slides.forEach((slide, i) => {
    slide.style.left = `${i * 100}%`;
  });

  // build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    if (i === 0) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      goToSlide(i);
      restartTimer();
    });
    dotsWrap.appendChild(btn);
  });

  function updateDots() {
    Array.from(dotsWrap.children).forEach((b, idx) => b.classList.toggle('is-active', idx === current));
  }

  function goToSlide(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
    current = index;
    updateDots();
  }

  function next() {
    goToSlide((current + 1) % slides.length);
  }

  function prev() {
    goToSlide((current - 1 + slides.length) % slides.length);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartTimer(); });

  let timer = setInterval(next, intervalMs);
  function restartTimer() { clearInterval(timer); timer = setInterval(next, intervalMs); }

  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => restartTimer());

  // pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartTimer();
  });
})();

/* Fetch and display events from API */
async function loadEvents() {
  try {
    const response = await fetch('/api/events');
    const events = await response.json();
    
    const eventGrid = document.querySelector('.event-grid');
    if (!eventGrid || events.length === 0) return;
    
    // Clear existing events
    eventGrid.innerHTML = '';
    
    // Add events from database
    events.forEach(event => {
      const date = new Date(event.date);
      const day = String(date.getDate()).padStart(2, '0');
      const mon = date.toLocaleString('default', { month: 'short' });
      
      const eventCard = document.createElement('article');
      eventCard.className = 'event-card';
      eventCard.innerHTML = `
        <div class="event-date"><span class="day">${day}</span><span class="mon">${mon}</span></div>
        <div class="event-body">
          <h3>${event.title}</h3>
          <p class="event-meta">${event.venue}</p>
          <p>${event.description}</p>
          <a href="#contact" class="btn btn-small">Get Details</a>
        </div>
      `;
      eventGrid.appendChild(eventCard);
    });
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}

// Load events when page loads
document.addEventListener('DOMContentLoaded', loadEvents);