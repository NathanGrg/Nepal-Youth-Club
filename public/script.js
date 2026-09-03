const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('is-open');
        navToggle.classList.toggle('is-active');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    primaryNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            primaryNav.classList.remove('is-open');
            navToggle.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}
document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    const currentPath = window.location.pathname;
    
    if (href === currentPath || 
        (href === '#' && currentPath === '/') ||
        (href === '#home' && currentPath === '/')) {
        link.classList.add('active');
    }
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            history.pushState(null, null, targetId);
        }
    });
});
class Carousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = this.track ? Array.from(this.track.children) : [];
        this.dotsContainer = container.querySelector('.carousel-dots');
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.interval = null;
        this.autoPlayDelay = parseInt(this.track?.dataset.interval) || 4000;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.isDragging = false;
        
        if (this.totalSlides === 0) return;
        
        this.init();
    }
    
    init() {
        this.slides.forEach((slide, i) => {
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.height = '100%';
            slide.style.opacity = i === 0 ? '1' : '0';
            slide.style.transition = 'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            slide.style.pointerEvents = i === 0 ? 'auto' : 'none';
            if (!slide.querySelector('.slide-caption') && slide.dataset.caption) {
                const caption = document.createElement('div');
                caption.className = 'slide-caption';
                caption.textContent = slide.dataset.caption;
                slide.appendChild(caption);
            }
        });
        this.updateTrackHeight();
        this.createDots();
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this.resetTimer(); });
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this.resetTimer(); });
        document.addEventListener('keydown', (e) => {
            if (!this.container.closest('.carousel')) return;
            if (e.key === 'ArrowLeft') { this.prev(); this.resetTimer(); }
            if (e.key === 'ArrowRight') { this.next(); this.resetTimer(); }
        });
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.start());
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.isDragging = true;
            this.pause();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const diff = this.touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) { this.next(); }
                else { this.prev(); }
                this.isDragging = false;
                this.resetTimer();
            }
        }, { passive: true });
        
        this.track.addEventListener('touchend', () => {
            this.isDragging = false;
            this.start();
        }, { passive: true });
        this.start();
    }
    
    updateTrackHeight() {
        if (!this.track) return;
        const firstSlide = this.slides[0];
        if (firstSlide) {
            const img = firstSlide.querySelector('img');
            if (img) {
                img.addEventListener('load', () => {
                    this.track.style.height = img.offsetHeight + 'px';
                });
                if (img.complete) {
                    this.track.style.height = img.offsetHeight + 'px';
                }
            }
        }
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.dataset.index = i;
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => {
                this.goTo(i);
                this.resetTimer();
            });
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        const dots = this.dotsContainer.querySelectorAll('button');
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === this.currentIndex);
        });
    }
    
    goTo(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        this.isTransitioning = true;
        const currentSlide = this.slides[this.currentIndex];
        currentSlide.style.opacity = '0';
        currentSlide.style.pointerEvents = 'none';
        const newSlide = this.slides[index];
        newSlide.style.opacity = '1';
        newSlide.style.pointerEvents = 'auto';
        
        this.currentIndex = index;
        this.updateDots();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 700);
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goTo(nextIndex);
    }
    
    prev() {
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goTo(prevIndex);
    }
    
    start() {
        if (this.totalSlides <= 1) return;
        this.pause();
        this.interval = setInterval(() => this.next(), this.autoPlayDelay);
    }
    
    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    resetTimer() {
        this.pause();
        this.start();
    }
}
const carouselContainer = document.querySelector('.carousel-inner');
if (carouselContainer) {
    new Carousel(carouselContainer);
}
const recruitForm = document.getElementById('recruitForm');
const recruitNote = document.getElementById('recruitNote');

if (recruitForm) {
    const inputs = recruitForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('error');
                input.classList.remove('success');
            } else if (input.value.trim()) {
                input.classList.remove('error');
                input.classList.add('success');
            }
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('error') && input.value.trim()) {
                input.classList.remove('error');
                input.classList.add('success');
            }
        });
    });
    
    recruitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = recruitForm.querySelector('button[type="submit"]');
        const name = document.getElementById('name');
        const contact = document.getElementById('contact');
        const position = document.getElementById('position');
        let isValid = true;
        [name, contact].forEach(field => {
            field.classList.remove('error', 'success');
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.add('success');
            }
        });
        
        if (!isValid) {
            recruitNote.textContent = '⚠️ Please fill in all required fields.';
            recruitNote.className = 'form-note error';
            return;
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        recruitNote.textContent = '';
        recruitNote.className = 'form-note';
        
        const payload = {
            name: name.value.trim(),
            position: position ? position.value : '',
            contact: contact.value.trim()
        };
        
        try {
            let success = false;
            
            try {
                const res = await fetch('/api/trial-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    success = true;
                } else {
                    console.warn('API returned error, falling back to localStorage');
                }
            } catch (apiError) {
                console.warn('API unavailable, saving locally:', apiError);
            }
            if (!success) {
                const requests = JSON.parse(localStorage.getItem('trialRequests') || '[]');
                requests.push({
                    ...payload,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('trialRequests', JSON.stringify(requests));
                success = true;
            }
            
            if (success) {
                recruitNote.textContent = "✅ Your request has been submitted. We'll be in touch!";
                recruitNote.className = 'form-note success';
                recruitForm.reset();
                inputs.forEach(input => {
                    input.classList.remove('success', 'error');
                });
                if (submitBtn) {
                    submitBtn.textContent = 'Submitted!';
                    setTimeout(() => {
                        submitBtn.textContent = 'Request a Trial';
                    }, 3000);
                }
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (err) {
            console.error('Failed to submit trial request:', err);
            recruitNote.textContent = '❌ Failed to submit request. Please try again later.';
            recruitNote.className = 'form-note error';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }
    });
}
function initScrollAnimations() {
    const cards = document.querySelectorAll('.event-card, .position-list li');
    if (!cards.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const card = entry.target;
                if (!card.dataset.index) {
                    card.dataset.index = index;
                }
                
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${parseInt(card.dataset.index) * 80}ms`;
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
                
                observer.unobserve(card);
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach((card, index) => {
        card.dataset.index = index;
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        observer.observe(card);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScrollAnimations, 300);
});
window.addEventListener('load', initScrollAnimations);
async function loadEvents() {
    const eventGrid = document.querySelector('.event-grid');
    if (!eventGrid) return;
    
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const events = await response.json();
        if (events.length === 0) return;
        eventGrid.innerHTML = '';
        events.forEach((event, index) => {
            const date = new Date(event.date);
            const day = String(date.getDate()).padStart(2, '0');
            const mon = date.toLocaleString('default', { month: 'short' });
            
            const eventCard = document.createElement('article');
            eventCard.className = 'event-card';
            eventCard.style.opacity = '0';
            eventCard.style.transform = 'translateY(30px)';
            eventCard.dataset.index = index;
            
            eventCard.innerHTML = `
                <div class="event-date">
                    <span class="day">${day}</span>
                    <span class="mon">${mon}</span>
                </div>
                <div class="event-body">
                    <h3>${event.title || 'Event'}</h3>
                    <p class="event-meta">${event.venue || 'Venue TBA'}</p>
                    <p>${event.description || 'Details coming soon.'}</p>
                    <a href="#contact" class="btn btn-small">Get Details</a>
                </div>
            `;
            eventGrid.appendChild(eventCard);
        });
        setTimeout(initScrollAnimations, 200);
        
    } catch (error) {
        console.warn('Could not load events from API:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadEvents);
function animateStats() {
    const stats = document.querySelectorAll('.stat-strip dt');
    if (!stats.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isNumber = !isNaN(parseInt(finalValue));
                
                if (isNumber) {
                    const num = parseInt(finalValue);
                    let current = 0;
                    const increment = Math.ceil(num / 30);
                    
                    const interval = setInterval(() => {
                        current += increment;
                        if (current >= num) {
                            current = num;
                            clearInterval(interval);
                        }
                        target.textContent = current + (finalValue.includes('+') ? '+' : '');
                    }, 40);
                }
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

document.addEventListener('DOMContentLoaded', animateStats);
console.log('🏐 Nepal Youth Club — site loaded successfully!');