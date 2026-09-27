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
import { X, UserPlus, AlertCircle } from 'lucide-react-native';

interface AddDebtModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({ visible, onClose }) => {
  const { customers, addDebt } = useTransactions();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);

  const handleSave = () => {
    if (!selectedCustomerId && !newCustomerName.trim()) {
      setError('Please select or enter the customer who owes you');
      return;
    }
    if (numericAmount <= 0) {
      setError('Please enter the debt amount');
      return;
    }

    const res = addDebt({
      customerId: selectedCustomerId || undefined,
      newCustomerName: newCustomerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      amount: numericAmount,
      note: note.trim() || undefined,
    });

    if (res.success) {
      resetForm();
      onClose();
    } else {
      setError(res.error || 'Failed to record debt');
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setNewCustomerName('');
    setCustomerPhone('');
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
                <AlertCircle size={20} color={COLORS.statusUnpaid} />
              </View>
              <Text style={styles.sheetTitle}>Add Debt (Who Took Goods)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Quick Customer Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Select Existing Debtor</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.customerChip, !selectedCustomerId && styles.customerChipSelected]}
                  onPress={() => setSelectedCustomerId('')}
                >
                  <UserPlus size={14} color={!selectedCustomerId ? COLORS.textInverse : COLORS.textSecondary} />
                  <Text style={[styles.customerChipText, !selectedCustomerId && styles.customerChipTextSelected]}>
                    + New Customer
                  </Text>
                </TouchableOpacity>

                {customers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.customerChip, isSelected && styles.customerChipSelected]}
                      onPress={() => {
                        setSelectedCustomerId(c.id);
                        setNewCustomerName('');
                      }}
                    >
                      <Text style={[styles.customerChipText, isSelected && styles.customerChipTextSelected]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* If New Customer, show Name and Phone */}
            {!selectedCustomerId ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Customer Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Iya Moria, Brother Paul"
                    placeholderTextColor={COLORS.textMuted}
                    value={newCustomerName}
                    onChangeText={(t) => { setNewCustomerName(t); setError(''); }}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Phone Number (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="080 1234 5678"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                  />
                </View>
              </>
            ) : null}

            {/* Amount Owed */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount Owed (₦)</Text>
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

            {/* Note / Goods Description */}
            <View style={styles.field}>
              <Text style={styles.label}>What goods did they take? (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 48 }]}
                placeholder="e.g. 1 carton of noodles, 2 bottles of oil"
                placeholderTextColor={COLORS.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit Button */}
            <Button
              title={`Save Debt (${formatNaira(numericAmount)})`}
              onPress={handleSave}
              variant="danger"
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
    backgroundColor: '#FEE2E2',
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
  amountInput: {
    borderWidth: 2,
    borderColor: COLORS.statusUnpaid,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 54,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.statusUnpaid,
    backgroundColor: '#FEF2F2',
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
