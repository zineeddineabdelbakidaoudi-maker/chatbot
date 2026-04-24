import { generateSummary } from "./groq";

/**
 * Memory manager - keeps last 8 interactions + rolling summary
 * State is passed from the client and processed server-side
 */

const MAX_HISTORY = 8; // 8 pairs = 16 messages

/**
 * Format history for the LLM prompt
 */
export function formatHistory(history) {
  if (!history || history.length === 0) return "";
  return history
    .slice(-MAX_HISTORY * 2) // last 8 pairs
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
}

/**
 * Build memory context string for RAG prompt
 */
export function buildMemoryContext(history, summary) {
  let context = "";
  if (summary) {
    context += `Conversation Summary: ${summary}\n\n`;
  }
  const recentHistory = formatHistory(history);
  if (recentHistory) {
    context += `Recent Conversation:\n${recentHistory}`;
  }
  return context;
}

/**
 * Trim history to keep only last 8 interaction pairs
 */
export function trimHistory(history) {
  if (!history) return [];
  return history.slice(-MAX_HISTORY * 2);
}

/**
 * Check if summary should be regenerated (every 4 new interactions)
 */
export function shouldUpdateSummary(history) {
  if (!history) return false;
  return history.length > 0 && history.length % 8 === 0; // every 4 pairs
}

/**
 * Generate a rolling summary from history
 */
export async function updateRollingSummary(history, existingSummary) {
  if (!history || history.length === 0) return existingSummary || "";
  
  // Include existing summary + recent messages for context
  const messagesToSummarize = [];
  if (existingSummary) {
    messagesToSummarize.push({ role: "system", content: `Previous summary: ${existingSummary}` });
  }
  messagesToSummarize.push(...history.slice(-8)); // last 4 pairs
  
  return await generateSummary(messagesToSummarize);
}

/**
 * Get memory stats for debug/admin
 */
export function getMemoryStats(history, summary) {
  return {
    messageCount: history ? history.length : 0,
    pairCount: history ? Math.floor(history.length / 2) : 0,
    hasSummary: !!summary,
    summaryLength: summary ? summary.length : 0,
  };
}
