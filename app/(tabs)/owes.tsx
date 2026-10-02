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
import { FONTS, formatNaira } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Search, AlertCircle, Phone, ArrowRight, CheckCircle2 } from 'lucide-react-native';

import { useTransactions } from '@/src/context/TransactionContext';
import { RecordPaymentModal } from '@/src/components/modals/RecordPaymentModal';
import { Customer } from '@/src/types';

export default function OwesScreen() {
  const { customers, totalDebtOwed } = useTransactions();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);

  const debtors = customers.filter((c) => (c.outstanding_balance || 0) > 0);

  const filteredDebtors = debtors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.phone && d.phone.includes(searchQuery))
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Who Owes You</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Outstanding customer debt & payment settlements
        </Text>
      </View>

      {/* Outstanding Total Banner */}
      <View
        style={[
          styles.totalBanner,
          {
            backgroundColor: colors.debtSurface,
            borderColor: colors.debtBorder,
          },
        ]}
      >
        <View style={styles.totalBannerLeft}>
          <Text style={[styles.totalBannerLabel, { color: colors.debtText }]}>
            Total Outstanding Debt
          </Text>
          <Text style={[styles.totalBannerAmount, { color: colors.debtText }]}>
            {formatNaira(totalDebtOwed)}
          </Text>
          <Text style={[styles.totalBannerSub, { color: colors.debtText }]}>
            {debtors.length} customers owe you money
          </Text>
        </View>
        <View style={[styles.alertIconCircle, { backgroundColor: 'rgba(220, 38, 38, 0.15)' }]}>
          <AlertCircle size={26} color={colors.statusUnpaid} />
        </View>
      </View>

      {/* Search Input */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search debtor name or phone..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Debtors List */}
      <FlatList
        data={filteredDebtors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.debtCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowOpacity: isDark ? 0 : 0.03,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.debtorName, { color: colors.textPrimary }]}>
                  {item.name}
                </Text>
                {item.phone ? (
                  <View style={styles.phoneRow}>
                    <Phone size={12} color={colors.textMuted} />
                    <Text style={[styles.phoneText, { color: colors.textMuted }]}>
                      {item.phone}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={[styles.balanceBadge, { backgroundColor: colors.debtSurface }]}>
                <Text style={[styles.balanceLabel, { color: colors.statusUnpaid }]}>Owes</Text>
                <Text style={[styles.balanceAmount, { color: colors.statusUnpaid }]}>
                  {formatNaira(item.outstanding_balance || 0)}
                </Text>
              </View>
            </View>

            {item.notes ? (
              <View
                style={[
                  styles.activityBox,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                  {item.notes}
                </Text>
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.recordPaymentBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDebtor(item);
                  setPaymentModalVisible(true);
                }}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.recordPaymentText}>Record Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.historyBtn,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.historyBtnText, { color: colors.textPrimary }]}>
                  Details
                </Text>
                <ArrowRight size={13} color={colors.textSecondary} />
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginTop: 2,
  },
  totalBanner: {
    borderRadius: 18,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  totalBannerLeft: {
    flex: 1,
  },
  totalBannerLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  totalBannerAmount: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    marginVertical: 2,
  },
  totalBannerSub: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  alertIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    paddingLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  debtCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  debtorName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  phoneText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  balanceBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  balanceLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
  },
  activityBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 10,
  },
  activityText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  recordPaymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    gap: 6,
  },
  recordPaymentText: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  historyBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
});
