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
import { Badge } from '@/src/components/ui/Badge';
import { Plus, Search, Calendar, Filter } from 'lucide-react-native';

import { useTransactions } from '@/src/context/TransactionContext';
import { RecordSaleModal } from '@/src/components/modals/RecordSaleModal';

const FILTER_TABS = ['Today', 'Yesterday', 'This Week', 'This Month', 'All'];

export default function SalesScreen() {
  const { sales } = useTransactions();
  const [activeFilter, setActiveFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [saleModalVisible, setSaleModalVisible] = useState(false);

  const filteredSales = sales.filter((s) => {
    const custName = s.customer_name || 'Walk-in Cash Customer';
    const noteText = s.note || '';
    if (!searchQuery) return true;
    return (
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noteText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Book</Text>
        <Text style={styles.subtitle}>Track what you sell and cash collected</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer, item, or amount..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setActiveFilter(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sales List */}
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const unpaid = item.total_amount - item.amount_paid;
          return (
            <TouchableOpacity style={styles.saleCard} activeOpacity={0.7}>
              <View style={styles.cardTop}>
                <View style={styles.cardCustomerInfo}>
                  <Text style={styles.customerName}>{item.customer_name || 'Walk-in Cash Customer'}</Text>
                  <Text style={styles.saleItems}>{item.note || 'General Sale'}</Text>
                </View>
                <Badge status={item.status} />
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.dateText}>Today</Text>
                  {unpaid > 0 ? (
                    <Text style={styles.outstandingAlert}>
                      Owes: {formatNaira(unpaid)}
                    </Text>
                  ) : (
                    <Text style={styles.paidFullText}>Settled in full</Text>
                  )}
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.totalAmount}>{formatNaira(item.total_amount)}</Text>
                  <Text style={styles.paidSubtitle}>
                    Paid: {formatNaira(item.amount_paid)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setSaleModalVisible(true)}
      >
        <Plus size={24} color={COLORS.textInverse} />
        <Text style={styles.fabText}>Record Sale</Text>
      </TouchableOpacity>

      <RecordSaleModal
        visible={saleModalVisible}
        onClose={() => setSaleModalVisible(false)}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: TOUCH_TARGET.borderRadius,
    marginHorizontal: 20,
    marginVertical: 10,
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
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: COLORS.textInverse,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
    gap: 12,
  },
  saleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardCustomerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  saleItems: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceSubtle,
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  outstandingAlert: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    fontWeight: '700',
    marginTop: 2,
  },
  paidFullText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusPaid,
    fontWeight: '600',
    marginTop: 2,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    ...TYPOGRAPHY.titleSmall,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  paidSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
  },
  fabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
  },
});
