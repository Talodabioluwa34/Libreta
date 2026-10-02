import { Vibration, Platform } from 'react-native';

export const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        if (type === 'success') {
          navigator.vibrate([40, 60, 40]);
        } else {
          navigator.vibrate(15);
        }
      }
    } else {
      if (type === 'success') {
        Vibration.vibrate([0, 50, 40, 50]);
      } else if (type === 'medium') {
        Vibration.vibrate(25);
      } else {
        Vibration.vibrate(12);
      }
    }
  } catch {
    // Ignore environments where vibration is restricted
  }
};
