
// Global queue variables for Serializing Requests
let requestQueue = Promise.resolve();
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 1000; 

/**
 * Service to interact with Groq API.
 * Uses the OpenAI-compatible endpoint as requested.
 */
export const callGenerativeAI = async (prompt: string | any[]): Promise<string> => {
    const systemInstruction = "Você é um assistente especializado em educação, focado na criação de Planos Educacionais Individualizados (PEI). Suas respostas devem ser profissionais, bem estruturadas e direcionadas para auxiliar educadores. Sempre que apropriado, considere e sugira estratégias baseadas nos princípios do Desenho Universal para a Aprendizagem (DUA).";
    
    // Serialization of requests to avoid overwhelming the model or hitting quota limits too fast
    const currentOperation = requestQueue.then(async () => {
        const now = Date.now();
        const timeSinceLast = now - lastRequestTime;
        if (timeSinceLast < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLast));
        }

        try {
            lastRequestTime = Date.now();
            
            let userMessage = "";
            if (typeof prompt === 'string') {
                userMessage = prompt;
            } else if (Array.isArray(prompt)) {
                userMessage = prompt.map(p => p.text || "").join("\n");
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.error?.message || `Erro na API Groq: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || '';
        } catch (error) {
            console.error("Erro na API Groq:", error);
            throw new Error("Falha na comunicação com a IA Groq (Llama 3.3).");
        }
    });

    requestQueue = currentOperation.catch(() => {});
    return currentOperation;
};
