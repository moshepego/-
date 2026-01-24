
import React from 'react';
import { 
  Building2, Calendar, PiggyBank, Baby, User, Wallet, Home, ShoppingCart, 
  Car, Coffee, Heart, Briefcase, GraduationCap, Plane, Dumbbell, Gift, Tag
} from 'lucide-react';
import { ThemeColors, TabConfig } from './types';

export const BANK_OPTIONS = [
  "לאומי", "הפועלים", "וואן זירו", "מקס", "כאל", "ישראכרט", "מזרחי טפחות", "דיסקונט", "בינלאומי"
];

// Default ID is now handled dynamically in App.tsx
export const DEFAULT_FAMILY_ID = 'SF'; 

export const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 size={16} />,
  Calendar: <Calendar size={16} />,
  PiggyBank: <PiggyBank size={16} />,
  Baby: <Baby size={16} />,
  User: <User size={16} />,
  Wallet: <Wallet size={16} />,
  Home: <Home size={16} />,
  ShoppingCart: <ShoppingCart size={16} />,
  Car: <Car size={16} />,
  Coffee: <Coffee size={16} />,
  Heart: <Heart size={16} />,
  Briefcase: <Briefcase size={16} />,
  GraduationCap: <GraduationCap size={16} />,
  Plane: <Plane size={16} />,
  Dumbbell: <Dumbbell size={16} />,
  Gift: <Gift size={16} />,
  Tag: <Tag size={16} />
};

export const DEFAULT_TABS: TabConfig[] = [
  { id: 'apartment', label: 'דירה', iconKey: 'Building2', includeInProjection: true },
  { id: 'monthly', label: 'שוטף', iconKey: 'Calendar', includeInProjection: false },
  { id: 'savings', label: 'חיסכון', iconKey: 'PiggyBank', includeInProjection: true },
  { id: 'personal', label: 'אישי', iconKey: 'User', includeInProjection: true }
];

export const THEMES: Record<string, ThemeColors> = {
  indigo: {
    label: 'אינדיגו',
    bgHeader: 'bg-indigo-700',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-indigo-200',
    textPrimary: 'text-indigo-600',
    textSecondary: 'text-indigo-400',
    bgPrimary: 'bg-indigo-600',
    bgPrimaryHover: 'hover:bg-indigo-700',
    bgGradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    shadowPrimary: 'shadow-indigo-200',
    bgSoft: 'bg-indigo-50',
    bgSoftHover: 'hover:bg-indigo-100',
    borderSoft: 'border-indigo-100',
    borderStrong: 'border-indigo-200',
    ring: 'focus:ring-indigo-500',
    iconColor: 'text-indigo-300'
  },
  emerald: {
    label: 'ירוק',
    bgHeader: 'bg-emerald-700',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-emerald-200',
    textPrimary: 'text-emerald-600',
    textSecondary: 'text-emerald-400',
    bgPrimary: 'bg-emerald-600',
    bgPrimaryHover: 'hover:bg-emerald-700',
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    shadowPrimary: 'shadow-emerald-200',
    bgSoft: 'bg-emerald-50',
    bgSoftHover: 'hover:bg-emerald-100',
    borderSoft: 'border-emerald-100',
    borderStrong: 'border-emerald-200',
    ring: 'focus:ring-emerald-500',
    iconColor: 'text-emerald-300'
  },
  violet: {
    label: 'סגול',
    bgHeader: 'bg-violet-700',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-violet-200',
    textPrimary: 'text-violet-600',
    textSecondary: 'text-violet-400',
    bgPrimary: 'bg-violet-600',
    bgPrimaryHover: 'hover:bg-violet-700',
    bgGradient: 'bg-gradient-to-br from-violet-500 to-violet-700',
    shadowPrimary: 'shadow-violet-200',
    bgSoft: 'bg-violet-50',
    bgSoftHover: 'hover:bg-violet-100',
    borderSoft: 'border-violet-100',
    borderStrong: 'border-violet-200',
    ring: 'focus:ring-violet-500',
    iconColor: 'text-violet-300'
  },
  amber: {
    label: 'ענבר',
    bgHeader: 'bg-amber-600',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-amber-100',
    textPrimary: 'text-amber-600',
    textSecondary: 'text-amber-400',
    bgPrimary: 'bg-amber-500',
    bgPrimaryHover: 'hover:bg-amber-600',
    bgGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
    shadowPrimary: 'shadow-amber-200',
    bgSoft: 'bg-amber-50',
    bgSoftHover: 'hover:bg-amber-100',
    borderSoft: 'border-amber-100',
    borderStrong: 'border-amber-200',
    ring: 'focus:ring-amber-500',
    iconColor: 'text-amber-300'
  },
  orange: {
    label: 'כתום',
    bgHeader: 'bg-orange-600',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-orange-100',
    textPrimary: 'text-orange-600',
    textSecondary: 'text-orange-400',
    bgPrimary: 'bg-orange-500',
    bgPrimaryHover: 'hover:bg-orange-600',
    bgGradient: 'bg-gradient-to-br from-orange-400 to-orange-600',
    shadowPrimary: 'shadow-orange-200',
    bgSoft: 'bg-orange-50',
    bgSoftHover: 'hover:bg-orange-100',
    borderSoft: 'border-orange-100',
    borderStrong: 'border-orange-200',
    ring: 'focus:ring-orange-500',
    iconColor: 'text-orange-300'
  },
  teal: {
    label: 'טורקיז',
    bgHeader: 'bg-teal-700',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-teal-200',
    textPrimary: 'text-teal-600',
    textSecondary: 'text-teal-400',
    bgPrimary: 'bg-teal-600',
    bgPrimaryHover: 'hover:bg-teal-700',
    bgGradient: 'bg-gradient-to-br from-teal-500 to-teal-700',
    shadowPrimary: 'shadow-teal-200',
    bgSoft: 'bg-teal-50',
    bgSoftHover: 'hover:bg-teal-100',
    borderSoft: 'border-teal-100',
    borderStrong: 'border-teal-200',
    ring: 'focus:ring-teal-500',
    iconColor: 'text-teal-300'
  },
  fuchsia: {
    label: 'פוקסיה',
    bgHeader: 'bg-fuchsia-700',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-fuchsia-200',
    textPrimary: 'text-fuchsia-600',
    textSecondary: 'text-fuchsia-400',
    bgPrimary: 'bg-fuchsia-600',
    bgPrimaryHover: 'hover:bg-fuchsia-700',
    bgGradient: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700',
    shadowPrimary: 'shadow-fuchsia-200',
    bgSoft: 'bg-fuchsia-50',
    bgSoftHover: 'hover:bg-fuchsia-100',
    borderSoft: 'border-fuchsia-100',
    borderStrong: 'border-fuchsia-200',
    ring: 'focus:ring-fuchsia-500',
    iconColor: 'text-fuchsia-300'
  },
  rose: {
    label: 'ורוד',
    bgHeader: 'bg-rose-600',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-rose-200',
    textPrimary: 'text-rose-600',
    textSecondary: 'text-rose-400',
    bgPrimary: 'bg-rose-500',
    bgPrimaryHover: 'hover:bg-rose-600',
    bgGradient: 'bg-gradient-to-br from-rose-400 to-rose-600',
    shadowPrimary: 'shadow-rose-200',
    bgSoft: 'bg-rose-50',
    bgSoftHover: 'hover:bg-rose-100',
    borderSoft: 'border-rose-100',
    borderStrong: 'border-rose-200',
    ring: 'focus:ring-rose-500',
    iconColor: 'text-rose-300'
  },
  slate: {
    label: 'פחם',
    bgHeader: 'bg-slate-800',
    bgHeaderLight: 'bg-white/10',
    textHeaderLight: 'text-slate-300',
    textPrimary: 'text-slate-700',
    textSecondary: 'text-slate-500',
    bgPrimary: 'bg-slate-700',
    bgPrimaryHover: 'hover:bg-slate-800',
    bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800',
    shadowPrimary: 'shadow-slate-200',
    bgSoft: 'bg-slate-50',
    bgSoftHover: 'hover:bg-slate-100',
    borderSoft: 'border-slate-200',
    borderStrong: 'border-slate-300',
    ring: 'focus:ring-slate-500',
    iconColor: 'text-slate-400'
  }
};
