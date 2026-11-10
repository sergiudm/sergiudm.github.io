// Site behaviour. Everything is progressive: pages work without this file.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  },
};

function throttle(fn) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...args); });
  };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ---------- theme ---------- */

function setTheme(theme, persist) {
  document.documentElement.dataset.theme = theme;
  if (persist) store.set('theme', theme);
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

function initTheme() {
  const btn = $('.theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (e) => { if (!store.get('theme')) setTheme(e.matches ? 'dark' : 'light', false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
}

/* ---------- copy buttons ---------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

function flash(btn) {
  const label = btn.querySelector('span');
  const original = label ? label.textContent : '';
  btn.classList.add('is-copied');
  if (label) label.textContent = 'Copied';
  setTimeout(() => {
    btn.classList.remove('is-copied');
    if (label) label.textContent = original;
  }, 1600);
}

function codeText(block) {
  const code = block.querySelector('.lntd:last-child code') || block.querySelector('pre code') || block.querySelector('pre');
  if (!code) return '';
  const clone = code.cloneNode(true);
  clone.querySelectorAll('.ln').forEach((n) => n.remove());
  return clone.textContent;
}

function initCopy() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    let text = '';
    if (btn.dataset.copyTarget) {
      const el = document.getElementById(btn.dataset.copyTarget);
      text = el ? el.textContent : '';
    } else if ('copyCommands' in btn.dataset) {
      const term = btn.closest('.terminal');
      text = $$('.term-input', term).map((n) => n.textContent).join('\n');
    } else {
      const block = btn.closest('.codeblock');
      text = block ? codeText(block) : '';
    }
    if (text && await copyText(text.replace(/\n+$/, ''))) flash(btn);
  });
}

/* ---------- disclosure buttons (abstract / BibTeX) ---------- */

function initToggles() {
  $$('[data-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.dataset.toggle);
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
}

function initMail() {
  $$('[data-mail-user]').forEach((a) => {
    const addr = `${a.dataset.mailUser}@${a.dataset.mailDomain}`;
    a.href = `mailto:${addr}`;
    a.title = addr;
  });
}

/* ---------- reading progress and table of contents ---------- */

function initProgress() {
  const bar = $('.progress__bar');
  const body = $('.post .prose');
  if (!bar || !body) return;
  const update = () => {
    const r = body.getBoundingClientRect();
    const total = Math.max(r.height - window.innerHeight * 0.7, 1);
    const p = Math.min(1, Math.max(0, -r.top / total));
    bar.style.setProperty('--progress', p.toFixed(4));
  };
  window.addEventListener('scroll', throttle(update), { passive: true });
  window.addEventListener('resize', throttle(update));
  update();
}

function initToc() {
  const links = $$('.post-grid__toc .toc a');
  if (links.length) {
    const map = new Map();
    links.forEach((a) => {
      const h = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (h) map.set(h, a);
    });
    const headings = [...map.keys()];
    let active = null;
    const onScroll = () => {
      let current = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top < 140) current = h;
        else break;
      }
      if (current === active) return;
      if (active) map.get(active).classList.remove('is-active');
      if (current) {
        const link = map.get(current);
        link.classList.add('is-active');
        const box = link.closest('.toc-sticky');
        if (box) {
          const lr = link.getBoundingClientRect();
          const br = box.getBoundingClientRect();
          if (lr.top < br.top + 40 || lr.bottom > br.bottom - 40) box.scrollTop += lr.top - br.top - br.height / 3;
        }
      }
      active = current;
    };
    window.addEventListener('scroll', throttle(onScroll), { passive: true });
    onScroll();
  }
  $$('.toc-mobile a').forEach((a) => a.addEventListener('click', () => { a.closest('details').open = false; }));
}

/* ---------- lightbox ---------- */

function zoomable(img) {
  if ('nozoom' in img.dataset || img.classList.contains('inline-img')) return false;
  if (!img.closest('.prose, .post-cover')) return false;
  if (img.closest('a, .compare, .demo, .terminal, .pub__teaser')) return false;
  return true;
}

function initLightbox() {
  $$('.prose img').forEach((img) => { if (zoomable(img) && !img.dataset.zoom) img.dataset.zoom = ''; });
  let box = null;
  let lastFocus = null;
  const close = () => {
    if (!box) return;
    box.classList.remove('is-open');
    const el = box;
    box = null;
    setTimeout(() => el.remove(), reduceMotion ? 0 : 200);
    document.removeEventListener('keydown', onKey);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || !zoomable(img)) return;
    lastFocus = document.activeElement;
    const fig = img.closest('figure');
    const caption = fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent.trim() : img.alt;
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', caption || 'Image');
    const full = document.createElement('img');
    full.src = img.dataset.zoom || img.currentSrc || img.src;
    full.alt = img.alt;
    const btn = document.createElement('button');
    btn.className = 'lightbox__close';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Close');
    btn.textContent = '✕';
    box.append(btn, full);
    if (caption) {
      const p = document.createElement('p');
      p.className = 'lightbox__caption';
      p.textContent = caption;
      box.append(p);
    }
    box.addEventListener('click', close);
    document.body.appendChild(box);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => box && box.classList.add('is-open'));
    btn.focus({ preventScroll: true });
  });
}

/* ---------- tabs ---------- */

function initTabs() {
  let saved = {};
  try { saved = JSON.parse(store.get('tabs') || '{}'); } catch (e) { saved = {}; }
  $$('.tabs').forEach((tabs, ti) => {
    const panels = $$(':scope > .tabs__panel', tabs);
    if (!panels.length) return;
    const group = tabs.dataset.group;
    const list = document.createElement('div');
    list.className = 'tabs__list';
    list.setAttribute('role', 'tablist');
    const buttons = panels.map((panel, i) => {
      const id = `tab-${ti}-${i}`;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tabs__tab';
      b.id = id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', `${id}-panel`);
      b.textContent = panel.dataset.label || `Tab ${i + 1}`;
      panel.id = `${id}-panel`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', id);
      list.appendChild(b);
      return b;
    });
    const select = (i, fromUser) => {
      buttons.forEach((b, j) => {
        const on = i === j;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (fromUser && group) {
        saved[group] = panels[i].dataset.label;
        store.set('tabs', JSON.stringify(saved));
        document.dispatchEvent(new CustomEvent('tabgroup', { detail: { group, label: panels[i].dataset.label, source: tabs } }));
      }
    };
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => select(i, true));
      b.addEventListener('keydown', (e) => {
        const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return;
        e.preventDefault();
        const n = (i + k + buttons.length) % buttons.length;
        select(n, true);
        buttons[n].focus();
      });
    });
    tabs.prepend(list);
    tabs.classList.add('is-ready');
    let initial = 0;
    if (group && saved[group]) {
      const k = panels.findIndex((p) => p.dataset.label === saved[group]);
      if (k >= 0) initial = k;
    }
    select(initial, false);
    if (group) {
      document.addEventListener('tabgroup', (e) => {
        if (e.detail.group !== group || e.detail.source === tabs) return;
        const k = panels.findIndex((p) => p.dataset.label === e.detail.label);
        if (k >= 0) select(k, false);
      });
    }
  });
}

/* ---------- compare slider, count-up stats, autoplay videos ---------- */

function initCompare() {
  $$('.compare').forEach((c) => {
    const range = $('.compare__range', c);
    if (!range) return;
    const set = () => c.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  });
}

function initCountUp() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const re = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s;
  const run = (el) => {
    const m = el.dataset.final.match(re);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 900);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (target * eased).toFixed(decimals) + post;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = el.dataset.final;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      run(en.target);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => {
    const text = el.textContent.trim();
    const m = text.match(re);
    if (!m || el.getBoundingClientRect().top < window.innerHeight) return;
    // Counting from 0 to a small whole number reads as a glitch, not a flourish.
    if (!m[2].includes('.') && parseFloat(m[2].replace(/,/g, '')) < 10) return;
    el.dataset.final = text;
    const decimals = (m[2].split('.')[1] || '').length;
    el.textContent = m[1] + (0).toFixed(decimals) + m[3];
    io.observe(el);
  });
}

function initVideos() {
  if (!reduceMotion) return;
  $$('video[data-autoplay]').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); v.controls = true; });
}

/* ---------- blog filter ---------- */

function initFilter() {
  const root = $('[data-filter]');
  if (!root) return;
  const input = $('[data-filter-input]', root);
  const chips = $$('[data-filter-cat]', root);
  const items = $$('.post-item');
  const groups = $$('[data-year-group]');
  const empty = $('[data-filter-empty]');
  const params = new URLSearchParams(window.location.search);
  let cat = params.get('category') || '';
  if (params.get('q')) input.value = params.get('q');

  const apply = () => {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach((li) => {
      const ok = (!cat || li.dataset.cats.includes(`|${cat}|`)) && terms.every((t) => li.dataset.search.includes(t));
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    groups.forEach((g) => { g.hidden = !g.querySelector('.post-item:not([hidden])'); });
    if (empty) empty.hidden = shown > 0;
    chips.forEach((c) => {
      const on = c.dataset.filterCat === cat;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const url = new URL(window.location.href);
    if (terms.length) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    if (cat) url.searchParams.set('category', cat); else url.searchParams.delete('category');
    window.history.replaceState(null, '', url);
  };

  input.addEventListener('input', apply);
  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.filterCat === cat ? '' : c.dataset.filterCat;
    apply();
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input, textarea, [contenteditable]')) {
      e.preventDefault();
      input.focus();
    }
  });
  if (cat || input.value) apply();
}

/* ---------- tooltips for [data-tip] ---------- */

function initTips() {
  let tip = null;
  const show = (el) => {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'tip';
      tip.setAttribute('role', 'tooltip');
      document.body.appendChild(tip);
    }
    tip.textContent = el.dataset.tip;
    const r = el.getBoundingClientRect();
    const w = tip.offsetWidth;
    const x = Math.min(Math.max(r.left + r.width / 2, w / 2 + 8), window.innerWidth - w / 2 - 8);
    tip.style.left = `${x}px`;
    tip.style.top = `${r.top}px`;
    tip.classList.add('is-visible');
  };
  const hide = () => { if (tip) tip.classList.remove('is-visible'); };
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el) show(el);
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest && e.target.closest('[data-tip]')) hide();
  });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el) show(el); else hide();
  });
  window.addEventListener('scroll', hide, { passive: true });
}

/* ---------- Mermaid diagrams (loaded only when a page has one) ---------- */

async function initMermaid() {
  const nodes = $$('.mermaid[data-source]');
  if (!nodes.length) return;
  let mermaid;
  try {
    mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs')).default;
  } catch (e) {
    console.warn('Mermaid could not be loaded; showing diagram source instead.', e);
    return;
  }
  let run = 0;
  const render = async () => {
    run += 1;
    const v = cssVar;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        darkMode: document.documentElement.dataset.theme === 'dark',
        fontSize: '15px',
        background: v('--surface'),
        primaryColor: v('--accent-soft'),
        primaryBorderColor: v('--accent'),
        primaryTextColor: v('--text'),
        secondaryColor: v('--highlight-soft'),
        secondaryBorderColor: v('--highlight'),
        tertiaryColor: v('--surface-2'),
        tertiaryBorderColor: v('--border-strong'),
        lineColor: v('--muted'),
        textColor: v('--text'),
        mainBkg: v('--accent-soft'),
        nodeBorder: v('--accent'),
        clusterBkg: v('--surface-2'),
        clusterBorder: v('--border-strong'),
        edgeLabelBackground: v('--surface'),
        titleColor: v('--text'),
        actorBkg: v('--accent-soft'),
        actorBorder: v('--accent'),
        actorTextColor: v('--text'),
        actorLineColor: v('--border-strong'),
        signalColor: v('--text-2'),
        signalTextColor: v('--text'),
        labelBoxBkgColor: v('--surface-2'),
        labelBoxBorderColor: v('--border-strong'),
        labelTextColor: v('--text'),
        loopTextColor: v('--text-2'),
        noteBkgColor: v('--highlight-soft'),
        noteBorderColor: v('--highlight'),
        noteTextColor: v('--text'),
        activationBkgColor: v('--surface-2'),
        activationBorderColor: v('--accent'),
        sequenceNumberColor: v('--accent-ink'),
      },
    });
    for (const [i, node] of nodes.entries()) {
      try {
        const { svg } = await mermaid.render(`mmd-${run}-${i}`, node.dataset.source);
        node.innerHTML = svg;
        node.classList.add('is-rendered');
      } catch (e) {
        console.warn('Mermaid could not render a diagram.', e);
      }
    }
  };
  await render();
  document.addEventListener('themechange', render);
}

/* ---------- Chart.js charts (loaded only when a page has one) ---------- */

function withAlpha(color, alpha) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

async function initCharts() {
  const figs = $$('.chart');
  if (!figs.length) return;
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js');
  } catch (e) {
    console.warn('Chart.js could not be loaded.', e);
    return;
  }
  const { Chart } = window;
  if (!Chart) return;
  const charts = [];
  const draw = () => {
    charts.splice(0).forEach((c) => c.destroy());
    const palette = [1, 2, 3, 4, 5, 6].map((i) => cssVar(`--series-${i}`));
    Chart.defaults.color = cssVar('--muted');
    Chart.defaults.borderColor = cssVar('--border');
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.backgroundColor = cssVar('--text');
    Chart.defaults.plugins.tooltip.titleColor = cssVar('--bg');
    Chart.defaults.plugins.tooltip.bodyColor = cssVar('--bg');
    if (reduceMotion) Chart.defaults.animation = false;
    figs.forEach((fig) => {
      let cfg;
      try {
        cfg = JSON.parse($('.chart__config', fig).textContent);
      } catch (e) {
        console.warn('Chart config is not valid JSON.', e);
        return;
      }
      const radial = ['pie', 'doughnut', 'polarArea'].includes(cfg.type);
      ((cfg.data && cfg.data.datasets) || []).forEach((ds, i) => {
        const c = palette[i % palette.length];
        if (radial) {
          if (!ds.backgroundColor) ds.backgroundColor = palette;
          if (!ds.borderColor) ds.borderColor = cssVar('--surface');
        } else {
          if (!ds.borderColor) ds.borderColor = c;
          if (!ds.backgroundColor) ds.backgroundColor = (ds.type || cfg.type) === 'line' ? withAlpha(c, 0.15) : withAlpha(c, 0.75);
          if (ds.borderWidth === undefined) ds.borderWidth = (ds.type || cfg.type) === 'line' ? 2 : 0;
          if (ds.borderRadius === undefined && (ds.type || cfg.type) === 'bar') ds.borderRadius = 4;
        }
      });
      cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false }, cfg.options || {});
      charts.push(new Chart($('canvas', fig), cfg));
    });
  };
  draw();
  document.addEventListener('themechange', draw);
}

/* ---------- go ---------- */

initTheme();
initCopy();
initToggles();
initMail();
initProgress();
initToc();
initLightbox();
initTabs();
initCompare();
initCountUp();
initVideos();
initFilter();
initTips();
initMermaid();
initCharts();
