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
import { Badge } from '@/src/components/ui/Badge';
import { PaymentMethod, PaymentStatus } from '@/src/types';
import { X, User, ShoppingBag, Plus, Minus } from 'lucide-react-native';

interface RecordSaleModalProps {
  visible: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'POS', value: 'pos' },
  { label: 'Other', value: 'other' },
];

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ visible, onClose }) => {
  const { customers, addSale } = useTransactions();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkInName, setWalkInName] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const numericPrice = parseInt(unitPrice.replace(/[^0-9]/g, '') || '0', 10);
  const totalAmount = quantity * numericPrice;
  const numericPaid = amountPaid === '' ? totalAmount : parseInt(amountPaid.replace(/[^0-9]/g, '') || '0', 10);

  // Derived payment status (PRD §8.4)
  let status: PaymentStatus = 'paid';
  if (numericPaid === 0) {
    status = 'unpaid';
  } else if (numericPaid < totalAmount) {
    status = 'part_paid';
  }

  const handleFullPay = () => {
    setAmountPaid(totalAmount.toString());
  };

  const handleZeroPay = () => {
    setAmountPaid('0');
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      setError('Please enter the item or product name');
      return;
    }
    if (numericPrice <= 0) {
      setError('Please enter a valid unit price');
      return;
    }

    const customerName = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.name
      : walkInName.trim() || 'Walk-in Cash Customer';

    const res = addSale({
      customerId: selectedCustomerId || undefined,
      customerName,
      itemName: itemName.trim(),
      quantity,
      unitPrice: numericPrice,
      amountPaid: numericPaid,
      paymentMethod,
      note: note.trim() || undefined,
    });

    if (res.success) {
      resetForm();
      onClose();
    } else {
      setError(res.error || 'Failed to record sale');
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setWalkInName('');
    setItemName('');
    setQuantity(1);
    setUnitPrice('');
    setAmountPaid('');
    setPaymentMethod('cash');
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
                <ShoppingBag size={20} color={COLORS.brandAccent} />
              </View>
              <Text style={styles.sheetTitle}>Record New Sale</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Customer Selector (Optional for Cash) */}
            <View style={styles.field}>
              <Text style={styles.label}>Customer (Optional for cash sales)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.customerChip, !selectedCustomerId && styles.customerChipSelected]}
                  onPress={() => setSelectedCustomerId('')}
                >
                  <User size={14} color={!selectedCustomerId ? COLORS.textInverse : COLORS.textSecondary} />
                  <Text style={[styles.customerChipText, !selectedCustomerId && styles.customerChipTextSelected]}>
                    Walk-in Cash
                  </Text>
                </TouchableOpacity>

                {customers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.customerChip, isSelected && styles.customerChipSelected]}
                      onPress={() => setSelectedCustomerId(c.id)}
                    >
                      <Text style={[styles.customerChipText, isSelected && styles.customerChipTextSelected]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Item Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Item / Product Sold</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50kg Rice, Cooking Oil, Lace fabric"
                placeholderTextColor={COLORS.textMuted}
                value={itemName}
                onChangeText={(t) => { setItemName(t); setError(''); }}
              />
            </View>

            {/* Quantity and Unit Price Row */}
            <View style={styles.row}>
              <View style={[styles.field, { width: '40%' }]}>
                <Text style={styles.label}>Quantity</Text>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Plus size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Unit Price (₦)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="₦0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={unitPrice ? parseInt(unitPrice, 10).toLocaleString('en-NG') : ''}
                  onChangeText={(t) => {
                    const clean = t.replace(/[^0-9]/g, '');
                    setUnitPrice(clean);
                    setError('');
                  }}
                />
              </View>
            </View>

            {/* Auto-Calculated Total Hero */}
            <View style={styles.totalHero}>
              <Text style={styles.totalHeroLabel}>Total Sale Amount</Text>
              <Text style={styles.totalHeroAmount}>{formatNaira(totalAmount)}</Text>
            </View>

            {/* Amount Paid & Status Derivation */}
            <View style={styles.field}>
              <View style={styles.paidHeaderRow}>
                <Text style={styles.label}>Amount Paid by Customer</Text>
                <Badge status={status} />
              </View>

              <TextInput
                style={styles.paidInput}
                placeholder={formatNaira(totalAmount)}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={amountPaid ? parseInt(amountPaid, 10).toLocaleString('en-NG') : ''}
                onChangeText={(t) => {
                  const clean = t.replace(/[^0-9]/g, '');
                  setAmountPaid(clean);
                  setError('');
                }}
              />

              {/* Quick Status Buttons */}
              <View style={styles.quickPayRow}>
                <TouchableOpacity style={styles.quickPayBtn} onPress={handleFullPay}>
                  <Text style={styles.quickPayText}>Paid in Full</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickPayBtn} onPress={handleZeroPay}>
                  <Text style={[styles.quickPayText, { color: COLORS.statusUnpaid }]}>Credit (Unpaid)</Text>
                </TouchableOpacity>
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
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 44 }]}
                placeholder="Optional customer note..."
                placeholderTextColor={COLORS.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit */}
            <Button
              title={`Save Sale (${formatNaira(totalAmount)})`}
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
    paddingBottom: 20,
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
    backgroundColor: COLORS.surfaceSubtle,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    height: 50,
    paddingHorizontal: 6,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 18,
  },
  totalHero: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  totalHeroLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalHeroAmount: {
    ...TYPOGRAPHY.amountDisplay,
    fontSize: 26,
    color: COLORS.primary,
    marginTop: 2,
  },
  paidHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paidInput: {
    borderWidth: 2,
    borderColor: COLORS.brandAccent,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
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
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    textAlign: 'center',
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 6,
  },
});
