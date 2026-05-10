'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  op: number;
  spd: number;
  ph: number;
}

interface RocketAnimationProps {
  width?: string | number;
  height?: number;
  showButton?: boolean;
  autoLaunch?: boolean;
  onLaunchComplete?: () => void;
}

const EXHAUST_COLORS = ['#f97316', '#fb923c', '#fbbf24', '#a855f7', '#c084fc'];
const CONFETTI_COLORS = ['#a855f7', '#f97316', '#fff', '#c084fc', '#fbbf24'];
const TAU = Math.PI * 2;

export default function RocketAnimation({
  width = '100%',
  height = 520,
  showButton = true,
  autoLaunch = false,
  onLaunchComplete,
}: RocketAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef({
    launched: false,
    frame: 0,
    particles: [] as Particle[],
    rings: [] as Ring[],
    stars: [] as Star[],
    rocket: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      launching: false,
      done: false,
      t: 0,
    },
    rafId: 0,
    W: 0,
    H: 0,
  });

  const initStars = useCallback((w: number, h: number) => {
    stateRef.current.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      op: Math.random() * 0.5 + 0.1,
      spd: Math.random() * 0.015 + 0.003,
      ph: Math.random() * TAU,
    }));
  }, []);

  const spawnExhaust = useCallback(() => {
    const state = stateRef.current;
    const tail = state.rocket.angle + Math.PI;
    for (let index = 0; index < 3; index += 1) {
      const spread = (Math.random() - 0.5) * 0.6;
      const speed = Math.random() * 2.5 + 1;
      state.particles.push({
        x: state.rocket.x + Math.cos(tail) * 14,
        y: state.rocket.y + Math.sin(tail) * 14,
        vx: Math.cos(tail + spread) * speed,
        vy: Math.sin(tail + spread) * speed,
        life: 1,
        decay: Math.random() * 0.04 + 0.025,
        size: Math.random() * 3 + 1,
        color: EXHAUST_COLORS[Math.floor(Math.random() * EXHAUST_COLORS.length)],
      });
    }
  }, []);

  const spawnRing = useCallback((x: number, y: number) => {
    stateRef.current.rings.push({ x, y, r: 0, maxR: 80, life: 1 });
  }, []);

  const drawRocket = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(8, -10, 8, 6, 6, 14);
    ctx.lineTo(-6, 14);
    ctx.bezierCurveTo(-8, 6, -8, -10, 0, -22);
    ctx.closePath();
    ctx.fillStyle = '#e8e8f0';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(5, -14, 5, -6, 4, 0);
    ctx.lineTo(-4, 0);
    ctx.bezierCurveTo(-5, -6, -5, -14, 0, -22);
    ctx.closePath();
    ctx.fillStyle = '#a855f7';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.lineTo(14, 18);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-14, 18);
    ctx.lineTo(-6, 14);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 4, 4, 0, TAU);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-1, 3, 2, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    ctx.restore();
  }, []);

  const doLaunch = useCallback(() => {
    const state = stateRef.current;
    if (state.launched) return;
    state.launched = true;
    state.rocket.x = state.W / 2;
    state.rocket.y = state.H * 0.72;
    state.rocket.vx = 0;
    state.rocket.vy = 0;
    state.rocket.angle = -Math.PI / 2;
    state.rocket.launching = true;
    state.rocket.done = false;
    state.rocket.t = 0;
    if (btnRef.current) {
      btnRef.current.style.opacity = '0';
      btnRef.current.style.pointerEvents = 'none';
    }
    spawnRing(state.W / 2, state.H * 0.72);
  }, [spawnRing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;

    const resize = () => {
      state.W = canvas.width = wrap.offsetWidth;
      state.H = canvas.height = wrap.offsetHeight;
      initStars(state.W, state.H);
    };

    resize();
    window.addEventListener('resize', resize);

    if (autoLaunch) {
      window.setTimeout(doLaunch, 800);
    }

    const loop = () => {
      state.rafId = window.requestAnimationFrame(loop);
      state.frame += 1;
      ctx.clearRect(0, 0, state.W, state.H);

      ctx.fillStyle = '#07070f';
      ctx.fillRect(0, 0, state.W, state.H);

      state.stars.forEach((star) => {
        const opacity = star.op + Math.sin(state.frame * star.spd + star.ph) * 0.2;
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, TAU);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      state.rings.forEach((ring) => {
        ring.r += 3;
        ring.life -= 0.025;
        ctx.save();
        ctx.globalAlpha = ring.life * 0.6;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, TAU);
        ctx.stroke();
        ctx.restore();
      });
      state.rings = state.rings.filter((ring) => ring.life > 0);

      if (state.launched && state.rocket.launching) {
        state.rocket.t += 1;

        if (state.rocket.t < 30) {
          const scale = state.rocket.t / 30;
          drawRocket(ctx, state.rocket.x, state.rocket.y, state.rocket.angle, scale);
          if (state.rocket.t % 3 === 0) spawnRing(state.rocket.x, state.rocket.y + 10);
        } else {
          const progress = (state.rocket.t - 30) / 180;
          const wobble = Math.sin(state.rocket.t * 0.15) * 0.12 * (1 - Math.min(progress, 1));
          state.rocket.vy = -3.5 * Math.min(progress * 2, 1) - 1.5;
          state.rocket.vx = Math.sin(state.rocket.t * 0.04) * 0.8;
          state.rocket.angle = -Math.PI / 2 + wobble + state.rocket.vx * 0.3;
          state.rocket.x += state.rocket.vx;
          state.rocket.y += state.rocket.vy;
          spawnExhaust();

          if (state.rocket.y < -60) {
            state.rocket.launching = false;
            state.rocket.done = true;
            onLaunchComplete?.();
            window.setTimeout(() => {
              state.launched = false;
              state.particles = [];
              if (btnRef.current) {
                btnRef.current.style.opacity = '1';
                btnRef.current.style.pointerEvents = 'auto';
              }
              for (let index = 0; index < 30; index += 1) {
                const angle = Math.random() * TAU;
                const speed = Math.random() * 4 + 2;
                state.particles.push({
                  x: state.W / 2,
                  y: state.H / 2,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed - 2,
                  life: 1,
                  decay: Math.random() * 0.02 + 0.01,
                  size: Math.random() * 3 + 1,
                  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                });
              }
            }, 400);
          }

          if (!state.rocket.done) {
            drawRocket(ctx, state.rocket.x, state.rocket.y, state.rocket.angle, 1);
          }
        }
      }

      state.particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.07;
        particle.vx *= 0.97;
        particle.life -= particle.decay;
        const radius = Math.max(0, particle.size * particle.life);
        ctx.save();
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius, 0, TAU);
        ctx.fill();
        if (particle.size > 1.5) {
          ctx.globalAlpha *= 0.25;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, radius * 2.5, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      });
      state.particles = state.particles.filter((particle) => particle.life > 0);
    };

    loop();

    return () => {
      window.cancelAnimationFrame(state.rafId);
      window.removeEventListener('resize', resize);
    };
  }, [autoLaunch, doLaunch, drawRocket, initStars, onLaunchComplete, spawnExhaust, spawnRing]);

  return (
    <div
      ref={wrapRef}
      style={{
        background: '#07070f',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', pointerEvents: 'none', userSelect: 'none' }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Code{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #a855f7, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Rockett
          </span>
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.2em',
            marginTop: '10px',
            textTransform: 'uppercase',
          }}
        >
          learn &nbsp;·&nbsp; build &nbsp;·&nbsp; launch
        </div>
      </div>

      {showButton && (
        <button
          ref={btnRef}
          onClick={doLaunch}
          style={{
            position: 'relative',
            zIndex: 5,
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: '100px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'transform 0.2s, opacity 0.2s',
          }}
          onMouseEnter={(event) => (event.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(event) => (event.currentTarget.style.transform = 'translateY(0)')}
        >
          Launch rocket
        </button>
      )}
    </div>
  );
}
