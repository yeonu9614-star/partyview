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
  const prompt = `다음 세 가지 키워드를 바탕으로 독특하고 창의적인 파티 테마 추천안을 만들어주세요: ${keywords.join(", ")}. 
  추천안은 재미있고 상상력이 풍부하며 상세해야 합니다. 모든 응답은 한국어로 작성해주세요.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "당신은 세계적인 파티 플래너이자 크리에이티브 디렉터입니다. 당신의 목표는 주어진 세 가지 키워드를 바탕으로 매우 상상력이 풍부하고 일관성 있는 파티 테마 추천안을 제공하는 것입니다. 모든 텍스트 응답은 한국어여야 합니다. 응답은 구조화된 JSON 형식으로 반환하세요.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themeName: { type: Type.STRING, description: "파티 테마의 매력적이고 창의적인 이름" },
          description: { type: Type.STRING, description: "파티 분위기에 대한 짧고 인상적인 설명" },
          musicStyle: { type: Type.STRING, description: "추천 음악 장르 또는 특정 분위기" },
          dressCode: { type: Type.STRING, description: "테마에 어울리는 하객 복장" },
          decorationIdeas: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3-5가지 구체적인 장식 아이디어"
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
