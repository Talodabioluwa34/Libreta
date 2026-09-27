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
import { BusinessMode } from '@/src/types';
import { Store, Check, BookOpen, Users } from 'lucide-react-native';

const BUSINESS_TYPES = [
  'Provision / Mini-Mart',
  'Fashion / Boutique / Shoes',
  'Foodstuff / Market Trader',
  'Phone & Electronics Accessories',
  'WhatsApp / Home Seller',
  'Bakery / Snacks / Drinks',
  'General Trading',
];

export default function BusinessSetupScreen() {
  const router = useRouter();
  const { setupBusiness } = useAuth();

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [mode, setMode] = useState<BusinessMode>('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!ownerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!businessName.trim()) {
      setError('Please enter your business or shop name');
      return;
    }

    setError('');
    setLoading(true);

    const res = await setupBusiness({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      businessType,
      mode,
    });

    setLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Failed to complete business setup');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Store size={32} color={COLORS.brandAccent} />
            </View>
            <Text style={styles.title}>Set up your Business Book</Text>
            <Text style={styles.subtitle}>
              Takes less than 30 seconds. You can always change these settings later.
            </Text>
          </View>

          <View style={styles.card}>
            {/* Owner Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mama Chinedu / Tunde"
                placeholderTextColor={COLORS.textMuted}
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>

            {/* Business Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Shop / Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chinedu Provision Store"
                placeholderTextColor={COLORS.textMuted}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            {/* Business Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Business Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeRow}
              >
                {BUSINESS_TYPES.map((type) => {
                  const isSelected = businessType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                      onPress={() => setBusinessType(type)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && styles.typeChipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Currency Banner */}
            <View style={styles.currencyBox}>
              <Text style={styles.currencyLabel}>Default Currency:</Text>
              <Text style={styles.currencyValue}>₦ NGN (Nigerian Naira)</Text>
            </View>

            {/* PRD §8.16: Mode Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>How do you want to use Libreta?</Text>

              {/* Mode Option 1: Full Book */}
              <TouchableOpacity
                style={[styles.modeCard, mode === 'full' && styles.modeCardSelected]}
                onPress={() => setMode('full')}
                activeOpacity={0.8}
              >
                <View style={styles.modeIcon}>
                  <BookOpen
                    size={22}
                    color={mode === 'full' ? COLORS.brandAccent : COLORS.textSecondary}
                  />
                </View>
                <View style={styles.modeTextContainer}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>Full Digital Book</Text>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  </View>
                  <Text style={styles.modeDesc}>
                    Record daily sales, cash collected, who owes you, and business expenses.
                  </Text>
                </View>
                {mode === 'full' ? (
                  <View style={styles.checkCircle}>
                    <Check size={16} color={COLORS.surface} />
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Mode Option 2: Debt-Only Mode */}
              <TouchableOpacity
                style={[styles.modeCard, mode === 'debt_only' && styles.modeCardSelected]}
                onPress={() => setMode('debt_only')}
                activeOpacity={0.8}
              >
                <View style={styles.modeIcon}>
                  <Users
                    size={22}
                    color={mode === 'debt_only' ? COLORS.statusPartPaid : COLORS.textSecondary}
                  />
                </View>
                <View style={styles.modeTextContainer}>
                  <Text style={styles.modeTitle}>Debt-Only Mode</Text>
                  <Text style={styles.modeDesc}>
                    "I just want to track who owes me money." Skip logging cash sales and record debts in 1 click.
                  </Text>
                </View>
                {mode === 'debt_only' ? (
                  <View style={[styles.checkCircle, { backgroundColor: COLORS.statusPartPaid }]}>
                    <Check size={16} color={COLORS.surface} />
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Open My Libreta"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
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
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: TOUCH_TARGET.borderRadius,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  typeRow: {
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeChipTextSelected: {
    color: COLORS.textInverse,
  },
  currencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  currencyValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.brandAccent,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  modeCardSelected: {
    borderColor: COLORS.brandAccent,
    backgroundColor: '#F0FDF4',
  },
  modeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    ...TYPOGRAPHY.bodyBold,
  },
  recommendedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  modeDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 2,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.statusUnpaid,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 6,
  },
});
