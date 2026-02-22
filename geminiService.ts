
import { GoogleGenAI, Type } from "@google/genai";


const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'YOUR_API_KEY') {
  ai = new GoogleGenAI({ apiKey });
}

export const getAIsuggestions = async (prompt: string) => {
  if (!ai) {
    return "Explore our library of faith-filled films to find inspiration for your daily walk with God.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a movie recommendation assistant for a Christian streaming platform. Based on this request: "${prompt}", provide a short, encouraging 2-sentence recommendation summary for watching films that build faith.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Explore our library of faith-filled films to find inspiration for your daily walk with God.";
  }
};
