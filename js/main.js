/* Michele Galasso — Osteopata D.O. | JavaScript essenziale, nessuna libreria */

/* ------------------------------------------------------------------
   CONFIGURAZIONE — da completare prima della pubblicazione
   formEndpoint: URL del servizio che riceve il modulo (es. Formspree
     "https://formspree.io/f/XXXXXXX" o un endpoint PHP proprio).
     Finché è vuoto il modulo NON simula l'invio: avvisa l'utente e
     indica il numero di telefono.
   whatsappEnabled: true solo dopo conferma che il numero usa WhatsApp.
------------------------------------------------------------------- */
const SITE_CONFIG = {
  formEndpoint: '',
  whatsappEnabled: false,
};

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno nel footer ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- WhatsApp (solo se confermato) ---------- */
  if (SITE_CONFIG.whatsappEnabled) {
    document.querySelectorAll('[data-whatsapp]').forEach((el) => { el.hidden = false; });
  }

  /* ---------- Header: ombra durante lo scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  const toggleLabel = toggle.querySelector('.sr-only');
  const mq = window.matchMedia('(max-width: 1023px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) {
      const first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a') && mq.matches) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  mq.addEventListener('change', () => setMenu(false));

  /* ---------- Voce di menu attiva ---------- */
  const links = Array.from(document.querySelectorAll('.nav-list a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Fade-in discreto ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- FAQ: accordion, una domanda aperta per volta ---------- */
  document.querySelectorAll('[data-accordion]').forEach((acc) => {
    const buttons = acc.querySelectorAll('.faq-q button');

    function close(btn) {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      const done = () => { if (!panel.classList.contains('is-open')) panel.hidden = true; };
      if (reduceMotion) done(); else setTimeout(done, 320);
    }
    function open(btn) {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      void panel.offsetHeight; // reflow per la transizione
      panel.classList.add('is-open');
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach((b) => { if (b !== btn && b.getAttribute('aria-expanded') === 'true') close(b); });
        if (isOpen) close(btn); else open(btn);
      });
      btn.addEventListener('keydown', (e) => {
        const list = Array.from(buttons);
        const i = list.indexOf(btn);
        let next = null;
        if (e.key === 'ArrowDown') next = list[(i + 1) % list.length];
        if (e.key === 'ArrowUp') next = list[(i - 1 + list.length) % list.length];
        if (e.key === 'Home') next = list[0];
        if (e.key === 'End') next = list[list.length - 1];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  });

  /* ---------- Approccio: la colonna si disegna con lo scroll ---------- */
  const spine = document.querySelector('[data-spine]');
  const spinePath = spine && spine.querySelector('.spine-draw');
  const principles = spine ? Array.from(spine.querySelectorAll('.principle')) : [];

  /* ---------- Come funziona: percorso che avanza con lo scroll ---------- */
  const journey = document.querySelector('[data-journey]');
  const jTrack = journey && journey.querySelector('.journey-track');
  const jSteps = journey ? Array.from(journey.querySelectorAll('.jstep')) : [];
  const jNodes = jSteps.map((s) => s.querySelector('.jstep-node'));
  const vertical = window.matchMedia('(max-width: 860px)');

  function layoutJourney() {
    if (!journey) return;
    if (vertical.matches) {
      const base = journey.getBoundingClientRect().top;
      const first = jNodes[0].getBoundingClientRect();
      const last = jNodes[jNodes.length - 1].getBoundingClientRect();
      jTrack.style.top = (first.top + first.height / 2 - base) + 'px';
      jTrack.style.bottom = 'auto';
      jTrack.style.height = (last.top - first.top) + 'px';
    } else {
      jTrack.style.top = jTrack.style.bottom = jTrack.style.height = '';
    }
  }

  const clamp = (v) => Math.max(0, Math.min(1, v));

  function updateScrollFx() {
    const vh = window.innerHeight;
    if (spine) {
      const r = spine.getBoundingClientRect();
      const p = reduceMotion ? 1 : clamp((vh * 0.62 - r.top) / r.height);
      spinePath.style.strokeDashoffset = String(1 - p);
      principles.forEach((li) => {
        const node = li.querySelector('.principle-node').getBoundingClientRect();
        if (reduceMotion || node.top < vh * 0.66) li.classList.add('is-on');
      });
    }
    if (journey) {
      const r = jTrack.getBoundingClientRect();
      let p;
      if (reduceMotion) p = 1;
      else if (vertical.matches) p = clamp((vh * 0.6 - r.top) / Math.max(r.height, 1));
      else p = clamp((vh * 0.78 - r.top) / (vh * 0.42));
      journey.style.setProperty('--p', p.toFixed(4));
      journey.classList.toggle('is-moving', p > 0.01 && p < 0.99);
      const n = jSteps.length - 1;
      jSteps.forEach((s, i) => { if (p >= i / n - 0.02) s.classList.add('is-active'); });
    }
  }

  let ticking = false;
  const requestFx = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateScrollFx(); });
  };
  layoutJourney();
  updateScrollFx();
  window.addEventListener('scroll', requestFx, { passive: true });
  window.addEventListener('resize', () => { layoutJourney(); requestFx(); });
  window.addEventListener('load', () => { layoutJourney(); requestFx(); });

  /* ---------- Modulo di contatto ---------- */
  const form = document.getElementById('modulo-contatto');
  if (!form) return;

  const loadedAt = Date.now();
  const status = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const PHONE = '+39 347 671 6225';
  const PHONE_LINK = '<a href="tel:+393476716225">' + PHONE + '</a>';

  const rules = {
    nome: (v) => (v.trim().length < 3 ? 'Inserisci nome e cognome.' : (!/\s/.test(v.trim()) ? 'Inserisci sia il nome sia il cognome.' : '')),
    email: (v) => (!v.trim() ? 'Inserisci il tuo indirizzo email.' : (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Controlla il formato dell\'email (es. nome@dominio.it).' : '')),
    telefono: (v) => { const d = v.replace(/[^\d]/g, ''); return !v.trim() ? 'Inserisci un numero di telefono.' : ((d.length < 8 || d.length > 15 || /[^\d\s+().-]/.test(v)) ? 'Controlla il numero di telefono.' : ''); },
    messaggio: (v) => (v.trim().length < 10 ? 'Scrivi un breve messaggio (almeno 10 caratteri).' : ''),
    privacy: (_, el) => (!el.checked ? 'Per inviare la richiesta è necessario accettare l\'informativa privacy.' : ''),
  };

  function validateField(el) {
    const rule = rules[el.name];
    if (!rule) return true;
    const msg = rule(el.value, el);
    const wrap = el.closest('.field');
    const err = document.getElementById(el.getAttribute('aria-describedby'));
    wrap.classList.toggle('has-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  }

  form.querySelectorAll('input, textarea').forEach((el) => {
    if (!rules[el.name]) return;
    el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') validateField(el); });
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('has-error')) validateField(el); });
    el.addEventListener('change', () => { if (el.type === 'checkbox') validateField(el); });
  });

  function notice(type, title, html) {
    status.innerHTML = '<div class="notice notice--' + type + '"><strong>' + title + '</strong><p>' + html + '</p></div>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.innerHTML = '';

    let firstInvalid = null;
    Object.keys(rules).forEach((name) => {
      const el = form.elements[name];
      if (!validateField(el) && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    // Antispam: campo trappola compilato o invio troppo rapido
    if (form.elements.website.value) return;
    if (Date.now() - loadedAt < 3000) {
      notice('warn', 'Un attimo…', 'Attendi qualche secondo e invia di nuovo la richiesta.');
      return;
    }

    if (!SITE_CONFIG.formEndpoint) {
      notice('warn', 'Il modulo online non è ancora attivo.', 'La tua richiesta <strong style="display:inline">non è stata inviata</strong>. Per informazioni o per richiedere una consulenza chiamami al ' + PHONE_LINK + '.');
      return;
    }

    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Invio in corso…';
    try {
      const data = new FormData(form);
      data.delete('website');
      data.set('privacy', 'accettata');
      data.set('_subject', 'Nuova richiesta dal sito — ' + data.get('nome'));
      const res = await fetch(SITE_CONFIG.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      notice('ok', 'Richiesta inviata. Grazie!', 'Ti risponderò il prima possibile ai recapiti che hai indicato.');
    } catch (err) {
      notice('err', 'Invio non riuscito.', 'Si è verificato un problema tecnico e la richiesta non è stata inviata. Riprova tra poco oppure chiamami al ' + PHONE_LINK + '.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();
