import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import OnboardingScreen from "../components/OnboardingScreen";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
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
