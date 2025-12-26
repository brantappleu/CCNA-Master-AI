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
      You are an expert CCNA instructor dedicated to teaching beginners.
      Create a detailed study guide for the topic: "${topic}".

      **Language Rules:**
      1. Write the main content in **English** (to prepare for the exam).
      2. When introducing a Key Term or a difficult concept, provide the **Chinese (Mandarin)** translation and a brief Chinese explanation in parentheses or a blockquote immediately following it.
      
      **Content Requirements (Detailed & Beginner Friendly):**
      - **Introduction:** Explain *what* this technology is and *why* we use it. Use a real-world analogy (Life Analogy).
      - **Technical Theory:** Step-by-step explanation. Break down logic simply.
      - **Configuration:** Provide standard Cisco IOS command syntax with explanations for each command line.
      - **Verification:** Show useful 'show' commands and explain how to read the output.
      - **Key Vocabulary:** A summary table of English terms and Chinese definitions at the end.

      **Formatting:**
      - Use Markdown.
      - **IMPORTANT:** Add extra blank lines between paragraphs to improve readability.
      - Use code blocks for all commands.
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
          "explanation": "Detailed explanation in Chinese (中文)..."
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

export const generateFullMockExam = async (count: number = 20): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Generate a realistic, full CCNA (200-301) mock exam simulation with ${count} questions.
      
      **CRITICAL: Weighting Distribution (Must follow strictly):**
      - 20% Network Fundamentals
      - 20% Network Access
      - 25% IP Connectivity
      - 10% IP Services
      - 15% Security Fundamentals
      - 10% Automation and Programmability
      
      **Requirements:**
      1. Questions must be in **English** (Standard Exam Language).
      2. Explanations must be in **Chinese (中文)** (For study purposes).
      3. Include a mix of multiple-choice and scenario-based questions.
      4. Return ONLY raw JSON array.
      
      Format:
      [
        {
          "id": 1,
          "domain": "1.0 Network Fundamentals",
          "question": "Question text...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
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
              domain: { type: Type.STRING },
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
    // Placeholder for future extension
    return ""; 
  } catch (error) {
    return "Error connecting to Lab Simulator.";
  }
};