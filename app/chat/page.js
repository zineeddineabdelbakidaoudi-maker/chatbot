"use client";
import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [summary, setSummary] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // History for API (role + content only)
  const history = messages
    .filter((m) => m.type !== "image")
    .map((m) => ({ role: m.role, content: m.content }));

  const memoryStats = {
    messageCount: history.length,
    pairCount: Math.floor(history.length / 2),
    hasSummary: !!summary,
    summaryLength: summary.length,
  };

  // Initialize vector store on mount
  useEffect(() => {
    fetch("/api/init")
      .then((r) => r.json())
      .then((data) => {
        setInitialized(true);
        console.log("Vector store initialized:", data);
      })
      .catch((err) => {
        console.error("Init failed:", err);
        setInitialized(true); // proceed anyway
      });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    const userMsg = { role: "user", content: text, type: "text", id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, summary }),
      });
      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.reply || "Sorry, something went wrong.",
        type: "text",
        sources: data.sources || [],
        classification: data.classification,
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.memoryUpdate) {
        setSummary(data.memoryUpdate);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again.", type: "text", id: Date.now() + 1 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(base64, mimeType, preview) {
    const userMsg = {
      role: "user",
      content: "I uploaded an image for character recognition.",
      type: "image",
      imagePreview: preview,
      id: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Could not analyze the image.",
          type: "text",
          sources: [],
          id: Date.now() + 1,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to analyze image.", type: "text", id: Date.now() + 1 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectQuery(query) {
    handleSend(query);
  }

  return (
    <div className="chat-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>
      <div className={`sidebar-wrapper ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar onSelectQuery={handleSelectQuery} memoryStats={memoryStats} />
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h1>🏹 HunterBot</h1>
          <span className="status-badge">{initialized ? "● Ready" : "◌ Loading..."}</span>
        </div>
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏹</div>
              <h2>Welcome to HunterBot</h2>
              <p>Your expert companion for all things Hunter x Hunter.</p>
              <p className="empty-hint">Ask about characters, Nen, arcs, or the team!</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {loading && (
            <div className="chat-message assistant-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSend} onImageUpload={handleImageUpload} disabled={loading} />
      </div>
    </div>
  );
}
