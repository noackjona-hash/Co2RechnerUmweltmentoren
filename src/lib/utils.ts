import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAccessKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format: XXXX-XXXX
  return `${result.slice(0, 4)}-${result.slice(4)}`;
}

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format: XXXX-XXXX-XXXX-XXXX
  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12)}`;
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`;
  }
  return `${Math.round(kg)} kg`;
}

export const CATEGORIES = {
  mobility: {
    label: 'Mobilität',
    icon: '🚗',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-500',
  },
  food: {
    label: 'Ernährung',
    icon: '🥗',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-500',
  },
  energy: {
    label: 'Energie',
    icon: '⚡',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
  },
  consumption: {
    label: 'Konsum',
    icon: '🛍️',
    color: '#a855f7',
    gradient: 'from-purple-500 to-pink-500',
  },
  public: {
    label: 'Öffentliche Hand',
    icon: '🏛️',
    color: '#64748b',
    gradient: 'from-slate-500 to-zinc-500',
  },
} as const;

export type Category = keyof typeof CATEGORIES;

export {
  CO2_BASE_PAUSCHALEN,
  TOTAL_BASE_PAUSCHALE,
  calculateStudentCategoryTotals,
  calculateStudentTotalCo2,
} from './co2-calculator';

// German national average: ~10.5 tonnes CO2e per capita per year (Umweltbundesamt)
export const NATIONAL_AVERAGE_CO2 = 10500; // kg
// Climate target 2050: ~2 tonnes (Paris 1.5°C)
export const CLIMATE_TARGET_CO2 = 2000; // kg

