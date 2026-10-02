import React from 'react';
import { Tabs } from 'expo-router';
import { FONTS } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Home, AlertCircle, Users, Menu } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTransactions } from '@/src/context/TransactionContext';

export default function TabsLayout() {
  const { summary } = useTransactions();
  const { colors, isDark } = useTheme();
  const owingCount = summary?.customers_owing_count || 0;
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom + 6 : (Platform.OS === 'ios' ? 26 : 18);
  const tabHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: isDark ? 0 : 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.bold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      {/* Sales history is accessible from Home and More, but hidden from the 4-button tab bar */}
      <Tabs.Screen
        name="sales"
        options={{
          href: null,
          title: 'Sales',
        }}
      />
      <Tabs.Screen
        name="owes"
        options={{
          title: 'Owes',
          tabBarIcon: ({ color }) => <AlertCircle size={22} color={color} strokeWidth={2.2} />,
          tabBarBadge: owingCount > 0 ? owingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.statusUnpaid,
            color: '#FFFFFF',
            fontFamily: FONTS.extraBold,
            fontSize: 10,
            lineHeight: 14,
            height: 16,
            minWidth: 16,
          },
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Menu size={22} color={color} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
