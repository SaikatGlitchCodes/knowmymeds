import { NAV_THEME } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getImageBase64, openCamera } from "@/utils/imageUtils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddMedsHomePage = () => {
  const router = useRouter();
  const { session } = useAuth();
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
        console.log("NFC method not implemented yet");
        // TODO: Implement NFC functionality
      },
    },
    {
      logo: (
        <MaterialCommunityIcons name="text-shadow" size={50} color="white" />
      ),
      name: "Fill Form",
      methods: () => {
        router.push("/addMedsForm");
      },
    },
    {
      logo: (
        <MaterialCommunityIcons
          name="camera-plus-outline"
          size={50}
          color="white"
        />
      ),
      name: "Scan with AI",
      methods: async () => {
        try {
          setAiLoading(true);
          const { uri, canceled } = await openCamera({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          });
          
          if (!canceled && uri) {
            if (session?.user.id) {
              // const uploadedUri = await imageUploadService(session.user.id, uri, "prescription_imgs");
              const base64 = await getImageBase64(uri);
              const response = await axios.post('https://medicineschedulerai.onrender.com/generate/image', {
                imageBase64: base64,
              });
              const cleanedResponse =  JSON.parse(response.data.response.replace(/```json|```/g, '').trim());
              router.push({
              pathname: "/addMedsForm",
              params: { prefillData: JSON.stringify(cleanedResponse) },
            });
            }
          }
        } catch (error) {
          console.error("Error in AI scan:", error);
        } finally {
          setAiLoading(false);
          console.log("AI loading finished");
        }
      },
    },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? 50 : 0,
        backgroundColor: NAV_THEME.dark.background,
      }}
    >
      <KeyboardAvoidingView style={{ flex: 1, padding: 20 }}>
        <View style={{ flex: 1, paddingTop: 80 }}>
          <Text
            style={{
              color: NAV_THEME.dark.text,
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Add Medication
          </Text>
          <Text style={{ color: NAV_THEME.dark.text }}>
            Add your prescriptions using one of the methods below
          </Text>
          <View
            style={{
              justifyContent: "space-between",
              flex: 1,
              flexDirection: "row",
              marginTop: 40,
            }}
          >
            {methodsToCreatePrescription.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  height: 100,
                  width: 100,
                  backgroundColor: NAV_THEME.dark.btn,
                  opacity: (method.name === "Scan with AI" && aiLoading) ? 0.5 : 1,
                }}
                onPress={method.methods}
                disabled={method.name === "Scan with AI" && aiLoading}
              >
                {method.name === "Scan with AI" && aiLoading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  method.logo
                )}
                <Text style={{ color: NAV_THEME.dark.text }}>
                  {method.name === "Scan with AI" && aiLoading ? "Processing..." : method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddMedsHomePage;
