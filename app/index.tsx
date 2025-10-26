import { ActivityIndicator, View } from "react-native";
import HomeScreen from "../components/HomeScreen";
import LoginScreen from "../components/LoginScreen";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { session, loading } = useAuth();

  console.log('session', session, 'loading', loading)

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

  return session ? <HomeScreen /> : <LoginScreen />;
}
