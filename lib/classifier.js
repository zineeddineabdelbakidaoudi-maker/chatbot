import { classifyWithLLM } from "./groq";
import { processQueryText, containsKnownEntity } from "./normalize";

// HxH keywords for fast classification
const HXH_KEYWORDS = [
  "hunter", "gon", "killua", "kurapika", "leorio", "hisoka", "chrollo",
  "nen", "hatsu", "enhancer", "transmuter", "conjurer", "emitter", "manipulator", "specialist",
  "phantom troupe", "spider", "zoldyck", "chimera ant", "greed island",
  "heavens arena", "yorknew", "whale island", "kukuroo", "meruem",
  "netero", "neferpitou", "pitou", "shaiapouf", "menthuthuyoupi", "komugi",
  "ging", "kite", "bisky", "biscuit", "wing", "knuckle", "shoot", "palm",
  "morel", "knov", "alluka", "nanika", "illumi", "silva", "zeno",
  "feitan", "machi", "nobunaga", "shalnark", "shizuku", "phinks", "franklin",
  "pakunoda", "uvogin", "kortopi", "bonolenov", "kalluto",
  "jajanken", "godspeed", "bungee gum", "chain jail", "emperor time",
  "scarlet eyes", "kurta", "meteor city", "hunter exam", "hunter association",
  "zodiac", "dark continent", "greed island", "gungi",
  "ten", "zetsu", "ren", "gyo", "en", "shu", "ko", "ken", "ryu",
  "hxh", "hunterxhunter", "hunter x hunter", "togashi",
  "trick tower", "zevil", "genthru", "bomber", "razor", "crazy slots",
  "skill hunter", "bandit secret", "doctor blythe", "terpsichora",
  "guanyin bodhisattva", "poor man rose", "deep purple",
  "water divination", "aura", "hatsu"
];

const TEAM_KEYWORDS = [
  "team", "member", "members", "who made", "who built", "who created",
  "creator", "creators", "developer", "developers", "your team",
  "project team", "about you", "who are you", "who developed",
  "university", "student", "students", "academic", "field of study"
];

const MEMORY_KEYWORDS = [
  "what did i ask", "what did i say", "what were we talking about", 
  "repeat my previous", "summarize our conversation", "what did you just say",
  "what was my last question", "what did we discuss"
];

/**
 * Classify user message into hunterxhunter, team_info, or off_topic
 */
export async function classifyMessage(message) {
  const normalized = processQueryText(message);

  // Check team keywords first (more specific)
  for (const kw of TEAM_KEYWORDS) {
    if (normalized.includes(kw)) {
      return { category: "team_info", method: "keyword", confidence: "high" };
    }
  }

  // Check memory follow-up
  for (const kw of MEMORY_KEYWORDS) {
    if (normalized.includes(kw)) {
      return { category: "memory_followup", method: "keyword", confidence: "high" };
    }
  }

  // Check HxH keywords
  for (const kw of HXH_KEYWORDS) {
    if (normalized.includes(kw)) {
      return { category: "hunterxhunter", method: "keyword", confidence: "high" };
    }
  }

  // Second-chance check for known entities/aliases
  if (containsKnownEntity(normalized)) {
    return { category: "hunterxhunter", method: "alias_resolution", confidence: "high" };
  }

  // Fallback: use LLM classification
  const llmCategory = await classifyWithLLM(message);
  return { category: llmCategory, method: "llm", confidence: "medium" };
}
