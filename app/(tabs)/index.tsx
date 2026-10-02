import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useTransactions } from '@/src/context/TransactionContext';
import { useTheme } from '@/src/context/ThemeContext';
import { formatNaira, FONTS } from '@/src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  CreditCard,
  Receipt,
  Eye,
  EyeOff,
  Bell,
  MessageCircle,
  ChevronRight,
  UserPlus,
  Clock,
  Banknote,
  Building2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react-native';
import { Badge } from '@/src/components/ui/Badge';
import { useRouter } from 'expo-router';
import { Customer } from '@/src/types';
import { RecordSaleModal } from '@/src/components/modals/RecordSaleModal';
import { AddDebtModal } from '@/src/components/modals/AddDebtModal';
import { RecordPaymentModal } from '@/src/components/modals/RecordPaymentModal';
import { RecordExpenseModal } from '@/src/components/modals/RecordExpenseModal';

export default function HomeScreen() {
  const router = useRouter();
  const { business } = useAuth();
  const { summary, totalDebtOwed, sales, customers } = useTransactions();
  const { colors, isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [debtModalVisible, setDebtModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const isDebtOnly = business?.mode === 'debt_only';

  const displayAmount = (amount: number) => {
    if (isPrivate) return '••••••';
    return formatNaira(amount);
  };

  const debtors = customers.filter((c) => (c.outstanding_balance || 0) > 0);
  const topDebtor = debtors.length > 0 ? debtors[0] : null;

  const handleWhatsAppReminder = (phone?: string, name?: string, balance?: number) => {
    if (!phone) {
      router.push('/(tabs)/owes');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${name || 'Customer'}, friendly reminder from ${
        business?.name || 'our shop'
      } for your balance of ${formatNaira(balance || 0)}. Thank you!`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
      router.push('/(tabs)/owes');
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* =========================================================================
            TOP BAR: [(M)] Shop Name on Left ......................... 🔔 on Right
        ========================================================================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.shopIdentityBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/more')}
          >
            <View style={[styles.shopAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.shopAvatarText}>
                {(business?.name || 'M')[0].toUpperCase()}
              </Text>
            </View>
            <Text
              style={[styles.businessTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {business?.name || 'Mama Chinedu Provisions'}
            </Text>
          </TouchableOpacity>

          {/* Right Notification Bell (Clean, borderless, with alert dot) */}
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/more')}
          >
            <Bell size={21} color={colors.textPrimary} strokeWidth={2} />
            {debtors.length > 0 && <View style={styles.bellBadgeDot} />}
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            ISLAND 1: THE MONEY COCKPIT (Flat Solid Forest Green, Zero Outlines)
        ========================================================================= */}
        <View
          style={[
            styles.heroIsland,
            { backgroundColor: isDark ? colors.surface : colors.primary },
          ]}
        >
          {/* Overline Label */}
          <Text style={styles.heroLabel}>
            {isDebtOnly ? 'OUTSTANDING DEBT' : "TODAY'S SALES"}
          </Text>

          {/* Huge Number with Eye IMMEDIATELY Beside It */}
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroAmountText}>
              {isDebtOnly ? displayAmount(totalDebtOwed) : displayAmount(summary.sales)}
            </Text>
            <TouchableOpacity
              onPress={() => setIsPrivate(!isPrivate)}
              activeOpacity={0.7}
              style={styles.eyeBtn}
            >
              {isPrivate ? (
                <EyeOff size={20} color="rgba(255, 255, 255, 0.75)" />
              ) : (
                <Eye size={20} color="rgba(255, 255, 255, 0.75)" />
              )}
            </TouchableOpacity>
          </View>

          {/* Clean 2-Column Split: Cash Collected vs Given on Credit */}
          {!isDebtOnly && (
            <View style={styles.splitRow}>
              <View style={styles.splitCol}>
                <View style={styles.splitLabelRow}>
                  <View style={[styles.statusDot, { backgroundColor: '#34D399' }]} />
                  <Text style={styles.splitLabel}>Cash Collected</Text>
                </View>
                <Text style={styles.splitValue}>{displayAmount(summary.collected)}</Text>
              </View>

              <View style={styles.splitDivider} />

              <View style={styles.splitCol}>
                <View style={styles.splitLabelRow}>
                  <View style={[styles.statusDot, { backgroundColor: '#F87171' }]} />
                  <Text style={styles.splitLabel}>Given on Credit</Text>
                </View>
                <Text style={[styles.splitValue, { color: '#FECACA' }]}>
                  {displayAmount(summary.new_credit)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* =========================================================================
            ISLAND 2: DEBT ALERT STRIP (Soft Flat Tint, No Outlines, Un-truncated)
        ========================================================================= */}
        {debtors.length > 0 && (
          <TouchableOpacity
            style={[styles.debtIsland, { backgroundColor: colors.debtSurface }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/owes')}
          >
            <View style={styles.debtIslandLeft}>
              <View style={styles.debtIconCircle}>
                <AlertCircle size={17} color={colors.statusUnpaid} strokeWidth={2.4} />
              </View>
              <View style={styles.debtTextCol}>
                <Text style={[styles.debtIslandTitle, { color: colors.statusUnpaid }]}>
                  {debtors.length} Customers Owe You {displayAmount(totalDebtOwed)}
                </Text>
                <Text style={[styles.debtIslandSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {topDebtor
                    ? `Top: ${topDebtor.name} · ${displayAmount(topDebtor.outstanding_balance || 0)}`
                    : 'Tap to view debt book'}
                </Text>
              </View>
            </View>

            <View style={styles.debtIslandRight}>
              {topDebtor && (
                <TouchableOpacity
                  style={styles.remindBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleWhatsAppReminder(
                      topDebtor.phone,
                      topDebtor.name,
                      topDebtor.outstanding_balance || 0
                    )
                  }
                >
                  <MessageCircle size={12} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.remindBtnText}>Remind</Text>
                </TouchableOpacity>
              )}
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        {/* =========================================================================
            ISLAND 3: ACTIONS HUB (Layout 2: Dominant +Record Sale Hero + 3 Pills)
        ========================================================================= */}
        <View style={[styles.actionsIsland, { backgroundColor: colors.surface }]}>
          {/* Dominant Full-Width Primary Action */}
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => {
              if (isDebtOnly) {
                setDebtModalVisible(true);
              } else {
                setSaleModalVisible(true);
              }
            }}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.primaryActionBtnText}>
              {isDebtOnly ? 'Add Debt (Who Took Goods)' : 'Record Sale'}
            </Text>
          </TouchableOpacity>

          {/* Secondary 3 Actions Row */}
          <View style={styles.secondaryActionsRow}>
            {/* Collect Debt */}
            <TouchableOpacity
              style={[styles.secondaryActionPill, { backgroundColor: colors.surfaceSubtle }]}
              activeOpacity={0.75}
              onPress={() => {
                setPaymentCustomer(null);
                setPaymentModalVisible(true);
              }}
            >
              <CreditCard size={15} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>
                Collect Debt
              </Text>
            </TouchableOpacity>

            {/* Add Expense */}
            <TouchableOpacity
              style={[styles.secondaryActionPill, { backgroundColor: colors.surfaceSubtle }]}
              activeOpacity={0.75}
              onPress={() => setExpenseModalVisible(true)}
            >
              <Receipt size={15} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>
                Add Expense
              </Text>
            </TouchableOpacity>

            {/* Give Credit */}
            <TouchableOpacity
              style={[styles.secondaryActionPill, { backgroundColor: colors.surfaceSubtle }]}
              activeOpacity={0.75}
              onPress={() => setDebtModalVisible(true)}
            >
              <UserPlus size={15} color={colors.statusUnpaid} strokeWidth={2.2} />
              <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>
                Give Credit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            ISLAND 4: TODAY'S LEDGER (Flat Unified Card, 3 Recent Items)
        ========================================================================= */}
        <View style={[styles.ledgerIsland, { backgroundColor: colors.surface }]}>
          <View style={styles.ledgerHeader}>
            <View>
              <Text style={[styles.ledgerTitle, { color: colors.textPrimary }]}>
                Today's Ledger
              </Text>
              <Text style={[styles.ledgerSub, { color: colors.textMuted }]}>
                {sales.length} transactions recorded today
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/sales')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>

          {sales.length === 0 ? (
            <View style={styles.emptyLedgerBox}>
              <ShoppingBag size={26} color={colors.textMuted} />
              <Text style={[styles.emptyLedgerText, { color: colors.textMuted }]}>
                No sales recorded today yet.
              </Text>
            </View>
          ) : (
            // Show exactly 3 recent transactions
            sales.slice(0, 3).map((sale, index) => (
              <View
                key={sale.id}
                style={[
                  styles.ledgerRow,
                  index !== Math.min(sales.length, 3) - 1 && [
                    styles.ledgerRowDivider,
                    { borderBottomColor: colors.borderSubtle },
                  ],
                ]}
              >
                <View style={styles.ledgerRowLeft}>
                  <View
                    style={[
                      styles.ledgerIconBox,
                      { backgroundColor: colors.surfaceSubtle },
                    ]}
                  >
                    {sale.status === 'unpaid' ? (
                      <Clock size={16} color={colors.statusUnpaid} strokeWidth={2.2} />
                    ) : (
                      <Banknote size={16} color={colors.primary} strokeWidth={2.2} />
                    )}
                  </View>
                  <View style={styles.ledgerInfo}>
                    <Text
                      style={[styles.ledgerItemTitle, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {sale.note || 'General Sale'}
                    </Text>
                    <Text
                      style={[styles.ledgerCustomerName, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {sale.customer_name || 'Walk-in Cash Customer'}
                    </Text>
                  </View>
                </View>

                <View style={styles.ledgerRowRight}>
                  <Text style={[styles.ledgerAmount, { color: colors.textPrimary }]}>
                    {displayAmount(sale.total_amount)}
                  </Text>
                  <Badge status={sale.status} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Interactive Modals */}
      <RecordSaleModal
        visible={saleModalVisible}
        onClose={() => setSaleModalVisible(false)}
      />
      <AddDebtModal
        visible={debtModalVisible}
        onClose={() => setDebtModalVisible(false)}
      />
      <RecordPaymentModal
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setPaymentCustomer(null);
        }}
        preselectedCustomer={paymentCustomer}
      />
      <RecordExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90,
    gap: 12,
  },

  /* TOP BAR: [(M)] Name .................... 🔔 */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  shopIdentityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shopAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  businessTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  /* ISLAND 1: MONEY COCKPIT */
  heroIsland: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  heroLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  heroAmountText: {
    fontFamily: FONTS.extraBold,
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  eyeBtn: {
    padding: 4,
  },
  splitRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitCol: {
    flex: 1,
  },
  splitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  splitLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  splitValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  splitDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },

  /* ISLAND 2: DEBT ALERT STRIP */
  debtIsland: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  debtIslandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  debtIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtTextCol: {
    flex: 1,
  },
  debtIslandTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  debtIslandSub: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginTop: 1,
  },
  debtIslandRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  remindBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },

  /* ISLAND 3: ACTIONS HUB */
  actionsIsland: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  primaryActionBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryActionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },

  /* ISLAND 4: TODAY'S LEDGER */
  ledgerIsland: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ledgerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  ledgerSub: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  emptyLedgerBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyLedgerText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ledgerRowDivider: {
    borderBottomWidth: 1,
  },
  ledgerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ledgerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerInfo: {
    flex: 1,
  },
  ledgerItemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  ledgerCustomerName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 2,
  },
  ledgerRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ledgerAmount: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
