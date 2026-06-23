'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="p-2 rounded-xl hover:bg-muted transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}
