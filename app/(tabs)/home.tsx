import { NAV_THEME } from "@/constants";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import type { CalendarMedicineSummary } from "@/types/prescription";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Agenda } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { medicineFormOptions } from "@/components/AddMedsForm";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { fetchCalendarData, calendarData, updateIntakeStatus } =
    usePrescriptions();
  const [items, setItems] = useState<{ [key: string]: any[] }>({});

  // Load initial calendar data
  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date();
        const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

        await fetchCalendarData(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        );
      } catch (error) {
        console.error("Error loading calendar data:", error);
        Alert.alert("Error", "Failed to load calendar data");
      }
    };

    loadData();
  }, [fetchCalendarData]);

  // Update items when calendarData changes
  useEffect(() => {
    // Transform CalendarMedicineSummary to AgendaEntry format
    const transformedItems: { [key: string]: any[] } = {};

    // First, initialize all dates in the range with empty arrays
    const today = new Date();
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Generate all dates in the range and initialize with empty arrays
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split("T")[0];
      transformedItems[dateString] = [];
    }

    // Then populate dates that have medicine data
    Object.keys(calendarData).forEach((date) => {
      transformedItems[date] = calendarData[date].map((medicine) => ({
        name: medicine.medicine,
        height: 80,
        day: date,
        medicine: medicine,
      }));
    });

    setItems(transformedItems);
  }, [calendarData]);

  const loadItemsForMonth = useCallback((month: any) => {
    const year = month.year;
    const monthIndex = month.month - 1; // month is 1-based, Date constructor expects 0-based

    // Get first and last day of the month
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Add empty arrays for all days in the month if they don't exist
    setItems((prevItems) => {
      const newItems = { ...prevItems };

      for (
        let date = new Date(firstDay);
        date <= lastDay;
        date.setDate(date.getDate() + 1)
      ) {
        const dateString = date.toISOString().split("T")[0];
        if (!newItems[dateString]) {
          newItems[dateString] = [];
        }
      }

      return newItems;
    });
  }, []);

  const navigateToProfile = () => {
    router.push("/profile");
  };

  const handleMedicinePress = (item: CalendarMedicineSummary) => {
    const statusOptions = [
      {
        text: "Mark as Taken",
        onPress: () => handleStatusUpdate(item, "taken"),
      },
      {
        text: "Mark as Missed",
        onPress: () => handleStatusUpdate(item, "missed"),
      },
      {
        text: "Mark as Skipped",
        onPress: () => handleStatusUpdate(item, "skipped"),
      },
      { text: "Cancel", style: "cancel" as const },
    ];

    Alert.alert(
      item.medicine,
      `${item.dose_in_mg}mg • ${item.number_of_tablets} tablet(s) at ${item.time_of_day}\nStatus: ${item.status}`,
      statusOptions
    );
  };

  const handleStatusUpdate = async (
    item: CalendarMedicineSummary,
    status: CalendarMedicineSummary["status"]
  ) => {
    if (!item.date) return;

    try {
      await updateIntakeStatus(
        item.prescription_id,
        item.schedule_id,
        item.date,
        status
      );
    } catch (error) {
      console.error("Error updating medicine status:", error);
      Alert.alert("Error", "Failed to update medicine status");
    }
  };

  const renderItem = (item: any) => {
    const medicine: CalendarMedicineSummary = item.medicine;

    if (!medicine) return null;
    const iconName = medicineFormOptions.filter((option) => {
      return option.title === medicine.form;
    })[0].iconName;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleMedicinePress(medicine)}
      >
        <MaterialCommunityIcons name={iconName} size={40} color="white" />
        <View style={{ flex: 1 }}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemText}>{medicine.medicine}</Text>
            <Text style={styles.timeText}>{medicine.time_of_day}</Text>
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
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "taken":
        return styles.takenBadge;
      case "missed":
        return styles.missedBadge;
      case "skipped":
        return styles.skippedBadge;
      default:
        return styles.pendingBadge;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={navigateToProfile}>
            <Image
              source={{
                uri: profile?.avatar_url || user?.user_metadata?.avatar_url,
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>
                {profile?.full_name ||
                  user?.user_metadata?.full_name ||
                  user?.email}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.sectionTitle}>
            Take Medicine today for health tomorrow
          </Text>
        </View>
      </View>
      {/* Agenda should NOT be wrapped in ScrollView */}
      <Agenda
        items={items}
        loadItemsForMonth={loadItemsForMonth}
        selected={new Date().toISOString().split("T")[0]}
        renderItem={renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text style={styles.emptyDateText}>No medicines scheduled</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
        theme={{
          selectedDayBackgroundColor: "#4a90e2",
          todayTextColor: "#4a90e2",
          agendaTodayColor: "#4a90e2",
          dotColor: "#4a90e2",
          agendaKnobColor: "#4a90e2",
          calendarBackground: NAV_THEME.dark.background,
          dayTextColor: NAV_THEME.dark.text,
          reservationsBackgroundColor: NAV_THEME.dark.background,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAV_THEME.dark.background,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: NAV_THEME.dark.card,
    borderRadius: 30,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: { flex: 1 },
  welcomeText: { fontSize: 14, color: NAV_THEME.dark.text },
  userName: { fontSize: 18, fontWeight: "600", color: NAV_THEME.dark.text },
  signOutButton: {
    backgroundColor: NAV_THEME.dark.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: { color: "#fff", fontSize: 14, fontWeight: "500" },
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
  takenItem: {
    backgroundColor: "#1a3d2e",
    borderColor: NAV_THEME.dark.success,
  },
  missedItem: {
    backgroundColor: "#3d1a1a",
    borderColor: NAV_THEME.dark.danger,
  },
  skippedItem: {
    backgroundColor: "#3d2e1a",
    borderColor: NAV_THEME.dark.warning,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "300",
    color: NAV_THEME.dark.text,
    paddingTop: 30,
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
  completedText: {
    opacity: 0.7,
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
  pendingBadge: {
    backgroundColor: "#374151",
  },
  takenBadge: {
    backgroundColor: "#22c55e",
  },
  missedBadge: {
    backgroundColor: "#ef4444",
  },
  skippedBadge: {
    backgroundColor: "#f59e0b",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyDate: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDateText: {
    color: NAV_THEME.dark.text,
    fontSize: 16,
    marginBottom: 12,
    opacity: 0.7,
  },
  addMedicineButton: {
    backgroundColor: NAV_THEME.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMedicineText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
