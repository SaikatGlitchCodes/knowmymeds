import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PreferencesData, ProfileData, ProfileService } from '../services/ProfileService';

export const useProfile = () => {
  const { 
    session, 
    profile, 
    preferences, 
    profileLoading, 
    updateCachedProfile, 
    updateCachedPreferences, 
    refreshProfileData 
  } = useAuth();
  
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates: Partial<ProfileData>): Promise<boolean> => {
    if (!session?.user.id) return false;
    try {
      const updatedProfile = await ProfileService.updateProfile(session.user.id, updates);
      // Update the cached profile in AuthContext
      updateCachedProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updatePreferences = async (updates: Partial<PreferencesData>): Promise<boolean> => {
    if (!session?.user?.id) return false;
    try {
      const updatedPreferences = await ProfileService.updatePreferences(session.user.id, updates);
      // Update the cached preferences in AuthContext
      updateCachedPreferences(updatedPreferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  };

  const uploadAvatar = async (imageUri: string): Promise<boolean> => {
    if (!session?.user.id) return false;
    
    setUpdating(true);
    try {
      const avatarUrl = await ProfileService.uploadAvatar(session.user.id, imageUri);
      if (avatarUrl && profile) {
        const updatedProfile = { ...profile, avatar_url: avatarUrl };
        // Update the cached profile in AuthContext
        updateCachedProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    preferences,
    loading: profileLoading,
    updating,
    loadProfile: refreshProfileData, // Use the AuthContext refresh function
    updateProfile,
    updatePreferences,
    uploadAvatar,
    refreshProfile: refreshProfileData, // Use the AuthContext refresh function
  };
};