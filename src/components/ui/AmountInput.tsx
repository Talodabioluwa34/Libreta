import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';

interface AmountInputProps {
  value: string;
  onChangeValue: (val: string) => void;
  label?: string;
  error?: string;
  quickAmounts?: number[];
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeValue,
  label = 'Amount',
  error,
  quickAmounts = [500, 1000, 2000, 5000, 10000],
}) => {
  const handleNumericInput = (text: string) => {
    // Keep only numbers
    const clean = text.replace(/[^0-9]/g, '');
    onChangeValue(clean);
  };

  const formattedDisplay = value ? parseInt(value, 10).toLocaleString('en-NG') : '';

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputBox, error ? styles.inputError : null]}>
        <Text style={styles.currencyPrefix}>₦</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          value={formattedDisplay}
          onChangeText={handleNumericInput}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          autoFocus={false}
          maxLength={10}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Quick selection chips for fast market recording */}
      {quickAmounts.length > 0 ? (
        <View style={styles.chipsRow}>
          {quickAmounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              activeOpacity={0.7}
              onPress={() => onChangeValue(amt.toString())}
              style={styles.chip}
            >
              <Text style={styles.chipText}>+₦{amt.toLocaleString('en-NG')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 16,
    height: 64,
  },
  inputError: {
    borderColor: COLORS.statusUnpaid,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
