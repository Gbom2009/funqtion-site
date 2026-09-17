/* ---------------------------------------------------------------------------
   menu.js  -  the full-screen numbered menu
   Adapted from TELETECH-EVENTS-DESIGN-REFERENCE.md chapter 32.2.6.

   <dialog> + showModal() is the whole reason to use a dialog here: the browser
   gives us the focus trap, inertness of the page behind, and Escape-to-close
   for free. The reference's version is an ES module; this is a classic script
   because module scripts are blocked by CORS under file://, and the brief
   requires the site to open with a double-click.
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
      // Force a frame so the mask transition has a start value to animate from.
      requestAnimationFrame(function () {
        menu.classList.add('is-open');
      });
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
      // Wait for the rows to travel back behind their masks before removing
      // the dialog, but never leave it hanging if no transition fires.
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        menu.close();
      };
      menu.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 400);
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
