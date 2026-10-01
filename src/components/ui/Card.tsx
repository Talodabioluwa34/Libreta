import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, TOUCH_TARGET } from '@/src/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'flat',
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outline' && styles.outline,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: TOUCH_TARGET.borderRadius,
    padding: 16,
  },
  elevated: {
    backgroundColor: COLORS.surface,
  },
  outline: {
    backgroundColor: COLORS.surfaceSubtle,
  },
});
