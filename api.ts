
import { GoogleGenAI, Type } from "@google/genai";
import type { IntakeData, AnalysisResult, VisualDiagnosisResult, RxScannerResult, LabReportResult } from './types';
import { API_KEY_STORAGE_KEY } from "./constants";

function getGenAIClient(): GoogleGenAI {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        throw new Error("Gemini API key not found. Please set it in the application settings.");
    }
    return new GoogleGenAI({ apiKey });
}

// --- SYMPTOM CHECKER SCHEMAS ---

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        conditions: {
            type: Type.ARRAY,
            description: "A list of 2-3 plausible, educational-purpose potential medical conditions based on the symptoms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'description']
            }
        },
        prescriptions: {
            type: Type.ARRAY,
            description: "A list of 1-2 example generic medications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    form: { type: Type.STRING },
                    route: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'purpose', 'description']
            }
        },
        lifestyleAdvice: {
            type: Type.ARRAY,
            description: "A list of 2-4 lifestyle tips.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                },
                required: ['id', 'text']
            }
        }
    },
    required: ['conditions', 'prescriptions', 'lifestyleAdvice']
};

function buildSymptomPrompt(data: IntakeData): string {
    const symptomsString = data.symptoms.map(s => s.name).join(', ');
    return `
A patient presents with:
- Name: ${data.patientInfo.name}, Age: ${data.patientInfo.age}, Gender: ${data.patientInfo.gender}
- Area: ${data.primaryBodyPart}
- Symptoms: ${symptomsString}

Generate an educational analysis. JSON only.
- 2 plausible conditions.
- 1-2 generic medications with disclaimer "Educational example only".
- 3-4 lifestyle tips.
`;
}

// --- NEW SCHEMAS FOR PREMIUM FEATURES ---

const visualDiagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        conditionName: { type: Type.STRING },
        probability: { type: Type.STRING, description: "e.g., 'High Likelihood'" },
        severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
        visualCharacteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
        description: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "First aid or next steps" },
        disclaimer: { type: Type.STRING }
    },
    required: ['conditionName', 'severity', 'description', 'recommendations', 'disclaimer']
};

const rxScannerSchema = {
    type: Type.OBJECT,
    properties: {
        medications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    purpose: { type: Type.STRING, description: "Explain what this treats in simple terms" },
                    notes: { type: Type.STRING }
                },
                required: ['name', 'purpose']
            }
        },
        patientInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        disclaimer: { type: Type.STRING }
    },
    required: ['medications', 'disclaimer']
};

const labReportSchema = {
    type: Type.OBJECT,
    properties: {
        tests: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    testName: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    referenceRange: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['Normal', 'High', 'Low', 'Critical'] },
                    interpretation: { type: Type.STRING, description: "Simple explanation of what this result implies." }
                },
                required: ['testName', 'status', 'interpretation']
            }
        },
        summary: { type: Type.STRING, description: "Overall summary of health based on report." },
        disclaimer: { type: Type.STRING }
    },
    required: ['tests', 'summary', 'disclaimer']
};

// --- HELPER FUNCTION FOR API CALLS ---

async function callGemini(modelName: string, prompt: string, schema: any, imagePart?: any) {
    const ai = getGenAIClient();
    const contents: any = {
        parts: imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }]
    };

    const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            systemInstruction: "You are a highly advanced medical AI assistant. Your goal is to provide accurate, educational analysis of medical data. Always include disclaimers that this is not a substitute for professional medical advice."
        }
    });
    
    // Improved JSON parsing to handle potential markdown wrappers
    let text = response.text || "{}";
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text);
}

// --- EXPORTED API FUNCTIONS ---

export async function getAnalysis(data: IntakeData): Promise<AnalysisResult> {
    const mode = localStorage.getItem('meddoc_app_mode') || 'live';
    // Basic mock bypass for existing symptom checker if needed, but we focus on live here
    if (mode === 'mock') {
         // Return simple mock
         return {
             conditions: [{name: "Mock Condition", description: "Offline mode"}],
             prescriptions: [{name: "Mock Med", purpose: "Test", description: "Test"}],
             lifestyleAdvice: [{id: "1", text: "Drink water"}]
         } as AnalysisResult;
    }

    return callGemini("gemini-2.5-flash", buildSymptomPrompt(data), analysisSchema);
}

export async function analyzeDermatology(imageBase64: string): Promise<VisualDiagnosisResult> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const prompt = "Analyze this image of a skin condition or injury. Identify the potential condition, severity, and visual characteristics. Provide immediate first aid advice. Educational use only.";
    return callGemini("gemini-2.5-flash", prompt, visualDiagnosisSchema, imagePart);
}

export async function analyzePrescription(imageBase64: string): Promise<RxScannerResult> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const prompt = "Transcribe this medical prescription. List all medications, their dosages, frequencies, and explain the purpose of each drug in simple language. Extract any special instructions.";
    return callGemini("gemini-2.5-flash", prompt, rxScannerSchema, imagePart);
}

export async function analyzeLabReport(imageBase64: string): Promise<LabReportResult> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const prompt = "Analyze this medical lab report. Extract test names, values, units, and ranges. Determine if the status is Normal, High, or Low. Provide a simple interpretation for any abnormal results and a general summary.";
    return callGemini("gemini-2.5-flash", prompt, labReportSchema, imagePart);
}

export async function chatWithPraxis(history: {role: 'user' | 'model', text: string}[], message: string): Promise<string> {
    const ai = getGenAIClient();
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        })),
        config: {
            systemInstruction: "You are 'Praxis', a sophisticated, empathetic, and highly knowledgeable medical AI assistant created by Code_For_Humanity. You assist users with medical questions, explain complex terms, and offer health advice. You must always maintain a professional yet approachable tone. If a user asks for a diagnosis, provide information but explicitly state you cannot provide a definitive medical diagnosis and they should see a doctor."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I apologize, I couldn't process that request.";
}
