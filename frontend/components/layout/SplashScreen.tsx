'use client';

import { useEffect, useState } from "react";

import RocketAnimation from "@/components/animations/RocketAnimation";

const MIN_VISIBLE_MS = 2200;
const FADE_OUT_MS = 450;
const MAX_VISIBLE_MS = 6000;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Manage body overflow based on visible state
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
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
      if (!mounted || exiting) return;
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

    if (!pageLoaded) {
      const onLoad = () => {
        pageLoaded = true;
        tryHide();
      };

      window.addEventListener("load", onLoad, { once: true });

      return () => {
        mounted = false;
        window.clearTimeout(minTimer);
        window.clearTimeout(fallbackTimer);
        window.removeEventListener("load", onLoad);
        if (hideTimer) window.clearTimeout(hideTimer);
      };
    }

    return () => {
      mounted = false;
      window.clearTimeout(minTimer);
      window.clearTimeout(fallbackTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [exiting]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-[#05060d] px-4 py-8 text-white transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.12),transparent_30%)]" />
      <div className="relative z-10 w-full max-w-5xl">
        <RocketAnimation width="100%" height={560} showButton={false} autoLaunch />
        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c084fc]">Coding Rocket</p>
          <p className="mt-2 text-sm text-slate-300">Launching your learning space...</p>
        </div>
      </div>
    </div>
  );
}
