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
  treatment_start_date: string;
  treatment_end_date: string;
  special_instructions?: string;
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