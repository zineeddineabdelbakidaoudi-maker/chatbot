"use client";

const SAMPLE_QUERIES = [
  { label: "Who is Gon Freecss?", icon: "⚡" },
  { label: "Explain Nen categories", icon: "🔮" },
  { label: "Tell me about the Phantom Troupe", icon: "🕷️" },
  { label: "What happened in the Chimera Ant arc?", icon: "🐜" },
  { label: "Tell me about Greed Island", icon: "🎮" },
  { label: "Who are the team members?", icon: "👥" },
  { label: "What did I ask earlier?", icon: "🧠" },
];

export default function Sidebar({ onSelectQuery, memoryStats }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🏹 HunterBot</h2>
        <p className="sidebar-subtitle">Hunter x Hunter Expert</p>
      </div>

      <div className="sidebar-section">
        <h3>Try asking:</h3>
        <div className="sample-queries">
          {SAMPLE_QUERIES.map((q, i) => (
            <button key={i} className="sample-query-btn" onClick={() => onSelectQuery(q.label)}>
              <span className="query-icon">{q.icon}</span>
              <span className="query-text">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {memoryStats && (
        <div className="sidebar-section">
          <h3>🧠 Memory</h3>
          <div className="memory-stats">
            <div className="stat-row">
              <span>Messages</span>
              <span className="stat-value">{memoryStats.messageCount}</span>
            </div>
            <div className="stat-row">
              <span>Interactions</span>
              <span className="stat-value">{memoryStats.pairCount}/8</span>
            </div>
            <div className="stat-row">
              <span>Summary</span>
              <span className={`stat-value ${memoryStats.hasSummary ? "active" : ""}`}>
                {memoryStats.hasSummary ? "Active" : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <p>Powered by Groq + RAG</p>
      </div>
    </div>
  );
}
