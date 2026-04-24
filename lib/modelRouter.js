/**
 * Model Router — fixed role assignments for Groq models.
 * Do NOT randomly rotate between models.
 */

export const MODELS = {
  /** Fast model for classification and lightweight guardrails */
  FAST: process.env.GROQ_MODEL_FAST || "llama-3.1-8b-instant",
  /** Main model for grounded HxH answers */
  MAIN: process.env.GROQ_MODEL_MAIN || "llama-3.3-70b-versatile",
  /** Speech-to-text model */
  STT: process.env.GROQ_MODEL_STT || "whisper-large-v3-turbo",
  /** Image model */
  IMAGE: process.env.GROQ_MODEL_IMAGE || "meta-llama/llama-4-scout-17b-16e-instruct",
};

/**
 * Get the model ID for a given role
 */
export function getModel(role) {
  switch (role) {
    case "fast":
      return MODELS.FAST;
    case "main":
      return MODELS.MAIN;
    case "stt":
      return MODELS.STT;
    case "image":
      return MODELS.IMAGE;
    default:
      return MODELS.MAIN;
  }
}
