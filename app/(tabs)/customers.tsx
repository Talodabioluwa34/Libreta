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
import { UserPlus, Search, Phone, ChevronRight } from 'lucide-react-native';

import { useTransactions } from '@/src/context/TransactionContext';

export default function CustomersScreen() {
  const { customers } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Customers Directory</Text>
          <Text style={styles.subtitle}>{customers.length} registered customers</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <UserPlus size={18} color={COLORS.textInverse} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name or phone..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.customerCard} activeOpacity={0.7}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {item.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.customerName}>{item.name}</Text>
              <View style={styles.phoneRow}>
                <Phone size={12} color={COLORS.textMuted} />
                <Text style={styles.phoneText}>{item.phone}</Text>
              </View>
              {item.notes ? (
                <Text style={styles.notesText} numberOfLines={1}>
                  {item.notes}
                </Text>
              ) : null}
            </View>

            <View style={styles.rightCol}>
              {(item.outstanding_balance || 0) > 0 ? (
                <View style={styles.owingTag}>
                  <Text style={styles.owingTagText}>
                    Owes {formatNaira(item.outstanding_balance || 0)}
                  </Text>
                </View>
              ) : (
                <View style={styles.clearTag}>
                  <Text style={styles.clearTagText}>No Debt</Text>
                </View>
              )}
              <Text style={styles.totalPurchases}>
                Bought {formatNaira(item.total_purchases || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textInverse,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 10,
  },
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  notesText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  owingTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  owingTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.statusUnpaid,
  },
  clearTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clearTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.statusPaid,
  },
  totalPurchases: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
