# HunterBot — System Documentation

## 1. System Capabilities

HunterBot is an intelligent chatbot specialized in the Hunter x Hunter anime/manga universe. It provides:

- **Accurate Q&A**: Answers grounded in a curated knowledge base, not hallucinated
- **Domain Restriction**: Only answers HxH and team questions; politely refuses everything else
- **Contextual Memory**: Remembers the last 8 interactions with rolling summaries
- **Voice Interaction**: Speech-to-text (browser API + Groq Whisper) and text-to-speech output
- **Image Upload**: Character image upload UI with graceful fallback
- **Source Attribution**: Shows which knowledge entries were used for each answer

## 2. Technologies Used

### Frontend
- **Next.js 14** with App Router for server-side rendering and API routes
- **Vanilla CSS** with dark glassmorphism design system
- **Google Fonts** (Inter, JetBrains Mono) for typography

### AI/ML
- **Groq API** (OpenAI-compatible) — LLM inference provider
- **llama-3.3-70b-versatile** — main answering model for grounded HxH responses
- **llama-3.1-8b-instant** — fast model for classification and guardrails
- **whisper-large-v3-turbo** — speech-to-text transcription model

### Search
- **BM25 keyword search** — local, zero-dependency information retrieval
- No external embedding API needed — works instantly on cold start

### Browser APIs
- **Web Speech API** — client-side speech-to-text (browser fallback)
- **SpeechSynthesis API** — text-to-speech for audio playback

## 3. RAG Architecture

### Pipeline Steps

1. **Input Processing**: User message is sanitized and prepared
2. **Classification**: Fast keyword matching classifies the query as `hunterxhunter`, `team_info`, or `off_topic`. LLM fallback using FAST model (llama-3.1-8b-instant) for uncertain cases
3. **Guardrail Check**: Off-topic queries are immediately refused with a polite message
4. **Retrieval**: BM25 keyword search with IDF weighting and metadata keyword bonus. Top 5 most relevant chunks are retrieved
5. **Memory Injection**: Last 8 conversation pairs and rolling summary are attached to the prompt
6. **Generation**: MAIN model (llama-3.3-70b-versatile) generates a grounded answer using the retrieved context and memory
7. **Validation**: Response is checked by guardrails before being returned
8. **Delivery**: Response is displayed with source citations and optional TTS playback

### Search Engine

The retrieval system uses BM25 (Best Match 25) scoring with keyword bonuses:
- **BM25**: Term frequency × inverse document frequency scoring
- **Keyword Bonus**: +2.0 for each metadata keyword match, +3.0 for title match
- **Category Filtering**: Optional filter by category (character, arc, nen, etc.)
- **Zero External Dependency**: No embedding API calls — instant initialization

### Model Router

| Role | Model | Usage |
|------|-------|-------|
| FAST | llama-3.1-8b-instant | Classification, summary generation |
| MAIN | llama-3.3-70b-versatile | Grounded answer generation |
| STT | whisper-large-v3-turbo | Audio transcription |

Models are fixed by role. No random rotation between models.

### Knowledge Base Coverage

| Category | Entries | Examples |
|----------|---------|----------|
| Characters | 20+ | Gon, Killua, Kurapika, Hisoka, Meruem, Netero |
| Arcs | 7 | Hunter Exam, Yorknew, Chimera Ant, Election |
| Nen System | 3 | Categories, Techniques, Vows |
| Organizations | 2 | Phantom Troupe, Hunter Association |
| Locations | 3 | Whale Island, Kukuroo Mountain, NGL |
| Greed Island | 1 | Card system and mechanics |
| Relationships | 1 | Key character dynamics |
| Team | 5+ | Project team members |

## 4. Groq API Integration

### Compatibility Rules
All Groq requests follow strict OpenAI-compatible format:
- No `logprobs`, `logit_bias`, `top_logprobs` fields
- No `messages[].name` field
- `n` always set to 1
- No unsupported reasoning-related payload fields

### Error Handling
- **401**: Invalid API key → clear error message
- **403**: Model access blocked → descriptive error
- **404**: Invalid model ID → descriptive error
- **429**: Rate limit → retry message
- **Missing key**: Checked at request time with clear error

## 5. Memory System

- **Short-term**: Last 8 user-assistant interaction pairs kept in full
- **Long-term**: Rolling summary generated every 4 turns via FAST model
- **Context Building**: Both are injected into the prompt for continuity
- **No Hallucination Risk**: Memory never overrides guardrails or domain restrictions

## 6. Evaluation Checklist

| Criterion | Status |
|-----------|--------|
| Answers HxH questions accurately | ✅ |
| Refuses off-topic questions | ✅ |
| Uses RAG retrieval (not hallucination) | ✅ |
| Maintains conversation memory | ✅ |
| Supports voice input (STT) | ✅ |
| Supports voice output (TTS) | ✅ |
| Image upload UI present | ✅ |
| Shows team member information | ✅ |
| Clean, modern dark UI | ✅ |
| Works on desktop and mobile | ✅ |
| Deployable on Vercel | ✅ |
| $0 operating cost | ✅ |
| Complete documentation | ✅ |

## 7. Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project at vercel.com
3. Add environment variable: `GROQ_API_KEY`
4. Deploy

### Local Development
```bash
cp .env.example .env.local    # Add your Groq API key
npm install                    # Install dependencies
npm run dev                    # Start development server
```

---

*Hunter x Hunter © Yoshihiro Togashi. This project is for educational/competition purposes only.*
