"use client";
import { useState } from "react";

export default function ChatMessage({ message, onPlayTTS }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isUser = message.role === "user";
  const isImage = message.type === "image";

  function handleTTS() {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message.content.replace(/\*\*/g, "").replace(/\n/g, " "));
    utterance.rate = 1;
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  // Simple markdown bold rendering
  function renderContent(text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  }

  return (
    <div className={`chat-message ${isUser ? "user-message" : "assistant-message"}`}>
      <div className="message-avatar">
        {isUser ? "👤" : "🤖"}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">{isUser ? "You" : "HunterBot"}</span>
        </div>
        {isImage && message.imagePreview && (
          <div className="message-image">
            <img src={message.imagePreview} alt="Uploaded" />
          </div>
        )}
        <div className="message-text">{renderContent(message.content)}</div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            {message.sources.map((s, i) => (
              <span key={i} className="source-tag">{s.title}</span>
            ))}
          </div>
        )}
        {!isUser && (
          <button className="tts-btn" onClick={handleTTS} title={isPlaying ? "Stop" : "Play aloud"}>
            {isPlaying ? "⏹" : "🔊"}
          </button>
        )}
      </div>
    </div>
  );
}
