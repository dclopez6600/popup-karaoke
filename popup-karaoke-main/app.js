// PopUp Karaoke — app.js
// Extracted from index.html for cacheability and maintainability.
// Loaded with defer — DOM is ready when this runs.


// ── BACK TO TOP ──────────────────────────────────────────────────
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, {
    passive: true
  });
  btn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

// ── URGENCY DATE SIGNAL ──────────────────────────────────────────
script > (function() {
  var el = document.getElementById('availUrgency');
  if (!el) return;
  var now = new Date();
  var month = now.getMonth();
  var year = now.getFullYear();
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // Count remaining Fri/Sat/Sun in current month
  var lastDay = new Date(year, month + 1, 0).getDate();
  var remaining = 0;
  for (var d = now.getDate(); d <= lastDay; d++) {
    var day = new Date(year, month, d).getDay();
    if (day === 5 || day === 6 || day === 0) remaining++;
  }
  // Also count next month's to decide messaging
  var nextMonth = (month + 1) % 12;
  var nextMonthName = monthNames[nextMonth];
  var msg = '';
  if (remaining <= 4) {
    msg = '⚡ Only ' + remaining + ' weekend days left in ' + monthNames[month] + '!';
  } else if (remaining <= 8) {
    msg = '📅 ' + remaining + ' weekend dates still open in ' + monthNames[month] + ' — check yours now.';
  } else {
    msg = '📅 ' + nextMonthName + ' weekends filling up — lock in your date early.';
  }
  el.textContent = msg;
  el.style.display = 'block';
})();

// ── TICKER DUPLICATION ───────────────────────────────────────────
  <
  script > (function() {
    var inner = document.getElementById('tickerInner');
    if (!inner) return;
    inner.innerHTML += inner.innerHTML;
  })();

// ── SERVICE WORKER REGISTRATION ──────────────────────────────────
script >
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }

// ── MAIN APP (nav, modals, forms, tracking, reveal, exit intent) ─
(function() {
  'use strict';
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
  var nav = document.getElementById('nav');

  function onScroll() {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  onScroll();
  var navToggle = document.getElementById('navToggle');
  var mobileOverlay = document.getElementById('mobileOverlay');

  function closeMobileNav() {
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (mobileOverlay) mobileOverlay.setAttribute('aria-hidden', 'true');
  }
  if (navToggle && mobileOverlay) {
    navToggle.addEventListener('click', function() {
      var open = mobileOverlay.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
      mobileOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    mobileOverlay.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        closeMobileNav();
      });
    });
    mobileOverlay.addEventListener('click', function(e) {
      if (e.target === mobileOverlay) closeMobileNav();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileOverlay && mobileOverlay.classList.contains('open')) closeMobileNav();
  });
  var mobileOverlayClose = document.getElementById('mobileOverlayClose');
  if (mobileOverlayClose) mobileOverlayClose.addEventListener('click', closeMobileNav);
  var openers = document.querySelectorAll('[data-open-modal]');
  var closers = document.querySelectorAll('[data-close-modal]');

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstInput = m.querySelector('input, textarea, select, button');
    if (firstInput) setTimeout(function() {
      firstInput.focus();
    }, 50);
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(function(m) {
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }
  openers.forEach(function(b) {
    b.addEventListener('click', function() {
      openModal(b.getAttribute('data-open-modal'));
    });
  });
  closers.forEach(function(b) {
    b.addEventListener('click', closeAllModals);
  });
  document.querySelectorAll('.modal').forEach(function(m) {
    m.addEventListener('click', function(e) {
      if (e.target === m) closeAllModals();
    });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAllModals();
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    document.querySelectorAll('.reveal').forEach(function(el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el) {
      el.classList.add('in');
    });
  }
  try {
    if (location.search.indexOf('sent=1') !== -1) {
      alert("Thanks! We got your request and will be in touch soon. 🎤");
      if (history.replaceState) history.replaceState({}, '', location.pathname);
    }
  } catch (e) {}

  function validateField(field) {
    var msg = '';
    var v = (field.value || '').trim();
    if (field.required && !v) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      msg = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && v && v.replace(/\D/g, '').length < 7) {
      msg = 'Please enter a valid phone number.';
    } else if (field.tagName === 'SELECT' && field.required && !v) {
      msg = 'Please select an option.';
    }
    var errorEl = field.parentElement.querySelector('.form-error');
    if (msg) {
      field.classList.add('invalid');
      field.classList.remove('valid');
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
      }
      return false;
    } else {
      field.classList.remove('invalid');
      if (v) field.classList.add('valid');
      field.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.classList.remove('show');
      return true;
    }
  }

  function setupForm(form) {
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('.form-group'), function(g) {
      if (g.querySelector('.form-error')) return;
      var err = document.createElement('div');
      err.className = 'form-error';
      err.setAttribute('role', 'alert');
      g.appendChild(err);
    });
    var fields = form.querySelectorAll('input:not([type=hidden]):not([name=_honey]), select, textarea');
    Array.prototype.forEach.call(fields, function(f) {
      f.addEventListener('blur', function() {
        validateField(f);
      });
      f.addEventListener('input', function() {
        if (f.classList.contains('invalid')) validateField(f);
      });
    });
    form.addEventListener('submit', function(e) {
      var allValid = true;
      Array.prototype.forEach.call(fields, function(f) {
        if (!validateField(f)) allValid = false;
      });
      if (!allValid) {
        e.preventDefault();
        var firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.classList.add('submitting');
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = 'Sending…';
        btn.setAttribute('disabled', 'disabled');
      }
    });
  } // Two-step booking form
  (function() {
    var step1 = document.getElementById('formStep1');
    var step2 = document.getElementById('formStep2');
    var fp1 = document.getElementById('fp1');
    var fp2 = document.getElementById('fp2');
    var nextBtn = document.getElementById('formNextBtn');
    var backBtn = document.getElementById('formBackBtn');
    if (!step1 || !step2 || !nextBtn || !backBtn) return;

    function goStep2() {
      // Validate step 1 fields
      var nameF = document.getElementById('b-name');
      var emailF = document.getElementById('b-email');
      var typeF = document.getElementById('b-type');
      var valid = true;
      [nameF, emailF, typeF].forEach(function(f) {
        if (!validateField(f)) valid = false;
      });
      if (!valid) return;
      step1.style.display = 'none';
      step2.style.display = 'block';
      if (fp1) {
        fp1.classList.remove('fp-active');
        fp1.classList.add('fp-done');
        fp1.querySelector('.fp-num').textContent = '✓';
      }
      if (fp2) {
        fp2.classList.add('fp-active');
      }
      // Pre-fill date from availability checker if set
      var availDate = document.getElementById('availDate');
      var bookDate = document.getElementById('b-date');
      if (availDate && bookDate && availDate.value && !bookDate.value) bookDate.value = availDate.value;
      step2.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }

    function goStep1() {
      step2.style.display = 'none';
      step1.style.display = 'block';
      if (fp1) {
        fp1.classList.add('fp-active');
        fp1.classList.remove('fp-done');
        fp1.querySelector('.fp-num').textContent = '1';
      }
      if (fp2) {
        fp2.classList.remove('fp-active');
      }
      step1.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
    nextBtn.addEventListener('click', goStep2);
    backBtn.addEventListener('click', goStep1);
  })();
  setupForm(document.getElementById('bookingForm'));
  setupForm(document.getElementById('songForm'));
  window.dataLayer = window.dataLayer || [];

  function trackEvent(eventName, fbEvent, params) {
    params = params || {};
    try {
      window.dataLayer.push(Object.assign({
        event: eventName
      }, params));
    } catch (e) {}
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', fbEvent, params);
      }
    } catch (e) {}
  }
  var bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function() {
      trackEvent('lead_submit', 'Lead', {
        content_name: 'Booking Request',
        content_category: 'booking',
        value: 0,
        currency: 'USD'
      });
    });
  }
  var songForm = document.getElementById('songForm');
  if (songForm) {
    songForm.addEventListener('submit', function() {
      trackEvent('lead_submit', 'Lead', {
        content_name: 'Song Request',
        content_category: 'song_request',
        value: 0,
        currency: 'USD'
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('a[href*="square.link"]'), function(a) {
    a.addEventListener('click', function() {
      var src = 'unknown';
      try {
        var u = new URL(a.href);
        src = u.searchParams.get('src') || 'unknown';
      } catch (e) {}
      trackEvent('initiate_checkout', 'InitiateCheckout', {
        content_name: 'Square Payment',
        payment_method: 'square',
        link_source: src,
        currency: 'USD'
      });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]'), function(a) {
    a.addEventListener('click', function() {
      var kind = a.getAttribute('href').indexOf('tel:') === 0 ? 'phone' : 'email';
      trackEvent('contact_click', 'Contact', {
        content_name: kind === 'phone' ? 'Call' : 'Email',
        contact_method: kind
      });
    });
  });
})();