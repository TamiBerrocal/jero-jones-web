import { getFanPieces } from './api.js';
import { seededRandom } from './random.js';

// Packed collage: the stage keeps a fixed height and every piece shrinks as more arrive, down to
// MIN_SIZE. Pieces are bigger than their cell (OVERLAP) so they pile up like a hand-made collage.
// Once they're all at MIN_SIZE, the stage grows taller instead of shrinking them further.
const MIN_SIZE = 20;
const MAX_SIZE = 260;
const OVERLAP = 1.45;
const MAX_TILT = 7;
// On hover/focus a piece grows to at least this size, so the smallest ones can still be seen.
const HOVER_MIN_SIZE = 96;
const SHADOWS = ['var(--pink)', 'var(--indigo)', 'var(--olive)', 'var(--plum)'];

function shuffle(list, random) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Splits the stage into a grid that matches its aspect ratio; each piece takes one cell.
function computeGrid(count, width, baseHeight) {
  const cols = Math.max(1, Math.round(Math.sqrt((count * width) / baseHeight)));
  const rows = Math.ceil(count / cols);
  const cellW = width / cols;
  const cellH = baseHeight / rows;
  const size = Math.min(cellW, cellH) * OVERLAP;
  if (size >= MIN_SIZE) {
    return { cols, rows, cellW, cellH, height: baseHeight, size: Math.min(size, MAX_SIZE, width * 0.9, baseHeight * 0.9) };
  }
  // Floor reached: keep pieces at MIN_SIZE and let the stage grow to fit them.
  const cell = MIN_SIZE / OVERLAP;
  const fitCols = Math.max(1, Math.floor(width / cell));
  const fitRows = Math.ceil(count / fitCols);
  return { cols: fitCols, rows: fitRows, cellW: width / fitCols, cellH: cell, height: Math.max(baseHeight, fitRows * cell), size: MIN_SIZE };
}

function createPiece(piece, index) {
  const item = document.createElement('li');
  item.className = 'fan';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fan__btn';
  button.setAttribute('aria-describedby', 'fan-tip');
  button.style.setProperty('--fan-shadow', SHADOWS[index % SHADOWS.length]);
  button.dataset.index = String(index);

  const img = document.createElement('img');
  img.className = 'fan__img';
  img.src = piece.image;
  img.alt = `Tapa de ${piece.display_name}`;
  img.loading = 'lazy';
  img.decoding = 'async';

  button.append(img);
  item.append(button);
  return item;
}

export async function initFanWall() {
  const section = document.querySelector('.fans');
  const stage = section?.querySelector('[data-fan-stage]');
  const list = stage?.querySelector('[data-fan-wall]');
  const tip = stage?.querySelector('[data-fan-tip]');
  if (!list || !tip) return;
  const tipName = tip.querySelector('[data-fan-tip-name]');
  const tipComment = tip.querySelector('[data-fan-tip-comment]');

  let pieces = [];
  try {
    pieces = await getFanPieces();
  } catch (error) {
    console.error(error);
  }
  section.toggleAttribute('data-empty', pieces.length === 0);
  if (pieces.length === 0) return;

  const items = pieces.map(createPiece);
  list.replaceChildren(...items);
  const random = seededRandom(pieces.map((piece) => piece.id).join('|'));
  // Per-piece jitter, tilt and stacking order, fixed for the page's lifetime.
  const jitter = pieces.map(() => ({ x: random() - 0.5, y: random() - 0.5, tilt: (random() * 2 - 1) * MAX_TILT, z: random() }));
  let lastWidth = 0;
  let active = null;

  function hideTip() {
    active?.classList.remove('is-active');
    active = null;
    tip.hidden = true;
  }

  function showTip(button) {
    const piece = pieces[Number(button.dataset.index)];
    active?.classList.remove('is-active');
    active = button;
    button.classList.add('is-active');
    tipName.textContent = piece.display_name;
    tipComment.textContent = piece.comment ?? '';
    tipComment.hidden = !piece.comment;
    tip.hidden = false;

    // Under the piece, or above it when the piece sits in the lower half; always inside the stage.
    const stageBox = stage.getBoundingClientRect();
    const box = button.getBoundingClientRect();
    const gap = 12;
    const centerX = box.left + box.width / 2 - stageBox.left;
    const left = Math.min(Math.max(centerX - tip.offsetWidth / 2, 0), stageBox.width - tip.offsetWidth);
    const below = box.bottom - stageBox.top + gap;
    const above = box.top - stageBox.top - tip.offsetHeight - gap;
    const inLowerHalf = box.top + box.height / 2 - stageBox.top > stageBox.height / 2;
    tip.style.left = `${left}px`;
    tip.style.top = `${inLowerHalf && above >= 0 ? above : below}px`;
  }

  function layout() {
    const width = stage.clientWidth;
    if (!width || width === lastWidth) return;
    lastWidth = width;
    const baseHeight = parseFloat(getComputedStyle(stage).minHeight) || 520;
    const grid = computeGrid(pieces.length, width, baseHeight);
    const cells = shuffle([...Array(grid.cols * grid.rows).keys()], seededRandom(`${grid.cols}x${grid.rows}`));
    const half = grid.size / 2;

    stage.style.height = `${grid.height}px`;
    list.style.setProperty('--fan-size', `${grid.size}px`);
    list.style.setProperty('--fan-hover-scale', String(Math.max(1.08, HOVER_MIN_SIZE / grid.size)));
    list.style.setProperty('--fan-border', grid.size < 48 ? '1px' : '2px');
    list.style.setProperty('--fan-offset', `${Math.max(2, Math.round(grid.size * 0.035))}px`);

    items.forEach((item, i) => {
      const cell = cells[i];
      const x = ((cell % grid.cols) + 0.5 + jitter[i].x * 0.6) * grid.cellW;
      const y = (Math.floor(cell / grid.cols) + 0.5 + jitter[i].y * 0.6) * grid.cellH;
      const button = item.firstChild;
      button.style.left = `${Math.min(Math.max(x, half), width - half)}px`;
      button.style.top = `${Math.min(Math.max(y, half), grid.height - half)}px`;
      button.style.setProperty('--fan-tilt', `${jitter[i].tilt.toFixed(1)}deg`);
      button.style.zIndex = String(Math.floor(jitter[i].z * pieces.length) + 1);
    });
    hideTip();
  }

  list.addEventListener('pointerover', (event) => {
    const button = event.target.closest('.fan__btn');
    if (button && event.pointerType === 'mouse') showTip(button);
  });
  list.addEventListener('pointerout', (event) => {
    if (event.pointerType === 'mouse' && !event.relatedTarget?.closest?.('.fan__btn')) hideTip();
  });
  // Keyboard and touch: focus or tap shows the same tooltip.
  list.addEventListener('focusin', (event) => {
    const button = event.target.closest('.fan__btn');
    if (button) showTip(button);
  });
  list.addEventListener('focusout', (event) => {
    if (!list.contains(event.relatedTarget)) hideTip();
  });
  list.addEventListener('click', (event) => {
    const button = event.target.closest('.fan__btn');
    if (button && button !== active) showTip(button);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideTip();
  });

  new ResizeObserver(layout).observe(stage);
  layout();
}
