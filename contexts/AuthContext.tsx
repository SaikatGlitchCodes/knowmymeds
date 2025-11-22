import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import { PreferencesData, ProfileData, ProfileService } from '../services/ProfileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  preferences: PreferencesData | null;
  loading: boolean;
  profileLoading: boolean;
  expoPushToken: string | null;
  hasNotificationPermission: boolean;
  signOut: () => Promise<void>;
  updateCachedProfile: (updates: ProfileData) => void;
  updateCachedPreferences: (updates: PreferencesData) => void;
  refreshProfileData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize notifications
  const { expoPushToken, hasPermission: hasNotificationPermission } = useNotifications();

  // Load profile and preferences data
  const loadProfileData = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const [profileData, preferencesData] = await Promise.all([
        ProfileService.getProfile(userId),
        ProfileService.getPreferences(userId)
      ]);
      setProfile(profileData);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateCachedProfile = useCallback((updates: ProfileData) => {
    setProfile(updates);
  }, []);

  const updateCachedPreferences = useCallback((updates: PreferencesData) => {
    setPreferences(updates);
  }, []);

  const refreshProfileData = useCallback(async () => {
    if (session?.user.id) {
      await loadProfileData(session.user.id);
    }
  }, [session?.user.id, loadProfileData]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {     
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error.message);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          // Load profile data for initial session
          await loadProfileData(session.user.id);
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session ? 'Session exists' : 'No session');
        console.log('🔄 Is initialized:', isInitialized.current, 'Current loading:', loading);
        
        // Don't set loading for TOKEN_REFRESHED events if we already have a session
        if (event === 'TOKEN_REFRESHED' && isInitialized.current && session) {
          console.log('Token refreshed for existing user, not setting loading');
          setSession(session);
          setUser(session.user);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          await loadProfileData(session.user.id);
          isInitialized.current = true;
        } else {
          // Clear all state when session is null
          setSession(null);
          setUser(null);
          setProfile(null);
          setPreferences(null);
          isInitialized.current = false;
        }
        
        console.log('✅ Setting loading to false after auth state change');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error.message);
      } else {
        // Clear local state immediately after successful sign out
        setSession(null);
        setUser(null);
        setProfile(null);
        setPreferences(null);
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signOut,
      profile,
      preferences,
      profileLoading,
      expoPushToken,
      hasNotificationPermission,
      updateCachedProfile,
      updateCachedPreferences,
      refreshProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}