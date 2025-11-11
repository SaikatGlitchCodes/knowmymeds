import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { PrescriptionService } from '../services';
import type {
  CalendarMedicineSummary,
  CreatePrescriptionResponse,
  Prescription,
  PrescriptionFormData
} from '../types/prescription';

export const usePrescriptions = () => {
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription | null>(null);
  const [calendarData, setCalendarData] = useState<{
    [date: string]: CalendarMedicineSummary[];
  }>({});

  // Get current user ID
  const getCurrentUserId = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user.id;
  }, []);

  // Fetch calendar medicine summary for date range
  const fetchCalendarData = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();

        const data = await PrescriptionService.getCalendarMedicineSummaryRange(
          userId,
          startDate,
          endDate
        );
        setCalendarData(data);
        return data;
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUserId]
  );

  // Fetch prescript by prescription ID
  const fetchPrescriptionById = useCallback(async (prescriptionId: string) => {
    try {
      setLoading(true);
      const data = await PrescriptionService.getMedicineById(prescriptionId);
      if (data) {
        setPrescriptions(data);
      }
      return data;
    } catch (error) {
      console.error("Error fetching prescription by ID:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar medicine summary for specific date
  const fetchCalendarDataByDate = useCallback(
    async (date: string) => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();

        const data = await PrescriptionService.getCalendarMedicineSummaryByDate(
          userId,
          date
        );
        return data;
      } catch (error) {
        console.error("Error fetching calendar data by date:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUserId]
  );

  // Update intake status
  const updateIntakeStatus = useCallback(
    async (
      prescriptionId: string,
      scheduleId: string,
      date: string,
      status: "pending" | "taken" | "missed" | "skipped",
      takenAt?: string
    ) => {
      try {
        await PrescriptionService.updateIntakeStatus(
          prescriptionId,
          scheduleId,
          date,
          status,
          takenAt
        );

        // Refresh calendar data for the specific date
        const userId = await getCurrentUserId();
        const updatedData =
          await PrescriptionService.getCalendarMedicineSummaryByDate(
            userId,
            date
          );

        // Update the calendar data state
        setCalendarData((prev) => ({
          ...prev,
          [date]: updatedData,
        }));
      } catch (error) {
        console.error("Error updating intake status:", error);
        Alert.alert("Error", "Failed to update medicine status");
        throw error;
      }
    },
    [getCurrentUserId]
  );

  // Create a new prescription
  const createPrescription = useCallback(
    async (
      formData: PrescriptionFormData
    ): Promise<CreatePrescriptionResponse> => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();
        const result = await PrescriptionService.addMedicine(userId, formData);
        return result;
      } catch (error) {
        console.error("Error creating prescription:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUserId]
  );

  // load data
  const refreshCalendarData = async () => {
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

  return {
    // State
    loading,
    prescriptions,
    calendarData,

    // Actions
    refreshCalendarData,
    createPrescription,
    fetchCalendarData,
    fetchPrescriptionById,
    fetchCalendarDataByDate,
    updateIntakeStatus,
  };
};
