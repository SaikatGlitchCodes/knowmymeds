import { JSX } from "react";

export interface MedicineInfo {
  medicine: string;
  dose_in_mg: string;
  form: string;
  quantity: string;
  frequency: { time: string; tablets: number }[];
  start_date: string;
  end_date: string;
  special_instructions: string;
  prescription_refills: number;
}

export interface MedicineFormOption {
  id: number;
  title: string;
  iconName: string;
  iconLibrary: string;
  icon?: JSX.Element;
  getIcon?: (size?: number, color?: string) => JSX.Element;
}

export interface FrequencyOption {
  time: string;
  tablets: number;
}

export interface FormStepProps {
  values: MedicineInfo;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}