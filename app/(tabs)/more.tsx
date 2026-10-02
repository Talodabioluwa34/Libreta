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
import { useTheme } from '@/src/context/ThemeContext';
import { FONTS } from '@/src/constants/theme';
import {
  Receipt,
  Store,
  Layers,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react-native';

export default function MoreScreen() {
  const { user, business, updateBusinessMode, logout } = useAuth();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>More</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Settings, expenses, and business options
          </Text>
        </View>

        {/* Business Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.profileIconCircle, { backgroundColor: colors.primarySurface }]}>
            <Store size={26} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.businessName, { color: colors.textPrimary }]}>
              {business?.name || 'My Shop'}
            </Text>
            <Text style={[styles.ownerName, { color: colors.textSecondary }]}>
              Owner: {user?.name || 'Vendor'} • {business?.business_type || 'General Trading'}
            </Text>
            <Text style={[styles.phoneText, { color: colors.textMuted }]}>
              Phone: {user?.phone || 'Not set'}
            </Text>
          </View>
        </View>

        {/* =========================================================================
            THEME & APPEARANCE (Light, Dark, System)
        ========================================================================= */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE</Text>
          <View
            style={[
              styles.themeSelectorCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Light */}
            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                themeMode === 'light' && [
                  styles.themeOptionBtnActive,
                  { backgroundColor: colors.primarySurface, borderColor: colors.primary },
                ],
              ]}
              activeOpacity={0.75}
              onPress={() => setThemeMode('light')}
            >
              <Sun
                size={18}
                color={themeMode === 'light' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themeMode === 'light' ? colors.primary : colors.textSecondary,
                    fontFamily: themeMode === 'light' ? FONTS.bold : FONTS.medium,
                  },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            {/* Dark */}
            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                themeMode === 'dark' && [
                  styles.themeOptionBtnActive,
                  { backgroundColor: colors.primarySurface, borderColor: colors.primary },
                ],
              ]}
              activeOpacity={0.75}
              onPress={() => setThemeMode('dark')}
            >
              <Moon
                size={18}
                color={themeMode === 'dark' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themeMode === 'dark' ? colors.primary : colors.textSecondary,
                    fontFamily: themeMode === 'dark' ? FONTS.bold : FONTS.medium,
                  },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>

            {/* System */}
            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                themeMode === 'system' && [
                  styles.themeOptionBtnActive,
                  { backgroundColor: colors.primarySurface, borderColor: colors.primary },
                ],
              ]}
              activeOpacity={0.75}
              onPress={() => setThemeMode('system')}
            >
              <Laptop
                size={18}
                color={themeMode === 'system' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themeMode === 'system' ? colors.primary : colors.textSecondary,
                    fontFamily: themeMode === 'system' ? FONTS.bold : FONTS.medium,
                  },
                ]}
              >
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Switcher Banner (PRD §8.16) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
            APP WORKFLOW MODE
          </Text>
          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleToggleMode}
          >
            <View style={styles.menuItemLeft}>
              <Layers size={22} color={colors.primary} />
              <View style={styles.modeTextCol}>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                  Current: {business?.mode === 'debt_only' ? '⚡ Debt-Only Mode' : '📘 Full Book'}
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                  {business?.mode === 'debt_only'
                    ? 'Leads with Owes. Tap to switch to Full Book (Sales + Expenses)'
                    : 'Leads with Sales. Tap to switch to lighter Debt-Only Mode'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Features & Expenses (PRD §8.9) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
            BUSINESS TRACKING
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Receipt size={20} color={colors.statusPartPaid} />
              <View>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                  Expenses Book
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                  Track Stock Restocking vs. Running costs
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Smartphone size={20} color={colors.primary} />
              <View>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                  Offline Sync Status
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                  All records saved locally and backed up
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
            SECURITY & SYSTEM
          </Text>

          <View
            style={[
              styles.menuItemStatic,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <Shield size={20} color={colors.textSecondary} />
              <View>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                  Data Privacy & RLS
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                  Multi-tenant Row-Level Security active
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <HelpCircle size={20} color={colors.textSecondary} />
              <View>
                <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                  Help & Support
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                  How to use Libreta in your market stall
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.debtBorder,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut size={18} color={colors.statusUnpaid} />
          <Text style={[styles.logoutText, { color: colors.statusUnpaid }]}>
            Log Out of Libreta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  profileIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  businessName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  ownerName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 2,
  },
  phoneText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  themeSelectorCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    gap: 6,
  },
  themeOptionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeOptionBtnActive: {
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 13,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  modeTextCol: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  menuItemSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
