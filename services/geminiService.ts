
import { GoogleGenAI } from "@google/genai";

// Global queue variables for Serializing Requests
let requestQueue = Promise.resolve();
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 1000; 

/**
 * Service to interact with Google Gemini API.
 * Follows the strictly required SDK patterns.
 */
export const callGenerativeAI = async (prompt: string | any[]): Promise<string> => {
    const systemInstruction = "Você é um assistente especializado em educação, focado na criação de Planos Educacionais Individualizados (PEI). Suas respostas devem ser profissionais, bem estruturadas e direcionadas para auxiliar educadores. Sempre que apropriado, considere e sugira estratégias baseadas nos princípios do Desenho Universal para a Aprendizagem (DUA).";
    
    // Serialization of requests
    const currentOperation = requestQueue.then(async () => {
        const now = Date.now();
        const timeSinceLast = now - lastRequestTime;
        if (timeSinceLast < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLast));
        }

        try {
            lastRequestTime = Date.now();
            
            // Initialize AI client inside the call to ensure fresh key usage if needed
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let userPrompt = "";
            if (typeof prompt === 'string') {
                userPrompt = prompt;
            } else if (Array.isArray(prompt)) {
                userPrompt = prompt.map(p => p.text || "").join("\n");
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                },
            });

            return response.text || '';
        } catch (error: any) {
            console.error("Erro na API Gemini:", error);
            throw new Error(`Falha na comunicação com a IA: ${error.message}`);
        }
    });

    // FIX: Ensure requestQueue remains a Promise<void> by chaining then(() => {}) to resolve the 'Promise<string | void>' mismatch.
    requestQueue = currentOperation.then(() => {}).catch(() => {});
    return currentOperation;
};
