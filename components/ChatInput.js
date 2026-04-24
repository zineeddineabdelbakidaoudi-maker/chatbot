"use client";
import { useState, useRef } from "react";

export default function ChatInput({ onSend, onImageUpload, disabled }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  function handleSend() {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      onImageUpload(base64, file.type, reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function toggleSTT() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  return (
    <div className="chat-input-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <button className="input-action-btn" onClick={handleImageClick} title="Upload image" disabled={disabled}>
        🖼️
      </button>
      <button
        className={`input-action-btn ${isListening ? "listening" : ""}`}
        onClick={toggleSTT}
        title={isListening ? "Stop listening" : "Voice input"}
        disabled={disabled}
      >
        🎤
      </button>
      <input
        type="text"
        className="chat-text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about Hunter x Hunter..."
        disabled={disabled}
      />
      <button className="send-btn" onClick={handleSend} disabled={disabled || !text.trim()}>
        ➤
      </button>
    </div>
  );
}
