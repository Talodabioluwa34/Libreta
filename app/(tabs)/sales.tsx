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

const FILTER_TABS = ['Today', 'Yesterday', 'This Week', 'This Month', 'All'];

export default function SalesScreen() {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');

  const [sales] = useState([
    {
      id: 'sale-1',
      customer: 'Mama Bisi',
      items: '2 Bags of Rice (50kg)',
      total: 45000,
      paid: 30000,
      outstanding: 15000,
      status: 'part_paid' as const,
      date: 'Today, 12:40 PM',
    },
    {
      id: 'sale-2',
      customer: 'Walk-in Cash Customer',
      items: 'Cooking Oil (5L) + 2 Salt',
      total: 14000,
      paid: 14000,
      outstanding: 0,
      status: 'paid' as const,
      date: 'Today, 11:15 AM',
    },
    {
      id: 'sale-3',
      customer: 'Ibrahim Carpenter',
      items: 'Pack of Nails & Screws',
      total: 6500,
      paid: 0,
      outstanding: 6500,
      status: 'unpaid' as const,
      date: 'Today, 09:20 AM',
    },
    {
      id: 'sale-4',
      customer: 'Sister Grace',
      items: 'Fashion Fabric (Lace material)',
      total: 22000,
      paid: 22000,
      outstanding: 0,
      status: 'paid' as const,
      date: 'Yesterday, 04:10 PM',
    },
  ]);

  const filteredSales = sales.filter((s) => {
    if (!searchQuery) return true;
    return (
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items.toLowerCase().includes(searchQuery.toLowerCase())
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.saleCard} activeOpacity={0.7}>
            <View style={styles.cardTop}>
              <View style={styles.cardCustomerInfo}>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.saleItems}>{item.items}</Text>
              </View>
              <Badge status={item.status} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.dateText}>{item.date}</Text>
                {item.outstanding > 0 ? (
                  <Text style={styles.outstandingAlert}>
                    Owes: {formatNaira(item.outstanding)}
                  </Text>
                ) : (
                  <Text style={styles.paidFullText}>Settled in full</Text>
                )}
              </View>
              <View style={styles.amountBox}>
                <Text style={styles.totalAmount}>{formatNaira(item.total)}</Text>
                <Text style={styles.paidSubtitle}>
                  Paid: {formatNaira(item.paid)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Plus size={24} color={COLORS.textInverse} />
        <Text style={styles.fabText}>Record Sale</Text>
      </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
  },
});
