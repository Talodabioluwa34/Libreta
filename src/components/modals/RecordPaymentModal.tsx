import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTransactions } from '@/src/context/TransactionContext';
import { FONTS, formatNaira } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Customer, PaymentMethod } from '@/src/types';
import { NumericKeypad } from '@/src/components/ui/NumericKeypad';
import { SuccessFeedbackModal } from '@/src/components/ui/SuccessFeedbackModal';
import { X, CheckCircle2, Banknote, Building2, CreditCard } from 'lucide-react-native';

interface RecordPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  preselectedCustomer,
}) => {
  const { customers, recordPayment } = useTransactions();
  const { colors, isDark } = useTheme();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<string>('');

  // Success Feedback
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; title: string; subtitle: string }>({
    amount: 0,
    title: '',
    subtitle: '',
  });

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
    } else {
      const firstDebtor = customers.find((c) => (c.outstanding_balance || 0) > 0);
      if (firstDebtor && !selectedCustomerId) {
        setSelectedCustomerId(firstDebtor.id);
      }
    }
  }, [preselectedCustomer, customers, visible]);

  const debtors = customers.filter((c) => (c.outstanding_balance || 0) > 0);
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || debtors[0];
  const activeDebt = currentCustomer?.outstanding_balance || 0;
  const numericAmount = parseInt(amountStr || '0', 10);

  const handleKeyPress = (key: string) => {
    setError('');
    if (key === 'clear') {
      setAmountStr('');
      return;
    }
    if (key === 'backspace') {
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
      return;
    }
    if (key === '00') {
      if (!amountStr || amountStr === '0') return;
      if (amountStr.length >= 8) return;
      setAmountStr((prev) => prev + '00');
      return;
    }
    if (amountStr.length >= 8) return;
    if (amountStr === '' && key === '0') return;
    setAmountStr((prev) => prev + key);
  };

  const handleIncrement = (delta: number) => {
    setError('');
    const current = parseInt(amountStr || '0', 10);
    const updated = Math.min(activeDebt, current + delta);
    setAmountStr(updated.toString());
  };

  const handleFullPay = () => {
    setAmountStr(activeDebt.toString());
    setError('');
  };

  const handleHalfPay = () => {
    setAmountStr(Math.round(activeDebt / 2).toString());
    setError('');
  };

  const handleSave = () => {
    if (!currentCustomer) {
      setError('Please select a customer who owes you');
      return;
    }
    if (numericAmount <= 0) {
      setError('Please punch in the payment amount');
      return;
    }
    if (numericAmount > activeDebt) {
      setError(`Payment cannot exceed outstanding balance of ${formatNaira(activeDebt)}`);
      return;
    }

    const res = recordPayment({
      customerId: currentCustomer.id,
      amount: numericAmount,
      method: paymentMethod,
    });

    if (res.success) {
      const remaining = activeDebt - numericAmount;
      setSuccessInfo({
        amount: numericAmount,
        title: 'Payment Collected!',
        subtitle: remaining <= 0
          ? `${currentCustomer.name}'s debt is fully settled! 🎉`
          : `Remaining balance: ${formatNaira(remaining)}`,
      });
      setShowSuccess(true);
    } else {
      setError(res.error || 'Failed to record payment');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmountStr('');
    setError('');
    setPaymentMethod('cash');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Grab handle */}
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySurface }]}>
                <CheckCircle2 size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Collect Debt</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
                  Record customer settlement
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* 1. SELECT WHO IS PAYING */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                SELECT WHO IS PAYING
              </Text>
              {debtors.length === 0 ? (
                <View
                  style={[
                    styles.noDebtorsBox,
                    {
                      backgroundColor: colors.statusPaidBg,
                      borderColor: colors.statusPaid,
                    },
                  ]}
                >
                  <Text style={[styles.noDebtorsText, { color: colors.statusPaid }]}>
                    No outstanding customer debts found! 👏
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {debtors.map((c) => {
                    const isSelected = currentCustomer?.id === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.customerChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.surfaceSubtle,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedCustomerId(c.id);
                          setAmountStr('');
                          setError('');
                        }}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            {
                              backgroundColor: isSelected
                                ? '#FFFFFF'
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.avatarText,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.textPrimary,
                              },
                            ]}
                          >
                            {c.name[0]?.toUpperCase() || 'C'}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.customerChipText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : colors.textPrimary,
                                fontFamily: isSelected ? FONTS.bold : FONTS.semiBold,
                              },
                            ]}
                          >
                            {c.name}
                          </Text>
                          <Text
                            style={[
                              styles.customerChipDebt,
                              {
                                color: isSelected
                                  ? '#FECACA'
                                  : colors.statusUnpaid,
                              },
                            ]}
                          >
                            Owes {formatNaira(c.outstanding_balance || 0)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Active Debtor Banner */}
            {currentCustomer && (
              <View
                style={[
                  styles.activeDebtorBanner,
                  {
                    backgroundColor: colors.debtSurface,
                    borderColor: colors.debtBorder,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.activeDebtorLabel, { color: colors.debtText }]}>
                    TOTAL DEBT FOR {currentCustomer.name.toUpperCase()}
                  </Text>
                  <Text style={[styles.activeDebtorAmount, { color: colors.debtText }]}>
                    {formatNaira(activeDebt)}
                  </Text>
                </View>
                <View style={styles.quickSettleRow}>
                  <TouchableOpacity
                    style={[
                      styles.quickSettleBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.debtBorder,
                      },
                    ]}
                    onPress={handleFullPay}
                  >
                    <Text style={[styles.quickSettleBtnText, { color: colors.statusUnpaid }]}>
                      All ({formatNaira(activeDebt)})
                    </Text>
                  </TouchableOpacity>
                  {activeDebt > 500 && (
                    <TouchableOpacity
                      style={[
                        styles.quickSettleBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.debtBorder,
                        },
                      ]}
                      onPress={handleHalfPay}
                    >
                      <Text style={[styles.quickSettleBtnText, { color: colors.statusUnpaid }]}>
                        Half ({formatNaira(Math.round(activeDebt / 2))})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* 2. HERO AMOUNT DISPLAY */}
            <View
              style={[
                styles.heroAmountBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.nairaSymbol, { color: colors.primary }]}>₦</Text>
              <Text
                style={[
                  styles.heroAmountText,
                  { color: colors.textPrimary },
                  !amountStr && { color: colors.textMuted },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {numericAmount > 0 ? numericAmount.toLocaleString('en-NG') : '0'}
              </Text>
            </View>

            {/* Error Banner */}
            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.statusUnpaidBg,
                    borderColor: colors.statusUnpaid,
                  },
                ]}
              >
                <Text style={[styles.errorBannerText, { color: colors.statusUnpaid }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* 3. PAYMENT METHOD (LUCIDE ICONS, NO EMOJIS) */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                PAYMENT RECEIVED VIA
              </Text>
              <View style={styles.methodRow}>
                {/* Cash */}
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor:
                        paymentMethod === 'cash'
                          ? colors.primary
                          : colors.surfaceSubtle,
                      borderColor:
                        paymentMethod === 'cash'
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Banknote
                    size={15}
                    color={paymentMethod === 'cash' ? '#FFFFFF' : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          paymentMethod === 'cash'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          paymentMethod === 'cash' ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>

                {/* Transfer */}
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor:
                        paymentMethod === 'transfer'
                          ? colors.paymentTransfer
                          : colors.surfaceSubtle,
                      borderColor:
                        paymentMethod === 'transfer'
                          ? colors.paymentTransfer
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setPaymentMethod('transfer')}
                >
                  <Building2
                    size={15}
                    color={
                      paymentMethod === 'transfer'
                        ? '#FFFFFF'
                        : colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          paymentMethod === 'transfer'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          paymentMethod === 'transfer' ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    Transfer
                  </Text>
                </TouchableOpacity>

                {/* POS */}
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor:
                        paymentMethod === 'pos'
                          ? colors.paymentPOS
                          : colors.surfaceSubtle,
                      borderColor:
                        paymentMethod === 'pos'
                          ? colors.paymentPOS
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setPaymentMethod('pos')}
                >
                  <CreditCard
                    size={15}
                    color={paymentMethod === 'pos' ? '#FFFFFF' : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          paymentMethod === 'pos'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          paymentMethod === 'pos' ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    POS
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. FINTECH NUMPAD */}
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onIncrement={handleIncrement}
              quickIncrements={[500, 1000, 2000, 5000]}
            />

            {/* 5. BIG ACTION BUTTON */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    numericAmount <= 0 || !currentCustomer
                      ? colors.buttonDisabled
                      : colors.primary,
                  shadowOpacity: isDark || numericAmount <= 0 ? 0 : 0.2,
                },
              ]}
              disabled={numericAmount <= 0 || !currentCustomer}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color:
                      numericAmount <= 0 || !currentCustomer
                        ? colors.buttonDisabledText
                        : '#FFFFFF',
                  },
                ]}
              >
                {numericAmount > 0 && currentCustomer
                  ? `Save ₦${numericAmount.toLocaleString('en-NG')} from ${currentCustomer.name}`
                  : 'Punch in Payment Amount'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Sensory Feedback Celebration Modal */}
      <SuccessFeedbackModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title={successInfo.title}
        amount={successInfo.amount}
        subtitle={successInfo.subtitle}
        type="payment"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
  },
  sheetSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  noDebtorsBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  noDebtorsText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  customerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  customerChipText: {
    fontSize: 13,
  },
  customerChipDebt: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },
  activeDebtorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  activeDebtorLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  activeDebtorAmount: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    marginTop: 2,
  },
  quickSettleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickSettleBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickSettleBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  heroAmountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  nairaSymbol: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    marginRight: 4,
  },
  heroAmountText: {
    fontFamily: FONTS.extraBold,
    fontSize: 38,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorBannerText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  methodPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  methodPillText: {
    fontSize: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#00513F',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
});
