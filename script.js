// ===== Language System =====
const translations = {
    tr: 'tr',
    en: 'en'
};

let currentLang = localStorage.getItem('fitlog-lang') || 'tr';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fitlog-lang', lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all translatable elements
    document.querySelectorAll('[data-tr][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Update active state on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);

    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Screenshots Carousel =====
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDotsContainer = document.getElementById('carouselDots');

if (carouselTrack) {
    const items = carouselTrack.querySelectorAll('.screenshot-item');
    const itemCount = items.length;
    let currentIndex = 0;
    let itemWidth = 280;
    let gap = 32;
    let visibleItems = 3;

    // Update dimensions based on viewport
    function updateDimensions() {
        const viewportWidth = window.innerWidth;

        if (viewportWidth <= 480) {
            itemWidth = 200;
            visibleItems = 1;
        } else if (viewportWidth <= 768) {
            itemWidth = 240;
            visibleItems = 2;
        } else if (viewportWidth <= 1024) {
            itemWidth = 260;
            visibleItems = 3;
        } else {
            itemWidth = 280;
            visibleItems = 4;
        }
    }

    // Create dots
    function createDots() {
        carouselDotsContainer.innerHTML = '';
        const totalDots = Math.max(1, itemCount - visibleItems + 1);

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            carouselDotsContainer.appendChild(dot);
        }
    }

    // Update dots
    function updateDots() {
        const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Go to slide
    function goToSlide(index) {
        const maxIndex = Math.max(0, itemCount - visibleItems);
        currentIndex = Math.max(0, Math.min(index, maxIndex));

        const offset = currentIndex * (itemWidth + gap);
        carouselTrack.style.transform = `translateX(-${offset}px)`;

        updateDots();
    }

    // Next slide
    function nextSlide() {
        const maxIndex = Math.max(0, itemCount - visibleItems);
        goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }

    // Previous slide
    function prevSlide() {
        const maxIndex = Math.max(0, itemCount - visibleItems);
        goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    }

    // Event listeners
    if (carouselPrev) carouselPrev.addEventListener('click', prevSlide);
    if (carouselNext) carouselNext.addEventListener('click', nextSlide);

    // Initialize
    updateDimensions();
    createDots();

    // Handle resize
    window.addEventListener('resize', () => {
        updateDimensions();
        createDots();
        goToSlide(0);
    });

    // Auto-play carousel
    let autoPlayInterval = setInterval(nextSlide, 4000);

    // Pause on hover
    carouselTrack.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    carouselTrack.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(nextSlide, 4000);
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoPlayInterval);
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        autoPlayInterval = setInterval(nextSlide, 4000);
    }, { passive: true });
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Animate feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    animateOnScroll.observe(card);
});

// Animate section headers
document.querySelectorAll('.section-header').forEach((header) => {
    header.style.opacity = '0';
    header.style.transform = 'translateY(30px)';
    header.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    animateOnScroll.observe(header);
});

// Animate download card
const downloadCard = document.querySelector('.download-card');
if (downloadCard) {
    downloadCard.style.opacity = '0';
    downloadCard.style.transform = 'translateY(40px)';
    downloadCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    animateOnScroll.observe(downloadCard);
}

// Add animate-in class styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ===== Phone Mockup Parallax Effect =====
const heroPhones = document.querySelector('.hero-phones');

if (heroPhones && window.innerWidth > 1024) {
    const phoneFront = document.querySelector('.phone-front');
    const phoneBack = document.querySelector('.phone-back');

    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 100;
        const y = (window.innerHeight / 2 - e.clientY) / 100;

        if (phoneFront) {
            phoneFront.style.transform = `translate(calc(-50% + ${x * 2}px), calc(-50% + ${y * 2}px))`;
        }
        if (phoneBack) {
            phoneBack.style.transform = `translate(calc(-50% + ${x * 3}px), calc(-50% + ${y * 3}px)) scale(0.85) rotate(-8deg)`;
        }
    });
}

// ===== Stats Counter Animation =====
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stat = entry.target;
            const text = stat.textContent;
            const hasPlus = text.includes('+');
            const hasPercent = text.includes('%');
            let target = parseInt(text.replace(/[^0-9]/g, ''));

            if (isNaN(target)) return;

            let current = 0;
            const duration = 1500;
            const increment = target / (duration / 16);

            const counter = () => {
                current += increment;
                if (current >= target) {
                    stat.textContent = hasPercent ? `%${target}` : (hasPlus ? `${target}+` : target);
                } else {
                    stat.textContent = hasPercent ? `%${Math.floor(current)}` : (hasPlus ? `${Math.floor(current)}+` : Math.floor(current));
                    requestAnimationFrame(counter);
                }
            };

            counter();
            statsObserver.unobserve(stat);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== Preload Images =====
const imagesToPreload = [
    'images/screen-home.png',
    'images/screen-programs.png',
    'images/screen-exercises.png',
    'images/screen-login.png'
];

imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
});

// ===== Console Easter Egg =====
console.log('%c💪 FitLog', 'font-size: 48px; font-weight: bold; color: #D4FF00;');
console.log('%cAntrenmanlarını profesyonelce takip et!', 'font-size: 16px; color: #A1A1AA;');
console.log('%cGoogle Play: https://play.google.com/store/apps/details?id=com.seckinsoygan.fitlog', 'font-size: 12px; color: #71717A;');
