
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSuggestedTranslations = async (indonesiaWord: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan terjemahan bahasa Jawa untuk kata Indonesia: "${indonesiaWord}" dalam tingkat: Ngoko Lugu, Ngoko Alus, Krama Lugu, dan Krama Alus.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ngokoLugu: { type: Type.STRING },
            ngokoAlus: { type: Type.STRING },
            kramaLugu: { type: Type.STRING },
            kramaAlus: { type: Type.STRING },
          },
          required: ["ngokoLugu", "ngokoAlus", "kramaLugu", "kramaAlus"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
};
