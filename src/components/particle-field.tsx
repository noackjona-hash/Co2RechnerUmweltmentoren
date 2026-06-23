'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

/**
 * Interactive particle background canvas.
 * Particles react to mouse movement, creating attraction & repulsion effects.
 * Renders connecting lines between nearby particles.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  const createParticle = useCallback((canvasWidth: number, canvasHeight: number, mouseX?: number, mouseY?: number): Particle => {
    const fromMouse = mouseX !== undefined && mouseY !== undefined;
    return {
      x: fromMouse ? mouseX + (Math.random() - 0.5) * 30 : Math.random() * canvasWidth,
      y: fromMouse ? mouseY + (Math.random() - 0.5) * 30 : Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * (fromMouse ? 2 : 0.5),
      vy: (Math.random() - 0.5) * (fromMouse ? 2 : 0.5) - (fromMouse ? 1 : 0),
      size: Math.random() * 2.5 + 0.5,
      opacity: fromMouse ? 0.8 : Math.random() * 0.4 + 0.1,
      hue: 160 + Math.random() * 40, // emerald to cyan
      life: 0,
      maxLife: fromMouse ? 60 + Math.random() * 40 : 999999,
    };
  }, []);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize particles
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, canvas.height)
    );

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    // Click to spawn burst
    let clickCooldown = false;
    const handleClick = (e: MouseEvent) => {
      if (clickCooldown) return;
      clickCooldown = true;
      setTimeout(() => { clickCooldown = false; }, 200);

      for (let i = 0; i < 8; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height, e.clientX, e.clientY));
      }
    };
    document.addEventListener('click', handleClick);

    // Animation loop
    let rafId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Remove expired particles
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Mouse interaction: gentle attraction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 20) {
            const force = 0.02 / (dist * 0.01);
            p.vx += dx * force * 0.001;
            p.vy += dy * force * 0.001;
          }
          // Repulsion when very close
          if (dist < 40) {
            p.vx -= dx * 0.003;
            p.vy -= dy * 0.003;
          }
        }

        // Drift
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Fade for mortal particles
        const lifeFade = p.maxLife < 999999 ? Math.max(0, 1 - p.life / p.maxLife) : 1;
        const alpha = p.opacity * lifeFade;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha * 0.1})`;
        ctx.fill();
      }

      // Connect nearby particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(165, 60%, 50%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse glow ring
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        gradient.addColorStop(0, 'hsla(165, 70%, 50%, 0.04)');
        gradient.addColorStop(0.5, 'hsla(165, 70%, 50%, 0.02)');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-5 pointer-events-none"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
