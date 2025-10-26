export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  app_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
}

export interface PreferencesUpdateData {
  app_notifications?: boolean;
  email_notifications?: boolean;
}