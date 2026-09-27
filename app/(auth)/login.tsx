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
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleQuickDemo = (samplePhone: string) => {
    setPhone(samplePhone);
    handleSendOtp(samplePhone);
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
              title="Continue"
              onPress={() => handleSendOtp()}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Quick Pilot Tester Shortcuts */}
            <View style={styles.pilotSection}>
              <Text style={styles.pilotTitle}>⚡ 5-Vendor Pilot Test Mode:</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={styles.pilotChip}
                  onPress={() => handleQuickDemo('08012345678')}
                >
                  <Text style={styles.pilotChipText}>Trader Demo (0801...)</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
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
  pilotSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    borderWidth: 1,
    borderColor: COLORS.borderDark,
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
