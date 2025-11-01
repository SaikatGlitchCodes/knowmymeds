import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-circular-progressbar/dist/styles.css';

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
