import { classifyMessage } from "./classifier";
import { shouldRefuse, getRefusalMessage, sanitizeInput, validateResponse } from "./guardrails";
import { searchVectorStore, initializeVectorStore } from "./vectorStore";
import { getTeamInfoString } from "./knowledge";
import { generateAnswer } from "./groq";
import { buildMemoryContext, trimHistory, shouldUpdateSummary, updateRollingSummary } from "./memory";

const SYSTEM_PROMPT = `You are HunterBot, an expert assistant specialized EXCLUSIVELY in the Hunter x Hunter anime/manga universe created by Yoshihiro Togashi.

STRICT RULES:
1. ONLY answer questions about Hunter x Hunter (characters, plot, Nen, arcs, locations, abilities, organizations, etc.)
2. ONLY answer team/project questions when team data is provided in context
3. NEVER answer questions about other topics, even if the user insists
4. ALWAYS base your answers on the retrieved context provided below
5. If the retrieved context does not contain enough information, say: "I don't have enough Hunter x Hunter information to answer that fully, but here's what I know..."
6. Be accurate and detailed. Cite specific events, abilities, and character details
7. Keep answers concise but informative (2-4 paragraphs max)
8. Use a friendly, knowledgeable tone befitting a Hunter x Hunter expert`;

const TEAM_SYSTEM_PROMPT = `You are HunterBot. The user is asking about the team members who built this project.
Answer ONLY using the team data provided below. Do not invent or assume any information.
Present the information in a clear, friendly way.`;

/**
 * Main RAG pipeline - processes a user query end-to-end
 */
export async function processQuery(message, history = [], summary = "") {
  // 1. Sanitize input
  const cleanMessage = sanitizeInput(message);
  if (!cleanMessage) {
    return { reply: "Please enter a message.", classification: null, sources: [] };
  }

  // 2. Ensure vector store is ready
  await initializeVectorStore();

  // 3. Classify the message
  const classification = await classifyMessage(cleanMessage);

  // 4. Check guardrails
  if (shouldRefuse(classification)) {
    return {
      reply: getRefusalMessage(),
      classification,
      sources: [],
      memoryUpdate: null,
    };
  }

  // 5. Handle team info queries
  if (classification.category === "team_info") {
    const teamInfo = getTeamInfoString();
    const memoryContext = buildMemoryContext(history, summary);
    const context = `Team Members:\n${teamInfo}`;

    const reply = await generateAnswer(
      TEAM_SYSTEM_PROMPT,
      cleanMessage,
      context,
      trimHistory(history).map((m) => ({ role: m.role, content: m.content }))
    );

    return {
      reply: validateResponse(reply, classification),
      classification,
      sources: [{ title: "Team Profiles", category: "team" }],
      memoryUpdate: null,
    };
  }

  // 6. RAG retrieval for HxH queries
  const results = await searchVectorStore(cleanMessage, 5);
  const retrievedContext = results
    .map((r) => `[${r.title}] ${r.content}`)
    .join("\n\n");

  // 7. Build memory context
  const memoryContext = buildMemoryContext(history, summary);
  const fullContext = memoryContext
    ? `${memoryContext}\n\n---\n\n${retrievedContext}`
    : retrievedContext;

  // 8. Generate answer
  const reply = await generateAnswer(
    SYSTEM_PROMPT,
    cleanMessage,
    fullContext,
    trimHistory(history).map((m) => ({ role: m.role, content: m.content }))
  );

  // 9. Check if summary needs update
  let newSummary = null;
  if (shouldUpdateSummary(history)) {
    newSummary = await updateRollingSummary(history, summary);
  }

  // 10. Return result
  return {
    reply: validateResponse(reply, classification),
    classification,
    sources: results.map((r) => ({ title: r.title, category: r.category, score: r.score })),
    memoryUpdate: newSummary,
  };
}
