/**
 * Indian Celebritie - 3D Apple-Style Scrollytelling & Particle Physics Engine
 * Author: Antigravity Architecture
 * Version: 2.0.0
 * 
 * Provides:
 * - 60fps damped lerp physics for scroll-tied animation
 * - 3D depth-scaled olfactory particle system ("swimming in the scent aura")
 * - 3D bottle rotation, perspective tilt, and specular light sweeping
 * - Progressive sensory acts (Act 1, 2, 3) cross-fading
 * - 1:1 Video/Frame scrubbing API for AI-generated assets
 */

(function() {
  'use strict';

  function initScrolly3D(options) {
    options = options || {};
    const container = document.getElementById('scrolly-container');
    const stage = document.getElementById('scrolly-stage');
    const canvas = document.getElementById('scrolly-canvas');
    const bottleWrapper = document.getElementById('scrolly-bottle-wrapper');
    const introText = document.getElementById('scrolly-intro-text');
    const act1 = document.getElementById('act-1-callout');
    const act2 = document.getElementById('act-2-callout');
    const act3 = document.getElementById('act-3-callout');
    const progressBar = document.getElementById('scrolly-progress-bar');
    const specularLight = document.getElementById('scrolly-specular-light');
    const video = document.getElementById('scrolly-video');

    if (!container || !stage || !canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = window.devicePixelRatio || 1;

    // Particle Configuration based on fragrance theme
    const theme = options.theme || 'gold';
    let particlePalette = [];
    if (theme === 'coffee-amber') {
      particlePalette = [
        'rgba(212, 175, 55, ',    // Imperial gold
        'rgba(197, 160, 89, ',    // Warm amber
        'rgba(245, 232, 200, ',   // Cream froth
        'rgba(168, 121, 16, ',    // Roasted espresso bronze
        'rgba(255, 255, 255, '    // Micro-droplet sparkle
      ];
    } else if (theme === 'modern-oud') {
      particlePalette = [
        'rgba(212, 175, 55, ',    // Molten gold ribbon
        'rgba(180, 180, 190, ',   // Smoked agarwood silver mist
        'rgba(230, 213, 184, ',   // Warm champagne sand
        'rgba(255, 215, 0, ',     // Golden spark
        'rgba(255, 255, 255, '    // Pure light node
      ];
    } else { // floral-rose
      particlePalette = [
        'rgba(255, 182, 193, ',   // Damask rose petal
        'rgba(255, 240, 245, ',   // White jasmine dew
        'rgba(212, 175, 55, ',    // Delicate gold stamen
        'rgba(230, 190, 160, ',   // Sandalwood cream
        'rgba(255, 255, 255, '    // Refractive water droplet
      ];
    }

    // Initialize 120 depth particles
    const particleCount = 120;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        z: 0.2 + Math.random() * 2.8, // 3D depth scale
        radius: 0.8 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: -0.0003 - Math.random() * 0.0006,
        alpha: 0.15 + Math.random() * 0.7,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulseOffset: Math.random() * Math.PI * 2,
        colorBase: particlePalette[Math.floor(Math.random() * particlePalette.length)]
      });
    }

    function resizeCanvas() {
      width = stage.clientWidth;
      height = stage.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Scroll interpolation physics
    let targetFraction = 0;
    let currentFraction = 0;
    let lastFraction = 0;
    let scrollVelocity = 0;

    function updateScrollTarget() {
      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const progress = -rect.top / totalScrollable;
      targetFraction = Math.max(0, Math.min(1, progress));
    }
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    updateScrollTarget();

    // Animation Loop
    let time = 0;
    function render() {
      time += 0.016;

      // Damped lerp (smooth 60fps scrubbing)
      currentFraction += (targetFraction - currentFraction) * 0.085;
      scrollVelocity = (currentFraction - lastFraction) * 50;
      lastFraction = currentFraction;

      // 1. Render 3D Canvas Atmosphere Particles ("Swimming in scent")
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Vertical motion influenced by natural drift + scroll velocity
        p.y += p.vy - (scrollVelocity * 0.02) / p.z;
        p.x += p.vx + Math.sin(time + p.pulseOffset) * 0.0003;

        // Wrap particles around 3D viewport
        if (p.y < 0) p.y += 1;
        if (p.y > 1) p.y -= 1;
        if (p.x < 0) p.x += 1;
        if (p.x > 1) p.x -= 1;

        const screenX = p.x * width;
        const screenY = p.y * height;
        const screenR = p.radius * p.z;
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 3 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(screenX, screenY, screenR, 0, Math.PI * 2);
        ctx.fillStyle = p.colorBase + currentAlpha + ')';
        ctx.shadowColor = p.colorBase + '0.8)';
        ctx.shadowBlur = screenR * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. 3D Flacon Spatial Transform Engine
      if (bottleWrapper) {
        // Multi-axis 3D transformation based on scroll fraction
        let rotY = 0;
        let rotX = 0;
        let rotZ = 0;
        let transX = 0;
        let transY = 0;
        let scale = 1;

        if (currentFraction < 0.15) {
          // Act 0: Initial rest & subtle float
          const f = currentFraction / 0.15;
          rotY = f * -10;
          rotX = Math.sin(time) * 3;
          scale = 1 + f * 0.05;
        } else if (currentFraction < 0.45) {
          // Act 1: Shift right, rotate left to expose flank profile (Top Notes)
          const f = (currentFraction - 0.15) / 0.30;
          transX = f * 70; // moves right
          rotY = -10 + f * -22;
          rotX = 4 + Math.sin(f * Math.PI) * 8;
          rotZ = f * -3;
          scale = 1.05 + f * 0.08;
        } else if (currentFraction < 0.75) {
          // Act 2: Shift left, reverse angle to expose heart notes (Heart Notes)
          const f = (currentFraction - 0.45) / 0.30;
          transX = 70 - f * 140; // moves from +70 to -70
          rotY = -32 + f * 58; // from -32deg to +26deg
          rotX = 12 - f * 18;
          rotZ = -3 + f * 6;
          scale = 1.13 + f * 0.06;
        } else {
          // Act 3: Center & hero zoom (Base Notes & Sillage Lock)
          const f = (currentFraction - 0.75) / 0.25;
          transX = -70 + f * 70; // re-center to 0
          rotY = 26 - f * 26; // back to 0deg
          rotX = -6 + f * 6;
          rotZ = 3 - f * 3;
          scale = 1.19 + f * 0.06;
        }

        // Apply physical transform matrix
        bottleWrapper.style.transform = `perspective(1200px) translate3d(${transX}px, ${transY}px, 0px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`;
      }

      // 3. Specular Light Gleam Sweep
      if (specularLight) {
        const gleamPos = Math.sin(currentFraction * Math.PI * 2);
        specularLight.style.opacity = Math.max(0, gleamPos * 0.6);
      }

      // 4. Fade Intro Text (0% to 15%)
      if (introText) {
        const introOpacity = Math.max(0, 1 - currentFraction * 7.5);
        introText.style.opacity = introOpacity;
        introText.style.transform = `translateY(${-currentFraction * 80}px)`;
      }

      // 5. Cross-Fade Sensory Callouts
      // Act 1 (Top Notes): visible 18% - 42%
      if (act1) {
        if (currentFraction >= 0.16 && currentFraction <= 0.42) {
          const a = currentFraction < 0.25 ? (currentFraction - 0.16) / 0.09 : (0.42 - currentFraction) / 0.10;
          act1.style.opacity = Math.max(0, Math.min(1, a));
          act1.style.transform = `translateY(-50%) translateX(${(1 - a) * -20}px)`;
        } else {
          act1.style.opacity = '0';
        }
      }

      // Act 2 (Heart Notes): visible 45% - 72%
      if (act2) {
        if (currentFraction >= 0.44 && currentFraction <= 0.72) {
          const a = currentFraction < 0.54 ? (currentFraction - 0.44) / 0.10 : (0.72 - currentFraction) / 0.10;
          act2.style.opacity = Math.max(0, Math.min(1, a));
          act2.style.transform = `translateY(-50%) translateX(${(1 - a) * 20}px)`;
        } else {
          act2.style.opacity = '0';
        }
      }

      // Act 3 (Base Notes & Sillage): visible 75% - 98%
      if (act3) {
        if (currentFraction >= 0.74 && currentFraction <= 0.98) {
          const a = currentFraction < 0.84 ? (currentFraction - 0.74) / 0.10 : (0.98 - currentFraction) / 0.08;
          act3.style.opacity = Math.max(0, Math.min(1, a));
          act3.style.transform = `translateX(-50%) translateY(${(1 - a) * 15}px)`;
        } else {
          act3.style.opacity = '0';
        }
      }

      // 6. Progress Bar
      if (progressBar) {
        progressBar.style.width = (currentFraction * 100).toFixed(1) + '%';
      }

      // 7. Video Scrubbing Hook (for AI generated Google Flow / Veo / Runway MP4)
      if (video && video.duration && !isNaN(video.duration)) {
        const targetVideoTime = currentFraction * video.duration;
        if (Math.abs(video.currentTime - targetVideoTime) > 0.04) {
          video.currentTime = targetVideoTime;
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  window.initScrolly3D = initScrolly3D;
})();
