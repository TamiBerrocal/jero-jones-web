import { PageFlip } from 'page-flip';
import { ALBUM_PHOTOS } from './album-photos.js';
import { seededRandom } from './random.js';

// "Cerrando el circuito" as a photo book (senoidal.html): a hard cover, inner pages laid out like a
// photo album, and a hard back cover. page-flip (StPageFlip) curls the pages:
// drag a corner, click a page edge, or use the buttons and the ←/→ keys. One page in portrait, spreads
// in landscape.

// Each inner page is one layout; `count` is how many photos it takes. The sequence adds up to 20.
const LAYOUTS = {
  hero: 1, // one photo, nearly full bleed, caption sticker
  pair: 2, // two photos, stacked and offset
  polaroid: 1, // a tilted print with a white border and tape
  grid4: 4, // contact-sheet grid
  scatter: 3, // overlapping and tilted, like the collage on the Home
  duo: 1, // duotone print in the site's pink and night
  trio: 3, // one big and two small
  strip: 3, // vertical film strip
};
const SEQUENCE = ['hero', 'pair', 'polaroid', 'grid4', 'scatter', 'duo', 'trio', 'strip', 'polaroid', 'hero'];
const MAX_TILT = { scatter: 9, polaroid: 5, pair: 3, trio: 2.5, hero: 1.2, duo: 3, grid4: 1.5, strip: 0 };

// Fills pages in SEQUENCE order; when a layout needs more photos than are left, the next one that fits
// takes its place, so any number of photos ends on a full page.
function paginate(photos) {
  const pages = [];
  let next = 0;
  let step = 0;
  while (next < photos.length) {
    const left = photos.length - next;
    const order = [...SEQUENCE.slice(step % SEQUENCE.length), ...SEQUENCE.slice(0, step % SEQUENCE.length)];
    const layout = order.find((name) => LAYOUTS[name] <= left) ?? 'hero';
    pages.push({ layout, photos: photos.slice(next, next + LAYOUTS[layout]) });
    next += LAYOUTS[layout];
    step++;
  }
  return pages;
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

// Tape is torn by hand, so both short ends get an irregular zigzag; the long edges stay straight.
function tornEnds(random) {
  const steps = 9;
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const y = ((i / steps) * 100).toFixed(1);
    left.push(`${(random() * 3.5).toFixed(1)}% ${y}%`);
    right.unshift(`${(100 - random() * 3.5).toFixed(1)}% ${y}%`);
  }
  return `polygon(${[...left, ...right].join(', ')})`;
}

function createPhoto(photo, layout, index, random) {
  const figure = el('figure', `album__photo album__photo--${index + 1}`);
  const tilt = (random() * 2 - 1) * MAX_TILT[layout];
  figure.style.setProperty('--tilt', `${tilt.toFixed(1)}deg`);

  const frame = el('div', layout === 'duo' ? 'album__frame duo' : 'album__frame');
  const img = el('img', '', { src: photo.src, alt: photo.alt, loading: 'lazy', decoding: 'async', draggable: 'false' });
  frame.append(img);
  if (layout === 'duo') frame.append(el('span', 'shade', { 'aria-hidden': 'true' }));
  figure.append(frame);

  // Tape on the prints that would be stuck down by hand.
  if (layout === 'polaroid' || layout === 'scatter' || (layout === 'pair' && index === 0)) {
    const tape = el('span', 'album__tape', { 'aria-hidden': 'true' });
    tape.style.setProperty('--tape-tilt', `${((random() * 2 - 1) * 12).toFixed(1)}deg`);
    tape.style.setProperty('--tape-width', `${Math.round(32 + random() * 14)}%`);
    tape.style.clipPath = tornEnds(random);
    figure.append(tape);
  }
  if (photo.caption && layout !== 'grid4' && layout !== 'strip') {
    const caption = el('figcaption', 'album__caption cond');
    caption.textContent = photo.caption;
    figure.append(caption);
  }
  return figure;
}

// The cover sits alone, so odd pages open on the left of each spread and even pages on the right.
function createInnerPage(page, number, random) {
  const node = el('div', `album__page album__page--${page.layout}`, { 'data-density': 'soft' });
  node.classList.add(number % 2 ? 'is-left' : 'is-right');
  const sheet = el('div', 'album__sheet');
  page.photos.forEach((photo, i) => sheet.append(createPhoto(photo, page.layout, i, random)));
  const folio = el('span', 'album__folio cond', { 'aria-hidden': 'true' });
  folio.textContent = String(number);
  node.append(sheet, folio);
  return node;
}

function createBlankPage(number) {
  const node = el('div', 'album__page album__page--blank', { 'data-density': 'soft' });
  node.classList.add(number % 2 ? 'is-left' : 'is-right');
  const note = el('p', 'album__blank-note cond');
  note.textContent = 'Esta página es para la próxima';
  node.append(note);
  return node;
}

function createCover() {
  const node = el('div', 'album__page album__cover', { 'data-density': 'hard' });
  // The winning fan photo is printed full-bleed near the bottom; a black band below it carries the logo.
  node.innerHTML = `
    <div class="album__cover-photo">
      <img src="${import.meta.env.BASE_URL}assets/album/cover.jpg" alt="La foto ganadora: Jero Jones canta al micrófono, con anteojos de sol y remera a rayas" width="1274" height="849">
    </div>
    <span class="album__cover-band" aria-hidden="true"><span class="album__cover-logo"></span></span>
    <div class="album__cover-inner">
      <p class="album__cover-title cond"><span class="tear"><span class="tear-top fit-cap">Senoidal</span><span class="tear-bot fit-cap" aria-hidden="true">Senoidal</span></span><span class="album__cover-block block">por ustedes</span></p>
    </div>`;
  return node;
}

function createBackCover() {
  const node = el('div', 'album__page album__back', { 'data-density': 'hard' });
  node.innerHTML = `
    <div class="album__back-inner">
      <p class="album__back-title cond">Esto recién empieza</p>
    </div>`;
  return node;
}

export function initAlbum() {
  const root = document.querySelector('[data-album]');
  const book = root?.querySelector('[data-album-book]');
  if (!book) return;
  const prev = root.querySelector('[data-album-prev]');
  const next = root.querySelector('[data-album-next]');
  const count = root.querySelector('[data-album-count]');

  const random = seededRandom(ALBUM_PHOTOS.map((photo) => photo.src).join('|'));
  const inner = paginate(ALBUM_PHOTOS).map((page, i) => createInnerPage(page, i + 1, random));
  // With a cover and a back cover, the inner pages must pair up into spreads.
  if (inner.length % 2) inner.push(createBlankPage(inner.length + 1));
  inner[0].classList.add('is-first');
  inner.at(-1).classList.add('is-last');
  const pages = [createCover(), ...inner, createBackCover()];
  book.replaceChildren(...pages);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flip = new PageFlip(book, {
    width: 460,
    height: 600,
    size: 'stretch',
    minWidth: 260,
    maxWidth: 620,
    minHeight: 340,
    maxHeight: 760,
    showCover: true,
    usePortrait: true,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.45,
    flippingTime: reducedMotion ? 250 : 900,
    // Peeling a corner on hover draws page-flip's hard-page shadows as a dark frame on the covers.
    showPageCorners: false,
  });
  flip.loadFromHTML(pages);

  const total = pages.length;
  const innerCount = inner.length;
  function updateControls() {
    const index = flip.getCurrentPageIndex();
    const landscape = flip.getOrientation() === 'landscape';
    prev.disabled = index === 0;
    next.disabled = index >= total - 1;
    if (index === 0) count.textContent = 'Tapa';
    else if (index === total - 1) count.textContent = 'Contratapa';
    else if (landscape) count.textContent = `${index}–${Math.min(index + 1, innerCount)} de ${innerCount}`;
    else count.textContent = `${index} de ${innerCount}`;
  }
  // Pages page-flip keeps hidden never trigger lazy loading, so the photos of the next spreads are
  // requested ahead of time: once the album gets close, and again after every turn.
  function warm(index) {
    pages.slice(index, index + 6).forEach((page) => page.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
    }));
  }
  const nearObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    warm(flip.getCurrentPageIndex());
    nearObserver.disconnect();
  }, { rootMargin: '100% 0px' });
  nearObserver.observe(root);
  flip.on('flip', ({ data }) => warm(data));
  flip.on('flip', updateControls);
  flip.on('changeOrientation', updateControls);
  updateControls();


  // The covers are boards a little bigger than the pages: inner pages leave a 2px transparent margin (top,
  // bottom, outer edge; see album.css) and the boards sit still underneath, inside page-flip's own block, so
  // they never move or resize. A turning page has no rim of its own; its margin just shows what's below.
  // Pages 1 and 10 are glued to the covers, so their margin is the board itself and turns with the cover.
  // Each board only shows where a cover lies open under the pages, and hides while its cover is turning
  // (page-flip gives a turning hard page a rotateY transform), always while an opaque page covers it.
  const block = book.querySelector('.stf__block');
  const frontBoard = el('div', 'album__board album__board--front', { 'aria-hidden': 'true' });
  const backBoard = el('div', 'album__board album__board--back', { 'aria-hidden': 'true' });
  block.prepend(frontBoard, backBoard);
  const turning = (page) => page.style.display !== 'none' && page.style.transform.includes('rotateY');

  let shift = 0;
  function placeBoards() {
    const index = flip.getCurrentPageIndex();
    const portrait = flip.getOrientation() === 'portrait';
    const frontTurning = turning(pages[0]);
    const backTurning = turning(pages[total - 1]);
    let showFront = index >= 1 && !frontTurning;
    let showBack = index <= total - 2 && !backTurning;
    if (portrait) {
      // One page at a time: the board is the one under that page's side of the spread.
      const leftPage = pages[index]?.classList.contains('is-left');
      showFront = showFront && leftPage;
      showBack = showBack && !leftPage;
    }
    book.classList.toggle('is-portrait', portrait);

    // A closed book sits centred: the cover lies on one half of page-flip's spread, so shift the book by a
    // quarter of its width toward the middle. A turning cover slides it to where it will land (open = no
    // shift), over the same time the flip takes; settling back to 'read' always corrects it.
    if (portrait) shift = 0;
    else if (flip.getState() === 'read') shift = index === 0 ? -25 : index === total - 1 ? 25 : 0;
    else if (frontTurning) shift = index === 0 ? 0 : -25;
    else if (backTurning) shift = index === total - 1 ? 0 : 25;
    book.style.setProperty('--shift', `${shift}%`);
    frontBoard.classList.toggle('is-visible', showFront);
    backBoard.classList.toggle('is-visible', showBack);
  }

  // While a page moves, check every frame (a cover can be lifted halfway and dropped back).
  let following = false;
  function follow() {
    placeBoards();
    if (flip.getState() !== 'read') requestAnimationFrame(follow);
    else following = false;
  }
  flip.on('changeState', () => {
    if (!following) {
      following = true;
      requestAnimationFrame(follow);
    }
  });
  flip.on('flip', placeBoards);
  flip.on('changeOrientation', placeBoards);
  placeBoards();
  // Only animate the shift from here on, so the closed book starts out centred instead of sliding in.
  requestAnimationFrame(() => book.classList.add('is-ready'));

  prev.addEventListener('click', () => flip.flipPrev());
  next.addEventListener('click', () => flip.flipNext());

  // ←/→ turn pages while the album is on screen; they don't scroll the page, so nothing is lost.
  let visible = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { threshold: 0.4 }).observe(root);
  document.addEventListener('keydown', (event) => {
    if (!visible || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowRight') flip.flipNext();
    else if (event.key === 'ArrowLeft') flip.flipPrev();
  });
}
