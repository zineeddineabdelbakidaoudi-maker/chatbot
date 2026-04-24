# HunterBot — Build Walkthrough

## Summary

Built a complete, production-ready Hunter x Hunter RAG chatbot with **25 files** across all layers. The project builds successfully with zero errors and runs on the free Gemini tier at **$0 cost**.

## What Was Built

### 🗂️ Knowledge Base (2 files)
- **hunterxhunter_lore.json** — 35 entries covering characters (20+), all 7 arcs, Nen system (3 entries), organizations, locations, Greed Island cards, and relationships
- **team_profiles.json** — 5 placeholder team members (edit before competition)

### ⚙️ Core Libraries (7 files)
| File | Purpose |
|------|---------|
| `lib/gemini.js` | Gemini API client (LLM, embeddings, vision, summary, classification) |
| `lib/classifier.js` | Two-stage domain classifier (100+ HxH keywords → LLM fallback) |
| `lib/guardrails.js` | Off-topic refusal, input sanitization, response validation |
| `lib/knowledge.js` | JSON loader + chunker with metadata tagging |
| `lib/vectorStore.js` | Cosine similarity search with precomputed embeddings cache |
| `lib/memory.js` | Last 8 interactions + rolling summary generation |
| `lib/rag.js` | Full RAG pipeline orchestration |

### 🔌 API Routes (3 files)
- `/api/chat` — Main RAG pipeline (classify → guard → retrieve → generate)
- `/api/image` — Gemini Vision character identification
- `/api/init` — Vector store initialization

### 🖥️ Frontend (6 files)
- **Landing page** (`app/page.js`) — Hero with gradient title, 6 feature cards, CTA button
- **Chat page** (`app/chat/page.js`) — Full chat interface with sidebar, messages, input
- **ChatMessage** — User/assistant bubbles with TTS button, source tags, markdown
- **ChatInput** — Text input + microphone (STT) + image upload
- **Sidebar** — 7 sample queries + memory stats panel
- **globals.css** — 350+ lines of dark glassmorphism CSS with animations

### 📄 Documentation (4 files)
- `README.md` — Setup guide, architecture diagram, test queries, deployment
- `DOCUMENTATION.md` — Competition-ready system documentation
- `.env.example` — Single required env var
- `scripts/precompute-embeddings.js` — Embedding precomputation script

## Screenshots

### Landing Page
![Landing page with hero, gradient title, and feature cards](C:/Users/zinouuuuu/.gemini/antigravity/brain/f16244fa-cbe1-4f3f-8ad3-16576536f4ce/.system_generated/click_feedback/click_feedback_1776997833641.png)

### Chat Page
![Chat page with sidebar, welcome state, and input bar](C:/Users/zinouuuuu/.gemini/antigravity/brain/f16244fa-cbe1-4f3f-8ad3-16576536f4ce/.system_generated/click_feedback/click_feedback_1776997852586.png)

## Build Verification

```
✓ next build — 0 errors
✓ All routes compiled (3 static, 3 dynamic)
✓ Landing page renders correctly
✓ Chat page renders with sidebar, welcome state, input
✓ Dev server running at localhost:3000
```

## Next Steps for You

1. **Add your Gemini API key**: 
   ```bash
   cp .env.example .env.local
   # Paste your key from https://aistudio.google.com/apikey
   ```

2. **Edit team data**: Update `data/team_profiles.json` with real team member info

3. **Precompute embeddings** (optional, for faster cold starts):
   ```bash
   npm run precompute
   ```

4. **Test the full pipeline** — try the sample queries and off-topic rejection

5. **Deploy to Vercel** when ready
