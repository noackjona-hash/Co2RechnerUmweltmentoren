'use client';

import { useState, useEffect } from 'react';

/**
 * Lightweight, child-friendly ambient background.
 * Uses GPU-accelerated CSS animations instead of high-frequency canvas loops.
 * Extremely battery- and CPU-friendly on school tablets and Chromebooks.
 */
export function ParticleField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const items = [
    { icon: '🍃', size: 'text-xl', left: '8%', top: '15%', delay: '0s', duration: '7s' },
    { icon: '🌱', size: 'text-lg', left: '88%', top: '22%', delay: '1.5s', duration: '8s' },
    { icon: '✨', size: 'text-sm', left: '18%', top: '65%', delay: '2s', duration: '6s' },
    { icon: '🌿', size: 'text-xl', left: '82%', top: '75%', delay: '3.2s', duration: '9s' },
    { icon: '☀️', size: 'text-base', left: '92%', top: '10%', delay: '0.8s', duration: '7.5s' },
    { icon: '💧', size: 'text-sm', left: '12%', top: '40%', delay: '2.5s', duration: '8.5s' },
    { icon: '🌍', size: 'text-lg', left: '4%', top: '82%', delay: '1.2s', duration: '10s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Soft ambient gradient spots */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/15 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-teal-300/15 dark:bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-cyan-300/15 dark:bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Floating friendly eco emojis */}
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`absolute ${item.size} opacity-40 dark:opacity-20 animate-float-leaf transition-transform`}
          style={{
            left: item.left,
            top: item.top,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}
