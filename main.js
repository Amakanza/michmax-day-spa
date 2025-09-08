// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Header scroll effect
window.addEventListener('scroll', function() {
  const header = document.getElementById('header');
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Mobile menu functionality
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  
  mobileMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
  
  // Prevent body scrolling when menu is open
  if (mobileMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  
  mobileMenu.classList.remove('active');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  
  if (mobileMenu.classList.contains('active') && 
      !mobileMenu.contains(e.target) && 
      !hamburger.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close mobile menu on window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});

// Collapsible sections functionality
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const isActive = section.classList.contains('active');
  
  // Close all sections first
  document.querySelectorAll('.collapsible-section').forEach(s => {
    s.classList.remove('active');
  });
  
  // If this section wasn't active, open it
  if (!isActive) {
    section.classList.add('active');
  }
}

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card, .collapsible-section');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
});

// Touch gesture improvements for mobile
let startY = 0;

document.addEventListener('touchstart', function(e) {
  startY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
  const endY = e.changedTouches[0].clientY;
  const diff = startY - endY;
  
  // If scrolling down significantly, hide mobile menu
  if (diff > 50 && document.getElementById('mobileMenu').classList.contains('active')) {
    closeMobileMenu();
  }
});

// =================================
// PNG OVERLAY FUNCTIONALITY
// =================================

// Parallax effect for PNG overlays
let parallaxTicking = false;

function updateOverlayParallax() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.overlay-parallax');
  
  parallaxElements.forEach((element, index) => {
    // Different speeds for different overlays (0.2 to 0.8)
    const speed = 0.2 + (index * 0.15);
    const yPos = -(scrolled * speed);
    
    // Apply transform while preserving any existing transforms
    const currentTransform = element.style.transform || '';
    const newTransform = currentTransform.replace(/translateY\([^)]*\)/g, '') + ` translateY(${yPos}px)`;
    element.style.transform = newTransform.trim();
  });
  
  parallaxTicking = false;
}

function requestOverlayParallaxUpdate() {
  if (!parallaxTicking && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(updateOverlayParallax);
    parallaxTicking = true;
  }
}

// Initialize parallax on scroll
window.addEventListener('scroll', requestOverlayParallaxUpdate, { passive: true });

// Intersection Observer for overlay visibility and performance
const overlayObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const overlay = entry.target;
    
    if (entry.isIntersecting) {
      // Show overlay when in viewport
      if (overlay.classList.contains('overlay-subtle')) {
        overlay.style.opacity = '0.3';
      } else {
        overlay.style.opacity = '0.4';
      }
      
      // Resume animations
      overlay.style.animationPlayState = 'running';
    } else {
      // Hide overlay when out of viewport for performance
      overlay.style.opacity = '0.1';
      
      // Pause animations
      overlay.style.animationPlayState = 'paused';
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '100px 0px'
});

// Performance monitoring
function monitorOverlayPerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 16) { // Flag if frame takes longer than 16ms
          console.warn('Overlay animation causing performance issues:', entry);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}

// Initialize overlay system
function initializeOverlaySystem() {
  // Observe all overlay elements
  document.querySelectorAll('.png-overlay').forEach(overlay => {
    overlayObserver.observe(overlay);
  });
  
  // Monitor performance in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    monitorOverlayPerformance();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeOverlaySystem);

// Handle window resize for overlay repositioning
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Recalculate overlay positions if needed
    updateOverlayParallax();
  }, 100);
});

// Handle visibility change to pause/resume animations
document.addEventListener('visibilitychange', function() {
  const overlays = document.querySelectorAll('.png-overlay');
  
  if (document.hidden) {
    // Pause animations when tab is not visible
    overlays.forEach(overlay => {
      overlay.style.animationPlayState = 'paused';
    });
  } else {
    // Resume animations when tab becomes visible
    overlays.forEach(overlay => {
      overlay.style.animationPlayState = 'running';
    });
  }
});
