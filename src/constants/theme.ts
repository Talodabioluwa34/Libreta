import { LIGHT_THEME, DARK_THEME, ThemeColors } from '@/src/context/ThemeContext';

export { LIGHT_THEME, DARK_THEME, ThemeColors };

// Backwards-compatible default colors (matches LIGHT_THEME)
export const COLORS = {
  // Brand (Deep Pine Forest Green)
  primary: '#00513F',
  primaryLight: '#0A6B54',
  primaryDark: '#00382B',
  primarySurface: '#E6F0EC',

  // Accent (Electric Volt / Citron Lime)
  accent: '#E8FF26',
  accentHover: '#D3EB17',
  accentSurface: '#F7FDCE',
  accentText: '#00382B',
  brandAccent: '#00513F',

  // Neutral & Canvas
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',
  overlay: 'rgba(15, 23, 42, 0.6)',
  shadow: '#0F172A',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status
  statusPaid: '#059669',
  statusPaidBg: '#ECFDF5',
  statusPartPaid: '#D97706',
  statusPartPaidBg: '#FFFBEB',
  statusUnpaid: '#DC2626',
  statusUnpaidBg: '#FEF2F2',

  // Money Movement
  cashIn: '#059669',
  cashOut: '#DC2626',

  // Debt Scale
  debtSurface: '#FEF2F2',
  debtBorder: '#FCA5A5',
  debtText: '#991B1B',
  debtBadge: '#B91C1C',

  // Channels
  paymentCash: '#059669',
  paymentTransfer: '#2563EB',
  paymentTransferBg: '#EFF6FF',
  paymentPOS: '#7C3AED',
  paymentPOSBg: '#F5F3FF',
  whatsapp: '#25D366',
  whatsappBg: '#DCF8C6',

  // Interactive
  buttonDisabled: '#E2E8F0',
  buttonDisabledText: '#94A3B8',
  inputFocus: '#00513F',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

// NOTE: In React Native on Android, NEVER add `fontWeight` when using custom font family names
// that already denote the weight (e.g. PlusJakartaSans_700Bold), or Android falls back to system Roboto!
export const TYPOGRAPHY = {
  titleLarge: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    lineHeight: 34,
    color: '#0F172A',
  },
  titleMedium: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    lineHeight: 26,
    color: '#0F172A',
  },
  titleSmall: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 22,
    color: '#0F172A',
  },
  bodyRegular: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  bodyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  bodyBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
  },
  caption: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
  amountDisplay: {
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    letterSpacing: -0.5,
    color: '#0F172A',
  },
};

export const TOUCH_TARGET = {
  minHeight: 48,
  borderRadius: 14,
};

export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  return '₦' + rounded.toLocaleString('en-NG');
}
