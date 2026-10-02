import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useTransactions } from '@/src/context/TransactionContext';
import { FONTS, formatNaira } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { NumericKeypad } from '@/src/components/ui/NumericKeypad';
import { SuccessFeedbackModal } from '@/src/components/ui/SuccessFeedbackModal';
import { PaymentMethod } from '@/src/types';
import {
  X,
  ShoppingBag,
  Banknote,
  Building2,
  CreditCard,
  Clock,
  Check,
} from 'lucide-react-native';

interface RecordSaleModalProps {
  visible: boolean;
  onClose: () => void;
}

const COMMON_CATEGORIES = [
  'General Sale',
  'Drinks',
  'Foodstuff',
  'Provisions',
  'Bakery / Bread',
  'Stock / Goods',
];

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ visible, onClose }) => {
  const { customers, addSale } = useTransactions();
  const { colors, isDark } = useTheme();

  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('General Sale');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isCreditSale, setIsCreditSale] = useState<boolean>(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkInName, setWalkInName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Success Feedback
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; title: string; subtitle: string }>({
    amount: 0,
    title: '',
    subtitle: '',
  });

  const numericAmount = parseInt(amountStr || '0', 10);

  // Keypad Handlers
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
    const updated = current + delta;
    if (updated <= 99999999) {
      setAmountStr(updated.toString());
    }
  };

  const handleSave = () => {
    if (numericAmount <= 0) {
      setError('Please punch in the sale amount');
      return;
    }

    if (isCreditSale && !selectedCustomerId && !walkInName.trim()) {
      setError('Please select who took the goods on credit');
      return;
    }

    const itemName = showCustomInput && customItemName.trim()
      ? customItemName.trim()
      : selectedCategory;

    const customerName = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.name
      : walkInName.trim() || 'Walk-in Cash Customer';

    const amountPaid = isCreditSale ? 0 : numericAmount;

    const res = addSale({
      customerId: selectedCustomerId || undefined,
      customerName,
      itemName,
      quantity: 1,
      unitPrice: numericAmount,
      amountPaid,
      paymentMethod,
    });

    if (res.success) {
      setSuccessInfo({
        amount: numericAmount,
        title: isCreditSale ? 'Credit Recorded!' : 'Sale Recorded!',
        subtitle: isCreditSale
          ? `${customerName} owes ${formatNaira(numericAmount)}`
          : `Recorded via ${paymentMethod.toUpperCase()}`,
      });
      setShowSuccess(true);
    } else {
      setError(res.error || 'Failed to record sale');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmountStr('');
    setSelectedCategory('General Sale');
    setCustomItemName('');
    setShowCustomInput(false);
    setPaymentMethod('cash');
    setIsCreditSale(false);
    setSelectedCustomerId('');
    setWalkInName('');
    setError('');
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
                <ShoppingBag size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Record Sale</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
                  Punch amount like POS
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
            {/* 1. HERO AMOUNT DISPLAY */}
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

            {/* 2. PAYMENT TYPE (CLEAN LUCIDE ICONS, NO EMOJIS!) */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
              <View style={styles.methodRow}>
                {/* Cash */}
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor:
                        !isCreditSale && paymentMethod === 'cash'
                          ? colors.primary
                          : colors.surfaceSubtle,
                      borderColor:
                        !isCreditSale && paymentMethod === 'cash'
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsCreditSale(false);
                    setPaymentMethod('cash');
                  }}
                >
                  <Banknote
                    size={15}
                    color={
                      !isCreditSale && paymentMethod === 'cash'
                        ? '#FFFFFF'
                        : colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          !isCreditSale && paymentMethod === 'cash'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          !isCreditSale && paymentMethod === 'cash'
                            ? FONTS.bold
                            : FONTS.semiBold,
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
                        !isCreditSale && paymentMethod === 'transfer'
                          ? colors.paymentTransfer
                          : colors.surfaceSubtle,
                      borderColor:
                        !isCreditSale && paymentMethod === 'transfer'
                          ? colors.paymentTransfer
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsCreditSale(false);
                    setPaymentMethod('transfer');
                  }}
                >
                  <Building2
                    size={15}
                    color={
                      !isCreditSale && paymentMethod === 'transfer'
                        ? '#FFFFFF'
                        : colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          !isCreditSale && paymentMethod === 'transfer'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          !isCreditSale && paymentMethod === 'transfer'
                            ? FONTS.bold
                            : FONTS.semiBold,
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
                        !isCreditSale && paymentMethod === 'pos'
                          ? colors.paymentPOS
                          : colors.surfaceSubtle,
                      borderColor:
                        !isCreditSale && paymentMethod === 'pos'
                          ? colors.paymentPOS
                          : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsCreditSale(false);
                    setPaymentMethod('pos');
                  }}
                >
                  <CreditCard
                    size={15}
                    color={
                      !isCreditSale && paymentMethod === 'pos'
                        ? '#FFFFFF'
                        : colors.textPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color:
                          !isCreditSale && paymentMethod === 'pos'
                            ? '#FFFFFF'
                            : colors.textPrimary,
                        fontFamily:
                          !isCreditSale && paymentMethod === 'pos'
                            ? FONTS.bold
                            : FONTS.semiBold,
                      },
                    ]}
                  >
                    POS
                  </Text>
                </TouchableOpacity>

                {/* Credit / Owes */}
                <TouchableOpacity
                  style={[
                    styles.methodPill,
                    {
                      backgroundColor: isCreditSale
                        ? colors.statusUnpaid
                        : colors.surfaceSubtle,
                      borderColor: isCreditSale
                        ? colors.statusUnpaid
                        : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsCreditSale(true);
                  }}
                >
                  <Clock
                    size={15}
                    color={isCreditSale ? '#FFFFFF' : colors.statusUnpaid}
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      {
                        color: isCreditSale ? '#FFFFFF' : colors.statusUnpaid,
                        fontFamily: isCreditSale ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    Owes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. CUSTOMER SELECTOR (If Credit or debtor selected) */}
            {isCreditSale || selectedCustomerId ? (
              <View
                style={[
                  styles.section,
                  styles.creditHighlightBox,
                  {
                    backgroundColor: colors.debtSurface,
                    borderColor: colors.debtBorder,
                  },
                ]}
              >
                <Text style={[styles.sectionLabel, { color: colors.debtText }]}>
                  {isCreditSale
                    ? 'WHO TOOK THIS GOODS ON CREDIT? (REQUIRED)'
                    : 'CUSTOMER (OPTIONAL)'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {customers.map((c) => {
                    const isSelected = selectedCustomerId === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.customerChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedCustomerId(c.id);
                          setWalkInName('');
                        }}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            {
                              backgroundColor: isSelected
                                ? '#FFFFFF'
                                : colors.surfaceSubtle,
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
                        <Text
                          style={[
                            styles.customerChipText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : colors.textPrimary,
                              fontFamily: isSelected ? FONTS.bold : FONTS.medium,
                            },
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Manual Name Input if new debtor */}
                {!selectedCustomerId && (
                  <TextInput
                    style={[
                      styles.nameInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="Or type customer name (e.g. Mama Funke)"
                    placeholderTextColor={colors.textMuted}
                    value={walkInName}
                    onChangeText={(t) => {
                      setWalkInName(t);
                      setError('');
                    }}
                  />
                )}
              </View>
            ) : null}

            {/* 4. FAST 1-TAP CATEGORIES */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                  ITEM / CATEGORY
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCustomInput(!showCustomInput)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.customToggleText, { color: colors.primary }]}>
                    {showCustomInput ? '✕ Quick chips' : '+ Type specific item'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!showCustomInput ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {COMMON_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primarySurface
                              : colors.surfaceSubtle,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            {
                              color: isSelected
                                ? colors.primary
                                : colors.textSecondary,
                              fontFamily: isSelected ? FONTS.bold : FONTS.medium,
                            },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <TextInput
                  style={[
                    styles.customItemInput,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="e.g. 50kg Mama Gold Rice, Eggs"
                  placeholderTextColor={colors.textMuted}
                  value={customItemName}
                  onChangeText={setCustomItemName}
                  autoFocus
                />
              )}
            </View>

            {/* 5. FINTECH NUMPAD */}
            <NumericKeypad
              onKeyPress={handleKeyPress}
              onIncrement={handleIncrement}
              quickIncrements={[500, 1000, 2000, 5000]}
            />

            {/* 6. BIG DESIGN-SYSTEM ACTION BUTTON */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    numericAmount <= 0
                      ? colors.buttonDisabled
                      : isCreditSale
                      ? colors.statusUnpaid
                      : colors.primary,
                  shadowOpacity: isDark || numericAmount <= 0 ? 0 : 0.2,
                },
              ]}
              disabled={numericAmount <= 0}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color:
                      numericAmount <= 0
                        ? colors.buttonDisabledText
                        : '#FFFFFF',
                  },
                ]}
              >
                {numericAmount > 0
                  ? isCreditSale
                    ? `Record ₦${numericAmount.toLocaleString('en-NG')} Credit (Owes)`
                    : `Record ₦${numericAmount.toLocaleString('en-NG')} ${paymentMethod.toUpperCase()} Sale`
                  : 'Punch in Amount'}
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
        type={isCreditSale ? 'debt' : 'sale'}
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
  section: {
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  customToggleText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
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
  creditHighlightBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginTop: 4,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  customerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  customerChipText: {
    fontSize: 13,
  },
  nameInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginTop: 8,
  },
  categoryChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
  },
  customItemInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 4,
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
