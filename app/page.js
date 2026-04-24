import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>
      <nav className="landing-nav">
        <span className="nav-logo">🏹 HunterBot</span>
        <Link href="/chat" className="nav-cta">Open Chat</Link>
      </nav>
      <main className="landing-hero">
        <h1 className="hero-title">
          Your <span className="gradient-text">Hunter x Hunter</span> Expert
        </h1>
        <p className="hero-subtitle">
          An intelligent RAG-powered chatbot that answers any question about the Hunter x Hunter universe.
          Characters, Nen abilities, arcs, and more — grounded in real knowledge.
        </p>
        <Link href="/chat" className="hero-btn">
          Start Chatting →
        </Link>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>RAG Retrieval</h3>
            <p>Answers grounded in a curated Hunter x Hunter knowledge base with vector search.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Domain Guard</h3>
            <p>Strict guardrails — only answers HxH and team questions, refuses everything else.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧠</span>
            <h3>Memory</h3>
            <p>Remembers your last 8 interactions with a rolling summary for context.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎤</span>
            <h3>Voice I/O</h3>
            <p>Speech-to-text input and text-to-speech output using browser APIs.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🖼️</span>
            <h3>Image Upload</h3>
            <p>Upload character images — describe them in text for AI-powered identification.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Groq Powered</h3>
            <p>Built on Groq LLaMA models for fast, accurate, and cost-effective responses.</p>
          </div>
        </div>
      </main>
      <footer className="landing-footer">
        <p>Built for competition · Powered by Groq + RAG · Hunter x Hunter © Yoshihiro Togashi</p>
      </footer>
    </div>
  );
}
