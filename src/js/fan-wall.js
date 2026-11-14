import { getFanPieces } from './api.js';

// Every card gets its own tilt and shadow color so the wall reads as pinned by hand.
const TILTS = [-2.5, 1.8, -1.2, 2.6, -2, 1.1, -0.8, 2.2];
const SHADOWS = ['var(--pink)', 'var(--indigo)', 'var(--olive)', 'var(--plum)'];

function renderPiece(piece, index) {
  const item = document.createElement('li');
  item.className = 'fan';
  item.style.setProperty('--tilt', `${TILTS[index % TILTS.length]}deg`);
  item.style.setProperty('--fan-shadow', SHADOWS[index % SHADOWS.length]);

  const figure = document.createElement('figure');
  figure.className = 'fan__card';

  const img = document.createElement('img');
  img.className = 'fan__img';
  img.src = piece.image;
  img.alt = `Tapa diseñada por ${piece.display_name}`;
  img.loading = 'lazy';
  img.decoding = 'async';

  const caption = document.createElement('figcaption');
  caption.className = 'fan__caption';
  const name = document.createElement('span');
  name.className = 'fan__name cond';
  name.textContent = piece.display_name;
  caption.append(name);
  if (piece.comment) {
    const comment = document.createElement('span');
    comment.className = 'fan__comment';
    comment.textContent = piece.comment;
    caption.append(comment);
  }

  figure.append(img, caption);
  item.append(figure);
  return item;
}

export async function initFanWall() {
  const list = document.querySelector('[data-fan-wall]');
  if (!list) return;
  try {
    const pieces = await getFanPieces();
    list.replaceChildren(...pieces.map(renderPiece));
    list.closest('.fans')?.toggleAttribute('data-empty', pieces.length === 0);
  } catch (error) {
    console.error(error);
    list.closest('.fans')?.setAttribute('data-empty', '');
  }
}
