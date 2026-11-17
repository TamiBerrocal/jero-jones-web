// Inlined right after </nav> on every page (see vite.config.js), as a classic script, so it runs before
// first paint. It applies the same fit check nav.js uses: when logo + links + CTA don't fit on one row,
// the bar starts compact, with the hamburger shown. Without this, phones paint the wrapped bar first
// and the whole page jumps up when nav.js collapses it. nav.js then takes over (menu, resize, fonts).
(function () {
  var nav = document.querySelector('.nav');
  var toggle = nav && nav.querySelector('[data-nav-toggle]');
  var menu = nav && nav.querySelector('#nav-menu');
  if (!toggle || !menu) return;
  nav.classList.add('has-js');
  toggle.hidden = false;
  var row = nav.querySelector('.nav__logo').getBoundingClientRect();
  var rowMiddle = row.top + row.height / 2;
  var cta = nav.querySelector('.nav__cta');
  var wraps = [menu, cta].some(function (el) {
    return el && el.getBoundingClientRect().top > rowMiddle;
  });
  nav.classList.toggle('is-compact', wraps);
})();
