
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse, WeeklyInsight } from "./types";

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
    return {
      priority: 'medium',
      category: 'General',
      subtasks: []
    };
  }
};

export const getWeeklyProductivityAnalysis = async (tasks: any[]): Promise<WeeklyInsight> => {
  try {
    const taskSummary = tasks.map(t => `${t.text} (${t.completed ? 'Completed' : 'Pending'}, Category: ${t.category})`).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a productivity coach. Analyze this user's weekly task history: [${taskSummary}]. 
      Provide a productivity score out of 100, a brief 2-sentence summary of their performance, and one piece of actionable advice for next week.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          required: ["score", "summary", "advice"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as WeeklyInsight;
  } catch (error) {
    console.error("Weekly analysis failed:", error);
    return {
      score: 70,
      summary: "You've been steady this week, keeping up with most of your commitments.",
      advice: "Try to tackle your highest priority tasks earlier in the day to improve momentum."
    };
  }
};
