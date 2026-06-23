'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'fadeIn';
  delay?: number; // ms
  threshold?: number; // 0-1
  once?: boolean;
}

/**
 * Scroll-triggered reveal animation using IntersectionObserver.
 * Wraps children and animates them into view when scrolled to.
 */
export function ScrollReveal({
  children,
  className = '',
  animation = 'slideUp',
  delay = 0,
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, once]);

  const animationStyles: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
    slideUp: {
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    slideLeft: {
      from: { opacity: 0, transform: 'translateX(-40px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    slideRight: {
      from: { opacity: 0, transform: 'translateX(40px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.85)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  };

  const style = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(!isVisible ? style.from : style.to),
        transition: `all 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
