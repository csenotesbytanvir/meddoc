
import { GoogleGenAI, Type } from "@google/genai";
import type { IntakeData, AnalysisResult } from './types';
import { API_KEY_STORAGE_KEY, APP_MODE_STORAGE_KEY } from "./constants";

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

IMPORTANT: Your entire response must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown formatting like \`\`\`json.
`;
}

async function getLiveAIAnalysis(data: IntakeData): Promise<AnalysisResult> {
    let rawResponseText: string | null = null;
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

        // Add a more robust check for safety blocks or empty responses.
        if (!response.candidates || response.candidates.length === 0 || response.candidates[0].finishReason === 'SAFETY') {
            const reason = response.candidates?.[0]?.finishReason || 'No response';
            console.error(`AI response blocked or empty. Reason: ${reason}`, response);
            throw new Error("Analysis failed because the AI's response was blocked, possibly for safety reasons. This can occur with medical topics. Please adjust the symptoms and try again.");
        }

        rawResponseText = response.text;

        if (!rawResponseText || rawResponseText.trim() === '') {
            console.error("Raw AI response was empty.");
            throw new Error("Failed to get analysis from AI. The model returned an empty response.");
        }
        
        let jsonText = rawResponseText.trim();

        // More robustly strip markdown fences if they exist.
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.slice(7, -3).trim();
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.slice(3, -3).trim();
        }

        // The final attempt to parse the cleaned text.
        const result = JSON.parse(jsonText) as AnalysisResult;
        return result;

    } catch (e: any) {
        // Log the raw response for any error, which is extremely helpful for debugging.
        console.error("Error processing AI response:", e);
        if (rawResponseText) {
            console.error("Raw AI response that caused the error:", rawResponseText);
        }

        // Propagate specific, user-friendly error messages that we've defined above.
        if (e.message.includes("API key") || e.message.includes("blocked") || e.message.includes("empty response")) {
            throw e;
        }
        
        // This is the generic fallback for JSON parsing errors or other unexpected issues.
        throw new Error("Failed to get analysis from AI. The model returned an invalid response. Check the developer console for more details.");
    }
}


// MOCK DATA IMPLEMENTATION
const mockData: Record<string, AnalysisResult> = {
    'Head': {
        conditions: [
            { name: "Tension Headache", description: "This is a common type of headache that feels like a constant ache or pressure around the head, especially at the temples or back of the head and neck." },
            { name: "Sinus Congestion", description: "This occurs when the nasal passages become swollen with excess mucus, often leading to a feeling of pressure in the face." }
        ],
        prescriptions: [
            { name: "Ibuprofen 200 mg", dosage: "1-2 tablets", form: "Tablet", route: "Oral", frequency: "Every 4-6 hours as needed", purpose: "Pain and inflammation relief", description: "Educational example: A common over-the-counter pain reliever. Consult a clinician before use." },
            { name: "Saline Nasal Spray", dosage: "1-2 sprays per nostril", form: "Spray", route: "Nasal", frequency: "As needed", purpose: "To relieve nasal congestion", description: "Educational example: Helps to moisturize nasal passages and clear mucus. Consult a clinician before use." }
        ],
        lifestyleAdvice: [
            { id: "la_1", text: "Stay hydrated by drinking plenty of water throughout the day." },
            { id: "la_2", text: "Rest in a quiet, dark room to help alleviate headache symptoms." },
            { id: "la_3", text: "Apply a warm compress to your face to help ease sinus pressure." },
            { id: "la_4", text: "Avoid known headache triggers such as excessive caffeine or strong smells." }
        ]
    },
    'default': {
        conditions: [
            { name: "General Malaise", description: "A feeling of general discomfort, illness, or lack of well-being. It's a common symptom for many minor conditions." },
            { name: "Muscular Strain", description: "This can occur from overexertion or minor injury, leading to localized pain and discomfort in muscles." }
        ],
        prescriptions: [
            { name: "Paracetamol 500 mg", dosage: "1-2 tablets", form: "Tablet", route: "Oral", frequency: "Every 4-6 hours as needed", purpose: "Fever and pain reduction", description: "Educational example: A widely used over-the-counter analgesic. Consult a clinician before use." }
        ],
        lifestyleAdvice: [
            { id: "la_1", text: "Ensure you get adequate rest and sleep to help your body recover." },
            { id: "la_2", text: "Eat a balanced diet rich in fruits and vegetables." },
            { id: "la_3", text: "Engage in light physical activity, such as walking, if you feel up to it." }
        ]
    }
};

function getMockAnalysis(data: IntakeData): Promise<AnalysisResult> {
    console.log("Using Offline Mock Analysis");
    return new Promise(resolve => {
        setTimeout(() => {
            const resultTemplate = mockData[data.primaryBodyPart] || mockData['default'];
            // Deep copy to avoid mutating the original mock data object
            const result = JSON.parse(JSON.stringify(resultTemplate));
            
            // Personalize the response slightly for demonstration
            result.conditions[0].description = `An educational mock example for ${data.patientInfo.name}. ${result.conditions[0].description}`;
            resolve(result);
        }, 1200); // Simulate network/processing delay
    });
}

export async function getAnalysis(data: IntakeData): Promise<AnalysisResult> {
    const mode = localStorage.getItem(APP_MODE_STORAGE_KEY) || 'live';
    if (mode === 'mock') {
        return getMockAnalysis(data);
    }
    return getLiveAIAnalysis(data);
}
