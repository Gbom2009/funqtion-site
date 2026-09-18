/* ---------------------------------------------------------------------------
   boot.js  -  the CRT power-on, home page only

   A cathode-ray tube coming to life, in the order the hardware does it:

     1. Nothing. The heater is warming; the screen is dark.
     2. The beam strikes with no deflection at all, so it paints a single
        point at the centre of the tube.
     3. Horizontal deflection ramps first, and the point stretches into a
        bright hairline across the middle of the screen.
     4. Vertical deflection follows, and the line opens into a full raster.
        The page is what is behind it.
     5. The phosphor overshoots, then settles. Scanlines fade with it.

   This replaces the 32x32 dither dissolve documented in chapter 10.8.1. The
   reference describes that dissolve as reading like "a CRT settling", which
   is a different moment from a CRT starting: settling is what a tube does
   after the raster is already open. The dither is in git history if it is
   ever wanted back.

   The vocabulary is borrowed from the site's own grain rather than invented:
   the scanline layer uses the same 5px horizontal pitch as #grained
   (reference 11.1.3), so the boot and the permanent texture are the same
   raster at different opacities.

   Rules this obeys (revise brief section 1):
     - never fakes a delay: the overlay is ADDED by JS over already-rendered
       content, so with JS off or broken there is simply no overlay
     - once per session via sessionStorage, not once per navigation
     - skippable by any key, pointer, wheel or touch
     - absent entirely under prefers-reduced-motion, not shortened
     - total runtime under 900ms
     - nothing loops: every animation below runs exactly one iteration, and
       the fastest of them is 210ms
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  var KEY = 'fq-booted';

  /* The sequence, in ms from the moment the overlay is inserted. Kept in one
     place so the shape of the thing is readable without tracing keyframes. */
  var T = {
    heater:  80,    // dark, before the beam strikes
    strike: 210,    // point stretching into the hairline
    open:   300,    // raster opening: the shutters retracting
    settle: 640,    // everything faded
    end:    700     // overlay removed
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

    // Once per session. Six pages must not replay it six times.
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
    } catch (e) {
      return;                    // private mode with storage blocked: skip it
    }

    var host = document.createElement('div');
    host.className = 'fq-crt';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML =
      '<div class="fq-crt__shutter" data-h="t"></div>' +
      '<div class="fq-crt__shutter" data-h="b"></div>' +
      '<div class="fq-crt__bloom"></div>' +
      '<div class="fq-crt__beam"></div>' +
      '<div class="fq-crt__scan"></div>';
    document.body.appendChild(host);

    var beam = host.querySelector('.fq-crt__beam');
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
      play(shutters[i], [
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(0)' }
      ], {
        duration: 300, delay: T.open, fill: 'forwards',
        easing: 'cubic-bezier(0.14, 0.86, 0.37, 0.96)'
      });
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
