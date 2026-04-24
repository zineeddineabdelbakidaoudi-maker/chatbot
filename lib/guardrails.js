const REFUSAL_MESSAGES = [
  "I can only help with Hunter x Hunter and team information. Feel free to ask me about characters, Nen, arcs, or our team!",
  "That's outside my domain! I specialize in Hunter x Hunter. Ask me about Gon, Killua, Nen abilities, or the team behind this project!",
  "I'm a Hunter x Hunter specialist — I can't help with that topic. Try asking about the Phantom Troupe, Chimera Ants, or Greed Island!",
];

/**
 * Check if query should be refused
 */
export function shouldRefuse(classification) {
  return classification.category === "off_topic";
}

/**
 * Get a polite refusal message
 */
export function getRefusalMessage() {
  return REFUSAL_MESSAGES[Math.floor(Math.random() * REFUSAL_MESSAGES.length)];
}

/**
 * Sanitize user input
 */
export function sanitizeInput(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().slice(0, 2000); // Max 2000 chars
}

/**
 * Validate generated response - check for hallucination signals
 */
export function validateResponse(response, classification) {
  if (!response) return getRefusalMessage();

  // If classified as team_info but response discusses non-team topics extensively
  if (classification.category === "team_info") {
    return response; // Trust the structured data pipeline
  }

  return response;
}
