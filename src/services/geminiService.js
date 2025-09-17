import { model } from "../config/gemini.js";

export async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini error:", err.message);
    return "⚠️ Error fetching response from Gemini API";
  }
}
