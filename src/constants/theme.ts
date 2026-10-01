export const COLORS = {
  // Brand (Deep Pine Forest Green)
  primary: '#00513F', // Brand Core (Rich, authoritative Nigerian forest green)
  primaryLight: '#0A6B54',
  primaryDark: '#003B2E',
  primaryDeep: '#00241C',
  primarySurface: '#E6F0EC', // Subtle green tint for light containers

  // Accent (Electric Volt / Citron Lime)
  accent: '#E8FF26', // High-energy neon volt accent
  accentHover: '#D3EB17',
  accentSurface: '#F7FDCE', // Soft pastel lime tint for chips/light badges
  accentText: '#00382B', // Dark contrast text required on top of #E8FF26
  brandAccent: '#00513F', // Backwards-compatible alias for primary brand accent

  // Neutral & Canvas
  background: '#F8FAFC', // Slate 50 (Crisp, clean canvas)
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Slate 100
  border: '#E2E8F0', // Slate 200
  borderDark: '#CBD5E1', // Slate 300
  overlay: 'rgba(15, 23, 42, 0.65)',
  shadow: '#0F172A',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status & Transaction Colors (High Visibility)
  statusPaid: '#059669', // Emerald
  statusPaidBg: '#ECFDF5',
  statusPartPaid: '#D97706', // Amber
  statusPartPaidBg: '#FFFBEB',
  statusUnpaid: '#DC2626', // Crimson / Red
  statusUnpaidBg: '#FEF2F2',

  // Money Movement
  cashIn: '#059669',
  cashOut: '#DC2626',

  // Urgent Debt / Owes Alert Scale
  debtSurface: '#FEF2F2',
  debtBorder: '#FCA5A5',
  debtText: '#991B1B',
  debtBadge: '#B91C1C',

  // PRD §8.9: Expense Categories
  stockSpend: '#4F46E5', // Indigo (Inventory asset restock)
  stockSpendBg: '#EEF2FF',
  runningCost: '#D97706', // Amber (Sunk running overhead / fuel / rent)
  runningCostBg: '#FFFBEB',

  // Nigerian Payment Channels
  paymentCash: '#059669',
  paymentTransfer: '#2563EB', // Bank Blue
  paymentTransferBg: '#EFF6FF',
  paymentPOS: '#7C3AED', // POS Purple
  paymentPOSBg: '#F5F3FF',

  // External & Messaging
  whatsapp: '#25D366', // WhatsApp official green
  whatsappBg: '#DCF8C6',
  whatsappDark: '#128C7E',

  // Offline / Cloud Sync Status (The Trust Pillar)
  syncOnline: '#059669',
  syncPending: '#D97706',
  syncOffline: '#64748B',

  // Interactive
  buttonDisabled: '#CBD5E1',
  buttonDisabledText: '#94A3B8',
  inputFocus: '#00513F',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const TYPOGRAPHY = {
  titleLarge: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: COLORS.textPrimary,
  },
  titleMedium: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: COLORS.textPrimary,
  },
  titleSmall: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  bodyRegular: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  bodyBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  caption: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  amountDisplay: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
};

export const TOUCH_TARGET = {
  minHeight: 48,
  borderRadius: 12,
};

export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  return '₦' + rounded.toLocaleString('en-NG');
}
