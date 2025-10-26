import { NAV_THEME } from "@/constants";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddMedsHomePage = () => {
  const router = useRouter();
  const [nfcVisible, setNfcVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Camera permission Required!");
      }
    })();
  }, []);

  const methodsToCreatePrescription = [
    {
      logo: <MaterialCommunityIcons name="nfc" size={50} color="white" />,
      name: "NFC",
      methods: async () => {
        setNfcVisible(true);
      }
    },
    {
      logo: <MaterialCommunityIcons name="text-shadow" size={50} color="white" />,
      name: "Fill Form",
      methods: () => {
      },
    },
    {
      logo: <MaterialCommunityIcons name="camera-plus-outline" size={50} color="white" />,
      name: "Scan with AI",
      methods: async () => {
      },
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: Platform.OS === "android" ? 50 : 0, backgroundColor: NAV_THEME.dark.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, padding: 20}}
      >
        <View style={{flex: 1, paddingTop: 80}}>
          <Text style={{color: NAV_THEME.dark.text, fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>
            Add Medication
          </Text>
          <Text  style={{color: NAV_THEME.dark.text}}>
            Add your prescriptions using one of the methods below
          </Text>
          <View style={{justifyContent: 'space-between', flex: 1, flexDirection: 'row', marginTop: 40}}>
            {methodsToCreatePrescription.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={{alignItems: 'center', justifyContent: 'center', borderRadius: 10, height: 100, width: 100, backgroundColor: NAV_THEME.dark.btn}}
                onPress={method.methods}
              >
                {method.logo}
                <Text style={{color: NAV_THEME.dark.text}}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddMedsHomePage;