import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import OnboardingScreen from "../components/OnboardingScreen";
import { useAuth } from "../contexts/AuthContext";
import { NAV_THEME } from "@/constants";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: NAV_THEME.dark.background,
        }}
      >
        <ActivityIndicator size="large" color={NAV_THEME.dark.primary} />
      </View>
    );
  }

  // If user has a session, redirect to tab navigation
  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If no session, show onboarding with login on last slide
  return <OnboardingScreen onComplete={() => {}} />;
}
