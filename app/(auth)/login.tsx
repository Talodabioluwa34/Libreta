import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';
import { Button } from '@/src/components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, quickDemoLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInstantDemo = async () => {
    setLoading(true);
    await quickDemoLogin();
    setLoading(false);
    router.replace('/(tabs)');
  };

  const handleSendOtp = async (inputPhone?: string) => {
    const rawNumber = inputPhone || phone;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid 10 or 11 digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    const fullPhone = cleanNumber.startsWith('0')
      ? '+234' + cleanNumber.substring(1)
      : cleanNumber.startsWith('234')
      ? '+' + cleanNumber
      : '+234' + cleanNumber;

    const res = await sendOtp(fullPhone);
    setLoading(false);

    if (res.success) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: fullPhone },
      });
    } else {
      setError(res.error || 'Could not send verification code');
    }
  };

  const handleQuickDemo = async (samplePhone: string) => {
    setPhone(samplePhone);
    await handleInstantDemo();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <BookOpen size={36} color={COLORS.brandAccent} />
            </View>
            <Text style={styles.brandTitle}>Libreta</Text>
            <Text style={styles.brandTagline}>Your business, in your pocket.</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.formTitle}>Enter your phone number</Text>
            <Text style={styles.formSubtitle}>
              We will send you a 6-digit verification code to keep your business book secure.
            </Text>

            <View style={[styles.phoneInputContainer, error ? styles.inputError : null]}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.flagEmoji}>🇳🇬</Text>
                <Text style={styles.countryCodeText}>+234</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="801 234 5678"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError('');
                }}
                maxLength={11}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Continue with Phone"
              onPress={() => handleSendOtp()}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Instant Demo Access Button */}
            <TouchableOpacity
              style={styles.instantDemoBtn}
              activeOpacity={0.8}
              onPress={handleInstantDemo}
            >
              <Text style={styles.instantDemoBtnTitle}>⚡ 1-Tap Demo: Enter Home Screen</Text>
              <Text style={styles.instantDemoBtnSub}>
                Instant access as Mama Chinedu Provisions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <View style={styles.footer}>
            <ShieldCheck size={18} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              Your records are backed up securely and isolated to your business.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    ...TYPOGRAPHY.titleLarge,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  brandTagline: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    ...TYPOGRAPHY.titleMedium,
  },
  formSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    backgroundColor: COLORS.surface,
    height: 58,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: COLORS.statusUnpaid,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCodeText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyBold,
    fontSize: 18,
    paddingLeft: 12,
    color: COLORS.textPrimary,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    marginTop: 6,
  },
  submitBtn: {
    marginTop: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 11,
  },
  instantDemoBtn: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantDemoBtnTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 14,
  },
  instantDemoBtnSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    fontSize: 11,
    marginTop: 2,
  },
  pilotTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pilotChip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pilotChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
});
