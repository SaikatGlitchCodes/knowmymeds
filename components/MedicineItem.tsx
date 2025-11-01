import { medicineFormOptions } from "@/components/AddMedsForm";
import { NAV_THEME } from "@/constants";
import type { CalendarMedicineSummary } from "@/types/prescription";
import moment from "moment";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MedicineItemProps {
  medicine: CalendarMedicineSummary;
  onPress: (medicine: CalendarMedicineSummary) => void;
  getStatusBadgeStyle: (status: string) => any;
}

// Memoized component for better performance
const MedicineItem = memo(({ medicine, onPress, getStatusBadgeStyle }: MedicineItemProps) => {
  const getDynamicIcon = (form: string, size: number, color: string) => {
    const option = medicineFormOptions.find(
      (option) => option.title === form
    );
    return option?.getIcon ? option.getIcon(size, color) : null;
  };

  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(medicine)}>
      <View style={styles.iconContainer}>
        {getDynamicIcon(medicine.form, 24, NAV_THEME.dark.text)}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemText}>{medicine.medicine}</Text>
          <Text style={styles.timeText}>
            {moment(medicine.time_of_day, "HH:mm:ss").format("h:mm A")}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.dosageText}>{medicine.dose_in_mg}mg</Text>
          <View
            style={[styles.statusBadge, getStatusBadgeStyle(medicine.status)]}
          >
            <Text style={styles.statusText}>
              {medicine.status.charAt(0).toUpperCase() +
                medicine.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MedicineItem.displayName = "MedicineItem";

const styles = StyleSheet.create({
  item: {
    backgroundColor: NAV_THEME.dark.card,
    flexDirection: "row",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    marginTop: 7,
    marginBottom: 5,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemText: {
    color: NAV_THEME.dark.text,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  timeText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dosageText: {
    color: "#9ca3af",
    fontSize: 14,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: NAV_THEME.dark.border,
    borderRadius: 8,
  },
});

export default MedicineItem;