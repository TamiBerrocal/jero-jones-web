import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/home.css';
import { initNav } from './nav.js';
import { initSignup } from './signup.js';
import { initFanWall } from './fan-wall.js';

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
    if (index === current) return false;
    imgs[current].classList.remove('is-on');
    imgs[index].classList.add('is-on');
    current = index;
    return imgs[index];
  };
}

// Where a sticky stage pins (below the fixed nav), in px from the viewport top.
const stickyTop = (stage) => parseFloat(getComputedStyle(stage).top) || 0;

// Progress (0–1) of a tall section whose sticky stage is pinned while it scrolls past.
function pinProgress(section, stage) {
  const travel = section.offsetHeight - stage.offsetHeight;
  return travel > 0 ? clamp01((stickyTop(stage) - section.getBoundingClientRect().top) / travel) : 0;
}

/* Hero: the first 3000/4500 of the scroll scrubs the frames, the rest reveals the title and sweeps in the bar */
function initHero() {
  const hero = document.querySelector('[data-hero]');
  const stage = hero.querySelector('.hero__stage');
  const show = frameStack(hero.querySelector('[data-frames]'), 'hero', HERO_FRAMES);
  const lines = hero.querySelectorAll('[data-line]');
  const bar = hero.querySelector('[data-bar]');
  const counter = hero.querySelector('[data-counter]');
  const meter = hero.querySelector('[data-meter]');
  const hint = hero.querySelector('[data-hint]');
  const SCRUB = 3000 / 4500;

  hero.classList.remove('is-static');

  return () => {
    const p = pinProgress(hero, stage);
    const frame = Math.round(clamp01(p / SCRUB) * (HERO_FRAMES - 1));
    const t = Math.round(clamp01((p - SCRUB) / (1 - SCRUB)) * 50) / 50;
    show(frame);
    lines[0].classList.toggle('is-on', t >= 0.08);
    lines[1].classList.toggle('is-on', t >= 0.28);
    const sweep = clamp01((t - 0.45) / 0.5);
    bar.classList.toggle('is-on', sweep > 0);
    bar.style.setProperty('--bar', 0.2 + 0.8 * sweep);
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
  const hint = tour.querySelector('[data-tour-hint]');
  const board = tour.querySelector('[data-flaps]');

  // The board rolls through the five cities and lands on "TOUR 2026".
  // Distances in the canvas's own units: 300 to reveal the first city, then 600 per item.
  const SEQ = ' ABCDEFGHIJKLMNÑOÓPQRSTUVWXYZ0123456789';
  const SLOTS = 9;
  const pad = (x) => (x + ' '.repeat(SLOTS)).slice(0, SLOTS);
  const ITEMS = ['CABA', 'LA PLATA', 'ROSARIO', 'CÓRDOBA', 'QUILMES', 'TOUR 2026'].map(pad);
  const LAST = ITEMS.length - 1;
  const BLANK = pad('');
  const INTRO = 300;
  const SEGMENT = 600;
  const RUN = SEGMENT * ITEMS.length;
  const TOTAL = INTRO + RUN;

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

  // Once the board lands on "TOUR 2026" it stays there. As soon as the user scrolls up, or the section has
  // scrolled out above the viewport, the tall section collapses to the height of its stage, so scrolling
  // back up passes it like any other block instead of sitting on a pinned, frozen stage. The scroll position
  // is compensated so nothing on screen jumps. Everything re-arms when the section is fully below the
  // viewport again (the user went back up to the hero).
  let done = false;
  let collapsed = false;
  let lastY = window.scrollY;
  let direction = 1;

  const setCollapsed = (on) => {
    const before = stage.getBoundingClientRect().top;
    collapsed = on;
    tour.classList.toggle('is-collapsed', on);
    if (on) window.scrollBy(0, stage.getBoundingClientRect().top - before);
    lastY = window.scrollY;
  };

  const render = () => {
    const rect = tour.getBoundingClientRect();
    if (rect.top >= window.innerHeight) {
      done = false;
      if (collapsed) setCollapsed(false);
    }
    if (done && !collapsed && (direction < 0 || rect.bottom <= 0)) setCollapsed(true);
    const { scale } = units();
    const top = tour.getBoundingClientRect().top - stickyTop(stage);
    const ty = done ? TOTAL : Math.max(0, Math.round((-top * scale) / 6) * 6);

    show(Math.round(clamp01((ty - INTRO) / RUN) * (TOUR_FRAMES - 1)));

    let from = BLANK;
    let to = BLANK;
    let u = 0;
    if (ty < INTRO) {
      to = ITEMS[0];
      u = ty / INTRO;
    } else {
      const sp = clamp01((ty - INTRO) / RUN) * ITEMS.length;
      const i = Math.min(LAST, Math.floor(sp));
      const fr = sp - i;
      from = ITEMS[i];
      to = ITEMS[i];
      if (i < LAST && fr > 0.5) {
        to = ITEMS[i + 1];
        u = (fr - 0.5) / 0.5;
      }
      if (i === LAST) done = true;
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

    hint.style.opacity = ty < 60 ? 1 : 0;
  };

  // When scrolling down stops halfway between two items, glide to the next one. Never snap while scrolling
  // up or once the board is frozen, so it doesn't fight the user.
  let idle;
  const snap = () => {
    const { travel, scale } = units();
    if (!scale || done || direction < 0) return;
    const top = tour.getBoundingClientRect().top + window.scrollY - stickyTop(stage);
    const cy = (window.scrollY - top) * scale;
    let target = null;
    if (cy >= 0 && cy < INTRO) target = INTRO;
    else if (cy >= INTRO && cy < TOTAL) {
      const sp = (cy - INTRO) / SEGMENT;
      const i = Math.min(LAST, Math.floor(sp));
      if (i < LAST && sp - i > 0.5) target = INTRO + (i + 1) * SEGMENT;
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
initFanWall();

initNav();
