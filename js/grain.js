/* ---------------------------------------------------------------------------
   grain.js  -  the animated film-grain overlay
   Adapted from TELETECH-EVENTS-DESIGN-REFERENCE.md chapter 11.4.

   Bakes a few noise tiles to data URLs and drifts one oversized layer behind a
   fixed clipping host, cycling tiles so the field genuinely changes frame to
   frame rather than the same tile sliding around.

   Three things this does that the original teletech.events grain does not:
     - it respects prefers-reduced-motion, and mounts a single static tile
       instead of animating (brief 3.4);
     - it bakes the tile at devicePixelRatio so one mark stays one device pixel,
       which is the fix for the haze the original works around by dropping the
       whole overlay to 20% opacity on phones (reference 11.4, last tuning row);
     - it injects no stylesheet and rewrites nothing on the host.

   Classic script, not a module: the site must work from file://.
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  /**
   * Render one noise tile and return it as a PNG data URL.
   *
   * pitch is the lattice step in both axes; markWidth/markHeight size each
   * mark. markWidth === pitch with markHeight < pitch gives a scanline raster
   * (continuous lines, transparent rows between) rather than isotropic speckle,
   * which is what reads as photocopy rather than as film.
   */
  function makeGrainTile(opts) {
    opts = opts || {};
    var size = opts.size || 600;
    var pitch = opts.pitch || 5;
    var markWidth = opts.markWidth || 5;
    var markHeight = opts.markHeight || 1;
    var opacity = opts.opacity == null ? 0.05 : opts.opacity;
    var dpr = opts.dpr || 1;

    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * dpr;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(dpr, dpr);

    for (var y = 0; y < size; y += pitch) {
      for (var x = 0; x < size; x += pitch) {
        var v = (Math.random() * 256) | 0;
        ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + opacity + ')';
        ctx.fillRect(x, y, markWidth, markHeight);
      }
    }
    // A 2D canvas stores premultiplied colour, so at opacity 0.05 only about
    // 14 grey levels survive the round trip. That quantisation is a feature:
    // it is what makes the result read as print rather than as video noise.
    return canvas.toDataURL('image/png');
  }

  /**
   * Mount a grain overlay inside `host`. Returns a teardown function.
   */
  function mountGrain(host, opts) {
    if (!host) return function () {};
    opts = opts || {};

    var drift = opts.drift == null ? 30 : opts.drift;
    var duration = opts.duration || 500;
    var steps = opts.steps || 20;
    var frames = opts.frames || 1;
    var frameRate = opts.frameRate || 12;
    var size = opts.size || 600;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var tileOpts = {
      size: size,
      pitch: opts.pitch,
      markWidth: opts.markWidth,
      markHeight: opts.markHeight,
      opacity: opts.opacity,
      dpr: dpr
    };

    // Under reduced motion one tile is all we will ever show, so bake one.
    var count = reduce ? 1 : Math.max(1, frames);
    var urls = [];
    for (var i = 0; i < count; i++) {
      var url = makeGrainTile(tileOpts);
      if (!url) return function () {};   // no 2D context: no grain, no error
      urls.push(url);
    }

    // A <dialog> opened with showModal() paints in the top layer, above every
    // normal-flow element regardless of z-index, so the fixed grain host is
    // hidden the moment the menu opens. Publishing the tile as a custom
    // property lets the dialog paint the same texture on itself.
    document.documentElement.style.setProperty('--fq-grain-tile', 'url(' + urls[0] + ')');

    var layer = document.createElement('div');
    layer.className = 'fq-grain-layer';
    // Set inline rather than in the stylesheet so the host page needs no extra
    // CSS for a purely decorative layer.
    layer.style.position = 'absolute';
    layer.style.top = '-100%';
    layer.style.left = '-100%';
    layer.style.width = '300%';
    layer.style.height = '300%';
    layer.style.backgroundImage = 'url(' + urls[0] + ')';
    layer.style.backgroundRepeat = 'repeat';
    // Authoring the tile in CSS pixels is what turns a crisp 1px line into
    // haze on a high-DPR screen; pin the paint size to the CSS size.
    layer.style.backgroundSize = size + 'px ' + size + 'px';
    layer.style.willChange = 'transform';
    host.appendChild(layer);

    var anim = null;
    var timer = 0;

    if (!reduce && drift > 0 && typeof layer.animate === 'function') {
      // The drift path, as fractions of `drift`. Ten segments, closed loop.
      var path = [
        [-0.33, 0.33], [-0.83, 0.00], [-1.00, 0.33], [-1.00, 1.00], [-0.67, 0.67],
        [-0.50, 0.33], [-0.67, 0.67], [-0.17, 0.67], [-0.83, 0.17], [-1.00, 0.83],
        [-0.33, 0.33]
      ];
      anim = layer.animate(
        path.map(function (p) {
          return { transform: 'translate(' + (p[0] * drift) + '%,' + (p[1] * drift) + '%)' };
        }),
        {
          duration: duration,
          iterations: Infinity,
          // Iteration-level steps: `steps` discrete positions per cycle. Putting
          // the easing here rather than on each keyframe is what stops the
          // once-per-2.5ms jitter the original site has.
          easing: 'steps(' + steps + ', end)'
        }
      );
    }

    if (!reduce && urls.length > 1) {
      var i2 = 0;
      timer = window.setInterval(function () {
        i2 = (i2 + 1) % urls.length;
        layer.style.backgroundImage = 'url(' + urls[i2] + ')';
      }, Math.round(1000 / frameRate));
    }

    return function teardown() {
      if (anim) anim.cancel();
      if (timer) window.clearInterval(timer);
      layer.remove();
    };
  }

  function init() {
    var host = document.getElementById('fq-grain');
    if (!host) return;
    mountGrain(host, {
      size: 600, pitch: 5, markWidth: 5, markHeight: 1, opacity: 0.05,
      drift: 30, duration: 500, steps: 20,
      frames: 3, frameRate: 12
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
