import { GoogleGenAI } from "@google/genai";

export const generateCoupleBackground = async (apiKey: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A highly romantic, cinematic, and artistic background image of a diverse couple in a beautiful, ethereal setting (like a sunset beach, a blooming garden, or a cozy starlit balcony). The style should be soft, dreamy, and high-quality, suitable for a mobile app background. No text, no faces clearly visible to maintain a universal feel.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    // Only log if not a quota or permission error
    if (!error.message?.includes('429') && error.status !== 429 && !error.message?.includes('403') && error.status !== 403) {
      console.error("AI Background Error:", error);
    }
    throw error;
  }
};
