HEAD
# chatbot
=======
# 🏹 HunterBot — Hunter x Hunter RAG Chatbot

An intelligent, competition-ready chatbot that answers questions exclusively about the **Hunter x Hunter** universe. Built with RAG retrieval, domain guardrails, conversation memory, voice I/O, and image recognition.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **RAG Retrieval** | BM25 search over 35+ curated HxH knowledge entries |
| **Domain Guard** | Strict classification — refuses off-topic questions |
| **Memory** | Last 8 interactions + rolling summary for context |
| **Voice Input** | Speech-to-text via browser Web Speech API + Groq Whisper |
| **Voice Output** | Text-to-speech playback for responses |
| **Image Upload** | Upload interface with graceful fallback message |
| **Team Info** | Answers about project team members from structured data |

## 🚀 Quick Start (3 Steps)

### 1. Get a Groq API Key (Free)
Go to [Groq Console](https://console.groq.com/keys) and create a free API key.

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local and paste your Groq API key
```

### 3. Run the App
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

## 🏗️ Architecture

```
User Input (text/voice/image)
        │
   ┌────▼────┐
   │Classifier│ → off_topic → 🛑 Refusal
   │(FAST)    │   (llama-3.1-8b-instant)
   └────┬────┘
        │ hunterxhunter / team_info
   ┌────▼──────────┐
   │ BM25 Search    │ → Top 5 chunks (no external API needed)
   └────┬──────────┘
        │
   ┌────▼────┐
   │ Memory   │ → Last 8 interactions + summary
   └────┬────┘
        │
   ┌────▼──────┐
   │ Groq LLM  │ → Grounded answer
   │ (MAIN)    │   (llama-3.3-70b-versatile)
   └────┬──────┘
        │
   ┌────▼──────┐
   │ Guardrails │ → Validated response
   └────┬──────┘
        │
   Response + Sources + Optional TTS
```

## 📁 Project Structure

```
├── app/
│   ├── layout.js          # Root layout with fonts
│   ├── page.js             # Landing page
│   ├── globals.css         # Full dark-mode stylesheet
│   ├── chat/page.js        # Main chat interface
│   └── api/
│       ├── chat/route.js   # Chat endpoint (RAG pipeline)
│       ├── image/route.js  # Image upload (graceful fallback)
│       ├── init/route.js   # Search index initialization
│       └── transcribe/route.js  # Groq Whisper STT
├── components/
│   ├── ChatMessage.js      # Message bubbles with TTS
│   ├── ChatInput.js        # Input with voice + image upload
│   └── Sidebar.js          # Sample queries + memory stats
├── lib/
│   ├── groq.js             # Groq API client (OpenAI-compatible)
│   ├── modelRouter.js      # Fixed model role assignments
│   ├── classifier.js       # Domain classifier
│   ├── guardrails.js       # Refusal + validation logic
│   ├── knowledge.js        # KB loader + chunker
│   ├── vectorStore.js      # BM25 keyword search
│   ├── memory.js           # Conversation memory
│   └── rag.js              # RAG orchestration pipeline
├── data/
│   ├── hunterxhunter_lore.json  # 35+ HxH knowledge entries
│   └── team_profiles.json       # Team member data
├── .env.example
├── README.md
└── DOCUMENTATION.md
```

## 🧪 Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14 (App Router) | Free |
| Styling | Vanilla CSS (dark glassmorphism) | Free |
| LLM (answers) | Groq — llama-3.3-70b-versatile | Free tier |
| LLM (classify) | Groq — llama-3.1-8b-instant | Free tier |
| STT | Groq Whisper — whisper-large-v3-turbo | Free tier |
| Search | BM25 (local, no API needed) | Free |
| TTS | Browser SpeechSynthesis | Free |

**Total cost: $0**

## 🧠 Model Router

| Role | Model | Purpose |
|------|-------|---------|
| FAST | llama-3.1-8b-instant | Classification, guardrails |
| MAIN | llama-3.3-70b-versatile | Grounded HxH answers |
| STT | whisper-large-v3-turbo | Speech-to-text |

## 🧪 Test Queries

| Query | Expected |
|-------|----------|
| "Who is Gon Freecss?" | Detailed character info |
| "Explain Nen categories" | Six categories explained |
| "What happened in the Chimera Ant arc?" | Arc summary |
| "Who are the team members?" | Team data from JSON |
| "What did I ask earlier?" | Memory recall |
| "Who won the World Cup?" | **Refused** ✋ |

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add `GROQ_API_KEY` as environment variable
4. Deploy!

## 📝 Team

Edit `data/team_profiles.json` with your real team member information before the competition.

---

Built for competition · Powered by Groq + RAG · Hunter x Hunter © Yoshihiro Togashi
cf0a2bb (Initial deploy-ready HunterBot build)
