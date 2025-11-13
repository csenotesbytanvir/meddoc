
export interface PatientInfo {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
}

export type BodyPart = 'Head' | 'Neck' | 'Chest & Abdomen' | 'Back' | 'Pelvis & Groin' | 'Arms & Legs' | 'Skin' | 'Urinary' | 'General/Whole Body';

export interface Symptom {
  id: string;
  name: string;
}

export interface Condition {
  name: string;
  description: string;
}

export interface Prescription {
  name: string;
  dosage?: string;
  form?: string;
  route?: string;
  frequency?: string;
  purpose: string;
  description: string;
}

export interface LifestyleAdvice {
  id: string;
  text: string;
}

export interface AnalysisResult {
  conditions: Condition[];
  prescriptions: Prescription[];
  lifestyleAdvice: LifestyleAdvice[];
}

export interface IntakeData {
    patientInfo: PatientInfo;
    primaryBodyPart: BodyPart;
    symptoms: Symptom[];
}

export interface AnalysisRecord {
  id: string;
  date: string;
  intakeData: IntakeData;
  result: AnalysisResult;
}