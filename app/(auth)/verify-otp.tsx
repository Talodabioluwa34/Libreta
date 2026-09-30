import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, TOUCH_TARGET, TYPOGRAPHY } from '@/src/constants/theme';
import { Button } from '@/src/components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, ArrowLeft } from 'lucide-react-native';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, sendOtp } = useAuth();

  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    const res = await verifyOtp(phone || '', code);
    setLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    await sendOtp(phone || '');
    setLoading(false);
    setTimer(45);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <KeyRound size={32} color={COLORS.brandAccent} />
            </View>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              Code sent to <Text style={styles.phoneHighlight}>{phone}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={[styles.otpInput, error ? styles.inputError : null]}
              placeholder="123456"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (error) setError('');
                if (text.length === 6) {
                  handleVerify(text);
                }
              }}
              autoFocus
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Verify Code"
              onPress={() => handleVerify()}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendPrompt}>Didn't receive the SMS?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 0}
              >
                <Text
                  style={[
                    styles.resendLink,
                    timer > 0 ? styles.resendDisabled : null,
                  ]}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pilot Test Helper */}
            <TouchableOpacity
              style={styles.demoShortcut}
              onPress={() => {
                setOtp('123456');
                handleVerify('123456');
              }}
            >
              <Text style={styles.demoShortcutText}>⚡ Auto-fill Pilot Code (123456)</Text>
            </TouchableOpacity>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    ...TYPOGRAPHY.bodyBold,
    marginLeft: 6,
    color: COLORS.textPrimary,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 24,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyRegular,
    marginTop: 6,
    textAlign: 'center',
  },
  phoneHighlight: {
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  otpInput: {
    height: 64,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: COLORS.primary,
    backgroundColor: COLORS.surfaceSubtle,
  },
  inputError: {
    borderColor: COLORS.statusUnpaid,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    textAlign: 'center',
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  resendPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  resendLink: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.brandAccent,
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
  demoShortcut: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoShortcutText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
