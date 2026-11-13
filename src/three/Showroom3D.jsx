import React, { useEffect, useRef } from 'react';

function getFrameSrc(framesDir, totalFrames, index1Based, cacheVersion) {
  const clamped = Math.max(1, Math.min(totalFrames, index1Based));
  const padded = String(clamped).padStart(3, '0');
  return `${framesDir}/f_${padded}.jpg?v=${cacheVersion}`;
}

export default function Showroom3D({
  scrollProgress = 0,
  framesDir = '/assets/hero_women_frames',
  totalFrames = 301,
  topOffsetPx = 29,
  cacheVersion = '3'
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef(new Array(totalFrames).fill(null));
  const targetProgressRef = useRef(scrollProgress);
  const smoothProgressRef = useRef(scrollProgress);
  const lastDrawnFrameRef = useRef(-1);
  const lastDrawnSizeRef = useRef('');

  // Keep target scroll progress updated without restarting the RAF loop
  useEffect(() => {
    targetProgressRef.current = Math.max(0, Math.min(1, scrollProgress));
  }, [scrollProgress]);

  // Smart concurrency-controlled progressive frame loader (never blocks browser network pool)
  useEffect(() => {
    let cancelled = false;
    framesRef.current = new Array(totalFrames).fill(null);
    const loadedFlags = new Array(totalFrames).fill(false);

    const loadFramePromise = (idx0, highPriority = false) =>
      new Promise((resolve) => {
        if (cancelled || loadedFlags[idx0]) {
          resolve();
          return;
        }
        loadedFlags[idx0] = true;
        const img = new Image();
        img.decoding = 'async';
        if (highPriority) {
          img.fetchPriority = 'high';
        }
        img.onload = () => {
          if (cancelled) {
            resolve();
            return;
          }
          const finalize = () => {
            if (!cancelled) {
              framesRef.current[idx0] = img;
              lastDrawnFrameRef.current = -1;
            }
            resolve();
          };
          if (typeof img.decode === 'function') {
            img.decode().then(finalize).catch(finalize);
          } else {
            finalize();
          }
        };
        img.onerror = () => resolve();
        img.src = getFrameSrc(framesDir, totalFrames, idx0 + 1, cacheVersion);
      });

    // Build priority order: Wave 1 (every 10th), Wave 2 (every 3rd), Wave 3 (remaining)
    const pendingQueue = [];
    const seen = new Set([0, totalFrames - 1]);
    for (let i = 0; i < totalFrames; i += 10) {
      if (!seen.has(i)) {
        seen.add(i);
        pendingQueue.push({ idx: i, wave: 1 });
      }
    }
    for (let i = 0; i < totalFrames; i += 3) {
      if (!seen.has(i)) {
        seen.add(i);
        pendingQueue.push({ idx: i, wave: 2 });
      }
    }
    for (let i = 0; i < totalFrames; i++) {
      if (!seen.has(i)) {
        seen.add(i);
        pendingQueue.push({ idx: i, wave: 3 });
      }
    }

    const pickNextFrameIdx = () => {
      if (pendingQueue.length === 0) return -1;
      // Always finish Wave 1 coarse scrub keyframes first
      if (pendingQueue[0].wave === 1) {
        return pendingQueue.shift().idx;
      }
      // Otherwise prioritize whichever queued frame is closest to user's current scroll position
      const currentTargetIdx = Math.round(targetProgressRef.current * (totalFrames - 1));
      let bestPos = 0;
      let bestScore = Infinity;
      const searchLimit = Math.min(pendingQueue.length, 60);
      for (let i = 0; i < searchLimit; i++) {
        const item = pendingQueue[i];
        const dist = Math.abs(item.idx - currentTargetIdx) + item.wave * 18;
        if (dist < bestScore) {
          bestScore = dist;
          bestPos = i;
        }
      }
      return pendingQueue.splice(bestPos, 1)[0].idx;
    };

    let streamingStarted = false;
    const startWorkers = () => {
      if (cancelled || streamingStarted) return;
      streamingStarted = true;
      const CONCURRENCY = topOffsetPx > 0 ? 3 : 2;
      const runWorker = async () => {
        while (!cancelled && pendingQueue.length > 0) {
          const nextIdx = pickNextFrameIdx();
          if (nextIdx < 0) break;
          await loadFramePromise(nextIdx, false);
        }
      };
      for (let w = 0; w < CONCURRENCY; w++) {
        runWorker();
      }
    };

    // 1. Immediately load Frame 1 (and final frame) at high priority
    loadFramePromise(0, topOffsetPx > 0).then(() => {
      if (cancelled) return;
      loadFramePromise(totalFrames - 1, false);
      if (topOffsetPx > 0) {
        // Hero section: start progressive workers right after Frame 1 renders
        startWorkers();
      }
    });

    // 2. For lower-page video (#stories-motion), wait until near viewport or after 1.4s idle
    let observer;
    let idleTimer;
    if (topOffsetPx === 0) {
      idleTimer = setTimeout(startWorkers, 1400);
      if (typeof IntersectionObserver !== 'undefined' && wrapRef.current) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              startWorkers();
              observer.disconnect();
            }
          },
          { rootMargin: '1500px 0px' }
        );
        observer.observe(wrapRef.current);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(idleTimer);
      if (observer) observer.disconnect();
    };
  }, [framesDir, totalFrames, cacheVersion, topOffsetPx]);

  // Find the nearest loaded frame if the exact frame is still streaming in
  const getNearestLoadedFrame = (targetIdx) => {
    const frames = framesRef.current;
    if (frames[targetIdx]) return frames[targetIdx];
    for (let offset = 1; offset < totalFrames; offset++) {
      if (targetIdx - offset >= 0 && frames[targetIdx - offset]) {
        return frames[targetIdx - offset];
      }
      if (targetIdx + offset < totalFrames && frames[targetIdx + offset]) {
        return frames[targetIdx + offset];
      }
    }
    return null;
  };

  // 60fps / 120fps requestAnimationFrame loop for butter-smooth forward & reverse scroll scrubbing
  useEffect(() => {
    let rafId;

    // Draw the full 100% uncropped video frame (zero top, bottom, left, or right cut-off)
    const drawFullFrameImage = (ctx, img, canvasWidth, canvasHeight, currentProgress) => {
      if (!img || !img.complete || !img.naturalWidth || canvasWidth <= 0 || canvasHeight <= 0) {
        return false;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      let effectiveTopPx = topOffsetPx;
      if (topOffsetPx > 0) {
        const announceBar = document.querySelector('.drift-top-announcement');
        if (announceBar && announceBar.offsetHeight > 0) {
          effectiveTopPx = announceBar.offsetHeight;
        }
      }
      const topOffset = Math.round(effectiveTopPx * dpr);
      const availH = Math.max(1, canvasHeight - topOffset);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#140205';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const isMobilePortrait = window.innerWidth <= 768 && availH > canvasWidth * 0.95;

      if (isMobilePortrait) {
        // 1. Full uncropped 16:9 frame placed cleanly in the open upper stage at start, gliding to center on scroll
        const naturalAspect = img.naturalWidth / img.naturalHeight;
        const mobileFrameH = Math.min(availH, Math.round((canvasWidth / naturalAspect) * 1.32));
        const scrollShift = Math.min(1, Math.max(0, currentProgress * 3.8));
        const verticalRatio = topOffsetPx > 0 ? 0.04 + scrollShift * 0.28 : 0.16;
        const mobileFrameY = topOffset + Math.round((availH - mobileFrameH) * verticalRatio);

        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          0,
          mobileFrameY,
          canvasWidth,
          mobileFrameH
        );

        // 2. Smooth top & bottom feather gradients so the video blends seamlessly into #140205 with zero hard seam line
        const topFeatherH = Math.round(mobileFrameH * 0.18);
        const topGrad = ctx.createLinearGradient(0, mobileFrameY, 0, mobileFrameY + topFeatherH);
        topGrad.addColorStop(0, '#140205');
        topGrad.addColorStop(1, 'rgba(20, 2, 5, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, mobileFrameY - 2, canvasWidth, topFeatherH + 2);

        const botFeatherH = Math.round(mobileFrameH * 0.26);
        const botGrad = ctx.createLinearGradient(
          0,
          mobileFrameY + mobileFrameH - botFeatherH,
          0,
          mobileFrameY + mobileFrameH
        );
        botGrad.addColorStop(0, 'rgba(20, 2, 5, 0)');
        botGrad.addColorStop(1, '#140205');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, mobileFrameY + mobileFrameH - botFeatherH, canvasWidth, botFeatherH + 2);

        return true;
      }

      // Desktop / Laptop: 100% unchanged full-stage render
      const drawX = 0;
      const drawY = topOffset;
      const drawW = canvasWidth;
      const drawH = availH;

      ctx.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        drawX,
        drawY,
        drawW,
        drawH
      );
      return true;
    };

    const syncCanvasDimensions = () => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const parent = wrapRef.current || canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : null;
      const cssW = rect && rect.width > 0 ? rect.width : window.innerWidth;
      const cssH = rect && rect.height > 0 ? rect.height : window.innerHeight;
      const width = Math.max(1, Math.round(cssW * dpr));
      const height = Math.max(1, Math.round(cssH * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastDrawnFrameRef.current = -1;
        return true;
      }
      return false;
    };

    syncCanvasDimensions();
    window.addEventListener('resize', syncCanvasDimensions);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && wrapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        syncCanvasDimensions();
      });
      resizeObserver.observe(wrapRef.current);
    }

    const renderLoop = () => {
      const diff = targetProgressRef.current - smoothProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        smoothProgressRef.current += diff * 0.24;
      } else {
        smoothProgressRef.current = targetProgressRef.current;
      }

      const exactFrame = smoothProgressRef.current * (totalFrames - 1);
      const primaryIdx = Math.max(0, Math.min(totalFrames - 1, Math.round(exactFrame)));

      const canvas = canvasRef.current;
      if (canvas) {
        const isMobile = window.innerWidth <= 768;
        const sizeKey = `${canvas.width}x${canvas.height}x${isMobile ? 'm' : 'd'}`;
        const needsRedraw =
          primaryIdx !== lastDrawnFrameRef.current ||
          sizeKey !== lastDrawnSizeRef.current ||
          (isMobile && Math.abs(diff) > 0.0005);

        if (needsRedraw) {
          const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
          const primaryImg = getNearestLoadedFrame(primaryIdx);

          if (ctx && primaryImg) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            const didDraw = drawFullFrameImage(
              ctx,
              primaryImg,
              canvas.width,
              canvas.height,
              smoothProgressRef.current
            );
            if (didDraw) {
              lastDrawnFrameRef.current = primaryIdx;
              lastDrawnSizeRef.current = sizeKey;
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncCanvasDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [totalFrames, topOffsetPx]);

  return (
    <div ref={wrapRef} className="showroom-3d-canvas-wrap">
      {/* Instant Frame-1 High-Priority Poster Fallback (Zero 32MB Video Download Overhead) */}
      <img
        className="hero-scrub-video"
        src={`${framesDir}/f_001.jpg?v=${cacheVersion}`}
        alt=""
        fetchPriority={topOffsetPx > 0 ? 'high' : 'low'}
        decoding="async"
        style={{
          opacity: 1,
          top: `${topOffsetPx}px`,
          height: `calc(100% - ${topOffsetPx}px)`
        }}
      />

      {/* High-DPI Hardware Canvas for Zero-Lag Scroll Scrubbing */}
      <canvas
        ref={canvasRef}
        className="showroom-scrub-canvas"
      />
    </div>
  );
}
