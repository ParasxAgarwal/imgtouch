import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates an image based on a text prompt.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

/**
 * Edits an existing image based on instructions.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image format");
  }
  const mimeType = matches[1];
  const data = matches[2];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: prompt }
        ]
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No edited image returned from Gemini.");
  } catch (error: any) {
    console.error("Gemini Edit Error:", error);
    throw new Error(error.message || "Failed to edit image.");
  }
};

/**
 * Enhances image clarity and resolution using AI logic.
 * This doesn't strictly increase dimensions if the model doesn't support it, 
 * but it hallucinates higher fidelity details (Super Resolution / Clarity).
 */
export const enhanceImageWithGemini = async (base64Image: string): Promise<string> => {
  // We use the edit endpoint but with a specific system-like prompt for enhancement.
  const prompt = "Enhance this image to be 4k ultra high resolution. Sharpen details, fix artifacts, improve lighting and texture quality. Make it look professional and photorealistic. Do not change the subject or composition.";
  return await editImageWithGemini(base64Image, prompt);
};

/**
 * Generate creative text captions or titles.
 */
export const generateCreativeText = async (topic: string): Promise<string[]> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 creative, short, punchy titles or captions for an image about: "${topic}". Return them as a JSON array of strings.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return ["Creative Title", "Dream Big", "Gen Z Vibes"];
  }
};
