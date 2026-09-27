import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '@/src/constants/theme';
import { PaymentStatus, SpendType } from '@/src/types';

interface BadgeProps {
  status?: PaymentStatus;
  spendType?: SpendType;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, spendType, label }) => {
  let backgroundColor = COLORS.surfaceSubtle;
  let textColor = COLORS.textSecondary;
  let displayText = label || '';

  if (status) {
    switch (status) {
      case 'paid':
        backgroundColor = COLORS.statusPaidBg;
        textColor = COLORS.statusPaid;
        displayText = 'Paid';
        break;
      case 'part_paid':
        backgroundColor = COLORS.statusPartPaidBg;
        textColor = COLORS.statusPartPaid;
        displayText = 'Part-paid';
        break;
      case 'unpaid':
        backgroundColor = COLORS.statusUnpaidBg;
        textColor = COLORS.statusUnpaid;
        displayText = 'Unpaid';
        break;
    }
  } else if (spendType) {
    if (spendType === 'stock') {
      backgroundColor = '#EEF2FF';
      textColor = '#4F46E5';
      displayText = 'Stock / Inventory';
    } else {
      backgroundColor = '#FEF3C7';
      textColor = '#B45309';
      displayText = 'Running Cost';
    }
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
