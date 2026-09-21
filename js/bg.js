/* ---------------------------------------------------------------------------
   bg.js  -  the idling lattice
   A 32x32 grid left alive at low duty: a few cells per second light to
   between #0a0a0a and #141414 and fade out, positions random. Same grid as
   the boot, so they read as one machine. Chosen over a scanline sweep and a
   VU-style rail, both built and measured -- see REFINEMENT-LOG.md.

     - nothing loops faster than 200ms: cells spawn every 280ms, live
       900-2100ms. Longest single movement is one cell's fade, so WCAG 2.2.2
       owes no pause control. aria-hidden texture carrying no information.
     - fixed host, canvas-painted, so scrolling never repaints it
     - luminance only. No accent anywhere near it.
     - prefers-reduced-motion stops it dead, enforced in JS with a live change
       listener because a stylesheet cannot stop a rAF loop
     - pauses when the tab is hidden
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  var GRID = 32;          // same lattice as the boot dissolve
  var SPAWN_MS = 280;     // how often a new batch lights
  var PER_BATCH = 3;      // cells per batch
  var LIFE_MIN = 900;     // ms, one cell's full fade in and out
  var LIFE_VAR = 1200;
  var BASE = 4;           // #040404, the page colour
  var PEAK_MIN = 6;       // so a lit cell lands between #0a0a0a ...
  var PEAK_VAR = 10;      // ... and #141414

  function init() {
    var host = document.getElementById('fq-bg');
    if (!host) return;

    var cv = document.createElement('canvas');
    cv.className = 'fq-bg__layer';
    var cx = cv.getContext('2d');
    if (!cx) return;
    host.appendChild(cv);

    var w = 0, h = 0, cw = 0, ch = 0, dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.scale(dpr, dpr);
      cw = w / GRID; ch = h / GRID;
    }
    size();

    var live = [], lastSpawn = 0, raf = 0, running = false;

    function spawn(t) {
      for (var i = 0; i < PER_BATCH; i++) {
        live.push({
          x: ((Math.random() * GRID) | 0) * cw,
          y: ((Math.random() * GRID) | 0) * ch,
          t0: t,
          dur: LIFE_MIN + Math.random() * LIFE_VAR,
          peak: PEAK_MIN + Math.random() * PEAK_VAR
        });
      }
    }

    function frame(t) {
      cx.clearRect(0, 0, w, h);
      if (t - lastSpawn > SPAWN_MS) { spawn(t); lastSpawn = t; }
      for (var i = live.length - 1; i >= 0; i--) {
        var c = live[i];
        var p = (t - c.t0) / c.dur;
        if (p >= 1) { live.splice(i, 1); continue; }
        // sin gives a symmetrical fade in and out with no hard edge
        var v = Math.round(BASE + c.peak * Math.sin(p * Math.PI));
        cx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        cx.fillRect(c.x, c.y, cw + 1, ch + 1);
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastSpawn = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      live.length = 0;
      cx.clearRect(0, 0, w, h);
    }

    // The reduced-motion contract, enforced where it actually works. A CSS
    // prefers-reduced-motion block cannot stop a rAF loop any more than it can
    // stop element.animate(), which is the trap the last pass documented.
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() { if (mq.matches) { stop(); } else { start(); } }
    if (mq.addEventListener) { mq.addEventListener('change', apply); }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (running) { cancelAnimationFrame(raf); raf = 0; running = false; } }
      else { apply(); }
    });

    var rt = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(function () { size(); }, 200);
    });

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
