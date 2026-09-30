import React from 'react';
import { Tabs } from 'expo-router';
import { COLORS, TYPOGRAPHY } from '@/src/constants/theme';
import { Home, ShoppingBag, AlertCircle, Users, Menu } from 'lucide-react-native';
import { Platform } from 'react-native';

import { useTransactions } from '@/src/context/TransactionContext';

export default function TabsLayout() {
  const { summary } = useTransactions();
  const owingCount = summary?.customers_owing_count || 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 6,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
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
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
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
