import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/dance.css';
import { releases } from './releases.js';
import { playSound, stopSound } from './audio.js';

const PREVIEW_SECONDS = 30;

const state = { flipped: null, rel: null, trk: null, playing: false, t: 0 };
let clock = null;

const grid = document.querySelector('[data-releases]');
const ui = {
  thumb: document.querySelector('[data-player-thumb]'),
  track: document.querySelector('[data-player-track]'),
  release: document.querySelector('[data-player-release]'),
  eq: document.querySelector('[data-player-eq]'),
  toggle: document.querySelector('[data-player-toggle]'),
  iconPlay: document.querySelector('[data-icon-play]'),
  iconPause: document.querySelector('[data-icon-pause]'),
  prev: document.querySelector('[data-player-prev]'),
  next: document.querySelector('[data-player-next]'),
  elapsed: document.querySelector('[data-player-elapsed]'),
  fill: document.querySelector('[data-player-fill]'),
};

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function coverMarkup(r) {
  if (r.img) {
    return `<img src="${r.img}" alt="Tapa de ${escape(r.title)}" loading="lazy">`;
  }
  return `
    <div class="duo" style="--duo-light: ${r.duo.light}; --duo-dark: ${r.duo.dark}">
      <img src="${r.duo.img}" alt="" style="object-position: ${r.duo.pos}" loading="lazy">
      <div class="shade"></div>
    </div>
    <svg class="grain" aria-hidden="true"><rect width="100%" height="100%" filter="url(#jjg)"></rect></svg>
    <p class="rec__cover-title cond" style="color: ${r.ink}">${escape(r.title)}</p>`;
}

function releaseMarkup(r, ri) {
  const tracks = r.tracks
    .map(
      (t, ti) => `
      <li><button type="button" class="trk" data-rel="${ri}" data-trk="${ti}">
        <span class="trk__n cond">${String(ti + 1).padStart(2, '0')}</span>
        <span class="trk__name">${escape(t.name)}</span>
        <span class="trk__dur">${escape(t.duration)}</span>
      </button></li>`,
    )
    .join('');

  return `
  <li class="rel" data-release="${r.id}">
    <div class="rec" style="--label: ${r.label}">
      <div class="rec__disc" aria-hidden="true"></div>
      <div class="rec__card">
        <div class="rec__face" style="background: ${r.bg}">${coverMarkup(r)}</div>
        <div class="rec__face rec__back" style="background: ${r.backBg}; color: ${r.backInk}">
          <p class="rec__meta">${escape(r.kind)} · ${r.year}</p>
          <p class="rec__back-title cond">${escape(r.title)}</p>
          <ol class="tracks">${tracks}</ol>
          <p class="rec__note">[Lista de temas provisoria]</p>
        </div>
      </div>
    </div>
    <div class="rel__foot">
      <div>
        <h2 class="rel__title cond">${escape(r.title)}</h2>
        <p class="rel__meta" style="color: ${r.label}">${escape(r.kind)} · ${r.year}</p>
      </div>
      <button type="button" class="rel__toggle" data-toggle="${r.id}" aria-pressed="false">Ver temas</button>
    </div>
  </li>`;
}

grid.innerHTML = releases.map(releaseMarkup).join('');

grid.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const id = toggle.dataset.toggle;
    state.flipped = state.flipped === id ? null : id;
    renderFlip();
    return;
  }
  const trk = event.target.closest('.trk');
  if (trk) play(Number(trk.dataset.rel), Number(trk.dataset.trk));
});

ui.toggle.addEventListener('click', () => {
  if (state.rel === null) return play(releases.length - 1, 0);
  if (state.playing) {
    pause();
  } else {
    play(state.rel, state.trk, state.t);
  }
});
ui.prev.addEventListener('click', () => go(-1));
ui.next.addEventListener('click', () => go(1));

function play(ri, ti, from = 0) {
  Object.assign(state, { rel: ri, trk: ti, playing: true, t: from });
  playSound(releases[ri], ti);
  clearInterval(clock);
  clock = setInterval(() => {
    state.t += 1;
    if (state.t >= PREVIEW_SECONDS) go(1);
    else renderProgress();
  }, 1000);
  renderPlayer();
}

function pause() {
  state.playing = false;
  stopSound();
  clearInterval(clock);
  renderPlayer();
}

function go(direction) {
  if (state.rel === null) return play(0, 0);
  let ri = state.rel;
  let ti = state.trk + direction;
  if (ti >= releases[ri].tracks.length) {
    ri = (ri + 1) % releases.length;
    ti = 0;
  }
  if (ti < 0) {
    ri = (ri - 1 + releases.length) % releases.length;
    ti = releases[ri].tracks.length - 1;
  }
  play(ri, ti);
}

function renderFlip() {
  grid.querySelectorAll('.rel').forEach((el) => {
    const flipped = el.dataset.release === state.flipped;
    el.querySelector('.rec').classList.toggle('is-flipped', flipped);
    const button = el.querySelector('[data-toggle]');
    button.setAttribute('aria-pressed', String(flipped));
    button.textContent = flipped ? 'Ver tapa' : 'Ver temas';
  });
}

function renderProgress() {
  ui.elapsed.textContent = `0:${String(state.t).padStart(2, '0')}`;
  ui.fill.style.width = `${(state.t / PREVIEW_SECONDS) * 100}%`;
}

function renderPlayer() {
  const r = releases[state.rel];
  ui.track.textContent = r.tracks[state.trk].name;
  ui.release.textContent = `${r.title} · ${r.year}`;
  ui.thumb.style.background = r.bg;
  ui.thumb.innerHTML = r.img ? `<img src="${r.img}" alt="">` : '';
  ui.eq.hidden = !state.playing;
  ui.iconPlay.toggleAttribute('hidden', state.playing);
  ui.iconPause.toggleAttribute('hidden', !state.playing);
  ui.toggle.setAttribute('aria-label', state.playing ? 'Pausar' : 'Reproducir');

  grid.querySelectorAll('.trk').forEach((button) => {
    const on = Number(button.dataset.rel) === state.rel && Number(button.dataset.trk) === state.trk;
    button.classList.toggle('is-on', on);
    const title = releases[button.dataset.rel].title;
    const prefix = on && state.playing ? 'Sonando' : 'Reproducir';
    button.setAttribute('aria-label', `${prefix}: tema ${Number(button.dataset.trk) + 1} de ${title}`);
  });
  renderProgress();
}

window.addEventListener('pagehide', stopSound);
