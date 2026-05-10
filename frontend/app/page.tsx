"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import type { CourseItem } from "@/types";

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

type TrailPoint = {
  x: number;
  y: number;
  age: number;
};

type BurstParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  trail: TrailPoint[];
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createStar(x: number, y: number, born = false): Star {
  const base = born ? randomBetween(1, 3) : randomBetween(0.4, 2.2);
  const maxAge = born ? Math.floor(randomBetween(80, 200)) : Number.POSITIVE_INFINITY;
  const palette = [
    { color: "#ffffff", weight: 0.85 },
    { color: "#c084fc", weight: 0.08 },
    { color: "#f97316", weight: 0.07 },
  ];
  const roll = Math.random();
  let chosen = palette[0].color;
  if (roll > 0.85 && roll <= 0.93) chosen = palette[1].color;
  if (roll > 0.93) chosen = palette[2].color;

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
    color: chosen,
    born,
    age: 0,
    maxAge,
  };
}

function createBurstParticle(x: number, y: number): BurstParticle {
  const colors = ["#c084fc", "#f97316", "#ffffff"];
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(1.5, 6.5);

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: randomBetween(0.015, 0.04),
    size: randomBetween(0.5, 3),
    color: colors[Math.floor(Math.random() * colors.length)],
    trail: [],
  };
}

export default function LandingPage() {
  const [courses, setCourses] = useState<CourseItem[] | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const cursorStateRef = useRef({ x: 0, y: 0, inside: false, clicking: false });
  const starsRef = useRef<Star[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const burstRef = useRef<BurstParticle[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<CourseItem[]>("/courses/catalog");
        setCourses(data);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const cursorRing = cursorRingRef.current;

    if (!wrapper || !canvas || !cursor || !cursorRing) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const createInitialStars = (width: number, height: number) => {
      starsRef.current = Array.from({ length: 160 }, () => createStar(Math.random() * width, Math.random() * height));
    };

    const resizeCanvas = () => {
      const nextWidth = wrapper.clientWidth;
      const nextHeight = wrapper.clientHeight;
      const previousWidth = canvasSizeRef.current.width || nextWidth;
      const previousHeight = canvasSizeRef.current.height || nextHeight;

      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvasSizeRef.current = { width: nextWidth, height: nextHeight };

      if (starsRef.current.length === 0) {
        createInitialStars(nextWidth, nextHeight);
        return;
      }

      const scaleX = nextWidth / previousWidth;
      const scaleY = nextHeight / previousHeight;

      starsRef.current = starsRef.current.map((star) => {
        if (star.born) {
          return star;
        }

        const nx = star.ox * scaleX;
        const ny = star.oy * scaleY;

        return {
          ...star,
          x: nx,
          y: ny,
          ox: nx,
          oy: ny,
        };
      });
    };

    const updateCursor = (x: number, y: number) => {
      cursorStateRef.current.x = x;
      cursorStateRef.current.y = y;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.opacity = "1";
    };

    const addTrailPoint = (x: number, y: number) => {
      trailRef.current.push({ x, y, age: 0 });
      if (trailRef.current.length > 18) trailRef.current.shift();
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      cursorStateRef.current.inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      updateCursor(x, y);
      addTrailPoint(x, y);
    };

    const drawTrail = () => {
      const trails = trailRef.current;
      if (trails.length < 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let index = 1; index < trails.length; index += 1) {
        const previous = trails[index - 1];
        const current = trails[index];
        const alpha = (index / trails.length) * 0.12;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    };

    const drawGlow = () => {
      if (!cursorStateRef.current.inside) return;

      const { x, y } = cursorStateRef.current;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 90);
      gradient.addColorStop(0, "rgba(124, 58, 237, 0.07)");
      gradient.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 90, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateStars = () => {
      const mouseX = cursorStateRef.current.x;
      const mouseY = cursorStateRef.current.y;

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
        const proximityBoost = Math.max(0, 1 - dist / 300);
        star.opacity = 0.18 + wave * 0.24 + proximityBoost * 0.65;
        star.size = star.base + wave * 0.25 + proximityBoost * 0.6;

        if (star.born && star.age > star.maxAge * 0.7) {
          const remaining = Math.max(1, star.maxAge - star.age);
          star.opacity *= remaining / Math.max(1, star.maxAge * 0.3);
        }

        if (star.born && star.age >= star.maxAge) {
          return false;
        }

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
    };

    const updateTrails = () => {
      trailRef.current = trailRef.current
        .map((trail) => ({ ...trail, age: trail.age + 1 }))
        .filter((trail) => trail.age <= 20);
    };

    const updateBursts = () => {
      burstRef.current = burstRef.current
        .map((particle) => {
          particle.trail.push({ x: particle.x, y: particle.y, age: 0 });
          if (particle.trail.length > 6) particle.trail.shift();
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.08;
          particle.vx *= 0.97;
          particle.life -= particle.decay;
          return particle;
        })
        .filter((particle) => particle.life > 0);

      burstRef.current.forEach((particle) => {
        if (particle.trail.length > 1) {
          for (let index = 1; index < particle.trail.length; index += 1) {
            const previous = particle.trail[index - 1];
            const current = particle.trail[index];
            const alpha = (index / particle.trail.length) * particle.life * 0.4;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, particle.life));
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      frameRef.current += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateTrails();
      drawTrail();
      drawGlow();
      updateStars();
      updateBursts();
      rafRef.current = window.requestAnimationFrame(animate);
    };

    resizeCanvas();
    cursorStateRef.current.inside = true;
    updateCursor(canvasSizeRef.current.width / 2, canvasSizeRef.current.height / 2);
    animate();

    document.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("resize", resizeCanvas);

    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }

      document.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", resizeCanvas);
      document.body.style.cursor = originalCursor;
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative min-h-[calc(100vh-0rem)] cursor-none overflow-x-hidden bg-[#070816] px-6 py-8 text-white sm:px-10"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 opacity-100 transition-opacity duration-150"
        style={{ transform: "translate(-50%, -50%)", opacity: 1 }}
      >
        <div
          ref={cursorRingRef}
          className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a855f7]/70 transition-transform duration-100"
        />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a855f7]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between gap-10">
        <header className="flex items-center justify-between gap-4">
          <div className="glass inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#d8b4fe] backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[#a855f7] shadow-[0_0_24px_rgba(168,85,247,0.9)]" />
            Coding Rocket
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/courses" className="btn-secondary rounded-full px-5 py-2.5 text-sm">
              Courses
            </Link>
            <Link href="/login" className="btn-primary rounded-full px-5 py-2.5 text-sm">
              Sign in
            </Link>
          </div>
        </header>

        <main className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <section className="max-w-3xl pt-4 sm:pt-10 lg:pt-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#c084fc]">
              Coding education for ambitious students
            </p>
            <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              Learn to code with a studio that feels modern, structured, and student-first.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Coding Rocket helps students build real projects, develop confidence, and move from curiosity to job-ready
              fundamentals through guided classes, practical assignments, and clear progress tracking.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="btn-primary rounded-full px-6 py-3 text-sm sm:px-7">
                Enroll now
              </Link>
              <Link href="/courses" className="btn-secondary rounded-full px-6 py-3 text-sm sm:px-7">
                Explore programs
              </Link>
            </div>
          </section>

          <aside className="relative">
            <div className="glass relative overflow-hidden rounded-[2rem] border border-white/10 p-5 backdrop-blur-2xl sm:p-7">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#a855f7]/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#f97316]/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
                <Image
                  src="/images/StockCake-Coder's_Neon_World-1904810-standard.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  priority
                  className="object-cover opacity-90"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Why families choose us</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "Live", label: "online classes" },
                  { value: "Projects", label: "built every term" },
                  { value: "Support", label: "from instructors" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-xl font-semibold text-white sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">What students get</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Structured lessons, hands-on practice, and a clear path from first syntax to confident problem
                  solving.
                </p>
              </div>
            </div>
          </aside>
        </main>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { t: "Small cohorts", d: "Students get attention, feedback, and enough space to ask questions." },
            { t: "Project-based learning", d: "Every module ends with something practical they can show." },
            { t: "Transparent progress", d: "Parents and students can track momentum instead of guessing." },
          ].map((item) => (
            <div key={item.t} className="glass rounded-3xl p-5 backdrop-blur-xl">
              <h3 className="font-medium text-white">{item.t}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{item.d}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-[2rem] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Programs</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">A clear path from basics to confidence</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Our curriculum is organized so beginners can start comfortably and returning students can keep
              building without losing momentum.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Web foundations for HTML, CSS, and JavaScript.",
                "Full-stack projects that connect frontend and backend skills.",
                "Interview and portfolio prep for older students ready for the next step.",
              ].map((line) => (
                <div key={line} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">How it works</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">Simple, guided enrollment</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { title: "1. Explore", body: "Review classes and find the right starting point." },
                { title: "2. Enroll", body: "Create an account or sign in to request a seat." },
                { title: "3. Learn", body: "Join class, submit work, and build consistency." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-[2rem] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Outcomes</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">Real-world skills, not just tutorials</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { metric: "Build", label: "projects with structure" },
                { metric: "Practice", label: "problem-solving weekly" },
                { metric: "Present", label: "work with confidence" },
              ].map((item) => (
                <div key={item.metric} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">{item.metric}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Student support</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">A team that keeps learners moving</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Instructors keep the pace manageable, explain concepts in plain language, and help students turn
              mistakes into progress.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Weekly guidance and feedback on assignments.",
                "Live help during class sessions.",
                "Progress notes that make the next step obvious.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Current classes</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">See what is available now</h2>
            </div>
            <Link href="/courses" className="btn-secondary rounded-full px-5 py-2.5 text-sm">
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!courses && <p className="text-slate-400">Loading courses...</p>}
            {courses?.map((course) => (
              <div key={course.id} className="glass rounded-3xl p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Course</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{course.name}</h3>
                <p className="mt-1 text-sm text-[#d8b4fe]">{course.level ?? "General"}</p>
                {course.description && <p className="mt-3 text-sm leading-7 text-slate-300">{course.description}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c084fc]">Ready to begin</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Give your child a stronger start in coding</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Join a program that teaches practical skills, keeps progress visible, and makes the learning journey feel
                organized from day one.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary rounded-full px-6 py-3 text-sm">
                Create account
              </Link>
              <Link href="/login" className="btn-secondary rounded-full px-6 py-3 text-sm">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
