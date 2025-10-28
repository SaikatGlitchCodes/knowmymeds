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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [calendarData, setCalendarData] = useState<{ [date: string]: CalendarMedicineSummary[] }>({});

  // Get current user ID
  const getCurrentUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }, []);

  // Fetch all prescriptions
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      
      const data = await PrescriptionService.getMedicines(userId);
      setPrescriptions(data);
      return data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  // Fetch calendar medicine summary for date range
  const fetchCalendarData = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      
      const data = await PrescriptionService.getCalendarMedicineSummaryRange(userId, startDate, endDate);
      setCalendarData(data);
      return data;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  // Fetch calendar medicine summary for specific date
  const fetchCalendarDataByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      
      const data = await PrescriptionService.getCalendarMedicineSummaryByDate(userId, date);
      return data;
    } catch (error) {
      console.error('Error fetching calendar data by date:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  // Update intake status
  const updateIntakeStatus = useCallback(async (
    prescriptionId: string,
    scheduleId: string,
    date: string,
    status: 'pending' | 'taken' | 'missed' | 'skipped',
    takenAt?: string
  ) => {
    try {
      await PrescriptionService.updateIntakeStatus(prescriptionId, scheduleId, date, status, takenAt);
      
      // Refresh calendar data for the specific date
      const userId = await getCurrentUserId();
      const updatedData = await PrescriptionService.getCalendarMedicineSummaryByDate(userId, date);
      
      // Update the calendar data state
      setCalendarData(prev => ({
        ...prev,
        [date]: updatedData
      }));
      
      Alert.alert('Success', `Medicine marked as ${status}`);
    } catch (error) {
      console.error('Error updating intake status:', error);
      Alert.alert('Error', 'Failed to update medicine status');
      throw error;
    }
  }, [getCurrentUserId]);

  // Create a new prescription
  const createPrescription = useCallback(async (formData: PrescriptionFormData): Promise<CreatePrescriptionResponse> => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      
      const result = await PrescriptionService.addMedicine(userId, formData);
      
      // Refresh prescriptions list
      await fetchPrescriptions();
      
      return result;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId, fetchPrescriptions]);

  // Delete prescription
  const deletePrescription = useCallback(async (prescriptionId: string) => {
    try {
      setLoading(true);
      
      await PrescriptionService.deleteMedicine(prescriptionId);
      
      // Refresh prescriptions list
      await fetchPrescriptions();
      
      Alert.alert('Success', 'Medicine deleted successfully');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      Alert.alert('Error', 'Failed to delete medicine');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchPrescriptions]);

  return {
    // State
    loading,
    prescriptions,
    calendarData,
    
    // Actions
    createPrescription,
    fetchPrescriptions,
    deletePrescription,
    fetchCalendarData,
    fetchCalendarDataByDate,
    updateIntakeStatus,
  };
};