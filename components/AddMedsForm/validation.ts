import * as yup from 'yup';

export const medicineValidationSchema = yup.object().shape({
  medicine: yup.string().required('Medicine name is required'),
  dose_in_mg: yup.string().required('Dose is required'),
  form: yup.string().required('Medicine form is required'),
  quantity: yup.string().required('Quantity is required'),
  frequency: yup.array().min(1, 'At least one frequency time is required'),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().required('End date is required'),
  special_instructions: yup.string(),
  prescription_refills: yup.number().min(0, 'Refills cannot be negative'),
});