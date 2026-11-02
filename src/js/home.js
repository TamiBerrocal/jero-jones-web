import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/home.css';
import { initSignup } from './signup.js';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const HERO_FRAMES = 51;
const TOUR_FRAMES = 61;

// Builds the frame stack for a sequence. The first frame is already in the markup; the rest load in
// order once the page has finished loading, so the first paint isn't competing with 100+ images.
function frameStack(container, folder, count) {
  const imgs = [container.querySelector('img')];
  for (let i = 2; i <= count; i++) {
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.dataset.src = asset(`${folder}/${String(i).padStart(2, '0')}.webp`);
    container.append(img);
    imgs.push(img);
  }
  const load = () => imgs.forEach((img) => img.dataset.src && (img.src = img.dataset.src));
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });

  let current = 0;
  imgs[0].classList.add('is-on');
  return (index) => {
    if (index === current) return;
    imgs[current].classList.remove('is-on');
    imgs[index].classList.add('is-on');
    current = index;
  };
}

// Progress (0–1) of a tall section whose sticky stage is pinned while it scrolls past.
function pinProgress(section, stage) {
  const travel = section.offsetHeight - stage.offsetHeight;
  return travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) : 0;
}

/* Hero: the first 3000/3900 of the scroll scrubs the frames, the rest reveals the title line by line */
function initHero() {
  const hero = document.querySelector('[data-hero]');
  const stage = hero.querySelector('.hero__stage');
  const show = frameStack(hero.querySelector('[data-frames]'), 'hero', HERO_FRAMES);
  const lines = hero.querySelectorAll('[data-line]');
  const counter = hero.querySelector('[data-counter]');
  const meter = hero.querySelector('[data-meter]');
  const hint = hero.querySelector('[data-hint]');
  const SCRUB = 3000 / 3900;
  const OFFSETS = [0, 18, 12, 6];
  const stageOf = (t, a, b, c) => (t >= c ? 3 : t >= b ? 2 : t >= a ? 1 : 0);

  hero.classList.remove('is-static');

  return () => {
    const p = pinProgress(hero, stage);
    const frame = Math.round(clamp01(p / SCRUB) * (HERO_FRAMES - 1));
    const t = Math.round(clamp01((p - SCRUB) / (1 - SCRUB)) * 50) / 50;
    show(frame);
    [stageOf(t, 0.1, 0.26, 0.42), stageOf(t, 0.42, 0.58, 0.74)].forEach((s, i) => {
      lines[i].classList.toggle('is-on', s > 0);
      lines[i].style.setProperty('--gx', `${OFFSETS[s]}px`);
      lines[i].style.setProperty('--gy', `${Math.round(OFFSETS[s] * 0.35)}px`);
    });
    const pct = Math.round(p * 100);
    counter.textContent = `${pct}%`;
    meter.style.width = `${pct}%`;
    hint.style.opacity = frame < 2 ? 1 : 0;
  };
}

/* Tour: split-flap board that rolls through the cities while the frames play, snapping to each city */
function initTour() {
  const tour = document.querySelector('[data-tour]');
  const stage = tour.querySelector('.tour__stage');
  const show = frameStack(tour.querySelector('[data-tour-frames]'), 'tour', TOUR_FRAMES);
  const meter = tour.querySelector('[data-tour-meter]');
  const hint = tour.querySelector('[data-tour-hint]');
  const board = tour.querySelector('[data-flaps]');

  // Distances in the canvas's own units: 300 to reveal the first city, then 3000 for the five cities.
  const INTRO = 300;
  const RUN = 3000;
  const TOTAL = INTRO + RUN;
  const SEGMENT = RUN / 5;
  const SEQ = ' ABCDEFGHIJKLMNÑOÓPQRSTUVWXYZ';
  const SLOTS = 8;
  const pad = (x) => (x + ' '.repeat(SLOTS)).slice(0, SLOTS);
  const CITIES = ['CABA', 'LA PLATA', 'ROSARIO', 'CÓRDOBA', 'QUILMES'].map(pad);
  const BLANK = pad('');

  const cells = Array.from({ length: SLOTS }, () => {
    const cell = document.createElement('div');
    cell.className = 'flap is-blank';
    cell.setAttribute('aria-hidden', 'true');
    cell.append(document.createElement('span'));
    board.append(cell);
    return cell;
  });
  const shown = new Array(SLOTS).fill(null);

  tour.classList.remove('is-static');

  const units = () => {
    const travel = tour.offsetHeight - stage.offsetHeight;
    return { travel, scale: travel > 0 ? TOTAL / travel : 0 };
  };

  const render = () => {
    const { scale } = units();
    const raw = -tour.getBoundingClientRect().top * scale;
    const ty = Math.max(0, Math.round(raw / 6) * 6);

    show(Math.round(clamp01((ty - INTRO) / RUN) * (TOUR_FRAMES - 1)));

    let from = BLANK;
    let to = BLANK;
    let u = 0;
    if (ty < INTRO) {
      to = CITIES[0];
      u = ty / INTRO;
    } else {
      const sp = clamp01((ty - INTRO) / RUN) * 5;
      const i = Math.min(4, Math.floor(sp));
      const fr = sp - i;
      from = CITIES[i];
      to = CITIES[i];
      if (i < 4 && fr > 0.5) {
        to = CITIES[i + 1];
        u = (fr - 0.5) / 0.5;
      }
    }

    cells.forEach((cell, i) => {
      const a = Math.max(0, SEQ.indexOf(from[i]));
      const b = Math.max(0, SEQ.indexOf(to[i]));
      const steps = (b - a + SEQ.length) % SEQ.length;
      const ui = clamp01((u - i * 0.05) / 0.65);
      const ch = SEQ[(a + Math.floor(steps * ui + 1e-6)) % SEQ.length];
      const moving = steps > 0 && ui > 0 && ui < 1;
      cell.classList.toggle('is-blank', ch === ' ' && !moving);
      if (ch !== shown[i]) {
        shown[i] = ch;
        cell.firstChild.textContent = ch === ' ' ? ' ' : ch;
        cell.classList.remove('is-flipping');
        void cell.offsetWidth;
        cell.classList.add('is-flipping');
      }
    });

    meter.style.width = `${Math.round(clamp01(ty / TOTAL) * 100)}%`;
    hint.style.opacity = ty < 60 ? 1 : 0;
  };

  // When scrolling stops halfway between two cities, glide to the next one in the scroll direction.
  let lastY = window.scrollY;
  let direction = 1;
  let idle;
  const snap = () => {
    const { travel, scale } = units();
    if (!scale) return;
    const top = tour.getBoundingClientRect().top + window.scrollY;
    const cy = (window.scrollY - top) * scale;
    let target = null;
    if (cy >= 0 && cy < INTRO) target = direction > 0 ? INTRO : -20;
    else if (cy >= INTRO && cy < TOTAL) {
      const sp = (cy - INTRO) / SEGMENT;
      const i = Math.min(4, Math.floor(sp));
      if (i < 4 && sp - i > 0.5) target = direction > 0 ? INTRO + (i + 1) * SEGMENT : INTRO + (i + 0.5) * SEGMENT - 2;
    }
    if (target === null || Math.abs(target - cy) <= 1) return;
    window.scrollTo({
      top: top + Math.min(travel, target / scale),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;
      clearTimeout(idle);
      idle = setTimeout(snap, 140);
    },
    { passive: true },
  );

  return render;
}

const renders = [initHero(), initTour()];
let queued = false;
const update = () => {
  queued = false;
  renders.forEach((render) => render());
};
const schedule = () => {
  if (!queued) {
    queued = true;
    requestAnimationFrame(update);
  }
};
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
update();

initSignup();
