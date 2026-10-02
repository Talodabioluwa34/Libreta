import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primarySurface: string;
  accent: string;
  accentSurface: string;
  accentText: string;

  // Background & Surface
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  overlay: string;
  shadow: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Status
  statusPaid: string;
  statusPaidBg: string;
  statusPartPaid: string;
  statusPartPaidBg: string;
  statusUnpaid: string;
  statusUnpaidBg: string;

  // Debt
  debtSurface: string;
  debtBorder: string;
  debtText: string;

  // Actions & Payments
  paymentCash: string;
  paymentCashBg: string;
  paymentTransfer: string;
  paymentTransferBg: string;
  paymentPOS: string;
  paymentPOSBg: string;
  whatsapp: string;

  // Button
  buttonDisabled: string;
  buttonDisabledText: string;
}

export const LIGHT_THEME: ThemeColors = {
  primary: '#00513F',
  primaryLight: '#0A6B54',
  primaryDark: '#00382B',
  primarySurface: '#E6F0EC',
  accent: '#E8FF26',
  accentSurface: '#F7FDCE',
  accentText: '#00382B',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderFocus: '#00513F',
  overlay: 'rgba(15, 23, 42, 0.6)',
  shadow: '#0F172A',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  statusPaid: '#059669',
  statusPaidBg: '#ECFDF5',
  statusPartPaid: '#D97706',
  statusPartPaidBg: '#FFFBEB',
  statusUnpaid: '#DC2626',
  statusUnpaidBg: '#FEF2F2',

  debtSurface: '#FEF2F2',
  debtBorder: '#FCA5A5',
  debtText: '#991B1B',

  paymentCash: '#059669',
  paymentCashBg: '#ECFDF5',
  paymentTransfer: '#2563EB',
  paymentTransferBg: '#EFF6FF',
  paymentPOS: '#7C3AED',
  paymentPOSBg: '#F5F3FF',
  whatsapp: '#25D366',

  buttonDisabled: '#E2E8F0',
  buttonDisabledText: '#94A3B8',
};

export const DARK_THEME: ThemeColors = {
  primary: '#00A87A',
  primaryLight: '#10B981',
  primaryDark: '#00513F',
  primarySurface: '#0B2920',
  accent: '#E8FF26',
  accentSurface: '#2A3600',
  accentText: '#00382B',

  background: '#0B0F17',
  surface: '#151D2A',
  surfaceSubtle: '#1E293B',
  surfaceElevated: '#243248',
  border: '#2A374A',
  borderSubtle: '#1E293B',
  borderFocus: '#00A87A',
  overlay: 'rgba(0, 0, 0, 0.75)',
  shadow: '#000000',

  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0B0F17',

  statusPaid: '#10B981',
  statusPaidBg: 'rgba(16, 185, 129, 0.15)',
  statusPartPaid: '#F59E0B',
  statusPartPaidBg: 'rgba(245, 158, 11, 0.15)',
  statusUnpaid: '#EF4444',
  statusUnpaidBg: 'rgba(239, 68, 68, 0.15)',

  debtSurface: 'rgba(239, 68, 68, 0.12)',
  debtBorder: 'rgba(239, 68, 68, 0.3)',
  debtText: '#FCA5A5',

  paymentCash: '#10B981',
  paymentCashBg: 'rgba(16, 185, 129, 0.15)',
  paymentTransfer: '#3B82F6',
  paymentTransferBg: 'rgba(59, 130, 246, 0.15)',
  paymentPOS: '#8B5CF6',
  paymentPOSBg: 'rgba(139, 92, 246, 0.15)',
  whatsapp: '#25D366',

  buttonDisabled: '#1E293B',
  buttonDisabledText: '#475569',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'libreta_user_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  colors: LIGHT_THEME,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      try {
        let saved: string | null = null;
        if (Platform.OS === 'web') {
          saved = localStorage.getItem(THEME_STORAGE_KEY);
        } else {
          saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        }
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch {
        // Fallback to system default
      }
    })();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } else {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
      }
    } catch {}
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
