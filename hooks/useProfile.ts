import { useCallback, useState } from 'react';
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

  const updateProfile = useCallback(async (updates: Partial<ProfileData>): Promise<boolean> => {
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
  }, [session?.user.id, updateCachedProfile]);

  const updatePreferences = useCallback(async (updates: Partial<PreferencesData>): Promise<boolean> => {
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
  }, [session?.user?.id, updateCachedPreferences]);

  const uploadAvatar = useCallback(async (imageUri: string): Promise<boolean> => {
    if (!session?.user.id) return false;
    
    setUpdating(true);
    try {
      // Upload avatar and update database
      const avatarUrl = await ProfileService.uploadAvatar(session.user.id, imageUri);
      
      if (avatarUrl) {
        await refreshProfileData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [session?.user.id, refreshProfileData]);

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