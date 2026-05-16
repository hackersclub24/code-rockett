"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  base: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  born: boolean;
  age: number;
  maxAge: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createStar(x: number, y: number, born = false): Star {
  const base = born ? randomBetween(1, 3) : randomBetween(0.4, 2.2);
  const maxAge = born ? Math.floor(randomBetween(80, 200)) : Number.POSITIVE_INFINITY;
  const palette = ["#ffffff", "#c084fc", "#f97316"];
  const color = palette[Math.floor(Math.random() * palette.length)];
  return {
    x,
    y,
    ox: x,
    oy: y,
    vx: 0,
    vy: 0,
    size: base,
    base,
    opacity: born ? 0.9 : randomBetween(0.25, 0.8),
    twinkleSpeed: randomBetween(0.01, 0.04),
    twinkleOffset: randomBetween(0, Math.PI * 2),
    color,
    born,
    age: 0,
    maxAge,
  };
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const createInitial = (w: number, h: number) => {
      starsRef.current = Array.from({ length: 160 }, () => createStar(Math.random() * w, Math.random() * h));
    };

    const resize = () => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      const prev = sizeRef.current;
      canvas.width = w;
      canvas.height = h;
      sizeRef.current = { width: w, height: h };
      if (starsRef.current.length === 0) {
        createInitial(w, h);
        return;
      }
      const sx = w / (prev.width || w);
      const sy = h / (prev.height || h);
      starsRef.current = starsRef.current.map((s) => ({ ...s, x: s.ox * sx, y: s.oy * sy, ox: s.ox * sx, oy: s.oy * sy }));
    };

    const update = () => {
      frameRef.current += 1;
      const mouseX = sizeRef.current.width / 2;
      const mouseY = sizeRef.current.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current = starsRef.current.filter((star) => {
        star.age += 1;
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < 300) {
          const force = (1 - dist / 300) * 8;
          const nx = dx / dist;
          const ny = dy / dist;
          star.vx += nx * force;
          star.vy += ny * force;
          star.vx += -ny * force * 0.12;
          star.vy += nx * force * 0.12;
        }

        star.vx *= 0.92;
        star.vy *= 0.92;
        star.x += (star.ox - star.x) * 0.01;
        star.y += (star.oy - star.y) * 0.01;
        star.x += star.vx;
        star.y += star.vy;

        const wave = Math.sin(frameRef.current * star.twinkleSpeed + star.twinkleOffset);
        const proximity = Math.max(0, 1 - dist / 300);
        star.opacity = 0.18 + wave * 0.24 + proximity * 0.65;
        star.size = star.base + wave * 0.25 + proximity * 0.6;

        const alpha = Math.max(0, Math.min(1, star.opacity));
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, Math.max(0.2, star.size), 0, Math.PI * 2);
        ctx.fill();

        if (star.size > 1.4) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        return true;
      });

      rafRef.current = window.requestAnimationFrame(update);
    };

    resize();
    update();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
    </div>
  );
}
