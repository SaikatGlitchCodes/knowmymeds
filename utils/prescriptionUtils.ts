import type { MedicineInfo } from '../components/AddMedsForm/types';
import type { MedicineForm, PrescriptionFormData } from '../types/prescription';

// Convert date from MM/DD/YYYY to YYYY-MM-DD format
const convertDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateStr; // Return as-is if already in correct format
};

// Map form to medicine form enum
const getMedicineForm = (form: string): MedicineForm => {
  const formMap: { [key: string]: MedicineForm } = {
    'tablet': 'Tablet',
    'capsule': 'Capsule',
    'liquid': 'Liquid',
    'injection': 'Injection',
    'cream': 'Cream',
    'inhaler': 'Inhaler'
  };
  return formMap[form.toLowerCase()] || 'Tablet';
};

// Convert form data to prescription data
export const mapFormToPrescriptionData = (formValues: MedicineInfo): PrescriptionFormData => {
  return {
    medicine: formValues.medicine.trim(),
    dose_in_mg: formValues.dose_in_mg.trim(),
    uses_of_the_medicine: formValues.uses_of_the_medicine?.trim() || undefined,
    form: getMedicineForm(formValues.form),
    quantity: formValues.quantity.trim(),
    treatment_start_date: convertDate(formValues.start_date),
    treatment_end_date: convertDate(formValues.end_date),
    special_instructions: formValues.special_instructions?.trim() || undefined,
    side_effects: formValues.side_effects?.trim() || undefined,
    frequency: formValues.frequency
      .filter(f => f.time && f.number_of_tablets > 0)
      .map(f => ({
        time: f.time,
        number_of_tablets: f.number_of_tablets
      }))
  };
};