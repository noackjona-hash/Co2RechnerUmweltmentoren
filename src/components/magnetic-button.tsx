'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number; // px displacement, default 8
  as?: 'button' | 'a' | 'div';
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

/**
 * Button that magnetically attracts towards the cursor on hover.
 * The element smoothly displaces towards the mouse position.
 */
export function MagneticButton({
  children,
  className = '',
  strength = 8,
  as: Component = 'button',
  onClick,
  href,
  type,
  disabled,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current || disabled) return;
    if (!rectRef.current) rectRef.current = ref.current.getBoundingClientRect();
    const rect = rectRef.current;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * (strength / 40)}px, ${y * (strength / 40)}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    rectRef.current = null;
    ref.current.style.transform = 'translate(0px, 0px)';
    ref.current.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    setTimeout(() => {
      if (ref.current) ref.current.style.transition = 'transform 0.15s ease-out';
    }, 400);
  };

  const handleMouseEnter = () => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.15s ease-out';
    rectRef.current = ref.current.getBoundingClientRect();
  };

  const props = {
    ref: ref as any,
    className,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onMouseEnter: handleMouseEnter,
    onClick,
    href,
    type,
    disabled,
    style: { willChange: 'transform' as const },
  };

  return <Component {...props}>{children}</Component>;
}
