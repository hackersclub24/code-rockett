'use client';

import { useEffect, useRef, useState } from "react";

import RocketAnimation from "@/components/animations/RocketAnimation";

const MIN_VISIBLE_MS = 2200;
const FADE_OUT_MS = 450;
const MAX_VISIBLE_MS = 6000;

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
      className={`pointer-events-none fixed inset-0 z-[80] flex items-center justify-center px-3 py-6 text-white transition-opacity duration-500 sm:px-4 sm:py-8 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1a4d 25%, #0d1b3d 50%, #1a1a4d 75%, #0a0e27 100%)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
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
