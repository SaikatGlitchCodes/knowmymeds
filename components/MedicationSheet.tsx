import { NAV_THEME } from "@/constants";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { CalendarMedicineSummary } from "@/services";
import {
    calculateCompletionPercentage,
    calculateDaysBetween,
} from "@/utils/medicationSheetUtils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import moment from "moment";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { ScrollView } from "react-native-gesture-handler";
import { medicineFormOptions } from "../constants/icon_time";

interface MedicationSheetProps {
  medicine: CalendarMedicineSummary;
  handleClose: () => void;
  updateIntakeStatus?: (
    prescriptionId: string,
    scheduleId: string,
    date: string,
    status: 'pending' | 'taken' | 'missed' | 'skipped',
    takenAt?: string
  ) => Promise<void>;
}

const MedicationSheet: React.FC<MedicationSheetProps> = ({
  medicine,
  handleClose,
  updateIntakeStatus: updateIntakeStatusFromParent,
}) => {
  const { fetchPrescriptionById, prescriptions, updateIntakeStatus } = usePrescriptions();
  
  useEffect(() => {
    fetchPrescriptionById(medicine.prescription_id);
  }, [medicine.prescription_id, fetchPrescriptionById]);

  const handlePrescriptionStatus = async (status: CalendarMedicineSummary['status']) => {
    if (medicine.prescription_id && medicine.schedule_id && medicine.date) {
      const updateFunction = updateIntakeStatusFromParent || updateIntakeStatus;
      await updateFunction(medicine.prescription_id, medicine.schedule_id, medicine.date, status);
    }
  }

  const getDynamicIcon = (form: string, size: number, color: string) => {
    const option = medicineFormOptions.find((option) => option.title === form);
    return option?.getIcon ? option.getIcon(size, color) : null;
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={{
            marginBottom: 8,
            fontSize: 16,
            fontWeight: "300",
            color: NAV_THEME.dark.text,
          }}
        >
          {medicine.medicine}{" "}
          {medicine.dose_in_mg ? `${medicine.dose_in_mg} mg` : ""}
        </Text>
        <AntDesign
          onPress={handleClose}
          name="close"
          size={20}
          color={NAV_THEME.dark.text}
        />
      </View>
      <Text style={{ color: NAV_THEME.dark.text }}>
        {medicine.uses_of_the_medicine}
      </Text>
      <View style={styles.infoSection}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={styles.iconContainer}>
            {medicine.form &&
              getDynamicIcon(medicine.form, 24, NAV_THEME.dark.text)}
          </View>
          <Text style={{ fontSize: 18, color: NAV_THEME.dark.text }}>
            {medicine?.form}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View>
            <Text style={styles.infoMutedInfo}>Duration</Text>
            <Text style={{ fontSize: 18, color: NAV_THEME.dark.text }}>
              {calculateDaysBetween(
                medicine.treatment_start_date,
                medicine.treatment_end_date
              )}{" "}
              days
            </Text>
          </View>
          <View>
            <Text style={styles.infoMutedInfo}>Dose</Text>
            <Text style={{ fontSize: 18, color: NAV_THEME.dark.text }}>
              {medicine?.dose_in_mg}
            </Text>
          </View>
          <View>
            <Text style={styles.infoMutedInfo}>Frequency</Text>
            <Text style={{ fontSize: 18, color: NAV_THEME.dark.text }}>
              {medicine?.times_per_day} times a day
            </Text>
          </View>
        </View>
      </View>
      <ScrollView
        horizontal
        snapToOffsets={[0, 230, 450]}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.infoCard}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              color: NAV_THEME.dark.text,
            }}
          >
            Progress
          </Text>
          <Text style={{ color: NAV_THEME.dark.text + "99" }}>
            Course started on{" "}
            {moment(medicine.treatment_start_date).format("DD MMM YYYY")}
          </Text>
          <View
            style={{
              marginVertical: 12,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <AnimatedCircularProgress
              size={150}
              width={8}
              fill={
                medicine.treatment_start_date && medicine.treatment_end_date
                  ? calculateCompletionPercentage(
                      medicine.treatment_start_date,
                      medicine.treatment_end_date
                    )
                  : 0
              }
              onAnimationComplete={() => console.log("onAnimationComplete")}
              tintColor={NAV_THEME.dark.primary}
              backgroundColor="gray"
            >
              {() => (
                <>
                  <Text style={{ fontSize: 24, color: NAV_THEME.dark.text }}>
                    {medicine.treatment_start_date &&
                    medicine.treatment_end_date
                      ? calculateCompletionPercentage(
                          medicine.treatment_start_date,
                          medicine.treatment_end_date
                        )
                      : 0}
                    %
                  </Text>
                  <Text style={{ color: NAV_THEME.dark.text + "99" }}>
                    completed
                  </Text>
                </>
              )}
            </AnimatedCircularProgress>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/sideEffects",
              params: { sideEffects: prescriptions?.side_effects },
            });
          }}
          style={[styles.infoCard, { backgroundColor: NAV_THEME.dark.primary }]}
        >
          <Image
            source={require("../assets/images/card_design.png")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 16,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              backgroundColor: NAV_THEME.dark.text,
              borderRadius: 8,
            }}
          >
            <Text>AI</Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: NAV_THEME.dark.text,
              }}
            >
              Possible Side effects
            </Text>
            <Text style={{ color: "white" }}>
              Learn more about this medication. Its side effects
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Text style={styles.statusText}>Status</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity onPress={() => handlePrescriptionStatus('pending')}>
          <Text
            style={[
              styles.statusButton,
              { backgroundColor: NAV_THEME.dark.warning },
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePrescriptionStatus('skipped')}>
          <Text
            style={[
              styles.statusButton,
              { backgroundColor: NAV_THEME.dark.primary },
            ]}
          >
            Change back to skip
          </Text>
        </TouchableOpacity>
      </View>
      {prescriptions?.special_instructions && (
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontSize: 18, color: "red" }}>
            Special Instructions
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "300", color: "gray" }}>
            {prescriptions?.special_instructions}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: NAV_THEME.dark.primary,
    borderRadius: 8,
  },
  infoSection: {
    gap: 24,
    backgroundColor: NAV_THEME.dark.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoMutedInfo: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "300",
    color: NAV_THEME.dark.text + "99",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    height: 280,
    borderRadius: 16,
    borderColor: NAV_THEME.dark.border,
    marginRight: 16,
    width: 230,
    justifyContent: "space-between",
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    color: NAV_THEME.dark.text,
    textAlign: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "500",
    color: NAV_THEME.dark.text,
    marginTop: 8,
  },
});

export default MedicationSheet;
