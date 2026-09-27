import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, formatNaira, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';
import { Search, AlertCircle, Phone, ArrowRight, CheckCircle2 } from 'lucide-react-native';

import { useTransactions } from '@/src/context/TransactionContext';
import { RecordPaymentModal } from '@/src/components/modals/RecordPaymentModal';
import { Customer } from '@/src/types';

export default function OwesScreen() {
  const { customers, totalDebtOwed } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);

  const debtors = customers.filter((c) => (c.outstanding_balance || 0) > 0);

  const filteredDebtors = debtors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.phone && d.phone.includes(searchQuery))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Who Owes You</Text>
        <Text style={styles.subtitle}>Outstanding customer debt & payment settlements</Text>
      </View>

      {/* Outstanding Total Banner */}
      <View style={styles.totalBanner}>
        <View style={styles.totalBannerLeft}>
          <Text style={styles.totalBannerLabel}>Total Outstanding Debt</Text>
          <Text style={styles.totalBannerAmount}>{formatNaira(totalDebtOwed)}</Text>
          <Text style={styles.totalBannerSub}>{debtors.length} customers owe you money</Text>
        </View>
        <View style={styles.alertIconCircle}>
          <AlertCircle size={28} color={COLORS.statusUnpaid} />
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search debtor name or phone..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Debtors List */}
      <FlatList
        data={filteredDebtors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.debtCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.debtorName}>{item.name}</Text>
                <View style={styles.phoneRow}>
                  <Phone size={13} color={COLORS.textMuted} />
                  <Text style={styles.phoneText}>{item.phone}</Text>
                </View>
              </View>

              <View style={styles.balanceBadge}>
                <Text style={styles.balanceLabel}>Owes</Text>
                <Text style={styles.balanceAmount}>{formatNaira(item.outstanding_balance || 0)}</Text>
              </View>
            </View>

            <View style={styles.activityBox}>
              <Text style={styles.activityText}>Notes: {item.notes || 'Active debt account'}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.recordPaymentBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDebtor(item);
                  setPaymentModalVisible(true);
                }}
              >
                <CheckCircle2 size={16} color={COLORS.textInverse} />
                <Text style={styles.recordPaymentText}>Record Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.historyBtn} activeOpacity={0.7}>
                <Text style={styles.historyBtnText}>Details</Text>
                <ArrowRight size={14} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <RecordPaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        preselectedCustomer={selectedDebtor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 24,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  totalBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalBannerLeft: {
    flex: 1,
  },
  totalBannerLabel: {
    ...TYPOGRAPHY.caption,
    color: '#991B1B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalBannerAmount: {
    ...TYPOGRAPHY.amountDisplay,
    fontSize: 28,
    color: '#991B1B',
    marginVertical: 2,
  },
  totalBannerSub: {
    ...TYPOGRAPHY.caption,
    color: '#B91C1C',
    fontSize: 12,
  },
  alertIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    paddingLeft: 8,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  debtCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  debtorName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  phoneText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  balanceBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.statusUnpaid,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.statusUnpaid,
    fontWeight: '800',
    fontSize: 16,
  },
  activityBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 10,
  },
  activityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  recordPaymentBtn: {
    flex: 1,
    backgroundColor: COLORS.brandAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  recordPaymentText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
