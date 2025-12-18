
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTaskWithAI = async (taskText: string): Promise<AIAnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following task and provide its priority (low, medium, high), a suitable category name (e.g., Work, Personal, Fitness, Study, Health, Finance, Shopping, etc.), and 2-3 logical sub-tasks if it's a complex task. Task: "${taskText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high'],
              description: "The importance of the task."
            },
            category: {
              type: Type.STRING,
              description: "A short one-word category for the task."
            },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 concrete steps to complete this task."
            }
          },
          required: ["priority", "category", "subtasks"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result as AIAnalysisResponse;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback defaults
    return {
      priority: 'medium',
      category: 'General',
      subtasks: []
    };
  }
};

export const generateTaskSuggestions = async (existingTasks: string[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these existing tasks: [${existingTasks.join(", ")}], suggest 4 more related and productive tasks the user might want to add. Keep them brief and actionable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Suggestion failed:", error);
    return ["Plan weekly meals", "Organize digital files", "Read for 30 minutes", "Exercise"];
  }
};
