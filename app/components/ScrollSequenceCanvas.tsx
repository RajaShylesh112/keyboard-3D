"use client";

import { useEffect, useRef, useState } from "react";

// Total frames in the sequence. Update this to match the
// highest frame that actually exists in the keyboard-frames folder.
// Your export currently goes up to ezgif-frame-240.jpg.
const FRAME_COUNT = 240;
const PRELOAD_FRAMES = 20; // eager preload for fast first interaction

function getFrameSrc(index: number) {
  const frameNumber = (index + 1).toString().padStart(3, "0");
  // Served via the /app/api/keyboard-frames/[filename]/route.ts handler.
  return `/api/keyboard-frames/ezgif-frame-${frameNumber}.jpg`;
}

interface ScrollSequenceCanvasProps {
  // 0..1 within the scroll section
  progress: number;
}

export function ScrollSequenceCanvas({ progress }: ScrollSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCache = useRef<HTMLImageElement[]>([]);
  const loadErrorRef = useRef(false);
  const [hasAnyFrameLoaded, setHasAnyFrameLoaded] = useState(false);

  // For smoothed frame interpolation
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef<number | null>(null);

  // Progressive preload: first N frames eagerly, rest lazily/idle
  useEffect(() => {
    if (imageCache.current.length > 0) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    const loadFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images[index] = img;
          if (!hasAnyFrameLoaded) {
            setHasAnyFrameLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadErrorRef.current = true;
          resolve();
        };
        img.src = getFrameSrc(index);
      });
    };

    const loadInitial = async () => {
      const initialCount = Math.min(PRELOAD_FRAMES, FRAME_COUNT);
      for (let i = 0; i < initialCount; i++) {
        // Sequential to prioritize earliest frames
        // and avoid thrashing the network
        // eslint-disable-next-line no-await-in-loop
        await loadFrame(i);
      }

      imageCache.current = images;

      const loadRemaining = () => {
        for (let i = initialCount; i < FRAME_COUNT; i++) {
          void loadFrame(i);
        }
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadRemaining);
      } else {
        window.setTimeout(loadRemaining, 0);
      }
    };

    void loadInitial();
  }, [hasAnyFrameLoaded]);

  // Map scroll progress -> target frame index (0..FRAME_COUNT-1)
  useEffect(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    targetFrameRef.current = clamped * (FRAME_COUNT - 1);
  }, [progress]);

  // rAF loop: smooth interpolation towards target frame, draw when needed
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      // Lerp towards target for buttery motion
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const next = current + (target - current) * 0.15; // smoothing factor
      currentFrameRef.current = next;

      let frameIndex = Math.round(next);
      frameIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));

      // Avoid redundant draws if frame index hasn't changed
      if (lastDrawnFrameRef.current === frameIndex) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      const image = imageCache.current[frameIndex];

      if (image && image.complete && !loadErrorRef.current) {
        drawImageToCanvas(canvas, context, image);
        lastDrawnFrameRef.current = frameIndex;
      } else {
        // Fallback: draw the closest loaded frame if available
        const fallback = imageCache.current.find((img) => img && img.complete);
        if (fallback) {
          drawImageToCanvas(canvas, context, fallback);
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Canvas sizing with DPR scaling for sharp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const dpr = Math.min(devicePixelRatio || 1, 2); // cap for perf
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showFallbackImage = loadErrorRef.current && !hasAnyFrameLoaded;

  return (
    <>
      {showFallbackImage && (
        <img
          src={getFrameSrc(0)}
          alt="KX-01 Mechanical Keyboard hero"
          className="sequence-canvas-fallback"
          aria-hidden="true"
        />
      )}
      <canvas ref={canvasRef} className="sequence-canvas" />
    </>
  );
}

function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  const canvasWidth = canvas.clientWidth || window.innerWidth;
  const canvasHeight = canvas.clientHeight || window.innerHeight;

  const imgWidth = image.naturalWidth;
  const imgHeight = image.naturalHeight;

  if (!imgWidth || !imgHeight) return;

  // COVER behavior: always fill the viewport, cropping overflow
  const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);

  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;

  // Center the image and round to whole pixels to avoid subpixel seams
  const dx = Math.round((canvasWidth - renderWidth) / 2);
  const dy = Math.round((canvasHeight - renderHeight) / 2);

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = "#050505";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, dx, dy, renderWidth, renderHeight);
}
