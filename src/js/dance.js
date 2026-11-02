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
  tip: document.querySelector('[data-player-tip]'),
  toggle: document.querySelector('[data-player-toggle]'),
  iconPlay: document.querySelector('[data-icon-play]'),
  iconPause: document.querySelector('[data-icon-pause]'),
  prev: document.querySelector('[data-player-prev]'),
  next: document.querySelector('[data-player-next]'),
  elapsed: document.querySelector('[data-player-elapsed]'),
  total: document.querySelector('[data-player-total]'),
  fill: document.querySelector('[data-player-fill]'),
};

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const seconds = (mmss) => {
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};
const clockText = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;

function releaseMarkup(r, ri) {
  const tracks = r.tracks
    .map(
      (t, ti) => `
      <li><button type="button" class="trk" data-rel="${ri}" data-trk="${ti}">
        <span class="trk__n cond">${String(ti + 1).padStart(2, '0')}</span>
        <span class="trk__name">[ ${escape(t.name)} ]</span>
        <span class="trk__dur">${escape(t.duration)}</span>
      </button></li>`,
    )
    .join('');

  return `
  <li class="rel" data-release="${r.id}">
    <div class="rec" style="--label: ${r.label}">
      <div class="rec__disc" aria-hidden="true"></div>
      <div class="rec__card">
        <div class="rec__face" style="background: ${r.bg}"><img src="${r.img}" alt="Tapa de ${escape(r.title)}" loading="lazy"></div>
        <div class="rec__face rec__back" style="background: ${r.backBg}; color: ${r.backInk}">
          <p class="rec__meta">${escape(r.kind)} · ${r.year}</p>
          <p class="rec__back-title cond">${escape(r.title)}</p>
          <ol class="tracks">${tracks}</ol>
        </div>
      </div>
    </div>
    <div class="rel__foot">
      <div>
        <h2 class="rel__title cond">${escape(r.title)}</h2>
        <p class="rel__meta">${escape(r.kind)} · ${r.year}</p>
      </div>
      <button type="button" class="brk" data-toggle="${r.id}" aria-pressed="false">Ver temas</button>
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
  if (state.rel === null) return play(0, 0);
  if (!current().playable) return;
  if (state.playing) pause();
  else play(state.rel, state.trk, state.t);
});
ui.prev.addEventListener('click', () => go(-1));
ui.next.addEventListener('click', () => go(1));

const current = () => releases[state.rel].tracks[state.trk];

// Selecting a track without a preview still shows it in the player, just not playing.
function play(ri, ti, from = 0) {
  const playable = releases[ri].tracks[ti].playable;
  Object.assign(state, { rel: ri, trk: ti, playing: playable, t: from });
  stopSound();
  clearInterval(clock);
  if (playable) {
    playSound(releases[ri], ti);
    clock = setInterval(() => {
      state.t += 1;
      if (state.t >= PREVIEW_SECONDS) go(1);
      else renderProgress();
    }, 1000);
  }
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
  const total = seconds(current().duration);
  ui.elapsed.textContent = clockText(state.t);
  ui.fill.style.width = `${Math.min(100, (state.t / total) * 100)}%`;
}

function renderPlayer() {
  const r = releases[state.rel];
  const track = current();
  ui.track.textContent = track.name;
  ui.release.textContent = `${r.title} · ${r.year}`;
  ui.thumb.style.background = r.bg;
  ui.thumb.innerHTML = `<img src="${r.img}" alt="">`;
  ui.eq.hidden = !state.playing;
  ui.iconPlay.toggleAttribute('hidden', state.playing);
  ui.iconPause.toggleAttribute('hidden', !state.playing);
  ui.total.textContent = track.duration;

  const available = track.playable;
  ui.toggle.setAttribute('aria-disabled', String(!available));
  ui.toggle.setAttribute(
    'aria-label',
    state.playing ? 'Pausar' : available ? 'Reproducir' : 'Reproducir: no disponible en este momento',
  );
  ui.tip.dataset.tip = available ? '' : 'No disponible en este momento';

  grid.querySelectorAll('.trk').forEach((button) => {
    const rel = releases[button.dataset.rel];
    const ti = Number(button.dataset.trk);
    const on = Number(button.dataset.rel) === state.rel && ti === state.trk;
    button.classList.toggle('is-on', on);
    const prefix = on && state.playing ? 'Sonando' : rel.tracks[ti].playable ? 'Reproducir' : 'Ver';
    button.setAttribute('aria-label', `${prefix}: tema ${ti + 1} de ${rel.title}`);
  });
  renderProgress();
}

window.addEventListener('pagehide', stopSound);
