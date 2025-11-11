import { NAV_THEME } from "@/constants";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import type { CalendarMedicineSummary } from "@/types/prescription";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Agenda } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";

import MedicationSheet from "@/components/MedicationSheet";
import MedicineItem from "@/components/MedicineItem";
import TrueSheet from "@/components/TrueSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import SwipeButton from "rn-swipe-button";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { calendarData, updateIntakeStatus, refreshCalendarData } =
    usePrescriptions();
  const [items, setItems] = useState<{ [key: string]: any[] }>({});
  const [selectedItem, setSelectedItem] =
    useState<CalendarMedicineSummary | null>(null);
  const trueSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial calendar data
  useEffect(() => {
    refreshCalendarData();
  }, []);

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

  const handleStatusUpdate = useCallback(
    async (
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
    },
    [updateIntakeStatus]
  );

  const handleMedicinePress = (item: CalendarMedicineSummary) => {
    trueSheetRef?.current?.snapToIndex(0);
    setSelectedItem(item);
  };

  const getStatusBadgeStyle = useCallback((status: string) => {
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
  }, []);

  const renderItem = useCallback(
    (item: any) => {
      const medicine: CalendarMedicineSummary = item.medicine;

      if (!medicine) return null;
      return (
        <MedicineItem
          medicine={medicine}
          onPress={handleMedicinePress}
          getStatusBadgeStyle={getStatusBadgeStyle}
        />
      );
    },
    [getStatusBadgeStyle]
  );

  const handleSwipeSuccess = () => {
    handleStatusUpdate(selectedItem as CalendarMedicineSummary, "taken");
    trueSheetRef?.current?.close();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCalendarData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background1.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/login.png")}
            style={styles.headerBackgroundImg}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={navigateToProfile}
            >
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[NAV_THEME.dark.primary]}
              progressBackgroundColor={"black"}
            />
          }
          items={items}
          loadItemsForMonth={loadItemsForMonth}
          selected={new Date().toISOString().split("T")[0]}
          pastScrollRange={2}
          futureScrollRange={2}
          removeClippedSubviews={true}
          renderItem={renderItem}
          renderEmptyDate={() => (
            <View style={styles.emptyDate}>
              <Text style={styles.emptyDateText}>No medicines scheduled</Text>
            </View>
          )}
          theme={{
            selectedDayBackgroundColor: NAV_THEME.dark.primary,
            todayTextColor: NAV_THEME.dark.primary,
            agendaTodayColor: NAV_THEME.dark.primary,
            dotColor: NAV_THEME.dark.primary,
            agendaKnobColor: NAV_THEME.dark.primary,
            calendarBackground: NAV_THEME.dark.background,
            dayTextColor: NAV_THEME.dark.text,
            reservationsBackgroundColor: NAV_THEME.dark.background,
            monthTextColor: NAV_THEME.dark.text,
            agendaDayTextColor: NAV_THEME.dark.text,
            agendaDayNumColor: NAV_THEME.dark.text,
          }}
        />
        {selectedItem && (
          <TrueSheet
            ref={trueSheetRef}
            snapPoint={
              selectedItem?.status === "taken" ? ["50%", "80%"] : ["15%", "70%"]
            }
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "300",
                  color: NAV_THEME.dark.text,
                  textAlign: "center",
                }}
              >
                {selectedItem.medicine}{" "}
                {selectedItem.dose_in_mg ? `${selectedItem.dose_in_mg} mg` : ""}{" "}
                | {selectedItem.number_of_tablets} {selectedItem.form}
              </Text>
              {selectedItem?.status !== "taken" && (
                <SwipeButton
                  title="Swipe to take"
                  disableResetOnTap
                  onSwipeSuccess={handleSwipeSuccess}
                  containerStyles={{
                    backgroundColor: NAV_THEME.dark.primary,
                    margin: 20,
                  }}
                  thumbIconBackgroundColor={NAV_THEME.dark.btn}
                  thumbIconBorderColor={NAV_THEME.dark.btn}
                  titleStyles={{ color: NAV_THEME.dark.text }}
                  railBackgroundColor={NAV_THEME.dark.card}
                  railBorderColor={NAV_THEME.dark.border}
                  thumbIconWidth={60}
                  railFillBackgroundColor={NAV_THEME.dark.btn}
                  railFillBorderColor={NAV_THEME.dark.btn}
                  shouldResetAfterSuccess={true}
                />
              )}
              <MedicationSheet
                medicine={selectedItem}
                handleClose={() => setSelectedItem(null)}
                updateIntakeStatus={updateIntakeStatus}
              />
            </View>
          </TrueSheet>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: NAV_THEME.dark.background,
  },
  backgroundImageStyle: {
    resizeMode: "cover" as const,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: NAV_THEME.dark.card,
    borderRadius: 30,
    marginHorizontal: 12,
    overflow: "hidden",
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
  welcomeText: { fontSize: 18, color: NAV_THEME.dark.text },
  userName: { fontSize: 18, fontWeight: "600", color: NAV_THEME.dark.text },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "200",
    color: NAV_THEME.dark.text,
    paddingTop: 20,
  },
  completedText: {
    opacity: 0.7,
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
  headerBackgroundImg: {
    position: "absolute",
    bottom: -250,
    right: -100,
    height: 400,
    width: 400,
  },
});
