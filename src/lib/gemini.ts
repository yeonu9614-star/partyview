import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PartyRecommendation {
  themeName: string;
  description: string;
  musicStyle: string;
  dressCode: string;
  decorationIdeas: string[];
}

export async function getPartyRecommendation(keywords: string[]): Promise<PartyRecommendation> {
  const prompt = `Create a unique and creative party theme recommendation based on these three keywords: ${keywords.join(", ")}. 
  The recommendation should be fun, imaginative, and detailed.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class party planner and creative director. Your goal is to provide highly imaginative and cohesive party theme recommendations based on three given keywords. Return the response in a structured JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themeName: { type: Type.STRING, description: "A catchy and creative name for the party theme" },
          description: { type: Type.STRING, description: "A brief, evocative description of the party's vibe" },
          musicStyle: { type: Type.STRING, description: "Recommended music genres or specific vibes" },
          dressCode: { type: Type.STRING, description: "What guests should wear to fit the theme" },
          decorationIdeas: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3-5 specific decoration ideas"
          },
        },
        required: ["themeName", "description", "musicStyle", "dressCode", "decorationIdeas"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as PartyRecommendation;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to generate recommendation. Please try again.");
  }
}
