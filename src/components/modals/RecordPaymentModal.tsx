import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTransactions } from '@/src/context/TransactionContext';
import { COLORS, formatNaira, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';
import { Button } from '@/src/components/ui/Button';
import { Customer, PaymentMethod } from '@/src/types';
import { X, CheckCircle2, User } from 'lucide-react-native';

interface RecordPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
}

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'POS', value: 'pos' },
  { label: 'Other', value: 'other' },
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  preselectedCustomer,
}) => {
  const { customers, recordPayment } = useTransactions();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Find currently selected customer
  const currentCustomer =
    customers.find((c) => c.id === (preselectedCustomer?.id || selectedCustomerId)) ||
    customers.find((c) => (c.outstanding_balance || 0) > 0);

  const activeCustId = currentCustomer?.id || '';
  const currentDebt = currentCustomer?.outstanding_balance || 0;
  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);

  const handleFullPay = () => {
    setAmount(currentDebt.toString());
    setError('');
  };

  const handleHalfPay = () => {
    setAmount(Math.round(currentDebt / 2).toString());
    setError('');
  };

  const handleSave = () => {
    if (!activeCustId) {
      setError('Please select a customer');
      return;
    }
    if (numericAmount <= 0) {
      setError('Please enter a payment amount');
      return;
    }
    // Business rule check (PRD §8.7)
    if (numericAmount > currentDebt) {
      setError(`Payment cannot exceed customer's outstanding debt of ${formatNaira(currentDebt)}`);
      return;
    }

    const res = recordPayment({
      customerId: activeCustId,
      amount: numericAmount,
      method: paymentMethod,
      note: note.trim() || undefined,
    });

    if (res.success) {
      resetForm();
      onClose();
    } else {
      setError(res.error || 'Failed to record payment');
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setError('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <CheckCircle2 size={20} color={COLORS.brandAccent} />
              </View>
              <Text style={styles.sheetTitle}>Record Debt Payment</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Customer Selector if not preselected */}
            {!preselectedCustomer ? (
              <View style={styles.field}>
                <Text style={styles.label}>Select Debtor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {customers
                    .filter((c) => (c.outstanding_balance || 0) > 0)
                    .map((c) => {
                      const isSelected = activeCustId === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.customerChip, isSelected && styles.customerChipSelected]}
                          onPress={() => {
                            setSelectedCustomerId(c.id);
                            setAmount('');
                            setError('');
                          }}
                        >
                          <Text style={[styles.customerChipText, isSelected && styles.customerChipTextSelected]}>
                            {c.name} ({formatNaira(c.outstanding_balance || 0)})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            ) : null}

            {/* Outstanding Balance Banner */}
            <View style={styles.debtBanner}>
              <View>
                <Text style={styles.debtBannerLabel}>Customer: {currentCustomer?.name}</Text>
                <Text style={styles.debtBannerSub}>Current Outstanding Debt</Text>
              </View>
              <Text style={styles.debtBannerAmount}>{formatNaira(currentDebt)}</Text>
            </View>

            {/* Amount Paid */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount Paying Today (₦)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="₦0"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={amount ? parseInt(amount, 10).toLocaleString('en-NG') : ''}
                onChangeText={(t) => {
                  const clean = t.replace(/[^0-9]/g, '');
                  setAmount(clean);
                  setError('');
                }}
              />

              {/* Quick Settlements */}
              <View style={styles.quickPayRow}>
                <TouchableOpacity style={styles.quickPayBtn} onPress={handleFullPay}>
                  <Text style={styles.quickPayText}>Pay Full ({formatNaira(currentDebt)})</Text>
                </TouchableOpacity>
                {currentDebt > 1000 ? (
                  <TouchableOpacity style={styles.quickPayBtn} onPress={handleHalfPay}>
                    <Text style={styles.quickPayText}>Pay Half ({formatNaira(Math.round(currentDebt / 2))})</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.field}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.methodRow}>
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m.value;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      style={[styles.methodChip, isSelected && styles.methodChipSelected]}
                      onPress={() => setPaymentMethod(m.value)}
                    >
                      <Text style={[styles.methodChipText, isSelected && styles.methodChipTextSelected]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Note */}
            <View style={styles.field}>
              <Text style={styles.label}>Note / Reference (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 48 }]}
                placeholder="e.g. Bank transfer ref / Cash handed over"
                placeholderTextColor={COLORS.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Save */}
            <Button
              title={`Confirm Payment (${formatNaira(numericAmount)})`}
              onPress={handleSave}
              style={styles.saveBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    ...TYPOGRAPHY.titleSmall,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  customerChip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customerChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  customerChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  customerChipTextSelected: {
    color: COLORS.textInverse,
  },
  debtBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  debtBannerLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  debtBannerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    marginTop: 2,
  },
  debtBannerAmount: {
    ...TYPOGRAPHY.titleMedium,
    fontWeight: '800',
    color: COLORS.statusUnpaid,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: COLORS.brandAccent,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 54,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brandAccent,
    backgroundColor: '#F0FDF4',
  },
  quickPayRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickPayBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPayText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  methodChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  methodChipTextSelected: {
    color: COLORS.textInverse,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    textAlign: 'center',
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 8,
  },
});
