'use client';

import { useRef, useEffect, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // 1-30, default 12
  glare?: boolean;
  scale?: number; // hover scale, default 1.02
}

/**
 * 3D perspective tilt card that follows mouse position.
 * Includes optional glare overlay effect.
 */
export function TiltCard({
  children,
  className = '',
  intensity = 12,
  glare = true,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let rect: DOMRect | null = null;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

        if (glareRef.current && rect) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
          glareRef.current.style.opacity = '1';
        }
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId);
      rect = null;
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      if (glareRef.current) {
        glareRef.current.style.opacity = '0';
      }
      setTimeout(() => {
        if (card) card.style.transition = 'transform 0.1s ease-out';
      }, 500);
    };

    const handleMouseEnter = () => {
      card.style.transition = 'transform 0.1s ease-out';
      rect = card.getBoundingClientRect();
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [intensity, scale]);

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      )}
    </div>
  );
}
