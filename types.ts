
export type TransactionType = 'asset' | 'debt';
export type InterestType = 'simple' | 'compound_daily' | 'compound_yearly';

export interface Transaction {
  id: string;
  item: string;
  cost: number;
  type: TransactionType;
  category: string;
  date: string;
  bank?: string;
  note?: string;
  totalInstallments?: number;
  installmentsPaid?: number;
  isInterest?: boolean;
  interestRate?: number;
  interestType?: InterestType;
  startDate?: string;
  createdAt: number;
  updatedAt: number;
  familyId: string;
}

export interface TabConfig {
  id: string;
  label: string;
  iconKey: string;
  includeInProjection: boolean;
}

export interface ThemeColors {
  label: string;
  bgHeader: string;
  bgHeaderLight: string;
  textHeaderLight: string;
  textPrimary: string;
  textSecondary: string;
  bgPrimary: string;
  bgPrimaryHover: string;
  bgGradient: string;
  shadowPrimary: string;
  bgSoft: string;
  bgSoftHover: string;
  borderSoft: string;
  borderStrong: string;
  ring: string;
  iconColor: string;
}

export type StorageMode = 'local' | 'cloud';
