import { supabase } from "../lib/supabase";
import type {
    CalendarMedicineSummary,
    CreatePrescriptionResponse,
    Prescription,
    PrescriptionFormData,
    PrescriptionSchedule
} from "../types/prescription";

export class PrescriptionService {
  // Add a new medicine prescription
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

  // Fetch all medicines for a user
  static async getMedicines(userId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('new_prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Delete a medicine by ID
  static async deleteMedicine(prescriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('new_prescriptions')
      .delete()
      .eq('id', prescriptionId);

    if (error) throw error;
  }

  // Get calendar medicine summary for a user
  static async getCalendarMedicineSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarMedicineSummary[]> {
    try {
      let query = supabase
        .from('v_calendar_medicine_summary')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('time_of_day', { ascending: true });

      // Add date filtering if provided
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching calendar medicine summary:', error);
      throw error;
    }
  }

  // Get calendar medicine summary for a specific date
  static async getCalendarMedicineSummaryByDate(
    userId: string,
    date: string
  ): Promise<CalendarMedicineSummary[]> {
    try {
      const { data, error } = await supabase
        .from('v_calendar_medicine_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time_of_day', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching calendar medicine summary by date:', error);
      throw error;
    }
  }

  // Get calendar medicine summary for a date range (useful for agenda view)
  static async getCalendarMedicineSummaryRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ [date: string]: CalendarMedicineSummary[] }> {
    try {
      const { data, error } = await supabase
        .from('v_calendar_medicine_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time_of_day', { ascending: true });

      if (error) throw error;

      // Group by date for agenda view
      const groupedData: { [date: string]: CalendarMedicineSummary[] } = {};
      
      if (data) {
        data.forEach((item: CalendarMedicineSummary) => {
          if (item.date) {
            if (!groupedData[item.date]) {
              groupedData[item.date] = [];
            }
            groupedData[item.date].push(item);
          }
        });
      }

      return groupedData;
    } catch (error) {
      console.error('Error fetching calendar medicine summary range:', error);
      throw error;
    }
  }

  // Update medicine intake status
  static async updateIntakeStatus(
    prescriptionId: string,
    scheduleId: string,
    date: string,
    status: 'pending' | 'taken' | 'missed' | 'skipped',
    takenAt?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'taken' && takenAt) {
        updateData.taken_at = takenAt;
      } else if (status === 'taken') {
        updateData.taken_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('new_medicine_intake_logs')
        .update(updateData)
        .eq('prescription_id', prescriptionId)
        .eq('schedule_id', scheduleId)
        .eq('date', date);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating intake status:', error);
      throw error;
    }
  }

  // Generate intake logs for the prescription duration
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