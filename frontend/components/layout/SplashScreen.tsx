'use client';

import { useEffect, useRef, useState } from "react";

import RocketAnimation from "@/components/animations/RocketAnimation";

const MIN_VISIBLE_MS = 2200;
const FADE_OUT_MS = 450;
const MAX_VISIBLE_MS = 6000;

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    // Create stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      opacity: Math.random() * 0.5 + 0.5,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;

    const animate = () => {
      ctx.fillStyle = "#05060d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity + twinkle * 0.3;

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => setCanvasSize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />;
}

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [compact, setCompact] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");

    const syncCompact = () => {
      setCompact(mediaQuery.matches);
    };

    syncCompact();
    mediaQuery.addEventListener("change", syncCompact);

    return () => {
      mediaQuery.removeEventListener("change", syncCompact);
    };
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    // Manage body overflow based on visible state
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previous || "auto";
    }

    return () => {
      document.body.style.overflow = previous || "auto";
    };
  }, [visible]);

  useEffect(() => {
    let mounted = true;
    let minElapsed = false;
    let fallbackElapsed = false;
    let pageLoaded = document.readyState === "complete";
    let hideTimer: number | undefined;
    let minTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const hideSplash = () => {
      if (!mounted || exitingRef.current) return;
      exitingRef.current = true;
      setExiting(true);
      hideTimer = window.setTimeout(() => {
        if (mounted) setVisible(false);
      }, FADE_OUT_MS);
    };

    const tryHide = () => {
      if (mounted && (pageLoaded || fallbackElapsed) && minElapsed) {
        hideSplash();
      }
    };

    minTimer = window.setTimeout(() => {
      minElapsed = true;
      tryHide();
    }, MIN_VISIBLE_MS);

    fallbackTimer = window.setTimeout(() => {
      fallbackElapsed = true;
      tryHide();
    }, MAX_VISIBLE_MS);

    const onLoad = () => {
      pageLoaded = true;
      tryHide();
    };

    if (!pageLoaded) {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      mounted = false;
      window.clearTimeout(minTimer);
      window.clearTimeout(fallbackTimer);
      if (!pageLoaded) window.removeEventListener("load", onLoad);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-[#05060d] px-3 py-6 text-white transition-opacity duration-500 sm:px-4 sm:py-8 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <StarField />
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-4">
        <RocketAnimation width="100%" height={compact ? 380 : 520} showButton={false} autoLaunch />
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center backdrop-blur-sm sm:px-5 sm:py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55 sm:text-xs">
            Launching your learning space...
          </p>
        </div>
      </div>
    </div>
  );
}
