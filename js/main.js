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
    const toggleMenu = (forceState) => {
      const isOpen = forceState !== undefined ? forceState : !mobileNav.classList.contains('open');
      hamburger.classList.toggle('open', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (navbar) {
        navbar.classList.toggle('mobile-menu-active', isOpen);
      }
    };

    hamburger.addEventListener('click', () => toggleMenu());

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleMenu(false);
      }
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

  // ---- Careers page: role pre-selection & dynamic teaching fields ----
  const roleSelect = document.getElementById('fac-role');
  const teachingFields = document.getElementById('teaching-fields-group');
  const trackSelect = document.getElementById('fac-program-track');
  const syncRoleFields = () => {
    if (!roleSelect || !teachingFields) return;
    const isOpsOnly = roleSelect.value === 'Studio Operations';
    teachingFields.classList.toggle('is-hidden', isOpsOnly);
    if (trackSelect) {
      if (roleSelect.value === 'Recreational Dance Teacher' && !trackSelect.value) {
        trackSelect.value = 'Recreational Students';
      } else if (roleSelect.value === 'Advanced & Company Faculty' && !trackSelect.value) {
        trackSelect.value = 'Competitive Students';
      } else if (roleSelect.value === 'Both Recreational & Advanced Teaching' && !trackSelect.value) {
        trackSelect.value = 'Both Recreational & Competitive';
      }
    }
  };
  if (roleSelect) {
    roleSelect.addEventListener('change', syncRoleFields);
    syncRoleFields();
  }
  document.querySelectorAll('[data-apply-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!roleSelect) return;
      const desired = btn.getAttribute('data-apply-role');
      roleSelect.value = desired;
      syncRoleFields();
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

  // ---- Multi-Layer Anti-Spam, CAPTCHA & Form Validation System ----
  // Layers:
  //   1. Invisible Honeypot trap (website_url)
  //   2. Behavioral Time-Gate (>= 2.5s) & human interaction tracking
  //   3. Interactive Human Verification Challenge (CAPTCHA widget)
  //   4. Content heuristic filter (blocks URL floods / BBCode) & 45s rate limit
  const pageLoadedAt = Date.now();
  let humanInteracted = false;
  const markInteracted = () => { humanInteracted = true; };
  window.addEventListener('keydown', markInteracted, { once: true, passive: true });
  window.addEventListener('pointerdown', markInteracted, { once: true, passive: true });

  const isSpamContent = (form) => {
    const textFields = form.querySelectorAll('input[type="text"], textarea');
    const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi;
    const spamPattern = /(\[url=|<script|crypto|bitcoin|casino|seo\s+service|backlinks|telegram\s*@)/i;
    for (const field of textFields) {
      const val = (field.value || '').trim();
      if (!val) continue;
      const urls = val.match(urlRegex);
      if (urls && urls.length > 2) return true;
      if (spamPattern.test(val)) return true;
    }
    return false;
  };

  const initSecurityWidget = (form) => {
    // 1. Ensure honeypot field exists
    if (!form.querySelector('input[name="website_url"]')) {
      const hpWrap = document.createElement('div');
      hpWrap.className = 'hp-field';
      hpWrap.setAttribute('aria-hidden', 'true');
      hpWrap.innerHTML = '<label>Leave this field blank<input type="text" name="website_url" tabindex="-1" autocomplete="off"></label>';
      form.prepend(hpWrap);
    }

    // 2. Ensure Human Verification widget exists above submit button
    let widget = form.querySelector('.security-verify-box');
    const submitBtn = form.querySelector('[type="submit"]');
    if (!widget && submitBtn) {
      widget = document.createElement('div');
      widget.className = 'security-verify-box';
      widget.setAttribute('data-verified', 'false');
      widget.innerHTML =
        '<div class="security-verify-row">' +
          '<div class="security-verify-left">' +
            '<button type="button" class="security-check-btn" aria-label="Verify you are human" aria-pressed="false">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            '</button>' +
            '<div>' +
              '<span class="security-verify-label">I am human</span>' +
              '<span class="security-verify-sub">Spam protection &middot; Click to verify</span>' +
            '</div>' +
          '</div>' +
          '<div class="security-verify-badge">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            '<span class="security-badge-text">Protected</span>' +
          '</div>' +
        '</div>' +
        '<div class="security-challenge-wrap">' +
          '<span class="security-question-text"></span>' +
          '<input type="number" class="security-answer-input" placeholder="?" aria-label="Security math answer" inputmode="numeric">' +
          '<button type="button" class="btn btn-primary btn-sm security-confirm-btn" style="padding:6px 14px;font-size:0.74rem;min-height:32px">Verify</button>' +
        '</div>' +
        '<div class="form-security-msg" role="alert">Please complete the human verification check above before submitting.</div>';
      submitBtn.parentNode.insertBefore(widget, submitBtn);
    }

    if (!widget) return null;

    // Generate random arithmetic challenge
    const numA = Math.floor(Math.random() * 7) + 2; // 2..8
    const numB = Math.floor(Math.random() * 6) + 1; // 1..6
    const expectedAnswer = numA + numB;

    const checkBtn = widget.querySelector('.security-check-btn');
    const labelEl  = widget.querySelector('.security-verify-label');
    const subEl    = widget.querySelector('.security-verify-sub');
    const badgeTxt = widget.querySelector('.security-badge-text');
    const qText    = widget.querySelector('.security-question-text');
    const ansInput = widget.querySelector('.security-answer-input');
    const confBtn  = widget.querySelector('.security-confirm-btn');
    const msgEl    = widget.querySelector('.form-security-msg');

    if (qText) qText.textContent = `Quick check: What is ${numA} + ${numB}?`;

    const openChallenge = () => {
      if (widget.getAttribute('data-verified') === 'true') return;
      widget.classList.remove('has-error');
      widget.classList.add('is-challenging');
      if (ansInput) ansInput.focus();
    };

    const verifyAnswer = () => {
      if (!ansInput) return;
      const val = parseInt(ansInput.value, 10);
      if (val === expectedAnswer) {
        widget.setAttribute('data-verified', 'true');
        widget.classList.remove('is-challenging', 'has-error');
        widget.classList.add('is-verified');
        if (checkBtn) checkBtn.setAttribute('aria-pressed', 'true');
        if (labelEl) labelEl.textContent = 'Verified human';
        if (subEl) subEl.textContent = 'Security check complete';
        if (badgeTxt) badgeTxt.textContent = 'Verified';
      } else {
        widget.classList.add('has-error');
        if (msgEl) msgEl.textContent = 'Incorrect answer. Please solve the quick math check above.';
        ansInput.value = '';
        ansInput.focus();
      }
    };

    if (checkBtn) checkBtn.addEventListener('click', openChallenge);
    if (labelEl) labelEl.addEventListener('click', openChallenge);
    if (confBtn) confBtn.addEventListener('click', verifyAnswer);
    if (ansInput) {
      ansInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          verifyAnswer();
        }
      });
      ansInput.addEventListener('input', () => {
        if (parseInt(ansInput.value, 10) === expectedAnswer) {
          verifyAnswer();
        }
      });
    }

    return widget;
  };

  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    const widget = initSecurityWidget(form);
    const formId = form.id || 'renner-form';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Layer 1: Honeypot check
      const hpInput = form.querySelector('input[name="website_url"]');
      if (hpInput && hpInput.value.trim() !== '') {
        return; // Silently drop bot submission
      }

      // Layer 2: Behavioral Time-Gate (< 2.5s) & human interaction check
      if (Date.now() - pageLoadedAt < 2500 || !humanInteracted) {
        return;
      }

      // Layer 3: Required fields validation
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      // Layer 4: Content heuristic & rate-limit check
      if (isSpamContent(form)) {
        if (widget) {
          widget.classList.add('has-error');
          const msg = widget.querySelector('.form-security-msg');
          if (msg) msg.textContent = 'Please remove external links or promotional content from your message.';
        }
        return;
      }

      const lastSubmitKey = `renner_last_submit_${formId}`;
      const lastSubmitTime = parseInt(sessionStorage.getItem(lastSubmitKey) || '0', 10);
      if (Date.now() - lastSubmitTime < 45000) {
        if (widget) {
          widget.classList.add('has-error');
          const msg = widget.querySelector('.form-security-msg');
          if (msg) msg.textContent = 'You recently submitted this form. Please wait a moment before sending another request.';
        }
        return;
      }

      // Layer 5: Interactive CAPTCHA / Human Verification check
      if (widget && widget.getAttribute('data-verified') !== 'true') {
        widget.classList.add('has-error', 'is-challenging');
        const msg = widget.querySelector('.form-security-msg');
        if (msg) msg.textContent = 'Please complete the human verification check above before submitting.';
        const ansInput = widget.querySelector('.security-answer-input');
        if (ansInput) ansInput.focus();
        return;
      }

      sessionStorage.setItem(lastSubmitKey, String(Date.now()));

      // Custom success UI based on form ID
      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending...';
        btn.disabled = true;
      }

      setTimeout(() => {
        if (form.id === 'faculty-form') {
          form.innerHTML =
            '<div style="text-align:center;padding:var(--space-8) 0">' +
              '<div style="font-size:2.5rem;margin-bottom:var(--space-4);color:#22c55e">&#10003;</div>' +
              '<h4 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:var(--space-3)">Application Received</h4>' +
              '<p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.7">Thank you for your interest in joining the Renner Dance team. Our leadership will review your application and be in touch soon.</p>' +
            '</div>';
        } else if (form.id === 'interest-form') {
          form.innerHTML =
            '<div style="text-align:center;padding:var(--space-8) 0">' +
              '<div style="font-size:2.5rem;margin-bottom:var(--space-4);color:#22c55e">&#10003;</div>' +
              '<h4 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:var(--space-3)">We\'ve Got Your Info</h4>' +
              '<p style="color:var(--ink-soft);font-size:0.95rem;line-height:1.7;max-width:420px;margin:0 auto">Thank you for expressing interest in our Company Program. We will be in touch as soon as auditions open for the next season.</p>' +
            '</div>';
        } else if (btn) {
          btn.textContent = 'Thank you! We\'ll be in touch soon.';
          btn.style.background = '#22c55e';
          btn.style.borderColor = '#22c55e';
        }
      }, 800);
    });
  });

});
