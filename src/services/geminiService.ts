import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateLoveLetter = async (partner1: string, partner2: string, duration: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a short, deeply romantic love letter from ${partner1} to ${partner2}. 
    They have been together for ${duration}. 
    The tone should be poetic, sincere, and modern. Keep it under 150 words.`,
  });
  return response.text;
};

export const generateDateIdeas = async (partner1: string, partner2: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 unique and romantic date ideas for ${partner1} and ${partner2}. 
    One should be a cozy home date, one an adventurous outdoor date, and one a sophisticated evening date.
    Format as a JSON array of objects with 'title' and 'description' fields.`,
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generatePoeticMemory = async (memoryTitle: string, memoryDescription: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform this relationship memory into a beautiful 4-line poem:
    Title: ${memoryTitle}
    Description: ${memoryDescription}`,
  });
  return response.text;
};
