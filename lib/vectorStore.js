import { getChunks } from "./knowledge";
import { processQueryText } from "./normalize";

// Module-level cache
let store = null;
let idfMap = null;

/**
 * Tokenize text into lowercase terms
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Compute IDF (Inverse Document Frequency) across all chunks
 */
function computeIDF(docs) {
  const df = {};
  const N = docs.length;
  for (const doc of docs) {
    const seen = new Set(doc.tokens);
    for (const term of seen) {
      df[term] = (df[term] || 0) + 1;
    }
  }
  const idf = {};
  for (const term of Object.keys(df)) {
    idf[term] = Math.log((N - df[term] + 0.5) / (df[term] + 0.5) + 1);
  }
  return idf;
}

/**
 * BM25 score for a query against a document
 */
function bm25Score(queryTokens, docTokens, idf, avgDL, k1 = 1.5, b = 0.75) {
  const dl = docTokens.length;
  const tf = {};
  for (const t of docTokens) {
    tf[t] = (tf[t] || 0) + 1;
  }

  let score = 0;
  for (const term of queryTokens) {
    if (!tf[term]) continue;
    const termIdf = idf[term] || 0;
    const termTf = tf[term];
    const num = termTf * (k1 + 1);
    const den = termTf + k1 * (1 - b + b * (dl / avgDL));
    score += termIdf * (num / den);
  }
  return score;
}

/**
 * Bonus score for exact keyword matches from metadata
 */
function keywordBonus(queryNormalized, chunk) {
  let bonus = 0;
  if (chunk.keywords) {
    for (const kw of chunk.keywords) {
      if (queryNormalized.includes(processQueryText(kw))) {
        bonus += 2.0;
      }
    }
  }
  // Title match bonus
  if (queryNormalized.includes(processQueryText(chunk.title))) {
    bonus += 3.0;
  }
  return bonus;
}

/**
 * Initialize the search index (BM25 + keyword matching)
 */
export async function initializeVectorStore() {
  if (store) return { status: "cached", count: store.length };

  const chunks = getChunks();

  store = chunks.map((chunk) => {
    const normalizedText = processQueryText(chunk.text);
    return {
      ...chunk,
      tokens: tokenize(normalizedText),
    };
  });

  idfMap = computeIDF(store);

  console.log(`Indexed ${store.length} chunks for BM25 search`);
  return { status: "indexed", count: store.length };
}

/**
 * Search for relevant chunks using BM25 + keyword bonus
 */
export async function searchVectorStore(query, topK = 5, categoryFilter = null) {
  if (!store) await initializeVectorStore();

  const normalizedQuery = processQueryText(query);
  const queryTokens = tokenize(normalizedQuery);
  const avgDL = store.reduce((sum, d) => sum + d.tokens.length, 0) / store.length;

  let candidates = store;
  if (categoryFilter) {
    candidates = store.filter((item) => item.category === categoryFilter);
  }

  const scored = candidates.map((item) => {
    const bm25 = bm25Score(queryTokens, item.tokens, idfMap, avgDL);
    const kwBonus = keywordBonus(normalizedQuery, item);
    return {
      id: item.id,
      category: item.category,
      title: item.title,
      content: item.content,
      keywords: item.keywords,
      score: bm25 + kwBonus,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Check if store is initialized
 */
export function isStoreReady() {
  return store !== null;
}

/**
 * Get store stats
 */
export function getStoreStats() {
  if (!store) return { initialized: false, count: 0 };
  const categories = {};
  for (const item of store) {
    categories[item.category] = (categories[item.category] || 0) + 1;
  }
  return { initialized: true, count: store.length, categories };
}
