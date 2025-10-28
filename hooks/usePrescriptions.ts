import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { PrescriptionService } from '../services';
import type {
    CreatePrescriptionResponse,
    Prescription,
    PrescriptionFormData
} from '../types/prescription';

export const usePrescriptions = () => {
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

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
    
    // Actions
    createPrescription,
    fetchPrescriptions,
    deletePrescription,
  };
};