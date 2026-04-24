/**
 * Shared normalization and alias resolution layer for Hunter x Hunter entities
 */

export const HUNTER_ENTITY_ALIASES = {
  // Characters
  "kaito": "kite",
  "kirua": "killua",
  "kuroro": "chrollo",
  "lucilfer": "chrollo",
  "netero-sama": "netero",
  "biscuit": "bisky",
  "neferpitou": "pitou",
  "menthuthuyoupi": "youpi",
  "shaiapouf": "pouf",
  "ging": "ging freecss",
  "kurapika kurta": "kurapika",
  
  // Organizations
  "genei ryodan": "phantom troupe",
  "ryodan": "phantom troupe",
  "spiders": "phantom troupe",
  "spider": "phantom troupe",

  // Concepts
  "nen": "nen", // ensure "nen" is strongly anchored
  "hatsu": "hatsu",
};

/**
 * Normalizes a query by lowercasing, trimming, and stripping extra spaces/punctuation
 */
export function normalizeQuery(text) {
  if (!text || typeof text !== "string") return "";
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, " ") // Replace punctuation with space (except hyphens)
    .replace(/\s+/g, " "); // Remove repeated spaces
}

/**
 * Resolves known aliases in a normalized text to their canonical forms
 */
export function resolveAliases(normalizedText) {
  let resolvedText = normalizedText;
  
  for (const [alias, canonical] of Object.entries(HUNTER_ENTITY_ALIASES)) {
    // Use word boundaries to avoid partial word replacements
    const regex = new RegExp(`\\b${alias}\\b`, "g");
    resolvedText = resolvedText.replace(regex, canonical);
  }
  
  return resolvedText;
}

/**
 * Convenience function to fully normalize and resolve aliases
 */
export function processQueryText(text) {
  return resolveAliases(normalizeQuery(text));
}

/**
 * Checks if a normalized query contains any known HxH entity or alias
 */
export function containsKnownEntity(normalizedText) {
  // Check against canonicals
  const canonicals = new Set(Object.values(HUNTER_ENTITY_ALIASES));
  for (const canonical of canonicals) {
    if (normalizedText.includes(canonical)) return true;
  }
  // Check against aliases
  for (const alias of Object.keys(HUNTER_ENTITY_ALIASES)) {
    if (normalizedText.includes(alias)) return true;
  }
  return false;
}
