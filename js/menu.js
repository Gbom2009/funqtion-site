/* ---------------------------------------------------------------------------
   menu.js  -  the full-screen numbered menu
   Adapted from TELETECH-EVENTS-DESIGN-REFERENCE.md chapter 32.2.6.

   <dialog> + showModal() gives the focus trap, inertness and Escape-to-close
   for free. Classic script, not the reference's ES module: modules are
   CORS-blocked under file:// and the site must open with a double-click.
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  function initMenu() {
    var trigger = document.querySelector('.fq-menu-trigger');
    var menu = document.querySelector('.fq-menu');
    var closeBtn = document.querySelector('.fq-menu__close');

    if (!trigger || !menu) return;

    // <dialog> is well supported, but if it is not, leave the trigger as a
    // plain link to the home page rather than shipping a dead button.
    if (typeof menu.showModal !== 'function') {
      trigger.hidden = true;
      return;
    }

    var reduced = function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    function open() {
      menu.showModal();
      // showModal() flips the dialog out of display:none. Reading offsetWidth
      // commits that synchronously so the masks have a start value to animate
      // from. A single rAF usually achieves the same thing and does so
      // reliably in testing here, but it is not guaranteed to land after the
      // display change has been committed; this is.
      void menu.offsetWidth;
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
    }

    function close() {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';

      if (reduced()) {
        menu.close();
        return;
      }
      // Wait for the rows to travel back behind their masks. transitionend
      // BUBBLES, so listening on the dialog fired on the FIRST row to finish
      // (250ms) and cut the outbound stagger in half: measured, the dialog
      // closed at 285ms while the last row needs 525ms. Listen on the last
      // thing still moving instead, row 6's index, whose delay is
      // calc(5 * 0.05s + 0.025s) = 275ms plus a 250ms duration.
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        menu.close();
      };
      var last = menu.querySelector('.fq-menu__list li:last-child .fq-menu__index');
      (last || menu).addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 600);
    }

    trigger.addEventListener('click', function () {
      if (menu.open) { close(); } else { open(); }
    });

    if (closeBtn) closeBtn.addEventListener('click', close);

    // Escape. preventDefault stops the dialog closing instantly so the
    // outbound transition can run.
    menu.addEventListener('cancel', function (e) {
      e.preventDefault();
      close();
    });

    // Any link inside the menu closes it. On a static multi-page site the
    // navigation will do that anyway, but this keeps in-page anchors correct.
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) close();
    });

    // Clicking the backdrop closes. The dialog fills the viewport, so this
    // only fires on the element itself, never on its contents.
    menu.addEventListener('mousedown', function (e) {
      if (e.target === menu) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();
