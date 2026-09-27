import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { Business, BusinessMode, UserProfile } from '@/src/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  USER_PROFILE: 'libreta_user_profile',
  BUSINESS: 'libreta_business',
};

interface AuthContextType {
  user: UserProfile | null;
  business: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBusiness: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  setupBusiness: (data: {
    ownerName: string;
    businessName: string;
    businessType: string;
    mode: BusinessMode;
  }) => Promise<{ success: boolean; error?: string }>;
  updateBusinessMode: (mode: BusinessMode) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage helper across web & native
async function saveLocalData(key: string, value: any) {
  const str = JSON.stringify(value);
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, str);
    } catch {}
  } else {
    await SecureStore.setItemAsync(key, str);
  }
}

async function getLocalData(key: string) {
  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  } else {
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : null;
  }
}

async function removeLocalData(key: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {}
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session on startup
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await getLocalData(STORAGE_KEYS.USER_PROFILE);
        const storedBusiness = await getLocalData(STORAGE_KEYS.BUSINESS);

        if (storedUser) setUser(storedUser);
        if (storedBusiness) setBusiness(storedBusiness);
      } catch (err) {
        console.error('Failed to load local session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
        });
        if (error) return { success: false, error: error.message };
      }
      // In offline / preview test mode or when using test phones:
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms',
        });
        if (error) return { success: false, error: error.message };

        const userId = data.user?.id || 'demo-user-id';
        const profile: UserProfile = {
          id: userId,
          name: data.user?.user_metadata?.name || 'Trader',
          phone,
          created_at: new Date().toISOString(),
        };

        setUser(profile);
        await saveLocalData(STORAGE_KEYS.USER_PROFILE, profile);

        // Fetch user business if exists in Supabase
        const { data: businessData } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', userId)
          .single();

        if (businessData) {
          setBusiness(businessData);
          await saveLocalData(STORAGE_KEYS.BUSINESS, businessData);
        }

        return { success: true };
      } else {
        // Mock verification for local/pilot validation (accept any 6-digit code or '123456')
        if (otp.length !== 6) {
          return { success: false, error: 'Enter a valid 6-digit code' };
        }

        const profile: UserProfile = {
          id: 'local-trader-' + phone.slice(-4),
          name: 'Trader',
          phone,
          created_at: new Date().toISOString(),
        };

        setUser(profile);
        await saveLocalData(STORAGE_KEYS.USER_PROFILE, profile);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  };

  const setupBusiness = async (data: {
    ownerName: string;
    businessName: string;
    businessType: string;
    mode: BusinessMode;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User is not authenticated' };
      }

      const updatedProfile: UserProfile = {
        ...user,
        name: data.ownerName,
      };
      setUser(updatedProfile);
      await saveLocalData(STORAGE_KEYS.USER_PROFILE, updatedProfile);

      const newBusiness: Business = {
        id: 'biz-' + Math.random().toString(36).substring(2, 9),
        owner_id: user.id,
        name: data.businessName,
        business_type: data.businessType,
        currency: 'NGN',
        mode: data.mode,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { data: insertedBiz, error } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            name: data.businessName,
            business_type: data.businessType,
            currency: 'NGN',
            mode: data.mode,
          })
          .select()
          .single();

        if (!error && insertedBiz) {
          newBusiness.id = insertedBiz.id;
        }
      }

      setBusiness(newBusiness);
      await saveLocalData(STORAGE_KEYS.BUSINESS, newBusiness);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to setup business' };
    }
  };

  const updateBusinessMode = async (mode: BusinessMode) => {
    if (!business) return;
    const updated = { ...business, mode };
    setBusiness(updated);
    await saveLocalData(STORAGE_KEYS.BUSINESS, updated);

    if (isSupabaseConfigured) {
      await supabase.from('businesses').update({ mode }).eq('id', business.id);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setBusiness(null);
    await removeLocalData(STORAGE_KEYS.USER_PROFILE);
    await removeLocalData(STORAGE_KEYS.BUSINESS);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isLoading,
        isAuthenticated: !!user,
        hasBusiness: !!business,
        sendOtp,
        verifyOtp,
        setupBusiness,
        updateBusinessMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
