/* ============================================================
   ROSE & SCHAFER  ·  site.js
   Shared behavior for every page: navigation, petals, scroll
   reveal, countdown, copy buttons, and the easter-egg game.

   TO ADD A NEW TAB: add one line to NAV_LINKS below, then
   create the matching .html page (copy an existing one).
   See AI_GUIDE.md for details.
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navigation tabs — single source of truth ---- */
  var NAV_LINKS = [
    { label: 'Home',           href: 'index.html'    },
    { label: 'Our Story',      href: 'story.html'    },
    { label: 'RSVP',           href: 'rsvp.html'     },
    { label: 'Stay & Explore', href: 'lodging.html'  },
    { label: 'Registry',       href: 'registry.html' },
    { label: 'Singles',        href: 'singles.html'  }
  ];

  /* ---- Wedding constants ---- */
  var WEDDING_DATE = '2026-09-05T17:30:00-05:00'; /* Sep 5 2026, 5:30 PM Central */
  var CONTACT_PHONE = '(980) 322-3755';

  /* ---- Easter egg ---- */
  var EGG_TOTAL = 6;             /* one hidden petal per page */
  var EGG_KEY   = 'sr-eggs';

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  function currentPage() {
    var p = location.pathname.split('/').pop();
    return (!p) ? 'index.html' : p;
  }

  /* ----------------------------------------------------------
     Navigation bar
     ---------------------------------------------------------- */
  function buildNav() {
    var page = currentPage();
    var items = NAV_LINKS.map(function (l) {
      var active = (l.href === page) ? ' class="active"' : '';
      return '<li><a href="' + l.href + '"' + active + '>' + l.label + '</a></li>';
    }).join('');

    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="nav-brand" href="index.html">Rose <span>&amp;</span> Schafer</a>' +
        '<button class="nav-toggle" aria-label="Menu" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<ul class="nav-links">' + items + '</ul>' +
      '</div>';
    document.body.insertBefore(nav, document.body.firstChild);

    var toggle = nav.querySelector('.nav-toggle');
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelector('.nav-links').addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    return nav;
  }

  /* ----------------------------------------------------------
     Footer
     ---------------------------------------------------------- */
  function buildFooter() {
    if (document.querySelector('.site-footer')) return;
    var links = NAV_LINKS.map(function (l) {
      return '<a href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    var f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML =
      '<div class="footer-monogram">Rose <span>&amp;</span> Schafer</div>' +
      '<div class="footer-detail">September 5, 2026<br>' +
        'Towering Oaks &middot; Valley View, Texas</div>' +
      '<nav class="footer-nav">' + links + '</nav>';
    document.body.appendChild(f);
  }

  /* ----------------------------------------------------------
     Floating petals
     ---------------------------------------------------------- */
  function buildPetals() {
    var wrap = document.getElementById('petals');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'petals';
      document.body.appendChild(wrap);
    }
    var colors = ['#c8d6be', '#d4e0ca', '#b8cca8', '#e2ece0', '#cad9c0'];
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('div');
      p.className = 'petal';
      var size = 7 + Math.random() * 10;
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = Math.random() > 0.4 ? '50% 0' : '60% 40%';
      p.style.animationDuration = (9 + Math.random() * 13) + 's';
      p.style.animationDelay = (Math.random() * 22) + 's';
      wrap.appendChild(p);
    }
  }

  /* ----------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .card');
    if (!('IntersectionObserver' in window)) {
      [].forEach.call(els, function (el) { el.classList.add('in-view'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    [].forEach.call(els, function (el) { obs.observe(el); });
  }

  /* ----------------------------------------------------------
     On-dark nav  (swaps nav style over .nav-dark sections)
     ---------------------------------------------------------- */
  function initNavTheme(nav) {
    var darks = document.querySelectorAll('.nav-dark');
    if (!darks.length) return;
    function update() {
      var dark = false;
      [].forEach.call(darks, function (s) {
        var r = s.getBoundingClientRect();
        if (r.top < 70 && r.bottom > 70) dark = true;
      });
      nav.classList.toggle('on-dark', dark);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ----------------------------------------------------------
     Countdown  (runs only if #countdown is on the page)
     ---------------------------------------------------------- */
  function initCountdown() {
    var cd = document.getElementById('countdown');
    if (!cd) return;
    var target = new Date(WEDDING_DATE).getTime();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function set(name, val) {
      var el = cd.querySelector('[data-cd="' + name + '"]');
      if (el) el.textContent = val;
    }
    function tick() {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      set('days',    Math.floor(diff / 86400000));
      set('hours',   pad(Math.floor(diff / 3600000) % 24));
      set('minutes', pad(Math.floor(diff / 60000) % 60));
      set('seconds', pad(Math.floor(diff / 1000) % 60));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------
     Copy-to-clipboard buttons  (data-copy="value")
     ---------------------------------------------------------- */
  function initCopy() {
    [].forEach.call(document.querySelectorAll('.copy-btn'), function (btn) {
      var label = btn.textContent;
      btn.addEventListener('click', function () {
        if (btn.classList.contains('copied')) return;
        var text = btn.getAttribute('data-copy') || '';
        function done() {
          btn.textContent = 'Copied';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = label;
            btn.classList.remove('copied');
          }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fallback);
        } else { fallback(); }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Easter egg — six hidden petals across the site
     ---------------------------------------------------------- */
  function getEggs() {
    try { return JSON.parse(localStorage.getItem(EGG_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveEggs(list) {
    try { localStorage.setItem(EGG_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function initEasterEgg() {
    var tokens = document.querySelectorAll('.egg-token');
    if (!tokens.length) return;
    var found = getEggs();
    [].forEach.call(tokens, function (t) {
      if (found.indexOf(t.dataset.egg) !== -1) t.classList.add('found');
      t.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = t.dataset.egg;
        var list = getEggs();
        if (list.indexOf(id) === -1) {
          list.push(id);
          saveEggs(list);
          t.classList.add('found');
          petalBurst(rectOf(t));
        }
        if (list.length >= EGG_TOTAL) {
          showEggModal();
        } else {
          showToast('Hidden petal found  ·  ' + list.length + ' of ' + EGG_TOTAL);
        }
      });
    });
  }

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function petalBurst(center) {
    var colors = ['#8fa882', '#c8d6be', '#c4b99a', '#b8cca8'];
    for (var i = 0; i < 12; i++) {
      var dot = document.createElement('div');
      var size = 6 + Math.random() * 8;
      dot.style.cssText =
        'position:fixed;z-index:10055;pointer-events:none;border-radius:50% 0;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + center.x + 'px;top:' + center.y + 'px;' +
        'background:' + colors[i % colors.length] + ';';
      document.body.appendChild(dot);
      var angle = (Math.PI * 2 * i) / 12 + Math.random();
      var dist = 50 + Math.random() * 75;
      animateDot(dot, Math.cos(angle) * dist, Math.sin(angle) * dist);
    }
  }
  function animateDot(dot, dx, dy) {
    if (dot.animate) {
      dot.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(360deg)', opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(0.25,1,0.5,1)' });
    }
    setTimeout(function () { dot.remove(); }, 1500);
  }

  var toastEl, toastTimer;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'egg-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3200);
  }

  function showEggModal() {
    var modal = document.getElementById('egg-modal');
    if (modal) { modal.classList.add('show'); return; }
    modal = document.createElement('div');
    modal.className = 'egg-modal';
    modal.id = 'egg-modal';
    modal.innerHTML =
      '<div class="egg-card">' +
        '<div class="egg-mark">&#10022;</div>' +
        '<h3>You found them all</h3>' +
        '<p>What a sharp eye. You have discovered all six petals hidden ' +
          'across our little website &mdash; a secret almost no one will find.</p>' +
        '<p>Be the <strong>first</strong> to text us your name and let us know ' +
          'you found the hidden petals, and a small prize will be waiting ' +
          'for you at the wedding.</p>' +
        '<div class="egg-phone">' + CONTACT_PHONE + '</div>' +
        '<button class="btn btn--primary" id="egg-close">How lovely</button>' +
      '</div>';
    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('show'); });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.id === 'egg-close') {
        modal.classList.remove('show');
      }
    });
    var center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    for (var k = 0; k < 3; k++) {
      setTimeout(function () { petalBurst(center); }, k * 260);
    }
  }

  /* Helper for the couple to re-test the hunt: run resetEasterEgg()
     in the browser console to clear progress. */
  window.resetEasterEgg = function () {
    try { localStorage.removeItem(EGG_KEY); } catch (e) {}
    document.querySelectorAll('.egg-token.found').forEach(function (t) {
      t.classList.remove('found');
    });
    return 'Easter egg progress cleared.';
  };

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  function init() {
    var nav = buildNav();
    buildPetals();
    initReveal();
    initNavTheme(nav);
    initCountdown();
    initCopy();
    initEasterEgg();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
