"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import RocketModel from "@/components/RocketModel";
import { api } from "@/lib/api";
import { getAccessToken, parseJwtPayload } from "@/lib/auth";

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

function CoursePreview() {
  type CourseItem = { id: string; name: string; description?: string; is_active?: boolean; level?: string };
  const [courses, setCourses] = useState<CourseItem[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [approvedStudent, setApprovedStudent] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setApprovedStudent(false);
      setAuthReady(true);
      return;
    }
    const payload = parseJwtPayload(token);
    setApprovedStudent(payload?.role === "student" && payload?.status === "approved");
    setAuthReady(true);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<CourseItem[]>('/courses/catalog');
        setCourses(data.slice(0, 3));
      } catch (err) {
        setCourses([]);
      }
    })();
  }, []);

  async function requestEnrollment(courseId: string) {
    setMessage(null);
    if (!approvedStudent) {
      window.location.href = `/login?next=/courses`;
      return;
    }
    setBusyId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll-request`);
      setMessage('Enrollment request sent.');
    } catch (e) {
      setMessage('Could not send request.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto mt-5 max-w-6xl sm:mt-6">
      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}
      {!courses && <p className="text-slate-400">Loading courses...</p>}
      {courses && courses.length === 0 && <p className="text-slate-500">No courses available right now.</p>}
      <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <div key={course.id} className="glass rounded-2xl p-4 sm:p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{course.level ?? 'General'}</p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{course.name}</h3>
            {course.description && <p className="mt-3 text-sm text-slate-300">{course.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void requestEnrollment(course.id)}
                disabled={!course.is_active || busyId === course.id}
                className="btn-primary px-4 py-2.5 text-xs sm:text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === course.id ? 'Sending...' : 'Request enrollment'}
              </button>
              <Link href="/courses" className="text-sm text-slate-500">View all</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function createStar(x: number, y: number, born = false): Star {
  const base = born ? randomBetween(1, 3) : randomBetween(0.4, 2.2);
  const maxAge = born ? Math.floor(randomBetween(80, 200)) : Number.POSITIVE_INFINITY;
  const palette = [
    { color: "#ffffff", weight: 0.85 },
    { color: "#ffd8b2", weight: 0.08 },
    { color: "#df7f35", weight: 0.07 },
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
  const colors = ["#df7f35", "#ffd8b2", "#ffffff"];
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
      className="relative min-h-[calc(100vh-0rem)] cursor-none overflow-x-hidden bg-[#070816] px-4 py-6 text-white sm:px-8 sm:py-8 lg:px-10"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_78%_30%,rgba(223,127,53,0.12),transparent_62%),radial-gradient(720px_420px_at_18%_18%,rgba(255,228,190,0.08),transparent_58%),radial-gradient(580px_300px_at_58%_72%,rgba(255,255,255,0.05),transparent_66%)]" />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 opacity-100 transition-opacity duration-150"
        style={{ transform: "translate(-50%, -50%)", opacity: 1 }}
      >
        <div
          ref={cursorRingRef}
          className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 transition-transform duration-100"
        />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between gap-8 sm:gap-10">
        <header className="flex items-center justify-between gap-4">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-accent backdrop-blur-xl sm:gap-3 sm:px-4 sm:text-xs sm:tracking-[0.3em]">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_24px_rgba(223,127,53,0.55)]" />
            Coding Rocket
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/courses" className="transition hover:text-white">
              Courses
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              Projects
            </Link>
            <Link href="/profile" className="transition hover:text-white">
              About
            </Link>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/courses" className="btn-secondary rounded-full px-5 py-2.5 text-sm">
              Explore
            </Link>
            <Link href="/login" className="btn-primary rounded-full px-5 py-2.5 text-sm">
              Sign in
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 md:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-main-nav"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? "Close" : "Menu"}
          </button>
        </header>

        {mobileNavOpen && (
          <nav
            id="mobile-main-nav"
            className="glass grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 md:hidden"
            aria-label="Mobile"
          >
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              Home
            </Link>
            <Link href="/courses" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              Courses
            </Link>
            <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              Projects
            </Link>
            <Link href="/profile" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              About
            </Link>
          </nav>
        )}

        <div className="flex gap-3 sm:hidden">
          <Link href="/courses" className="btn-secondary flex-1 rounded-full px-4 py-2.5 text-sm">
            Explore
          </Link>
          <Link href="/login" className="btn-primary flex-1 rounded-full px-4 py-2.5 text-sm">
            Sign in
          </Link>
        </div>

        <main className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <section className="max-w-3xl pt-2 sm:pt-10 lg:pt-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent backdrop-blur-xl sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.28em]">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Welcome to the future of learning
            </div>
            <h1 className="max-w-4xl font-display text-3xl font-semibold leading-[1.04] text-white sm:text-5xl lg:text-6xl">
              Coding made
              <span className="block text-accent">simple & easy</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:mt-6 sm:leading-8 sm:text-lg">
              Master programming with guided classes, hands-on projects, and clear support. From first steps to
              confident building, everything is presented in a clean, focused flow.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
              <Link href="/login" className="btn-primary rounded-full px-6 py-3 text-sm sm:px-7">
                Start learning
              </Link>
              <Link href="/courses" className="btn-secondary rounded-full px-6 py-3 text-sm sm:px-7">
                View projects
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:mt-10 sm:grid-cols-3">
              {[
                { value: "Live", label: "guided classes" },
                { value: "Build", label: "practical projects" },
                { value: "Grow", label: "clear support" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[520px] sm:max-w-[620px]">
              <div className="absolute -inset-x-12 -inset-y-10 rounded-full bg-accent/14 blur-[88px]" />
              <div className="absolute inset-x-12 bottom-4 h-28 rounded-full bg-[#ffd8b2]/16 blur-3xl" />
              <RocketModel width="100%" height="clamp(220px, 62vw, 560px)" showStars={false} mobileOptimized />
            </div>
          </aside>
        </main>

        {/* Available courses preview */}
        <section className="mt-8 sm:mt-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.3em]">Available Courses</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-4xl">Browse a few open courses</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:mt-4 sm:leading-7 sm:text-base">See a subset of courses on the homepage - click to view the full catalog or request enrollment.</p>
          </div>

          <CoursePreview />
        </section>

        <section className="pt-4 sm:pt-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.3em]">Featured Projects</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-4xl">Explore what students build</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:mt-4 sm:leading-7 sm:text-base">
              Real work, clear outcomes, and a presentation style that feels calm, modern, and easy to scan.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
            {[
              {
                title: "Live coding class",
                description: "Guided sessions where students follow along, ask questions, and learn by doing.",
                image: "/images/StockCake-Code_Teaching_Session-1396074-standard.jpg",
                tag: "Teaching",
              },
              {
                title: "Neon workspace",
                description: "A focused workspace designed to keep lessons and projects visually clear.",
                image: "/images/StockCake-Neon_Developer_Workspace-1527102-standard.jpg",
                tag: "Workspace",
              },
              {
                title: "Hands-on practice",
                description: "Short, practical exercises that help students turn concepts into muscle memory.",
                image: "/images/StockCake-Neon_Coding_Session-465513-standard.jpg",
                tag: "Practice",
              },
            ].map((project) => (
              <article key={project.title} className="group overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 sm:rounded-[1.9rem]">
                <div className="relative h-60 overflow-hidden sm:h-72">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070816] via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur-md sm:left-5 sm:top-5 sm:text-[0.65rem] sm:tracking-[0.3em]">
                    {project.tag}
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Featured project</p>
                  <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300 sm:leading-7">{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-[1.6rem] p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.28em]">Learning path</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">A simple flow from start to finish</h2>
            <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-3">
              {[
                { title: "1. Explore", body: "Find the right class and understand the starting point." },
                { title: "2. Build", body: "Follow guided lessons and complete practical exercises." },
                { title: "3. Show", body: "Finish with something polished enough to present proudly." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.6rem] p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.28em]">What students get</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">Structured support, without visual clutter</h2>
            <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
              {[
                "Live instruction with clear pacing.",
                "Projects that feel current and usable.",
                "A layout that keeps the focus on content.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 sm:py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
