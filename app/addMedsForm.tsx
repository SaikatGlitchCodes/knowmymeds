import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DosageScheduleForm,
  InstructionsForm,
  MedicineDetailsForm,
  MedicineInfo,
  frequencyOptions,
  medicineValidationSchema,
} from "../components/AddMedsForm";
import { NAV_THEME } from "../constants";
import { supabase } from "../lib/supabase";
import { PrescriptionService } from "../services";
import { mapFormToPrescriptionData } from "../utils/prescriptionUtils";

const AddMedsForm = () => {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const params = useLocalSearchParams();

  const prefillData = params.prefillData
    ? JSON.parse(params.prefillData as string)
    : {};
  const method = params.method || "";

  const initialValues: MedicineInfo = {
    medicine: prefillData?.medicine || "",
    dose_in_mg: prefillData?.dose_in_mg || "",
    form: prefillData?.form || "",
    quantity: prefillData?.quantity || "",
    frequency: prefillData?.frequency || frequencyOptions,
    special_instructions: prefillData?.special_instructions || "",
    start_date: prefillData?.start_date || "",
    end_date: prefillData?.end_date || "",
    prescription_refills: prefillData?.prescription_refills || 0,
    side_effects: prefillData?.side_effects || "",
    uses_of_the_medicine: prefillData?.uses_of_the_medicine || "",
  };

  const steps = [
    {
      title: "Medicine Details",
      component: (formikProps: any) => <MedicineDetailsForm {...formikProps} />,
    },
    {
      title: "Dosage & Schedule",
      component: (formikProps: any) => <DosageScheduleForm {...formikProps} />,
    },
    {
      title: "Instructions",
      component: (formikProps: any) => <InstructionsForm {...formikProps} />,
    },
  ];

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      router.back();
    }
  };

  const handleFormSubmission = async (values: MedicineInfo) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to add medicine");
        return;
      }
      console.log('method', method)
      // let value = method === 'fillForm' ? (await aiOnText(JSON.stringify(values))) : values;
      console.log(" AI Prefill Result: ", values);
      const prescriptionData = mapFormToPrescriptionData(values);
      await PrescriptionService.addMedicine(user.id, prescriptionData);

      Alert.alert(
        "Success",
        `Medicine "${values.medicine}" added successfully!`,
        [{ text: "OK", onPress: () => router.push("/") }]
      );
    } catch {
      Alert.alert("Error", "Failed to add medicine. Please try again.");
    }
  };

  const validateCurrentStep = async (formikProps: any, currentStep: number) => {
    const { validateForm, values, setTouched } = formikProps;
    const errors = await validateForm(values);

    const stepValidationFields: { [key: number]: string[] } = {
      0: ["medicine", "form"],
      1: ["dose_in_mg", "quantity", "frequency"],
      2: ["start_date", "end_date"], // Date fields are required
    };

    const currentFields = stepValidationFields[currentStep];
    const touchedFields = currentFields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: true,
      }),
      {}
    );
    setTouched(touchedFields);

    return !currentFields.some((field) => errors[field]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: NAV_THEME.dark.background }]}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={medicineValidationSchema}
        onSubmit={handleFormSubmission}
      >
        {(formikProps) => (
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <MaterialIcons
                  name="arrow-back-ios"
                  size={20}
                  color={NAV_THEME.dark.text}
                />
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${((stepIndex + 1) / steps.length) * 100}%` },
                  ]}
                />
              </View>

              <TouchableOpacity onPress={() => router.back()}>
                <AntDesign name="close" size={24} color={NAV_THEME.dark.text} />
              </TouchableOpacity>
            </View>

            {/* Step Content */}
            <ScrollView style={styles.content}>
              <Text style={[styles.stepTitle, { color: NAV_THEME.dark.text }]}>
                {steps[stepIndex].title}
              </Text>
              {steps[stepIndex].component(formikProps)}
            </ScrollView>

            {/* Next/Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: NAV_THEME.dark.primary },
                ]}
                onPress={async () => {
                  if (stepIndex === steps.length - 1) {
                    formikProps.handleSubmit();
                  } else {
                    const isValid = await validateCurrentStep(
                      formikProps,
                      stepIndex
                    );
                    if (isValid) {
                      setStepIndex(stepIndex + 1);
                    }
                  }
                }}
              >
                <Text style={styles.nextButtonText}>
                  {stepIndex === steps.length - 1 ? "Save Medicine" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    marginHorizontal: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: NAV_THEME.dark.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area padding for bottom
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddMedsForm;
