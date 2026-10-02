import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { COLORS, FONTS, formatNaira } from '@/src/constants/theme';
import { triggerHaptic } from '@/src/utils/feedback';

interface SuccessFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  amount?: number;
  subtitle?: string;
  type?: 'sale' | 'payment' | 'debt';
}

export const SuccessFeedbackModal: React.FC<SuccessFeedbackModalProps> = ({
  visible,
  onClose,
  title,
  amount,
  subtitle,
  type = 'sale',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      triggerHaptic('success');
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onClose();
      }, 1800);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const getAccentColor = () => {
    if (type === 'payment') return '#00513F';
    if (type === 'debt') return '#DC2626';
    return '#00513F';
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Unmistakable Big Green Checkmark Bubble */}
          <View style={[styles.iconCircle, { backgroundColor: getAccentColor() }]}>
            <Check size={36} color="#FFFFFF" strokeWidth={3.5} />
          </View>

          <Text style={styles.titleText}>{title}</Text>

          {amount !== undefined && amount > 0 && (
            <Text style={[styles.amountText, { color: getAccentColor() }]}>
              {formatNaira(amount)}
            </Text>
          )}

          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: getAccentColor() }]}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00513F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
  },
  amountText: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  doneButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
