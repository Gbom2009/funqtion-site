/* ---------------------------------------------------------------------------
   boot.js  -  the CRT power-on, home page only

   A tube coming to life in hardware order: heater warming (dark), the beam
   striking undeflected (a point), horizontal deflection stretching it to a
   hairline, vertical deflection opening the raster, then overshoot and
   settle. Replaces chapter 10.8.1's dither, which the reference itself calls
   "a CRT settling" -- a later moment than a CRT starting. Dither is in git
   history. Scanlines reuse #grained's 5px pitch (reference 11.1.3).

   Rules this obeys (revise brief section 1):
     - never fakes a delay: the overlay is ADDED over rendered content, so
       with JS off or broken there is simply no overlay
     - plays on arrival including a refresh, quiet during internal navigation
     - skippable by any key, pointer, wheel or touch
     - absent entirely under prefers-reduced-motion, not shortened
     - under 900ms; nothing loops, every animation runs one iteration
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  /* The sequence, in ms from the moment the overlay is inserted. Kept in one
     place so the shape of the thing is readable without tracing keyframes. */
  var T = {
    heater:   60,   // dark, before the beam strikes
    strike:  190,   // point stretching into the hairline
    readout: 120,   // the self-test mark, over the still-dark screen
    open:    230,   // raster opening: the shutters retracting, with overshoot
    roll1:   400,   // first vertical-blanking bar rolling down
    roll2:   600,   // second, fainter and quicker, as the picture locks
    settle:  780,   // everything faded
    end:     860    // overlay removed. Still inside the 900ms rule.
  };

  function run() {
    // Reduced motion: no overlay at all. Not a shortened version.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Forced colours: no overlay either, and this one was found by looking
    // rather than by reasoning. Under forced-colors the shutters are repainted
    // in the user's Canvas colour, which on the default Windows high-contrast
    // themes is white -- the same white the page itself becomes. The result is
    // not a CRT: it is the top and bottom of the page silently missing for
    // half a second, with a beam and scanlines that have been forced to
    // invisible. Someone who has asked the OS to strip decoration down to
    // legible colour is not the audience for a power-on sequence.
    if (window.matchMedia('(forced-colors: active)').matches) return;

    // Not while you are browsing the site. The previous version gated this on
    // sessionStorage, which was wrong in practice: sessionStorage lives for
    // the life of the TAB, so once it had played, refreshing the home page
    // never showed it again. Reloading the page and seeing nothing is
    // indistinguishable from it being broken, and that is exactly how it was
    // reported.
    //
    // What the gate was actually for was not replaying the sequence as
    // someone moves around the site. The referrer says that directly: if this
    // load came from one of our own pages, it is internal navigation, so stay
    // out of the way. Typing the address, refreshing, a bookmark, or a link
    // from anywhere else is an arrival, and an arrival is what a power-on is
    // for. Measured: typed URL and F5 both give an empty referrer, clicking
    // Home from over.html and the Back button both give a same-origin one.
    //
    // The referrer alone is not enough, because a refresh keeps whatever
    // referrer the original navigation had: land on Home by clicking it in
    // the nav, then press F5, and the referrer still says over.html, so the
    // boot would stay silent on an explicit refresh. Whether a refresh
    // replays should not depend on how you first got to the page. So ask the
    // Navigation Timing API what kind of navigation this actually is, and let
    // the referrer decide only the ordinary-navigation case.
    try {
      var nav = (performance.getEntriesByType('navigation')[0] || {}).type;
      if (nav === 'back_forward') return;      // returning through history
      if (nav !== 'reload') {                  // a reload is always an arrival
        var from = document.referrer;
        if (from && new URL(from).origin === window.location.origin) return;
      }
    } catch (e) {
      /* no Navigation Timing, or an unparseable referrer: play it */
    }

    var host = document.createElement('div');
    host.className = 'fq-crt';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML =
      '<div class="fq-crt__shutter" data-h="t"></div>' +
      '<div class="fq-crt__shutter" data-h="b"></div>' +
      '<div class="fq-crt__bloom"></div>' +
      '<div class="fq-crt__beam"></div>' +
      '<span class="fq-crt__ref">FQ-01</span>' +
      '<div class="fq-crt__roll" data-r="1"></div>' +
      '<div class="fq-crt__roll" data-r="2"></div>' +
      '<div class="fq-crt__scan"></div>';
    document.body.appendChild(host);

    var beam = host.querySelector('.fq-crt__beam');
    var ref = host.querySelector('.fq-crt__ref');
    var rolls = host.querySelectorAll('.fq-crt__roll');
    var bloom = host.querySelector('.fq-crt__bloom');
    var scan = host.querySelector('.fq-crt__scan');
    var shutters = host.querySelectorAll('.fq-crt__shutter');

    var anims = [];
    function play(el, frames, opts) {
      // element.animate() rather than CSS: the sequence is five overlapping
      // phases with different delays, and holding that in one place in JS is
      // honest about the ordering in a way five CSS classes would not be.
      var a = el.animate(frames, opts);
      anims.push(a);
      return a;
    }

    // 2 + 3. The point, then the hairline. scaleX from a hair to full width;
    // the Y scale stays at 1 because the line is already only 2px tall.
    play(beam, [
      { transform: 'translateY(-50%) scaleX(0.004)', opacity: 0, offset: 0 },
      { transform: 'translateY(-50%) scaleX(0.004)', opacity: 1, offset: 0.13,
        easing: 'cubic-bezier(0.14, 0.86, 0.37, 0.96)' },
      { transform: 'translateY(-50%) scaleX(1)', opacity: 1, offset: 0.62 },
      { transform: 'translateY(-50%) scaleX(1)', opacity: 0, offset: 1 }
    ], { duration: T.settle - T.heater, delay: T.heater, fill: 'both' });

    // 4. Vertical deflection. Each shutter collapses towards its own edge, so
    // the raster opens outwards from the centre line the beam just drew.
    for (var i = 0; i < shutters.length; i++) {
      // Overshoot, not a clean stop: the raster opens past its resting size
      // and settles back, the way deflection does when it first locks.
      play(shutters[i], [
        { transform: 'scaleY(1)', offset: 0,
          easing: 'cubic-bezier(0.14, 0.86, 0.37, 0.96)' },
        { transform: 'scaleY(0)', offset: 0.68 },
        { transform: 'scaleY(0.055)', offset: 0.84, easing: 'ease-in-out' },
        { transform: 'scaleY(0)', offset: 1 }
      ], { duration: 240, delay: T.open, fill: 'forwards' });
    }

    // 5. Phosphor overshoot: bright as the beam strikes, gone by the settle.
    play(bloom, [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.22 },
      { opacity: 0, offset: 1 }
    ], { duration: T.settle - T.heater, delay: T.heater, fill: 'backwards' });

    // The raster itself, fading as the tube stabilises.
    play(scan, [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.4 },
      { opacity: 0, offset: 1 }
    ], { duration: T.settle - T.strike, delay: T.strike, fill: 'backwards' });

    // The self-test mark, over the screen while it is still dark. FQ-01 is
    // the part number the top bar already carries, so this invents no copy.
    play(ref, [
      { opacity: 0, offset: 0 },
      { opacity: 0.85, offset: 0.17 },
      { opacity: 0.85, offset: 0.78 },
      { opacity: 0, offset: 1 }
    ], { duration: 350, delay: T.readout, fill: 'both' });

    // Vertical hold. Two blanking bars roll down as the picture locks, the
    // second fainter and quicker. This is the eccentric part: nothing else
    // reads as an old display quite as immediately as a frame that will not
    // sit still. Each traverse is a single 220ms/180ms movement, not a loop,
    // and the whole thing is gone before the overlay is.
    // 714% is the full traverse: see the note on .fq-crt__roll in the CSS.
    play(rolls[0], [
      { transform: 'translateY(-100%)' },
      { transform: 'translateY(714%)' }
    ], { duration: 260, delay: T.roll1, fill: 'both', easing: 'cubic-bezier(.4,0,.5,1)' });
    play(rolls[1], [
      { transform: 'translateY(-100%)', opacity: 0.55 },
      { transform: 'translateY(714%)', opacity: 0.18 }
    ], { duration: 200, delay: T.roll2, fill: 'both', easing: 'cubic-bezier(.35,0,.4,1)' });

    var finished = false;
    var timer = 0;

    function teardown() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      for (var j = 0; j < anims.length; j++) { anims[j].cancel(); }
      window.removeEventListener('keydown', teardown, true);
      window.removeEventListener('pointerdown', teardown, true);
      window.removeEventListener('wheel', teardown, true);
      window.removeEventListener('touchstart', teardown, true);
      host.remove();
    }

    window.addEventListener('keydown', teardown, true);
    window.addEventListener('pointerdown', teardown, true);
    window.addEventListener('wheel', teardown, true, { passive: true });
    window.addEventListener('touchstart', teardown, true, { passive: true });

    timer = window.setTimeout(teardown, T.end);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
