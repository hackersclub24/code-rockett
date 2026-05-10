'use client';

import { useEffect, useRef, useState } from 'react';

type Burst = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
};

function createBurst(x: number, y: number): Burst {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.5 + Math.random() * 3.5;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: 0.04 + Math.random() * 0.02,
    size: 2 + Math.random() * 3,
  };
}

export function GlobalCursor() {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Burst[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const pressingRef = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const originalCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = 'none';

    const updatePosition = (x: number, y: number) => {
      targetRef.current = { x, y };
      setVisible(true);
    };

    const spawnBurst = (x: number, y: number) => {
      setParticles((current) => [...current, ...Array.from({ length: 12 }, () => createBurst(x, y))]);
    };

    const onMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const onEnter = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const onLeave = () => {
      setVisible(false);
      pressingRef.current = false;
    };

    const onDown = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
      pressingRef.current = true;
      spawnBurst(event.clientX, event.clientY);
    };

    const onUp = () => {
      pressingRef.current = false;
    };

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.18;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.18;

      const { x, y } = currentRef.current;
      const movementLift = Math.hypot(targetRef.current.x - x, targetRef.current.y - y);
      const stretch = Math.min(0.14, movementLift / 2600);
      const isPressing = pressingRef.current;
      const cursorScale = (isPressing ? 0.9 : 1) + stretch;
      const ringScale = (isPressing ? 0.82 : 1) - stretch * 0.2;

      cursor.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${cursorScale})`;
      ring.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${ringScale})`;

      setParticles((current) =>
        current
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.96,
            vy: particle.vy * 0.96,
            life: particle.life - particle.decay,
          }))
          .filter((particle) => particle.life > 0),
      );

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    updatePosition(window.innerWidth / 2, window.innerHeight / 2);
    animate();

    return () => {
      document.documentElement.style.cursor = originalCursor;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      <div
        ref={cursorRef}
        className={`absolute h-3 w-3 rounded-full bg-[#fff3ff] shadow-[0_0_16px_rgba(255,243,255,0.72)] transition-opacity duration-100 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: 0, top: 0 }}
      />
      <div
        ref={ringRef}
        className={`absolute h-12 w-12 rounded-full border border-[#f3c8ff]/70 transition-opacity duration-100 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: 0, top: 0, transform: 'translate(-50%, -50%) scale(1)' }}
      />
      {particles.map((particle, index) => (
        <span
          key={`${index}-${particle.life.toFixed(2)}`}
          className="absolute rounded-full bg-[#ffe6c9]"
          style={{
            left: particle.x,
            top: particle.y,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: Math.max(0, Math.min(1, particle.life)),
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
