// Medicine form types
export type MedicineForm = 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Cream' | 'Inhaler';

// Frequency slot for scheduling
export interface FrequencySlot {
  time: string; // e.g., "08:00"
  number_of_tablets: number;
}

// Form data for creating a prescription
export interface PrescriptionFormData {
  medicine: string;
  dose_in_mg: string;
  form: MedicineForm;
  quantity: string;
  uses_of_the_medicine?: string;
  treatment_start_date: string;
  treatment_end_date: string;
  special_instructions?: string;
  side_effects?: string;
  frequency: FrequencySlot[];
}

// Database table interfaces
export interface Prescription {
  id: string;
  user_id: string;
  medicine: string;
  dose_in_mg: string;
  form: MedicineForm;
  quantity: string;
  treatment_start_date: string;
  treatment_end_date: string;
  special_instructions?: string;
  side_effects?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionSchedule {
  id: string;
  prescription_id: string;
  time_of_day: string;
  number_of_tablets: number;
  created_at: string;
}

// Response types
export interface CreatePrescriptionResponse {
  prescription: Prescription;
  schedules: PrescriptionSchedule[];
  totalDosesCreated: number;
}

// Calendar view data interface
export interface CalendarMedicineSummary {
  prescription_id: string;
  user_id: string;
  medicine: string;
  uses_of_the_medicine?: string;
  dose_in_mg: string;
  prescription_refills?: number;
  treatment_start_date: string;
  treatment_end_date: string;
  time_of_day: string;
  schedule_id: string;
  number_of_tablets: number;
  form: MedicineForm;
  date?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  taken_at?: string;
  times_per_day?: number;
}