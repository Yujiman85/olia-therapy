/* Olia Therapy — site behaviour
   Everything here degrades gracefully: with JS off the nav links still work,
   FAQ answers are visible, and the contact details are plain links. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Reader preferences — text size and high contrast.
     Stored per browser. Wrapped because storage throws in private mode.
     --------------------------------------------------------------- */
  var STORE = 'olia-reader-prefs';
  var root = document.documentElement;

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function writePrefs(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* no-op */ }
  }

  function applyPrefs(p) {
    if (p.textsize && p.textsize !== 'normal') root.setAttribute('data-textsize', p.textsize);
    else root.removeAttribute('data-textsize');

    if (p.contrast === 'high') root.setAttribute('data-contrast', 'high');
    else root.removeAttribute('data-contrast');

    syncControls(p);
  }

  function syncControls(p) {
    var size = p.textsize || 'normal';
    document.querySelectorAll('[data-set-textsize]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setTextsize === size));
    });
    var high = p.contrast === 'high';
    document.querySelectorAll('[data-toggle-contrast]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(high));
    });
  }

  document.addEventListener('click', function (e) {
    var sizeBtn = e.target.closest('[data-set-textsize]');
    if (sizeBtn) {
      var p = readPrefs();
      p.textsize = sizeBtn.dataset.setTextsize;
      writePrefs(p); applyPrefs(p);
      announce('Text size: ' + (p.textsize === 'normal' ? 'standard' : p.textsize === 'large' ? 'large' : 'extra large'));
      return;
    }
    var contrastBtn = e.target.closest('[data-toggle-contrast]');
    if (contrastBtn) {
      var q = readPrefs();
      q.contrast = q.contrast === 'high' ? 'normal' : 'high';
      writePrefs(q); applyPrefs(q);
      announce(q.contrast === 'high' ? 'High contrast on' : 'High contrast off');
    }
  });

  /* Politely announce preference changes to screen readers. */
  var liveRegion;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = msg;
  }

  syncControls(readPrefs());

  /* ---------------------------------------------------------------
     Mobile menu — full-screen overlay with a focus trap.
     --------------------------------------------------------------- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var lastFocused = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function openMenu() {
    if (!menu) return;
    lastFocused = document.activeElement;
    menu.hidden = false;
    document.body.style.overflow = 'hidden';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    var first = menu.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    if (lastFocused) lastFocused.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  /* Close after following an in-page link. */
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!menu || menu.hidden) return;

    if (e.key === 'Escape') { closeMenu(); return; }

    if (e.key === 'Tab') {
      var items = Array.prototype.filter.call(
        menu.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Menu is a mobile affordance only — close it if the viewport grows. */
  var wide = window.matchMedia('(min-width: 66.0625rem)');
  var onWide = function (ev) { if (ev.matches) closeMenu(); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else if (wide.addListener) wide.addListener(onWide);

  /* ---------------------------------------------------------------
     FAQ accordion. Answers start visible in the markup, so a reader
     with JS disabled sees everything; we collapse them on boot.
     --------------------------------------------------------------- */
  document.querySelectorAll('.faq-q').forEach(function (btn, i) {
    var answer = document.getElementById(btn.getAttribute('aria-controls'));
    if (!answer) return;

    var startOpen = i === 0;
    btn.setAttribute('aria-expanded', String(startOpen));
    answer.hidden = !startOpen;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });

  /* ---------------------------------------------------------------
     Contact form — DRAFT ONLY. Nothing is sent anywhere. The validation
     below is real, though, because the accessible pattern is the part worth
     getting right before someone wires up an endpoint: inline errors on each
     field, plus a focusable summary at the top that links to them. The
     summary complements the inline errors, it never replaces them.
     --------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var summary = document.getElementById('error-summary');
    var summaryList = document.getElementById('error-summary-list');
    var status = document.getElementById('form-status');

    var RULES = [
      { id: 'name',    msg: 'Enter your name' },
      { id: 'email',   msg: 'Enter an email address', test: function (v) {
          return v.indexOf('@') > 0 && v.indexOf('.', v.indexOf('@')) > v.indexOf('@') + 1;
        }, invalidMsg: 'Enter an email address in the format name@example.com' },
      { id: 'message', msg: 'Tell me briefly what you need help with' }
    ];

    function setFieldError(id, message) {
      var input = document.getElementById(id);
      var errorEl = document.getElementById(id + '-error');
      if (!input || !errorEl) return;
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    }

    function validate() {
      var errors = [];
      RULES.forEach(function (rule) {
        var input = document.getElementById(rule.id);
        if (!input) return;
        var value = input.value.trim();
        var message = '';
        if (!value) message = rule.msg;
        else if (rule.test && !rule.test(value)) message = rule.invalidMsg;
        setFieldError(rule.id, message);
        if (message) errors.push({ id: rule.id, message: message });
      });
      return errors;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = validate();

      if (errors.length) {
        status.hidden = true;
        summaryList.innerHTML = '';
        errors.forEach(function (err) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + err.id;
          a.textContent = err.message;
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            document.getElementById(err.id).focus();
          });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }

      summary.hidden = true;
      status.hidden = false;
      status.textContent = 'This is a design draft — the form is not connected yet, so nothing was sent. Please call 202-888-0543 or email hello@oliatherapy.com.';
      status.focus();
    });

    /* Clear a field error as soon as the person fixes it, but never introduce
       one mid-typing — that punishes someone still composing their answer.

       This listens on 'input' rather than 'blur' deliberately. Clearing the
       error on blur removes its element just as the pointer travels toward the
       Send button, which collapses the layout and shifts the button out from
       under the click. On 'input' the reflow happens while they are still
       typing, long before they reach for anything. */
    RULES.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      if (!input) return;
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') !== 'true') return;
        var value = input.value.trim();
        if (value && (!rule.test || rule.test(value))) setFieldError(rule.id, '');
      });
    });
  }

  /* ---------------------------------------------------------------
     Image placeholders report their own rendered size, so the number is
     honest at whatever width you are looking at rather than a figure that
     only holds at one breakpoint. Nothing here suggests what the picture
     should be — that is the client's call.
     --------------------------------------------------------------- */
  var placeholders = document.querySelectorAll('[data-ph]');
  if (placeholders.length) {
    var writeDims = function (el) {
      var out = el.querySelector('[data-ph-dims]');
      if (!out) return;
      var r = el.getBoundingClientRect();
      out.textContent = Math.round(r.width) + ' \u00d7 ' + Math.round(r.height);
    };

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { writeDims(entry.target); });
      });
      placeholders.forEach(function (el) { ro.observe(el); writeDims(el); });
    } else {
      /* Older browsers: set once, then refresh on resize. */
      var refresh = function () { placeholders.forEach(writeDims); };
      refresh();
      window.addEventListener('resize', refresh);
    }
  }

  /* ---------------------------------------------------------------
     Mark the current page in both navs.
     --------------------------------------------------------------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mm-links a').forEach(function (a) {
    var target = a.getAttribute('href');
    if (target === here) a.setAttribute('aria-current', 'page');
  });
})();
