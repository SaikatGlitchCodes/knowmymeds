import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PreferencesData, ProfileData, ProfileService } from '../services/ProfileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  preferences: PreferencesData | null;
  loading: boolean;
  profileLoading: boolean;
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

  // Load profile and preferences data
  const loadProfileData = async (userId: string) => {
    setProfileLoading(true);
    try {
      const [profileData, preferencesData] = await Promise.all([
        ProfileService.getProfile(userId),
        ProfileService.getPreferences(userId)
      ]);
      setProfile(profileData);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateCachedProfile = (updates: ProfileData) => {
    setProfile(updates);
  };

  const updateCachedPreferences = (updates: PreferencesData) => {
    setPreferences(updates);
  };

  const refreshProfileData = async () => {
    if (session?.user.id) {
      await loadProfileData(session.user.id);
    }
  };

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
      async (_, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          await loadProfileData(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setPreferences(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error.message);
      } else {
        setSession(null);
        setUser(null);
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