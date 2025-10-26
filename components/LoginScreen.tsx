import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  GoogleSignin.configure({
    scopes: ['email', 'profile'],
    webClientId: process.env.WEBCLIENTID! || '12502910031-ufn781pfglonjvupbh778mlrqnr790en.apps.googleusercontent.com',
  });
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/brand.png')} style={{ width: 220, height: 220, marginBottom: 30 }} />
      <View>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>KnowMyMeds</Text>
      </View>

      <Text style={styles.subtitle}>Please sign in to continue</Text>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={async () => {
          console.log('Google Sign-In button pressed');
          try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data && userInfo.data.idToken) {
              await supabase.auth.signInWithIdToken({
                provider: "google",
                token: userInfo.data.idToken,
              });
            } else {
              throw new Error("no ID token present!");
            }
          } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
              console.log('Operation (e.g. sign in) is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              console.log('Play services not available or outdated');
            } else {
              console.log('err', error);
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    marginTop: 60,
    alignItems: "center",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    paddingHorizontal: 30,
    textAlign: "center",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  brand:{
    fontSize: 42,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 20,
  }
});
