import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, formatNaira, TYPOGRAPHY } from '@/src/constants/theme';
import {
  Receipt,
  Store,
  Layers,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
} from 'lucide-react-native';

export default function MoreScreen() {
  const { user, business, updateBusinessMode, logout } = useAuth();

  const handleToggleMode = () => {
    const nextMode = business?.mode === 'full' ? 'debt_only' : 'full';
    const modeName = nextMode === 'debt_only' ? 'Debt-Only Mode' : 'Full Book';

    Alert.alert(
      'Switch Mode',
      `Switch your business book to ${modeName}? You can switch back anytime without losing any records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Mode',
          onPress: () => updateBusinessMode(nextMode),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your business book?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Settings, expenses, and business options</Text>
        </View>

        {/* Business Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIconCircle}>
            <Store size={28} color={COLORS.brandAccent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.businessName}>{business?.name || 'My Shop'}</Text>
            <Text style={styles.ownerName}>
              Owner: {user?.name || 'Vendor'} • {business?.business_type || 'General Trading'}
            </Text>
            <Text style={styles.phoneText}>Phone: {user?.phone || 'Not set'}</Text>
          </View>
        </View>

        {/* Mode Switcher Banner (PRD §8.16) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>App Workflow Mode</Text>
          <TouchableOpacity
            style={styles.modeCard}
            activeOpacity={0.8}
            onPress={handleToggleMode}
          >
            <View style={styles.menuItemLeft}>
              <Layers size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.menuItemTitle}>
                  Current: {business?.mode === 'debt_only' ? '⚡ Debt-Only Mode' : '📘 Full Book'}
                </Text>
                <Text style={styles.menuItemSubtitle}>
                  {business?.mode === 'debt_only'
                    ? 'Leads with Owes. Tap to switch to Full Book (Sales + Expenses)'
                    : 'Leads with Sales. Tap to switch to lighter Debt-Only Mode'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Features & Expenses (PRD §8.9) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Business Tracking</Text>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Receipt size={20} color={COLORS.statusPartPaid} />
              <View>
                <Text style={styles.menuItemTitle}>Expenses Book</Text>
                <Text style={styles.menuItemSubtitle}>
                  Track Stock Restocking vs. Running costs (Rent, Fuel, Transport)
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Smartphone size={20} color={COLORS.brandAccent} />
              <View>
                <Text style={styles.menuItemTitle}>Offline Sync Status</Text>
                <Text style={styles.menuItemSubtitle}>All records saved locally and backed up</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security & System</Text>

          <View style={styles.menuItemStatic}>
            <View style={styles.menuItemLeft}>
              <Shield size={20} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.menuItemTitle}>Data Privacy & RLS</Text>
                <Text style={styles.menuItemSubtitle}>Multi-tenant Row-Level Security active</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <HelpCircle size={20} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.menuItemTitle}>Help & Support</Text>
                <Text style={styles.menuItemSubtitle}>How to use Libreta in your market stall</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.statusUnpaid} />
          <Text style={styles.logoutText}>Log Out of Libreta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Libreta v1.0.0 (MVP Build) • Designed for Nigeria 🇳🇬</Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  profileIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  businessName: {
    ...TYPOGRAPHY.titleSmall,
    color: COLORS.textPrimary,
  },
  ownerName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phoneText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.brandAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuItemStatic: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  menuItemTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
  },
  menuItemSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.statusUnpaid,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 20,
  },
});
