import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, formatNaira, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PlusCircle,
  CreditCard,
  Receipt,
  AlertCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { Badge } from '@/src/components/ui/Badge';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { business } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Initial demonstration summary data (aligned with PRD §8.10)
  const [summary] = useState({
    sales: 85000,
    collected: 70000,
    new_credit: 15000,
    expenses: 12000,
    net_movement: 58000, // 70,000 - 12,000
    customers_owing_count: 4,
    total_debt_owed: 37500,
  });

  const [recentTransactions] = useState([
    {
      id: 'tx-1',
      title: 'Mama Bisi',
      item: '2 Bags of Rice (50kg)',
      amount: 45000,
      paid: 30000,
      outstanding: 15000,
      status: 'part_paid' as const,
      time: '12:40 PM',
      type: 'sale',
    },
    {
      id: 'tx-2',
      title: 'Walk-in Cash Customer',
      item: 'Cooking Oil (5L)',
      amount: 14000,
      paid: 14000,
      outstanding: 0,
      status: 'paid' as const,
      time: '11:15 AM',
      type: 'sale',
    },
    {
      id: 'tx-3',
      title: 'Generator Fuel & Transport',
      item: 'Running cost (10L Petrol)',
      amount: 8500,
      paid: 8500,
      outstanding: 0,
      spend_type: 'running_cost' as const,
      time: '09:30 AM',
      type: 'expense',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const isDebtOnly = business?.mode === 'debt_only';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brandAccent} />
        }
      >
        {/* Header with Business Title */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Daily Business Book</Text>
            <Text style={styles.businessTitle}>{business?.name || 'My Shop'}</Text>
          </View>
          <View style={styles.modeTag}>
            <Text style={styles.modeTagText}>
              {isDebtOnly ? '⚡ Debt-Only Mode' : '📘 Full Book'}
            </Text>
          </View>
        </View>

        {/* PRD §8.16: If in Debt-Only Mode, lead with Owes */}
        {isDebtOnly ? (
          <View style={styles.debtBannerCard}>
            <View style={styles.debtHeaderRow}>
              <View style={styles.debtIconBox}>
                <AlertCircle size={24} color={COLORS.statusUnpaid} />
              </View>
              <View>
                <Text style={styles.debtCardLabel}>Total People Owe You</Text>
                <Text style={styles.debtAmount}>{formatNaira(summary.total_debt_owed)}</Text>
              </View>
            </View>
            <View style={styles.debtFooterRow}>
              <Text style={styles.debtCountText}>
                <Text style={styles.boldWhite}>{summary.customers_owing_count} customers</Text> have
                active balances
              </Text>
              <TouchableOpacity
                style={styles.viewOwesBtn}
                onPress={() => router.push('/(tabs)/owes')}
              >
                <Text style={styles.viewOwesBtnText}>View List →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* PRD §8.10: Full Dashboard Daily Summary Card */
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Today's Business Movement</Text>
              <View style={styles.dateBadge}>
                <Clock size={12} color={COLORS.textSecondary} />
                <Text style={styles.dateBadgeText}>Today</Text>
              </View>
            </View>

            {/* Net Movement Hero Box (Collected - Expenses) */}
            <View style={styles.netMovementHero}>
              <Text style={styles.netMovementLabel}>Net Money Movement (Cash in hand)</Text>
              <Text style={styles.netMovementValue}>{formatNaira(summary.net_movement)}</Text>
              <Text style={styles.netMovementFormula}>
                Calculated as: Cash Collected ({formatNaira(summary.collected)}) − Spent ({formatNaira(summary.expenses)})
              </Text>
            </View>

            {/* Metrics Breakdown Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View style={styles.metricIconLabel}>
                  <TrendingUp size={16} color={COLORS.primary} />
                  <Text style={styles.metricLabel}>Total Sales</Text>
                </View>
                <Text style={styles.metricValue}>{formatNaira(summary.sales)}</Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricIconLabel}>
                  <ArrowDownLeft size={16} color={COLORS.statusPaid} />
                  <Text style={styles.metricLabel}>Cash Collected</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.statusPaid }]}>
                  {formatNaira(summary.collected)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricIconLabel}>
                  <AlertCircle size={16} color={COLORS.statusUnpaid} />
                  <Text style={styles.metricLabel}>New Credit (Owed)</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.statusUnpaid }]}>
                  {formatNaira(summary.new_credit)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricIconLabel}>
                  <ArrowUpRight size={16} color={COLORS.textSecondary} />
                  <Text style={styles.metricLabel}>Expenses</Text>
                </View>
                <Text style={styles.metricValue}>{formatNaira(summary.expenses)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Action Buttons (Large Touch Targets, PRD §8.3) */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {/* Record Sale / Add Debt */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/sales')}
            >
              <PlusCircle size={28} color={COLORS.textInverse} />
              <Text style={styles.actionCardTitle}>
                {isDebtOnly ? 'Add Debt' : 'Record Sale'}
              </Text>
              <Text style={styles.actionCardSubtitle}>
                {isDebtOnly ? 'Log who took goods' : 'Cash or Credit'}
              </Text>
            </TouchableOpacity>

            {/* Record Payment */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/owes')}
            >
              <CreditCard size={28} color={COLORS.brandAccent} />
              <Text style={[styles.actionCardTitle, { color: COLORS.textPrimary }]}>
                Record Payment
              </Text>
              <Text style={styles.actionCardSubtitle}>Customer debt payment</Text>
            </TouchableOpacity>

            {/* Record Expense */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/more')}
            >
              <Receipt size={28} color={COLORS.statusPartPaid} />
              <Text style={[styles.actionCardTitle, { color: COLORS.textPrimary }]}>
                Record Expense
              </Text>
              <Text style={styles.actionCardSubtitle}>Stock or Running cost</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Who Owes You Widget */}
        <TouchableOpacity
          style={styles.owesBanner}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/owes')}
        >
          <View style={styles.owesBannerLeft}>
            <View style={styles.owesBadge}>
              <Text style={styles.owesBadgeText}>{summary.customers_owing_count}</Text>
            </View>
            <View>
              <Text style={styles.owesBannerTitle}>Customers Currently Owing</Text>
              <Text style={styles.owesBannerSubtitle}>Tap to check balances & send reminders</Text>
            </View>
          </View>
          <Text style={styles.owesBannerAmount}>{formatNaira(summary.total_debt_owed)}</Text>
        </TouchableOpacity>

        {/* Recent Transactions List */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sales')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txItem}>{tx.item}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>

              <View style={styles.txRight}>
                <Text style={styles.txAmount}>{formatNaira(tx.amount)}</Text>
                {tx.type === 'sale' ? (
                  <Badge status={tx.status} />
                ) : (
                  <Badge spendType={tx.spend_type} />
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    ...TYPOGRAPHY.caption,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: COLORS.brandAccent,
  },
  businessTitle: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  modeTag: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modeTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  netMovementHero: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  netMovementLabel: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    fontWeight: '600',
  },
  netMovementValue: {
    ...TYPOGRAPHY.amountDisplay,
    color: COLORS.textInverse,
    marginVertical: 4,
  },
  netMovementFormula: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
  },
  metricIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricValue: {
    ...TYPOGRAPHY.titleSmall,
    fontWeight: '700',
  },
  debtBannerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  debtHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  debtIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtCardLabel: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    fontWeight: '600',
  },
  debtAmount: {
    ...TYPOGRAPHY.amountDisplay,
    color: COLORS.textInverse,
  },
  debtFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  debtCountText: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    flex: 1,
  },
  boldWhite: {
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  viewOwesBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewOwesBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleSmall,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  actionCardTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
    fontSize: 13,
    marginTop: 8,
  },
  actionCardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  owesBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  owesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  owesBadge: {
    backgroundColor: COLORS.statusUnpaid,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  owesBadgeText: {
    color: COLORS.textInverse,
    fontWeight: '800',
    fontSize: 14,
  },
  owesBannerTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: '#991B1B',
  },
  owesBannerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#B91C1C',
    fontSize: 11,
  },
  owesBannerAmount: {
    ...TYPOGRAPHY.titleSmall,
    color: '#991B1B',
    fontWeight: '800',
  },
  recentSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.brandAccent,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSubtle,
  },
  txLeft: {
    flex: 1,
  },
  txTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  txItem: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  txTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    ...TYPOGRAPHY.titleSmall,
    fontWeight: '700',
  },
});
