
import { GoogleGenAI, Type } from "@google/genai";
import type { IntakeData, AnalysisResult } from './types';
import { API_KEY_STORAGE_KEY } from "./constants";

function getGenAIClient(): GoogleGenAI {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        throw new Error("Gemini API key not found. Please set it in the application settings.");
    }
    return new GoogleGenAI({ apiKey });
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        conditions: {
            type: Type.ARRAY,
            description: "A list of 2-3 plausible, educational-purpose potential medical conditions based on the symptoms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the condition."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief, simple explanation of the condition."
                    }
                },
                required: ['name', 'description']
            }
        },
        prescriptions: {
            type: Type.ARRAY,
            description: "A list of 1-2 example generic or over-the-counter medications that might be associated with the conditions. These are for educational purposes ONLY.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The generic name and strength of the medication (e.g., 'Ibuprofen 200 mg')."
                    },
                    dosage: {
                        type: Type.STRING,
                        description: "Example dosage (e.g., '1-2 tablets')."
                    },
                    form: {
                        type: Type.STRING,
                        description: "The form of the medication (e.g., 'Tablet', 'Cream', 'Syrup')."
                    },
                    route: {
                        type: Type.STRING,
                        description: "The route of administration (e.g., 'Oral', 'Topical')."
                    },
                    frequency: {
                        type: Type.STRING,
                        description: "Example frequency (e.g., 'Every 4-6 hours as needed')."
                    },
                    purpose: {
                        type: Type.STRING,
                        description: "The primary purpose of the medication (e.g., 'Pain relief', 'Anti-inflammatory')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A mandatory disclaimer. MUST start with 'Educational example: ' and end with 'Consult a clinician before use.'."
                    }
                },
                required: ['name', 'purpose', 'description']
            }
        },
        lifestyleAdvice: {
            type: Type.ARRAY,
            description: "A list of 2-4 general, safe, and helpful lifestyle tips related to the symptoms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.STRING,
                        description: "A unique identifier string, e.g., 'la_1'."
                    },
                    text: {
                        type: Type.STRING,
                        description: "The lifestyle advice text."
                    }
                },
                required: ['id', 'text']
            }
        }
    },
    required: ['conditions', 'prescriptions', 'lifestyleAdvice']
};

function buildPrompt(data: IntakeData): string {
    const symptomsString = data.symptoms.map(s => s.name).join(', ');
    return `
A patient presents with the following information:
- Patient Details: Name: ${data.patientInfo.name}, Age: ${data.patientInfo.age}, Gender: ${data.patientInfo.gender}
- Primary Affected Area: ${data.primaryBodyPart}
- Symptoms: ${symptomsString}

Please generate an educational analysis based on this data. The output must be a JSON object matching the provided schema. 
- For 'conditions', provide 2 plausible potential conditions with simple descriptions.
- For 'prescriptions', provide 1-2 common generic or over-the-counter example medications. The description for each MUST include a disclaimer like "Educational example. Consult a clinician before use."
- For 'lifestyleAdvice', provide 3-4 simple, helpful tips.
This is for a tool called 'MedDoc Prescriber' and is for educational demonstration ONLY. Do not provide a real diagnosis or medical advice.
`;
}

export async function getAIAnalysis(data: IntakeData): Promise<AnalysisResult> {
    try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: buildPrompt(data),
            config: {
                systemInstruction: "You are an AI assistant for 'MedDoc Prescriber', an educational tool. Your role is to generate example medical data for demonstration purposes only. All information you provide must be clearly marked and understood as non-clinical, educational examples. DO NOT provide real medical advice. Based on the user's input of symptoms, you will generate a plausible set of potential conditions, example prescriptions (using generic names), and general lifestyle advice. Your output must strictly conform to the provided JSON schema.",
                responseMimeType: "application/json",
                responseSchema: analysisSchema
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as AnalysisResult;
        return result;
    } catch (e) {
        console.error("Error calling Gemini API:", e);
        if (e instanceof Error) {
            // Re-throw the original error if it's API key related to be handled by the UI
            if (e.message.includes("API key")) {
                throw e;
            }
        }
        throw new Error("Failed to get analysis from AI. The model may have returned an invalid response. Please try again.");
    }
}