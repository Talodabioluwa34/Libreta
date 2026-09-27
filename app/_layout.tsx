import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootNavigation() {
  const { user, business, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const segArray = segments as string[];
    const inAuthGroup = segArray[0] === '(auth)';

    if (!user) {
      // Not logged in -> go to login
      if (!inAuthGroup || segArray[1] !== 'login') {
        router.replace('/(auth)/login');
      }
    } else if (!business) {
      // Logged in but hasn't set up business -> go to setup
      if (segArray[1] !== 'business-setup') {
        router.replace('/(auth)/business-setup');
      }
    } else {
      // Logged in & business configured -> go to main tabs
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, business, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brandAccent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

import { TransactionProvider } from '@/src/context/TransactionContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TransactionProvider>
          <RootNavigation />
        </TransactionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
