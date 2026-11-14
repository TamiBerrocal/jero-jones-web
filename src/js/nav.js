// Compact menu: the bar must never wrap to a second row. Whenever logo + links + CTA don't fit on one
// row, the page links collapse behind a toggle and open as a full-screen overlay. Without JS the
// links simply wrap under the logo.

// True when the expanded layout would wrap: the links or the CTA drop below the logo's row.
function wouldWrap(nav, logo, menu, cta) {
  nav.classList.remove('is-compact');
  const row = logo.getBoundingClientRect();
  const rowMiddle = row.top + row.height / 2;
  return [menu, cta].some((el) => el && el.getBoundingClientRect().top > rowMiddle);
}

export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  // The nav is fixed to the top; publish its real height so sticky stages and anchors sit below it.
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  }).observe(nav);
  const toggle = nav?.querySelector('[data-nav-toggle]');
  const menu = nav?.querySelector('#nav-menu');
  if (!toggle || !menu) return;

  const label = toggle.querySelector('[data-nav-label]');
  const logo = nav.querySelector('.nav__logo');
  const cta = nav.querySelector('.nav__cta');
  nav.classList.add('has-js');
  toggle.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add('is-ready')));

  const setOpen = (open, { focus = true } = {}) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    document.documentElement.classList.toggle('menu-open', open);
    if (open && focus) menu.querySelector('a')?.focus();
    else if (!open && focus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false, { focus: false });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
  // Keep Tab inside the open menu: links, then the toggle that closes it.
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
    const items = [...menu.querySelectorAll('a'), toggle];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Measured synchronously (remove the class, read, re-add), so the expanded layout never paints.
  const updateCompact = () => {
    const compact = wouldWrap(nav, logo, menu, cta);
    nav.classList.toggle('is-compact', compact);
    if (!compact && nav.classList.contains('is-open')) setOpen(false, { focus: false });
  };
  updateCompact();
  window.addEventListener('resize', updateCompact);
  // The condensed and body fonts can change the links' width once they load.
  document.fonts?.ready.then(updateCompact);
}
