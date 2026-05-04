/* =========================================================
   Jaya Persona — Interactive Behaviour
   - Mobile menu toggle
   - Sticky header scroll state
   - Scroll-to-top button
   - Lead form validation
   - Auto year in footer
   ========================================================= */

(() => {
  'use strict';

  // --------------------------------------------------------
  // 1. Mobile menu toggle
  // --------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('icon-open');
  const iconClose  = document.getElementById('icon-close');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden') === false;
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      iconOpen.classList.toggle('hidden', isOpen);
      iconClose.classList.toggle('hidden', !isOpen);
    });

    // Close menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      });
    });
  }

  // --------------------------------------------------------
  // 2. Header scroll state + scroll-to-top button
  // --------------------------------------------------------
  const header    = document.getElementById('site-header');
  const scrollBtn = document.getElementById('scroll-top');

  const handleScroll = () => {
    const y = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
    }

    if (scrollBtn) {
      scrollBtn.classList.toggle('is-visible', y > 500);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------
  // 3. Footer year
  // --------------------------------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --------------------------------------------------------
  // 4. Lead form validation
  // --------------------------------------------------------
  const form       = document.getElementById('lead-form');
  const successBox = document.getElementById('form-success');

  if (!form) return;

  /**
   * Show an inline error for a given field.
   */
  const setError = (fieldName, message) => {
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    const input   = form.querySelector(`[name="${fieldName}"]`);

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('is-visible', Boolean(message));
    }
    if (input) {
      input.classList.toggle('is-error', Boolean(message));
    }
  };

  /**
   * Validate a single field. Returns true if valid.
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'name': {
        if (!value.trim()) return 'Please enter your name.';
        if (value.trim().length < 2) return 'Name looks too short.';
        return '';
      }
      case 'phone': {
        if (!value.trim()) return 'Please enter your phone number.';
        // Malaysian phone: accepts +60, 0 prefixes, spaces, dashes
        const phoneRegex = /^[+0-9][\d\s\-()]{7,}$/;
        if (!phoneRegex.test(value.trim())) return 'Please enter a valid phone number.';
        return '';
      }
      case 'email': {
        if (!value.trim()) return 'Please enter your email.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email.';
        return '';
      }
      case 'service': {
        if (!value) return 'Please select a service.';
        return '';
      }
      case 'consent': {
        // Checkbox — value here is the checked state (boolean-as-string)
        return value === 'true' ? '' : 'Please agree to be contacted.';
      }
      default:
        return '';
    }
  };

  // Real-time validation on blur
  ['name', 'phone', 'email', 'service'].forEach(fieldName => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.addEventListener('blur', () => {
      const msg = validateField(fieldName, input.value);
      setError(fieldName, msg);
    });

    // Clear error once the user starts correcting
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) {
        setError(fieldName, '');
      }
    });
  });

  // Submit handler
  form.addEventListener('submit', event => {
    event.preventDefault();

    const fd = new FormData(form);
    const fields = {
      name:    fd.get('name')    || '',
      phone:   fd.get('phone')   || '',
      email:   fd.get('email')   || '',
      service: fd.get('service') || '',
      consent: form.querySelector('[name="consent"]').checked ? 'true' : 'false',
    };

    // Run validation for every required field
    let firstInvalid = null;
    let hasErrors = false;

    Object.entries(fields).forEach(([name, value]) => {
      const msg = validateField(name, value);
      setError(name, msg);
      if (msg) {
        hasErrors = true;
        if (!firstInvalid) firstInvalid = form.querySelector(`[name="${name}"]`);
      }
    });

    if (hasErrors) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All clear — submit to Web3Forms → forwards to apjayapersona@gmail.com
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending…';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (data.success) {
          form.reset();
          if (successBox) {
            successBox.classList.remove('hidden');
            successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => successBox.classList.add('hidden'), 6000);
          }
        } else {
          alert('Something went wrong. Please try again or call us directly.');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('Network error. Please try again or call us directly.');
      });
  });
})();
