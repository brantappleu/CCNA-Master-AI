import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel } from "../types";

// Helper to get client. Note: We prefer process.env, but fallback to localStorage for the demo if user enters key manually.
const getClient = () => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("API Key not found. Please enter it in the Settings or set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStudyMaterial = async (topic: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      You are an expert CCNA instructor (Cisco Certified Network Associate).
      Please provide a comprehensive but concise study guide for the topic: "${topic}".
      
      Structure:
      1. Key Concepts (Bullet points)
      2. Configuration Syntax (if applicable, use code blocks)
      3. Important Exam Notes (Common pitfalls)
      4. A real-world analogy.
      
      Output in Markdown format.
      Language: Chinese (Mandarin) for explanations, English for technical terms and commands.
    `;

    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: prompt,
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error: ${(error as Error).message}. Please check your API Key.`;
  }
};

export const generateExamQuestions = async (domain: string, count: number = 5): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Generate ${count} distinct CCNA practice exam questions for the domain: "${domain}".
      
      Requirements:
      - Latest CCNA (200-301) syllabus.
      - Return ONLY raw JSON array. No markdown code blocks.
      - Schema: Array of objects.
      
      Format:
      [
        {
          "id": 1,
          "question": "Question text in English...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0, (index 0-3)
          "explanation": "Explanation in Chinese..."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
          },
        },
      }
    });

    return response.text || "[]";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const runLabSimulation = async (): Promise<string> => {
  try {
    // This function is currently a placeholder for advanced state management
    // The actual chat logic is handled directly in the LabSimulator component
    // We keep this here for future extension of service-based chat handling
    return ""; 
  } catch (error) {
    return "Error connecting to Lab Simulator.";
  }
};
