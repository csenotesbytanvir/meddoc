
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
            description: "A list of 2-3 plausible, educational-purpose potential medical conditions based on the symptoms. Complex reasoning required.",
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
            description: "A list of 1-2 example generic medications relevant to the conditions.",
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
            description: "A list of 2-4 detailed lifestyle tips.",
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

Perform a deep clinical analysis for educational purposes.
Generate a JSON response with:
- 2 highly plausible conditions based on the symptom cluster.
- 1-2 generic medication examples with strict educational disclaimers.
- 3-4 actionable, specific lifestyle protocols.
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

// --- HELPER FUNCTION FOR ERROR HANDLING ---

const handleError = (e: any): never => {
    console.error("API Call Failed", e);
    const msg = e.toString().toLowerCase();
    
    // Check for rate limiting / quota errors
    if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
        throw new Error("⚠️ System Busy: You have hit the Free Tier rate limit. Please wait 30-60 seconds and try again.");
    }
    
    if (msg.includes('api key') || msg.includes('403')) {
         throw new Error("⚠️ Authentication Error: Invalid API Key. Please update it in Settings.");
    }
    
    if (msg.includes('503') || msg.includes('overloaded')) {
        throw new Error("⚠️ Server Busy: The AI models are currently overloaded. Please retry shortly.");
    }
    
    throw new Error(`⚠️ System Error: ${e.message || "Unknown connection issue"}`);
};

// --- HELPER FUNCTION FOR API CALLS ---

async function callGemini(modelName: string, prompt: string, schema: any, imagePart?: any) {
    const ai = getGenAIClient();
    const contents: any = {
        parts: imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are Praxis, an advanced medical AI architected by Tanvir Ahmmed. Your goal is to provide highly accurate, deep, and educational medical analysis. You are not a doctor. Always emphasize that results are for educational purposes only."
            }
        });
        
        let text = response.text || "{}";
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            text = jsonMatch[1];
        } else {
            text = text.trim();
        }

        return JSON.parse(text);
    } catch (e) {
        handleError(e);
    }
}

// --- EXPORTED API FUNCTIONS ---

export async function getAnalysis(data: IntakeData): Promise<AnalysisResult> {
    const mode = localStorage.getItem('meddoc_app_mode') || 'live';
    if (mode === 'mock') {
         return {
             conditions: [{name: "Mock Condition", description: "Offline mode"}],
             prescriptions: [{name: "Mock Med", purpose: "Test", description: "Test"}],
             lifestyleAdvice: [{id: "1", text: "Drink water"}]
         } as AnalysisResult;
    }

    // Switched to gemini-2.5-flash for all analysis to prevent 429 errors
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
    try {
        const ai = getGenAIClient();
        
        // Switched to gemini-2.5-flash for stability and quota management
        const chat = ai.chats.create({
            model: "gemini-2.5-flash", 
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            })),
            config: {
                systemInstruction: "You are Praxis, a highly advanced, expert-level medical AI assistant. You were architected and built by Tanvir Ahmmed. Your role is to provide comprehensive, nuanced, and deeply knowledgeable medical information. Do not limit your answers to simple summaries; explain mechanisms, interpret complex queries with precision, and offer reassuring, professional guidance. You must strictly maintain your identity as Praxis by Tanvir Ahmmed. You are an educational tool, not a replacement for a doctor. Never provide a definitive diagnosis, but offer detailed educational analysis."
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text || "I apologize, I couldn't process that request.";
    } catch (e: any) {
        // Return friendly message directly in chat instead of throwing
        const msg = e.toString().toLowerCase();
        if (msg.includes('429') || msg.includes('quota')) {
            return "⚠️ **System Capacity Reached**: I am currently handling too many requests (Free Tier Limit). Please wait about a minute and ask me again.";
        }
        return "⚠️ **Connection Error**: I was unable to process your request. Please check your network or API key.";
    }
}
