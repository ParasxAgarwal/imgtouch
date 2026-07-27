import { GoogleGenAI } from "@google/genai";
import { parseDataUri, optimizeImagePayload } from "./imageUtils";

/**
 * Resolves the Gemini API Key safely with environment fallbacks.
 */
const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key.trim() === "" || key === "undefined") {
    throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your .env.local file.");
  }
  return key.trim();
};

/**
 * Creates and returns an initialized GoogleGenAI instance.
 */
const getAIClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

/**
 * Executes an async function with exponential backoff retries for transient API errors.
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isTransient =
      error?.status === 429 ||
      error?.status === 503 ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("fetch failed");

    if (retries > 0 && isTransient) {
      console.warn(`Transient API error encountered (${error?.message}). Retrying in ${delayMs}ms...`);
      await new Promise((res) => setTimeout(res, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

/**
 * Generates an image based on a text prompt using Gemini's image generation model.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Please enter a valid prompt for image generation.");
  }

  const ai = getAIClient();

  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt.trim() }]
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        if (candidate.finishReason === 'SAFETY') {
          throw new Error("Image generation was flagged by Gemini content safety policies. Please revise your prompt.");
        }
      }

      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("Gemini returned a response, but no inline image data was found.");
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      throw new Error(error.message || "Failed to generate image.");
    }
  });
};

/**
 * Edits an existing image based on text instructions.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Please enter editing instructions.");
  }

  // Optimize and resize image payload to avoid payload overflow
  const optimizedDataUri = await optimizeImagePayload(base64Image);
  const { mimeType, data } = parseDataUri(optimizedDataUri);
  const ai = getAIClient();

  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data
              }
            },
            { text: prompt.trim() }
          ]
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        if (candidate.finishReason === 'SAFETY') {
          throw new Error("Image edit request was flagged by Gemini content safety policies.");
        }
      }

      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("No edited image was returned by the AI.");
    } catch (error: any) {
      console.error("Gemini Edit Error:", error);
      throw new Error(error.message || "Failed to edit image.");
    }
  });
};

/**
 * Enhances image clarity and resolution details using AI logic.
 */
export const enhanceImageWithGemini = async (base64Image: string): Promise<string> => {
  const prompt = "Enhance this image to be 4k ultra high resolution. Sharpen details, fix artifacts, improve lighting and texture quality. Make it look professional and photorealistic. Maintain exact composition and colors.";
  return await editImageWithGemini(base64Image, prompt);
};

/**
 * Generates creative text captions or titles with robust JSON parsing.
 */
export const generateCreativeText = async (topic: string): Promise<string[]> => {
  if (!topic || !topic.trim()) {
    return ["Creative Title", "Dream Big", "Gen Z Vibes"];
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 creative, short, punchy titles or captions for an image about: "${topic.trim()}". Return them as a plain JSON array of strings, e.g. ["Title 1", "Title 2"].`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text;
    if (!rawText) return ["Creative Title", "Dream Big", "Gen Z Vibes"];

    // Robust JSON extraction (strip markdown fences if present)
    const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
    return ["Creative Title", "Dream Big", "Gen Z Vibes"];
  } catch (e) {
    console.error("Gemini Creative Text Generation Error:", e);
    return ["Creative Title", "Dream Big", "Gen Z Vibes"];
  }
};
