import { supabase } from "../lib/supabase";
import type {
    CreatePrescriptionResponse,
    Prescription,
    PrescriptionFormData,
    PrescriptionSchedule
} from "../types/prescription";

export class PrescriptionService {
  /**
   * Add a new medicine with schedule
   */
  static async addMedicine(
    userId: string, 
    formData: PrescriptionFormData
  ): Promise<CreatePrescriptionResponse> {
    try {
      // 1. Create prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from('new_prescriptions')
        .insert({
          user_id: userId,
          medicine: formData.medicine,
          dose_in_mg: formData.dose_in_mg,
          form: formData.form,
          quantity: formData.quantity,
          treatment_start_date: formData.treatment_start_date,
          treatment_end_date: formData.treatment_end_date,
          special_instructions: formData.special_instructions,
        })
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // 2. Create schedules
      const { data: schedules, error: schedulesError } = await supabase
        .from('new_prescription_schedules')
        .insert(
          formData.frequency.map(slot => ({
            prescription_id: prescription.id,
            time_of_day: slot.time,
            number_of_tablets: slot.number_of_tablets,
          }))
        )
        .select();

      if (schedulesError) throw schedulesError;

      // 3. Create daily logs
      const intakeLogs = this.generateIntakeLogs(
        prescription.id, 
        userId, 
        schedules, 
        prescription.treatment_start_date, 
        prescription.treatment_end_date
      );

      const { error: logsError } = await supabase
        .from('new_medicine_intake_logs')
        .insert(intakeLogs);

      if (logsError) throw logsError;

      return {
        prescription: prescription as Prescription,
        schedules: schedules as PrescriptionSchedule[],
        totalDosesCreated: intakeLogs.length
      };
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw error;
    }
  }

  /**
   * Get user's medicines
   */
  static async getMedicines(userId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('new_prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete a medicine
   */
  static async deleteMedicine(prescriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('new_prescriptions')
      .delete()
      .eq('id', prescriptionId);

    if (error) throw error;
  }

  /**
   * Generate intake logs for the treatment period
   */
  private static generateIntakeLogs(
    prescriptionId: string,
    userId: string,
    schedules: any[],
    startDate: string,
    endDate: string
  ): {
    prescription_id: string;
    schedule_id: string;
    user_id: string;
    date: string;
    status: string;
  }[] {
    const logs: {
      prescription_id: string;
      schedule_id: string;
      user_id: string;
      date: string;
      status: string;
    }[] = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0];
      
      schedules.forEach(schedule => {
        logs.push({
          prescription_id: prescriptionId,
          schedule_id: schedule.id,
          user_id: userId,
          date: currentDate,
          status: 'pending',
        });
      });
    }

    return logs;
  }
}