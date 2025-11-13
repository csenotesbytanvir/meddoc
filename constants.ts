import { BodyPart, Symptom } from './types';

export const API_KEY_STORAGE_KEY = 'gemini_api_key';
export const HISTORY_STORAGE_KEY = 'meddoc_prescriber_history';
export const APP_MODE_STORAGE_KEY = 'meddoc_app_mode';

export const SYMPTOM_DATA: Record<BodyPart, Symptom[]> = {
    'Head': [
        { id: 'headache', name: 'Headache' },
        { id: 'dizziness', name: 'Dizziness' },
        { id: 'sore_throat', name: 'Sore Throat' },
        { id: 'nasal_congestion', name: 'Nasal Congestion' },
        { id: 'earache', name: 'Earache' },
        { id: 'vision_changes', name: 'Vision Changes' },
        { id: 'migraine', name: 'Migraine' },
        { id: 'sinus_pressure', name: 'Sinus Pressure' },
    ],
    'Neck': [
        { id: 'stiff_neck', name: 'Stiff Neck' },
        { id: 'neck_pain', name: 'Neck Pain' },
        { id: 'swollen_glands', name: 'Swollen Glands' },
    ],
    'Chest & Abdomen': [
        { id: 'cough', name: 'Cough' },
        { id: 'chest_pain', name: 'Chest Pain' },
        { id: 'shortness_of_breath', name: 'Shortness of Breath' },
        { id: 'abdominal_pain', name: 'Abdominal Pain' },
        { id: 'nausea_vomiting', name: 'Nausea or Vomiting' },
        { id: 'heartburn', name: 'Heartburn' },
        { id: 'indigestion', name: 'Indigestion' },
        { id: 'palpitations', name: 'Palpitations' },
    ],
    'Back': [
        { id: 'upper_back_pain', name: 'Upper Back Pain' },
        { id: 'lower_back_pain', name: 'Lower Back Pain' },
        { id: 'muscle_spasms', name: 'Muscle Spasms' },
    ],
    'Pelvis & Groin': [
        { id: 'pelvic_pain', name: 'Pelvic Pain' },
        { id: 'groin_pain', name: 'Groin Pain' },
    ],
    'Arms & Legs': [
        { id: 'joint_pain', name: 'Joint Pain' },
        { id: 'muscle_pain', name: 'Muscle Pain' },
        { id: 'numbness_tingling', name: 'Numbness or Tingling' },
    ],
    'Skin': [
        { id: 'rash', name: 'Rash' },
        { id: 'itchiness', name: 'Itchiness' },
        { id: 'acne', name: 'Acne' },
        { id: 'dryness', name: 'Dryness' },
    ],
    'Urinary': [
        { id: 'painful_urination', name: 'Painful Urination' },
        { id: 'frequent_urination', name: 'Frequent Urination' },
    ],
    'General/Whole Body': [
        { id: 'fever', name: 'Fever' },
        { id: 'fatigue', name: 'Fatigue' },
        { id: 'chills', name: 'Chills' },
    ],
};