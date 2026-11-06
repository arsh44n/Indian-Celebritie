/**
 * Indian Celebritie - Video Frame Scrollytelling Engine
 * Plays and scrubs Full HD extracted video frames 1:1 with vertical scroll.
 */

(function() {
  'use strict';

  function initFrameScrubber(config) {
    const container = document.getElementById(config.containerId || 'scrolly-container');
    const canvas = document.getElementById(config.canvasId || 'frame-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const frameCount = config.frameCount || 179;
    const basePath = config.basePath.endsWith('/') ? config.basePath : config.basePath + '/';
    const introText = document.getElementById(config.introTextId || 'scrolly-intro-text');
    const progressBar = document.getElementById(config.progressBarId || 'scrolly-progress-bar');
    const callouts = config.callouts || [];

    // Storage for preloaded images
    const frames = new Array(frameCount);
    const loadedFlags = new Array(frameCount).fill(false);
    let loadedCount = 0;

    // Format filename with 3-digit padding (001 to N)
    function getFrameUrl(index) {
      const numStr = String(index + 1).padStart(3, '0');
      return `${basePath}ezgif-frame-${numStr}.jpg`;
    }

    // Canvas size & retina scaling
    let canvasWidth = 0;
    let canvasHeight = 0;
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
      renderCurrentFrame();
    }
    window.addEventListener('resize', resizeCanvas);

    // Frame drawing helper (Centered Contain)
    function drawImageScaled(img) {
      if (!img || !img.width || !img.height) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const hRatio = canvasWidth / img.width;
      const vRatio = canvasHeight / img.height;
      // Use cover on wide screens, contain on narrow screens, or balanced cover
      const ratio = Math.max(hRatio, vRatio);
      
      const drawWidth = img.width * ratio;
      const drawHeight = img.height * ratio;
      const shiftX = (canvasWidth - drawWidth) / 2;
      const shiftY = (canvasHeight - drawHeight) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, drawWidth, drawHeight);
    }

    // Find closest already-loaded frame to avoid blank flickers
    function getBestAvailableFrame(targetIdx) {
      if (loadedFlags[targetIdx] && frames[targetIdx]) {
        return frames[targetIdx];
      }
      // Look outward for closest loaded frame
      for (let offset = 1; offset < frameCount; offset++) {
        const left = targetIdx - offset;
        const right = targetIdx + offset;
        if (left >= 0 && loadedFlags[left] && frames[left]) return frames[left];
        if (right < frameCount && loadedFlags[right] && frames[right]) return frames[right];
      }
      return frames[0] || null;
    }

    let currentFrameIndex = 0;
    function renderCurrentFrame() {
      const idx = Math.min(frameCount - 1, Math.max(0, Math.round(currentFrameIndex)));
      const img = getBestAvailableFrame(idx);
      if (img) {
        drawImageScaled(img);
      }
    }

    // Step 1: Immediately load Frame 1 so the page has instant visual
    const firstFrame = new Image();
    firstFrame.src = getFrameUrl(0);
    firstFrame.onload = function() {
      frames[0] = firstFrame;
      loadedFlags[0] = true;
      loadedCount++;
      resizeCanvas();
      renderCurrentFrame();
    };

    // Step 2: Preload milestone keyframes (every 5th) then fill in the rest
    function preloadAllFrames() {
      // Prioritize keyframes first
      const keyframes = [];
      const others = [];
      for (let i = 0; i < frameCount; i++) {
        if (i % 5 === 0) keyframes.push(i);
        else others.push(i);
      }

      const queue = keyframes.concat(others);
      let activeIndex = 0;
      const maxConcurrent = 8;
      let activeLoads = 0;

      function loadNext() {
        if (activeIndex >= queue.length) return;
        while (activeLoads < maxConcurrent && activeIndex < queue.length) {
          const idx = queue[activeIndex++];
          if (loadedFlags[idx]) continue;

          activeLoads++;
          const img = new Image();
          img.src = getFrameUrl(idx);
          img.onload = function() {
            frames[idx] = img;
            loadedFlags[idx] = true;
            loadedCount++;
            activeLoads--;
            if (Math.abs(currentFrameIndex - idx) <= 1) {
              renderCurrentFrame();
            }
            loadNext();
          };
          img.onerror = function() {
            activeLoads--;
            loadNext();
          };
        }
      }

      loadNext();
    }

    // Start background preloading after first frame starts
    setTimeout(preloadAllFrames, 50);

    // Scroll scrubbing math with damped physics
    let targetFraction = 0;
    let currentFraction = 0;

    function updateScrollProgress() {
      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const progress = -rect.top / totalScrollable;
      targetFraction = Math.max(0, Math.min(1, progress));
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 60 FPS animation loop
    function animationLoop() {
      // Smooth lerp
      currentFraction += (targetFraction - currentFraction) * 0.12;

      // Map fraction to frame index
      const targetIdx = currentFraction * (frameCount - 1);
      const prevIdx = Math.round(currentFrameIndex);
      currentFrameIndex = targetIdx;
      const nextIdx = Math.round(currentFrameIndex);

      if (prevIdx !== nextIdx) {
        renderCurrentFrame();
      }

      // Fade intro text during first 12% scroll
      if (introText) {
        const introOpacity = Math.max(0, 1 - currentFraction * 8.5);
        introText.style.opacity = introOpacity;
        introText.style.transform = `translateY(${-currentFraction * 70}px)`;
        introText.style.pointerEvents = introOpacity > 0.05 ? 'auto' : 'none';
      }

      // Update progress bar
      if (progressBar) {
        progressBar.style.width = (currentFraction * 100).toFixed(1) + '%';
      }

      // Sensory callouts cross-fading
      for (let i = 0; i < callouts.length; i++) {
        const item = callouts[i];
        const el = document.getElementById(item.id);
        if (!el) continue;

        if (currentFraction >= item.start && currentFraction <= item.end) {
          const mid = (item.start + item.end) / 2;
          const halfSpan = (item.end - item.start) / 2;
          const dist = Math.abs(currentFraction - mid) / halfSpan;
          const opacity = Math.max(0, 1 - dist * 1.5);
          el.style.opacity = opacity;
          el.style.transform = `translateY(-50%) translateX(${(1 - opacity) * (item.side === 'right' ? 20 : -20)}px)`;
        } else {
          el.style.opacity = '0';
        }
      }

      requestAnimationFrame(animationLoop);
    }

    requestAnimationFrame(animationLoop);
  }

  window.initFrameScrubber = initFrameScrubber;
})();
