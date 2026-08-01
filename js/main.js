// ============================================================
// RENNER DANCE — Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll behavior ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const updateNav = () => {
      if (window.scrollY > 40) {
        navbar.classList.remove('transparent');
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.add('transparent');
        navbar.classList.remove('scrolled');
      }
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  // ---- Mobile nav ----
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Hero load animation ----
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => {
      setTimeout(() => hero.classList.add('loaded'), 100);
    });
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  // ---- Testimonials slider ----
  const track = document.querySelector('.testimonials-inner');
  const dots = document.querySelectorAll('.slider-dot');
  const slides = document.querySelectorAll('.testimonial-slide');
  let current = 0;
  let autoTimer;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    if (track) track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  };

  const resetAuto = () => {
    clearInterval(autoTimer);
    startAuto();
  };

  if (track && slides.length > 0) {
    goTo(0);
    startAuto();

    document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

    // Touch support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); resetAuto(); }
    });
  }

  // ---- Stat counter animation ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const duration = 1800;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + Math.round(eased * target).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObs.observe(c));
  }

  // ---- Form validation ----
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll('[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = '#ef4444';
          input.addEventListener('input', () => input.style.borderColor = '', { once: true });
        }
      });
      if (valid) {
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.textContent = 'Thank you! We\'ll be in touch soon.';
          btn.disabled = true;
          btn.style.background = '#22c55e';
        }
      }
    });
  });

  // ---- Smooth anchor scrolls ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Faculty form: file upload display ----
  const resumeInput = document.getElementById('fac-resume');
  const resumeName  = document.getElementById('fac-resume-name');
  const resumeText  = document.getElementById('fac-resume-text');
  if (resumeInput && resumeName && resumeText) {
    resumeInput.addEventListener('change', () => {
      const file = resumeInput.files[0];
      if (file) {
        resumeName.textContent = file.name;
        resumeName.classList.add('visible');
        resumeText.textContent = 'Change file';
      } else {
        resumeName.classList.remove('visible');
        resumeText.textContent = 'Click to upload your resume';
      }
    });
  }

  // ---- Faculty form: submit handler ----
  const facultyForm = document.getElementById('faculty-form');
  const facultyBtn  = document.getElementById('faculty-submit-btn');
  if (facultyForm && facultyBtn) {
    facultyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = facultyForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) { field.style.borderColor = '#c0392b'; valid = false; }
        else { field.style.borderColor = ''; }
      });
      if (!valid) return;
      facultyBtn.textContent = 'Sending...';
      facultyBtn.disabled = true;
      // Simulate submission — replace with real endpoint as needed
      setTimeout(() => {
        facultyForm.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0">' +
          '<div style="font-size:2.5rem;margin-bottom:var(--space-4)">&#10003;</div>' +
          '<h4 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:var(--space-3)">Application Received</h4>' +
          '<p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.7">Thank you for your interest in joining the Renner Dance faculty. We will review your application and be in touch soon.</p>' +
          '</div>';
      }, 1000);
    });
  }

  // ---- Interest form: submit handler (company page) ----
  const interestForm = document.getElementById('interest-form');
  const interestBtn  = document.getElementById('interest-submit-btn');
  if (interestForm && interestBtn) {
    interestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = interestForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) { field.style.borderColor = '#c0392b'; valid = false; }
        else { field.style.borderColor = ''; }
      });
      if (!valid) return;
      interestBtn.textContent = 'Sending...';
      interestBtn.disabled = true;
      setTimeout(() => {
        interestForm.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0">' +
          '<div style="font-size:2.5rem;margin-bottom:var(--space-4)">&#10003;</div>' +
          '<h4 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:var(--space-3)">We\'ve Got Your Info</h4>' +
          '<p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.7;max-width:420px;margin:0 auto">Thank you for expressing interest in our Company Program. We will be in touch as soon as auditions open for the next season.</p>' +
          '</div>';
      }, 1000);
    });
  }

});
