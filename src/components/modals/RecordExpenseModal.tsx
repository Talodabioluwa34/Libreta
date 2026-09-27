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
import { PaymentMethod, SpendType } from '@/src/types';
import { X, Receipt, Package, Wrench } from 'lucide-react-native';

interface RecordExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES = [
  'Generator Fuel',
  'Transport / Logistics',
  'Market Levy / Ticket',
  'Shop Rent',
  'Data / Airtime',
  'Packaging / Nylon bags',
  'Staff Wages',
  'Stock Restocking',
  'Repairs & Maintenance',
  'Miscellaneous',
];

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'POS', value: 'pos' },
  { label: 'Other', value: 'other' },
];

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({ visible, onClose }) => {
  const { addExpense } = useTransactions();

  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [spendType, setSpendType] = useState<SpendType>('running_cost');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    // If Stock Restocking, auto-switch to 'stock' spend_type
    if (cat === 'Stock Restocking') {
      setSpendType('stock');
    } else {
      setSpendType('running_cost');
    }
  };

  const handleSave = () => {
    if (numericAmount <= 0) {
      setError('Please enter the expense amount');
      return;
    }

    const res = addExpense({
      category,
      spendType,
      amount: numericAmount,
      method: paymentMethod,
      note: note.trim() || undefined,
    });

    if (res.success) {
      resetForm();
      onClose();
    } else {
      setError(res.error || 'Failed to record expense');
    }
  };

  const resetForm = () => {
    setCategory(EXPENSE_CATEGORIES[0]);
    setSpendType('running_cost');
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
                <Receipt size={20} color={COLORS.statusPartPaid} />
              </View>
              <Text style={styles.sheetTitle}>Record Business Expense</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* PRD §8.9: Spend Type Selector (Scaffolding for P1 Margin Reporting) */}
            <View style={styles.field}>
              <Text style={styles.label}>Type of Spend</Text>
              <View style={styles.spendTypeRow}>
                <TouchableOpacity
                  style={[styles.spendTypeBtn, spendType === 'running_cost' && styles.spendTypeBtnSelected]}
                  onPress={() => setSpendType('running_cost')}
                  activeOpacity={0.8}
                >
                  <Wrench size={16} color={spendType === 'running_cost' ? COLORS.textInverse : COLORS.textSecondary} />
                  <View>
                    <Text style={[styles.spendTypeTitle, spendType === 'running_cost' && styles.spendTypeTitleSelected]}>
                      Running Cost
                    </Text>
                    <Text style={[styles.spendTypeDesc, spendType === 'running_cost' && styles.spendTypeDescSelected]}>
                      Fuel, Transport, Rent, Levy
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.spendTypeBtn, spendType === 'stock' && styles.spendTypeBtnSelected]}
                  onPress={() => {
                    setSpendType('stock');
                    setCategory('Stock Restocking');
                  }}
                  activeOpacity={0.8}
                >
                  <Package size={16} color={spendType === 'stock' ? COLORS.textInverse : COLORS.textSecondary} />
                  <View>
                    <Text style={[styles.spendTypeTitle, spendType === 'stock' && styles.spendTypeTitleSelected]}>
                      Stock / Goods
                    </Text>
                    <Text style={[styles.spendTypeDesc, spendType === 'stock' && styles.spendTypeDescSelected]}>
                      Buying inventory to resell
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => handleSelectCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount Spent (₦)</Text>
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
              <Text style={styles.label}>Note / Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 48 }]}
                placeholder="e.g. 10 litres fuel for generator"
                placeholderTextColor={COLORS.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit */}
            <Button
              title={`Save Expense (${formatNaira(numericAmount)})`}
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
    maxHeight: '90%',
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
    backgroundColor: '#FEF3C7',
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
  spendTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  spendTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  spendTypeBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  spendTypeTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },
  spendTypeTitleSelected: {
    color: COLORS.textInverse,
  },
  spendTypeDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  spendTypeDescSelected: {
    color: '#94A3B8',
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.textInverse,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
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
