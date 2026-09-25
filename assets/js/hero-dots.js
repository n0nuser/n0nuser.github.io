'use strict';

// Homepage showpiece: on hover, the hero portrait crossfades into a
// dot-matrix version of itself whose dots shy away from the cursor.
// Progressive enhancement only: the <img> stays the real content, and
// nothing runs for reduced motion, touch-only devices or missing canvas.
(function () {
  var GRID = 48;          // dots per side
  var RADIUS = 70;        // cursor influence, CSS px
  var PUSH = 14;          // max displacement, CSS px
  var EASE = 0.18;        // per-frame easing towards targets

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var wrap = document.querySelector('.home-hero-photo');
    var img = wrap && wrap.querySelector('img');
    if (!img) return;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;

    canvas.className = 'hero-dots';
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);

    var lum = null;
    var offX = new Float32Array(GRID * GRID);
    var offY = new Float32Array(GRID * GRID);
    var size = 0, dpr = 1, fg = '#000', bg = '#fff', lightInk = false;
    var pointer = null, frame = 0;

    // Luminance per cell, sampled once from the already-loaded image
    function sample() {
      var probe = document.createElement('canvas');
      probe.width = probe.height = GRID;
      var pctx = probe.getContext('2d', { willReadFrequently: true });
      pctx.drawImage(img, 0, 0, GRID, GRID);
      var data = pctx.getImageData(0, 0, GRID, GRID).data;
      lum = new Float32Array(GRID * GRID);
      var min = 1, max = 0;
      for (var i = 0; i < lum.length; i++) {
        lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
        min = Math.min(min, lum[i]);
        max = Math.max(max, lum[i]);
      }
      // Stretch contrast so mid-grey portraits still read as a face
      for (var j = 0; j < lum.length; j++) {
        lum[j] = Math.pow((lum[j] - min) / ((max - min) || 1), 0.8);
      }
    }

    function measure() {
      var rootStyle = getComputedStyle(document.documentElement);
      fg = rootStyle.getPropertyValue('--fg').trim() || fg;
      bg = rootStyle.getPropertyValue('--bg').trim() || bg;
      // Light dots on a dark page must follow brightness, or the portrait turns negative
      lightInk = document.documentElement.dataset.mode === 'dark';
      dpr = window.devicePixelRatio || 1;
      size = img.clientWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
      // Sit exactly on the image box (the theme gives images vertical margins)
      canvas.style.left = img.offsetLeft + 'px';
      canvas.style.top = img.offsetTop + 'px';
      canvas.style.width = canvas.style.height = size + 'px';
    }

    function draw() {
      var cell = size / GRID;
      var moving = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = fg;

      for (var y = 0; y < GRID; y++) {
        for (var x = 0; x < GRID; x++) {
          var i = y * GRID + x;
          var cx = (x + 0.5) * cell;
          var cy = (y + 0.5) * cell;
          var tx = 0, ty = 0, grow = 0;

          if (pointer) {
            var dx = cx - pointer.x, dy = cy - pointer.y;
            var d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < RADIUS) {
              var f = (1 - d / RADIUS) * (1 - d / RADIUS);
              tx = (dx / d) * PUSH * f;
              ty = (dy / d) * PUSH * f;
              grow = f;
            }
          }

          offX[i] += (tx - offX[i]) * EASE;
          offY[i] += (ty - offY[i]) * EASE;
          if (Math.abs(tx - offX[i]) > 0.05 || Math.abs(ty - offY[i]) > 0.05) moving = true;

          // Ink-coloured dots grow where the photo has more ink
          var ink = lightInk ? lum[i] : 1 - lum[i];
          var r = ink * cell * 0.55 * (1 + grow * 0.6);
          if (r < 0.3) continue;
          ctx.beginPath();
          ctx.arc(cx + offX[i], cy + offY[i], r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frame = (pointer || moving) ? requestAnimationFrame(draw) : 0;
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    wrap.addEventListener('pointerenter', function () {
      if (!lum) sample();
      measure();
      wrap.classList.add('is-dotted');
      wake();
    });

    wrap.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      wake();
    });

    wrap.addEventListener('pointerleave', function () {
      pointer = null;
      wrap.classList.remove('is-dotted');
      wake();
    });
  }

  function start() {
    var img = document.querySelector('.home-hero-photo img');
    if (img && !img.complete) {
      img.addEventListener('load', init, { once: true });
    } else {
      init();
    }
  }

  // Stay off the critical path: wait for load, then for an idle moment
  window.addEventListener('load', function () {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      window.setTimeout(start, 200);
    }
  });
})();
