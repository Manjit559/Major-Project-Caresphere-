import { GoogleGenAI } from "@google/genai";

// Read the Vite client-side environment variable. Vite exposes vars prefixed with VITE_ via import.meta.env
const apiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || process.env.API_KEY || '';

let ai: any;
// Log only presence (not the value) so you can confirm Vite loaded the env var without leaking the key.
console.log('[gemini] API key present:', !!apiKey);

if (!apiKey) {
  console.warn('[gemini] No API key found. Set VITE_GEMINI_API_KEY in .env.local or provide process.env.API_KEY. Falling back to a noop client to avoid runtime crashes.');
  // Provide a minimal local stub that implements the parts of the SDK used by the app.
  ai = {
    models: {
      generateContent: async (opts: any) => {
        // Return a safe empty JSON so callers that parse JSON get predictable results
        return { text: '{}' };
      }
    },
    chats: {
      create: (opts: any) => {
        return {
          sendMessage: async ({ message }: { message: string }) => {
            // Echo back a friendly canned response so the UI remains interactive during dev without a key
            const reply = `Thanks for sharing — I heard: "${(message || '').slice(0, 200)}". (No API key configured in dev)`;
            return { text: reply };
          }
        };
      }
    }
  } as any;
} else {
  ai = new GoogleGenAI({ apiKey });
}

// Helper to check for quota errors
const isQuotaError = (error: any) => {
  return error.message?.includes('429') || 
         error.message?.includes('quota') || 
         error.message?.includes('exceeded') || 
         error.status === 429 ||
         error.code === 429;
};

// Helper to robustly clean and parse JSON from AI response
const cleanAndParseJSON = (text: string, fallback: any) => {
  try {
    if (!text) return fallback;
    let cleaned = text.trim();
    // Find JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON Parse Error:", e);
    return fallback;
  }
};

export const getGeminiModel = () => {
  return ai;
};

export const getModelName = () => {
  return 'gemini-2.5-flash';
};

export const analyzeImageWellness = async (base64Image: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this image for wellness. Detect emotions, stress, and atmosphere.
            Return strict JSON:
            {
              "emotions": ["emotion1", "emotion2"],
              "stressLevel": number (1-10),
              "happinessLevel": number (1-10),
              "feedback": "Warm, supportive feedback paragraph.",
              "wellnessScore": number (0-100)
            }`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    return cleanAndParseJSON(response.text || '{}', {
        emotions: ["Analysis Failed"],
        stressLevel: 0,
        happinessLevel: 0,
        feedback: "Could not analyze image. Please try again.",
        wellnessScore: 0
    });
  } catch (error: any) {
    if (isQuotaError(error)) {
      return {
        emotions: ["Busy"],
        stressLevel: 0,
        happinessLevel: 0,
        feedback: "System is busy. Please wait a moment.",
        wellnessScore: 0
      };
    }
    console.error("Image analysis error:", error);
    return {
        emotions: ["Error"],
        stressLevel: 0,
        happinessLevel: 0,
        feedback: "We encountered an issue analyzing the image.",
        wellnessScore: 0
    };
  }
};

export const detectRealtimeEmotions = async (base64Image: string, mimeType: string) => {
  try {
    // 4-second timeout to prevent UI freeze
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 4000)
    );

    const apiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Identify the dominant human facial emotion from this image.
            The image may be low light or have occlusion.
            Focus on landmarks: eyebrows, mouth corners, eye openness.
            
            Return JSON only: { "emotion": "Happy" | "Sad" | "Angry" | "Fear" | "Neutral" | "Disgust" | "Surprise", "confidence": 0.0 to 1.0 }`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    
    return cleanAndParseJSON(response.text, { emotion: "Neutral", confidence: 0 });

  } catch (error: any) {
    if (error.message === 'Timeout') return { emotion: "Timeout", confidence: 0 };
    if (isQuotaError(error)) return { emotion: "Limit Reached", confidence: 0 };
    return { emotion: "Neutral", confidence: 0 };
  }
};

export const analyzeVoiceReflection = async (base64Audio: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Analyze the speaker's tone, anxiety, and confidence in this audio.
            Return strict JSON:
            {
              "tone": "Brief description",
              "anxietyLevel": number (1-10),
              "confidenceLevel": number (1-10),
              "suggestions": ["suggestion1", "suggestion2"],
              "wellnessScore": number (0-100)
            }`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    return cleanAndParseJSON(response.text, {
        tone: "Analysis Failed",
        anxietyLevel: 0,
        confidenceLevel: 0,
        suggestions: ["Could not process audio"],
        wellnessScore: 0
    });
  } catch (error: any) {
    if (isQuotaError(error)) {
      return {
        tone: "System Busy",
        anxietyLevel: 0,
        confidenceLevel: 0,
        suggestions: ["Please try again later"],
        wellnessScore: 0
      };
    }
    console.error("Voice analysis error:", error);
    throw error;
  }
};

export const generateProductivityPlan = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a daily plan for: "${input}".
      Return JSON:
      {
        "tasks": [ { "time": "09:00", "task": "..." } ],
        "advice": "..."
      }`,
      config: {
        responseMimeType: "application/json",
      },
    });
    return cleanAndParseJSON(response.text, { tasks: [], advice: "Failed to generate plan." });
  } catch (error: any) {
    if (isQuotaError(error)) {
      return {
        tasks: [],
        advice: "Quota exceeded. Please wait."
      };
    }
    console.error("Productivity plan error:", error);
    return { tasks: [], advice: "Error generating plan." };
  }
};

export const simplifyContent = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Simplify this text: "${text}". Provide Sign Language Gloss if possible.
      Return JSON: { "simplified": "...", "signLanguageGloss": "..." }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return cleanAndParseJSON(response.text, { simplified: "Error processing text.", signLanguageGloss: "" });
  } catch (error: any) {
    if (isQuotaError(error)) {
      return { simplified: "System busy.", signLanguageGloss: "" };
    }
    console.error("Accessibility error:", error);
    throw error;
  }
};
