export const COLORS = {
  // Brand & Backgrounds
  primary: '#0F172A', // Slate 900 (High contrast, professional)
  primaryLight: '#1E293B',
  brandAccent: '#10B981', // Vibrant Emerald (Finnancial growth)
  background: '#F8FAFC', // Slate 50 (Crisp, clean canvas)
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

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
  debtBadge: '#B91C1C',

  // Interactive
  buttonDisabled: '#94A3B8',
  inputFocus: '#2563EB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const TYPOGRAPHY = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: COLORS.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: COLORS.textPrimary,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  bodyRegular: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  amountDisplay: {
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
