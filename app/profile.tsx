import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NAV_THEME } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { useProfile } from "../hooks/useProfile";
import { openGallery } from "../utils/imageUtils";

const Profile = () => {
  const { user, signOut } = useAuth();
  const {
    profile,
    preferences,
    loading,
    updating,
    updateProfile,
    updatePreferences,
    uploadAvatar,
  } = useProfile();
  const [tempProfile, setTempProfile] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    avatar_url: '',
  });

  const [tempPreferences, setTempPreferences] = useState({
    email_notifications: true,
    medication_reminders: true,
  });

  // Debounced save functions with useCallback to prevent infinite re-renders
  const saveProfileDebounced = useCallback(async (profileData: any) => {
    try {
      const success = await updateProfile(profileData);
      if (success) {
        Alert.alert('Success', 'Profile changes saved successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to save profile changes');
    }
  }, [updateProfile]);

  const savePreferencesDebounced = useCallback(async (preferencesData: any) => {
    try {
      const success = await updatePreferences(preferencesData);
      if (success) {
        Alert.alert('Success', 'Preferences changes saved successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to save preference changes');
    }
  }, [updatePreferences]);

  // Create debounced versions with 1.5 second delay
  const { debouncedCallback: debouncedSaveProfile } = useDebounce(saveProfileDebounced, 1500);
  const { debouncedCallback: debouncedSavePreferences } = useDebounce(savePreferencesDebounced, 1500);

  // Initialize temp state when profile data is loaded
  useEffect(() => {
    if (profile) {
      setTempProfile({
        full_name: profile.full_name || user?.user_metadata?.name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        avatar_url: profile.avatar_url || user?.user_metadata?.avatar_url || '',
      });
    }
  }, [profile, user]);

  // Initialize temp preferences when preferences data is loaded
  useEffect(() => {
    if (preferences) {
      setTempPreferences({
        email_notifications: Boolean(preferences.email_notifications ?? true),
        medication_reminders: Boolean(preferences.medication_reminders ?? true),
      });
    }
  }, [preferences]);

  // Auto-save profile when tempProfile changes
  useEffect(() => {
    if (profile) { // Only save if profile has been loaded
      const profileChanges: any = {};
      
      // Check for actual changes compared to loaded profile
      if (tempProfile.full_name !== profile.full_name && tempProfile.full_name?.trim()) {
        profileChanges.full_name = tempProfile.full_name;
      }
      if (tempProfile.phone !== profile.phone && tempProfile.phone?.trim()) {
        profileChanges.phone = tempProfile.phone;
      }
      if (tempProfile.date_of_birth !== profile.date_of_birth && tempProfile.date_of_birth?.trim()) {
        profileChanges.date_of_birth = tempProfile.date_of_birth;
      }

      // Only save if there are actual changes
      if (Object.keys(profileChanges).length > 0) {
        debouncedSaveProfile(profileChanges);
      }
    }
  }, [tempProfile, profile, debouncedSaveProfile]);

  // Auto-save preferences when tempPreferences changes
  useEffect(() => {
    if (preferences) { // Only save if preferences have been loaded
      const preferenceChanges: any = {};
      
      // Check for actual changes compared to loaded preferences
      if (tempPreferences.email_notifications !== preferences.email_notifications) {
        preferenceChanges.email_notifications = tempPreferences.email_notifications;
      }
      if (tempPreferences.medication_reminders !== preferences.medication_reminders) {
        preferenceChanges.medication_reminders = tempPreferences.medication_reminders;
      }

      // Only save if there are actual changes
      if (Object.keys(preferenceChanges).length > 0) {
        debouncedSavePreferences(preferenceChanges);
      }
    }
  }, [tempPreferences, preferences, debouncedSavePreferences]);

  const handleImagePicker = async () => {
    const result = await openGallery();
    
    if (!result.canceled && result.uri) {
      await handleImageUpload(result.uri);
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    try {
      const success = await uploadAvatar(imageUri);
      if (success) {
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  // Handle profile field changes with local state update
  const handleProfileChange = (field: keyof typeof tempProfile, value: string) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle preference changes with local state update
  const handlePreferenceToggle = (key: keyof typeof tempPreferences, value: boolean) => {
    setTempPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Sign Out", 
        style: "destructive", 
        onPress: async () => {
          await signOut();
          // Don't manually navigate - let the AuthContext handle the redirect
        }
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Alert.alert("Account deleted");
            await signOut();
            // Don't manually navigate - let the AuthContext handle the redirect
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarContainer}>
            {loading || updating ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color={NAV_THEME.dark.primary} />
              </View>
            ) : tempProfile?.avatar_url ? (
              <Image
                source={{ uri: tempProfile?.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {tempProfile?.full_name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.updateButton,
                (loading || updating) && styles.updateButtonDisabled
              ]}
              onPress={handleImagePicker}
              disabled={loading || updating}
            >
              <Text style={styles.updateButtonText}>
                {updating ? 'Uploading...' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{tempProfile?.full_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.full_name}
              onChangeText={(text) => handleProfileChange('full_name', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.phone}
              onChangeText={(text) => handleProfileChange('phone', text)}
              placeholder="Enter your phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email}
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.date_of_birth}
              onChangeText={(text) => handleProfileChange('date_of_birth', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Medication Reminders</Text>
              <Text style={styles.preferenceDescription}>
                Receive push notifications for medication reminders
              </Text>
            </View>
            <Switch
              value={tempPreferences?.medication_reminders}
              onValueChange={(value) => handlePreferenceToggle('medication_reminders', value)}
              trackColor={{ false: NAV_THEME.dark.border, true: NAV_THEME.dark.primary }}
              thumbColor={
                tempPreferences?.medication_reminders ? "#fff" : "#9ca3af"
              }
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Email Notifications</Text>
              <Text style={styles.preferenceDescription}>
                Receive email updates about your medications
              </Text>
            </View>
            <Switch
              value={tempPreferences?.email_notifications}
              onValueChange={(val) => handlePreferenceToggle('email_notifications', val)}
              trackColor={{ false: NAV_THEME.dark.border, true: NAV_THEME.dark.primary }}
              thumbColor={
                tempPreferences?.email_notifications ? "#fff" : "#9ca3af"
              }
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              Once you delete your account, there is no going back.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAV_THEME.dark.background,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: NAV_THEME.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: NAV_THEME.dark.border,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: NAV_THEME.dark.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: NAV_THEME.dark.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: NAV_THEME.dark.card,
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: NAV_THEME.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  updateButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: NAV_THEME.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: NAV_THEME.dark.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#9ca3af", // Keep as muted text
  },
  section: {
    backgroundColor: NAV_THEME.dark.card,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: NAV_THEME.dark.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d1d5db", // Light gray text
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: NAV_THEME.dark.border,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: NAV_THEME.dark.text,
    backgroundColor: NAV_THEME.dark.background,
  },
  disabledInput: {
    backgroundColor: NAV_THEME.dark.border,
    color: "#9ca3af", // Muted text
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af", // Muted text
    marginTop: 4,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: NAV_THEME.dark.border,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: NAV_THEME.dark.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#9ca3af", // Muted text
  },
  signOutButton: {
    backgroundColor: NAV_THEME.dark.notification,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: NAV_THEME.dark.border,
    paddingTop: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: NAV_THEME.dark.notification,
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: "#9ca3af", // Muted text
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: "#dc2626", // Keep darker red for delete
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingText: {
    color: NAV_THEME.dark.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Profile;
