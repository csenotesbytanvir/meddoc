
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

// NEW: For History/CRUD
export interface AnalysisRecord {
  id: string;
  date: string;
  type: 'symptom' | 'visual' | 'rx' | 'report';
  summary: string; // Brief title for history
  intakeData?: IntakeData; // For symptom checker
  result: any; // Flexible for different result types
}

// --- NEW INTERFACES ---

export interface VisualDiagnosisResult {
  conditionName: string;
  probability: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  visualCharacteristics: string[];
  description: string;
  recommendations: string[];
  disclaimer: string;
}

export interface RxScannerResult {
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    purpose: string;
    notes: string;
  }[];
  patientInstructions: string[];
  disclaimer: string;
}

export interface LabReportResult {
  tests: {
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'Normal' | 'High' | 'Low' | 'Critical';
    interpretation: string;
  }[];
  summary: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
