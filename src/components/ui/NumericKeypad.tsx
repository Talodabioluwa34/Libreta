import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { triggerHaptic } from '@/src/utils/feedback';
import { Delete, RotateCcw } from 'lucide-react-native';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onIncrement?: (amount: number) => void;
  quickIncrements?: number[];
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onIncrement,
  quickIncrements = [500, 1000, 2000, 5000],
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();

  const handleKey = (key: string) => {
    if (disabled) return;
    triggerHaptic('light');
    onKeyPress(key);
  };

  const handleIncrement = (amount: number) => {
    if (disabled) return;
    triggerHaptic('medium');
    if (onIncrement) {
      onIncrement(amount);
    }
  };

  return (
    <View style={styles.container}>
      {/* Quick Denomination Chips */}
      {quickIncrements && quickIncrements.length > 0 && (
        <View style={styles.quickChipRow}>
          <TouchableOpacity
            style={[
              styles.clearChip,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={() => handleKey('clear')}
          >
            <RotateCcw size={12} color={colors.textSecondary} />
            <Text style={[styles.clearChipText, { color: colors.textSecondary }]}>Clear</Text>
          </TouchableOpacity>

          {quickIncrements.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.quickChip,
                { backgroundColor: colors.primarySurface, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
              onPress={() => handleIncrement(amt)}
            >
              <Text style={[styles.quickChipText, { color: colors.primary }]}>
                +₦{amt.toLocaleString('en-NG')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 4x3 Keypad Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.row}>
          {['1', '2', '3'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={[
                styles.key,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowOpacity: isDark ? 0 : 0.04,
                },
              ]}
              activeOpacity={0.65}
              onPress={() => handleKey(digit)}
            >
              <Text style={[styles.keyText, { color: colors.textPrimary }]}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          {['4', '5', '6'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={[
                styles.key,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowOpacity: isDark ? 0 : 0.04,
                },
              ]}
              activeOpacity={0.65}
              onPress={() => handleKey(digit)}
            >
              <Text style={[styles.keyText, { color: colors.textPrimary }]}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          {['7', '8', '9'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={[
                styles.key,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowOpacity: isDark ? 0 : 0.04,
                },
              ]}
              activeOpacity={0.65}
              onPress={() => handleKey(digit)}
            >
              <Text style={[styles.keyText, { color: colors.textPrimary }]}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Row 4: 00, 0, Backspace */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.key,
              styles.specialKey,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.65}
            onPress={() => handleKey('00')}
          >
            <Text style={[styles.specialKeyText, { color: colors.textSecondary }]}>00</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.key,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowOpacity: isDark ? 0 : 0.04,
              },
            ]}
            activeOpacity={0.65}
            onPress={() => handleKey('0')}
          >
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.key,
              styles.specialKey,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.65}
            onPress={() => handleKey('backspace')}
          >
            <Delete size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 4,
  },
  quickChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 6,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 9,
    height: 32,
    justifyContent: 'center',
  },
  clearChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },
  quickChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  key: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  keyText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  specialKey: {
    borderWidth: 1,
  },
  specialKeyText: {
    fontFamily: FONTS.bold,
    fontSize: 17,
  },
});
