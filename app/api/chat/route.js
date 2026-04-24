import { NextResponse } from "next/server";
import { processQuery } from "@/lib/rag";

export async function POST(request) {
  try {
    const { message, history, summary } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await processQuery(message, history || [], summary || "");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);

    // Surface readable error messages for known Groq issues
    let userMessage = "Sorry, something went wrong. Please try again.";
    const msg = error?.message || "";
    if (msg.includes("GROQ_API_KEY")) {
      userMessage = "The server is missing its API key. Please contact the administrator.";
    } else if (msg.includes("rate limit")) {
      userMessage = "We're receiving too many requests right now. Please wait a moment and try again.";
    } else if (msg.includes("blocked") || msg.includes("403")) {
      userMessage = "The AI model is temporarily unavailable. Please try again shortly.";
    }

    return NextResponse.json(
      { error: msg, reply: userMessage },
      { status: 500 }
    );
  }
}
