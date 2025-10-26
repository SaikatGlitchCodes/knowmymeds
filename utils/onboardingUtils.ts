import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

// Configure Google Sign-In
GoogleSignin.configure({
  scopes: ["email", "profile"],
  webClientId:
    process.env.WEBCLIENTID! ||
    "12502910031-ufn781pfglonjvupbh778mlrqnr790en.apps.googleusercontent.com",
});

export const handleGoogleSignIn = async () => {
  console.log("Google Sign-In button pressed");
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (userInfo.data && userInfo.data.idToken) {
      await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.data.idToken,
      });
      // The AuthContext will handle navigation to HomeScreen
      console.log("Google Sign-In successful");
    } else {
      throw new Error("no ID token present!");
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User cancelled the login flow");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("Operation (e.g. sign in) is in progress already");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("Play services not available or outdated");
    } else {
      console.log("Google Sign-In error:", error);
    }
  }
};

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem("hasSeenOnboarding");
    Alert.alert(
      "Success",
      "Onboarding reset! Restart the app to see onboarding screens again."
    );
  } catch (error) {
    console.error("Error resetting onboarding:", error);
    Alert.alert("Error", "Failed to reset onboarding");
  }
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem("hasSeenOnboarding");
    return value === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

export const markOnboardingAsSeen = async () => {
  try {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
  } catch (error) {
    console.error("Error marking onboarding as seen:", error);
  }
};
