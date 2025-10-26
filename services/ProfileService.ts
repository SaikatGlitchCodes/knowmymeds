import { supabase } from "../lib/supabase";

export interface ProfileData {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
}

export interface PreferencesData {
  medication_reminders?: boolean;
  email_notifications?: boolean;
}

export class ProfileService {
  // Get user profile
  static async getProfile(userId: string) {
    console.log('getProfile');
    try {
      const { data, error } = await supabase
        .from("new_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: ProfileData) {
    console.log('updateProfile');
    try {
      const { data, error } = await supabase
        .from("new_profiles")
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Get user preferences
  static async getPreferences(userId: string) {
    console.log('getPreferences');
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching preferences:", error);
      return null;
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: PreferencesData) {
    console.log('updatePreferences');
    try {
      // Try to update first
      const { error: updateError, data: updatedPreferences } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single(); // Add .single() to get single object instead of array

      // If there was an update error, throw it
      if (updateError) throw updateError;
      return updatedPreferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  }

  // Upload avatar image
  static async uploadAvatar(userId: string, imageUri: string) {
    console.log('uploadAvatar');
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileName = `${userId}/avatar-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }
}
