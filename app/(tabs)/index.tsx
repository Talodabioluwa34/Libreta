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
import { formatNaira, TYPOGRAPHY } from '@/src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  CreditCard,
  Receipt,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  Users,
  MessageCircle,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Store,
  UserCheck,
} from 'lucide-react-native';
import { Badge } from '@/src/components/ui/Badge';
import { useRouter } from 'expo-router';

import { useTransactions } from '@/src/context/TransactionContext';
import { RecordSaleModal } from '@/src/components/modals/RecordSaleModal';
import { AddDebtModal } from '@/src/components/modals/AddDebtModal';
import { RecordPaymentModal } from '@/src/components/modals/RecordPaymentModal';
import { RecordExpenseModal } from '@/src/components/modals/RecordExpenseModal';

export default function HomeScreen() {
  const router = useRouter();
  const { business } = useAuth();
  const { summary, totalDebtOwed, sales, customers } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [debtModalVisible, setDebtModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const isDebtOnly = business?.mode === 'debt_only';

  const displayAmount = (amount: number) => {
    if (isPrivate) return '••••••';
    return formatNaira(amount);
  };

  const debtors = customers.filter((c) => (c.outstanding_balance || 0) > 0);
  const topDebtor = debtors.length > 0 ? debtors[0] : null;
  const latestSale = sales.length > 0 ? sales[0] : null;

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006B4D" />
        }
      >
        {/* =========================================================================
            1. TOP BAR (Clean, Native, Space-Conscious)
        ========================================================================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.shopIdentityBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/more')}
          >
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>
                {(business?.name || 'M')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.shopInfoCol}>
              <View style={styles.shopNameRow}>
                <Text style={styles.businessTitle} numberOfLines={1}>
                  {business?.name || 'Mama Chinedu Provisions'}
                </Text>
                <ChevronDown size={14} color="#64748B" />
              </View>
              <Text style={styles.modeSubText}>
                {isDebtOnly ? '⚡ Debt-Only Mode' : 'Daily Business Book'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            <View style={styles.syncPill}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>Synced</Text>
            </View>

            <TouchableOpacity
              style={styles.searchIconButton}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/sales')}
            >
              <Search size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            2. HERO COCKPIT (OPay Pattern: Unified Card + Seamless Docked Ticker)
        ========================================================================= */}
        <View style={styles.heroCardContainer}>
          {/* Main Green Body */}
          <View style={styles.heroMainBody}>
            {/* Header: Label + Privacy Eye + Embedded Action Button */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroLabelRow}>
                <Text style={styles.heroLabel}>
                  {isDebtOnly ? 'OUTSTANDING DEBT' : "TODAY'S TOTAL SALES"}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsPrivate(!isPrivate)}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  {isPrivate ? (
                    <EyeOff size={15} color="rgba(255, 255, 255, 0.7)" />
                  ) : (
                    <Eye size={15} color="rgba(255, 255, 255, 0.7)" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Embedded Primary Action Button */}
              <TouchableOpacity
                style={styles.heroActionPill}
                activeOpacity={0.85}
                onPress={() => {
                  if (isDebtOnly) {
                    setDebtModalVisible(true);
                  } else {
                    setSaleModalVisible(true);
                  }
                }}
              >
                <Plus size={14} color="#005A3E" strokeWidth={3} />
                <Text style={styles.heroActionPillText}>
                  {isDebtOnly ? 'Add Debt' : 'Record Sale'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Huge Clean Hero Amount */}
            <View style={styles.heroAmountRow}>
              <Text style={styles.heroAmountText}>
                {isDebtOnly ? displayAmount(totalDebtOwed) : displayAmount(summary.sales)}
              </Text>
            </View>

            {/* Translucent Glass Financial Metrics Strip */}
            {!isDebtOnly ? (
              <View style={styles.glassShelf}>
                <View style={styles.glassCol}>
                  <View style={styles.glassLabelRow}>
                    <View style={[styles.glassDot, { backgroundColor: '#34D399' }]} />
                    <Text style={styles.glassLabel}>Cash in Hand</Text>
                  </View>
                  <Text style={styles.glassValue}>
                    {displayAmount(summary.collected)}
                  </Text>
                </View>

                <View style={styles.glassDivider} />

                <View style={styles.glassCol}>
                  <View style={styles.glassLabelRow}>
                    <View style={[styles.glassDot, { backgroundColor: '#F87171' }]} />
                    <Text style={styles.glassLabel}>Given on Credit</Text>
                  </View>
                  <Text style={[styles.glassValue, { color: '#FECACA' }]}>
                    {displayAmount(summary.new_credit)}
                  </Text>
                </View>

                <View style={styles.glassDivider} />

                <View style={styles.glassCol}>
                  <View style={styles.glassLabelRow}>
                    <View style={[styles.glassDot, { backgroundColor: '#FBBF24' }]} />
                    <Text style={styles.glassLabel}>Spent (Stock)</Text>
                  </View>
                  <Text style={styles.glassValue}>
                    {displayAmount(summary.expenses)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Seamless Docked Ticker (OPay Pattern: Pinned into the bottom lip of the card) */}
          {latestSale ? (
            <TouchableOpacity
              style={styles.dockedTicker}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/sales')}
            >
              <View style={styles.dockedTickerLeft}>
                <View style={styles.tickerIconBadge}>
                  <ArrowDownLeft size={11} color="#006B4D" strokeWidth={2.5} />
                </View>
                <Text style={styles.dockedTickerText} numberOfLines={1}>
                  <Text style={styles.dockedBold}>Latest: </Text>
                  {latestSale.customer_name || 'Walk-in Sale'} · {displayAmount(latestSale.total_amount)}
                </Text>
              </View>
              <View style={styles.dockedTickerRight}>
                <Text style={styles.dockedStatusText}>
                  {latestSale.status === 'paid' ? 'Paid' : latestSale.status === 'unpaid' ? 'Credit' : 'Part-Paid'}
                </Text>
                <ChevronRight size={13} color="rgba(255, 255, 255, 0.6)" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* =========================================================================
            3. ACTIONABLE CUSTOMER DEBT STRIP (Compact, High-Value Ledger Row)
        ========================================================================= */}
        {debtors.length > 0 ? (
          <View style={styles.debtStripCard}>
            <View style={styles.debtStripLeft}>
              <View style={styles.debtAlertIconCircle}>
                <UserCheck size={16} color="#DC2626" />
              </View>
              <View style={styles.debtStripTextCol}>
                <Text style={styles.debtStripTitle}>
                  {debtors.length} Customers Owe You {displayAmount(totalDebtOwed)}
                </Text>
                <Text style={styles.debtStripSub} numberOfLines={1}>
                  {topDebtor ? `Top: ${topDebtor.name} (${displayAmount(topDebtor.outstanding_balance || 0)})` : 'Tap to open debt book'}
                </Text>
              </View>
            </View>

            <View style={styles.debtStripActions}>
              {topDebtor ? (
                <TouchableOpacity
                  style={styles.whatsappPillBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleWhatsAppReminder(
                      topDebtor.phone,
                      topDebtor.name,
                      topDebtor.outstanding_balance || 0
                    )
                  }
                >
                  <MessageCircle size={13} color="#FFFFFF" />
                  <Text style={styles.whatsappPillText}>Remind</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.openBookArrowBtn}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/owes')}
              >
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* =========================================================================
            4. PRIMARY ACTION HUB (OPay 4-Grid Masterclass: Unified Brand Styling)
        ========================================================================= */}
        <View style={styles.actionHubSection}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.actionGridRow}>
            {/* 1. Record Sale */}
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={() => {
                if (isDebtOnly) {
                  setDebtModalVisible(true);
                } else {
                  setSaleModalVisible(true);
                }
              }}
            >
              <View style={styles.actionIconSquircle}>
                <Plus size={22} color="#006B4D" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionItemLabel}>
                {isDebtOnly ? 'Add Debt' : 'Record Sale'}
              </Text>
            </TouchableOpacity>

            {/* 2. Collect Debt */}
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={() => setPaymentModalVisible(true)}
            >
              <View style={styles.actionIconSquircle}>
                <CreditCard size={20} color="#006B4D" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionItemLabel}>Collect Debt</Text>
            </TouchableOpacity>

            {/* 3. Add Expense */}
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={() => setExpenseModalVisible(true)}
            >
              <View style={styles.actionIconSquircle}>
                <Receipt size={20} color="#006B4D" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionItemLabel}>Add Expense</Text>
            </TouchableOpacity>

            {/* 4. Customers */}
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/customers')}
            >
              <View style={styles.actionIconSquircle}>
                <Users size={20} color="#006B4D" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionItemLabel}>Customers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            5. TODAY'S SALES BOOK FEED (Clean Native List, No Clunky Borders)
        ========================================================================= */}
        <View style={styles.ledgerSection}>
          <View style={styles.ledgerSectionHeader}>
            <View>
              <Text style={styles.sectionHeading}>Today's Ledger</Text>
              <Text style={styles.ledgerSubHeading}>
                {sales.length} transactions recorded today
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/sales')}
            >
              <Text style={styles.seeAllLinkText}>See All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ledgerListCard}>
            {sales.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Store size={30} color="#94A3B8" />
                <Text style={styles.emptyFeedTitle}>No sales recorded yet today</Text>
                <Text style={styles.emptyFeedSub}>
                  Tap "+ Record Sale" above to log your first transaction.
                </Text>
              </View>
            ) : (
              sales.slice(0, 5).map((s, idx) => (
                <View
                  key={s.id}
                  style={[
                    styles.txRowItem,
                    idx === sales.slice(0, 5).length - 1 ? { borderBottomWidth: 0 } : null,
                  ]}
                >
                  <View style={styles.txIconBubble}>
                    <Receipt size={16} color="#006B4D" />
                  </View>

                  <View style={styles.txDetailsCol}>
                    <Text style={styles.txItemTitle} numberOfLines={1}>
                      {s.note || 'General Merchandise'}
                    </Text>
                    <Text style={styles.txCustomerSub}>
                      {s.customer_name || 'Walk-in Cash Customer'}
                    </Text>
                  </View>

                  <View style={styles.txAmountCol}>
                    <Text style={styles.txAmountText}>
                      {displayAmount(s.total_amount)}
                    </Text>
                    <Badge status={s.status} />
                  </View>
                </View>
              ))
            )}
          </View>
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
        onClose={() => setPaymentModalVisible(false)}
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  /* 1. TOP BAR */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 2,
  },
  shopIdentityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shopAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#006B4D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shopAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  shopInfoCol: {
    flex: 1,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modeSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 2. HERO COCKPIT CARD */
  heroCardContainer: {
    backgroundColor: '#005A3E',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#005A3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  heroMainBody: {
    padding: 18,
    paddingBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  eyeBtn: {
    padding: 4,
  },
  heroActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  heroActionPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#005A3E',
  },
  heroAmountRow: {
    marginBottom: 14,
  },
  heroAmountText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },

  /* Translucent Glass Metrics Shelf */
  glassShelf: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  glassCol: {
    flex: 1,
  },
  glassLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  glassDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  glassLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  glassValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  glassDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 8,
  },

  /* Docked Ticker (OPay Seamless Lip) */
  dockedTicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dockedTickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tickerIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockedTickerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    flexShrink: 1,
  },
  dockedBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dockedTickerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dockedStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7F3D0',
  },

  /* 3. CUSTOMER DEBT STRIP */
  debtStripCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  debtStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  debtAlertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtStripTextCol: {
    flex: 1,
  },
  debtStripTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  debtStripSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  debtStripActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whatsappPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  whatsappPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  openBookArrowBtn: {
    padding: 2,
  },

  /* 4. PRIMARY ACTIONS HUB (OPay 4-Grid Layout) */
  actionHubSection: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  /* 5. TODAY'S SALES BOOK FEED */
  ledgerSection: {
    marginBottom: 16,
  },
  ledgerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ledgerSubHeading: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: -8,
  },
  seeAllLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006B4D',
  },
  ledgerListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyFeed: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyFeedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  emptyFeedSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  txRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  txIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetailsCol: {
    flex: 1,
  },
  txItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  txCustomerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  txAmountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
});
