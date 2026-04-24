import { NextResponse } from "next/server";
import { searchVectorStore, initializeVectorStore } from "@/lib/vectorStore";
import { analyzeImage } from "@/lib/groq";

/**
 * Image recognition endpoint.
 * Groq does not support multimodal/vision input.
 * Graceful fallback: attempt OCR-like text extraction from the user's description,
 * or return a clear temporary message without crashing.
 */
export async function POST(request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // Analyze image with Groq Vision
    const analysis = await analyzeImage(imageBase64, mimeType || "image/png");

    // If a character was identified, retrieve more info
    let additionalInfo = null;
    if (analysis.character && analysis.confidence !== "none") {
      await initializeVectorStore();
      const results = await searchVectorStore(analysis.character, 3, "character");
      if (results.length > 0) {
        additionalInfo = results.map((r) => ({ title: r.title, content: r.content, score: r.score }));
      }
    }

    // Build response text
    let responseText = "";
    if (analysis.confidence === "high") {
      responseText = `This is **${analysis.character}**! ${analysis.description}`;
    } else if (analysis.confidence === "medium") {
      responseText = `I believe this is **${analysis.character}**. ${analysis.description}`;
    } else if (analysis.confidence === "low") {
      responseText = `I am not fully sure, but this may be **${analysis.character}**. ${analysis.description}`;
    } else {
      responseText = analysis.description || "I couldn't identify a Hunter x Hunter character in this image.";
    }

    if (additionalInfo && additionalInfo.length > 0) {
      responseText += `\n\nHere's what I know about this character:\n${additionalInfo[0].content}`;
    }

    return NextResponse.json({
      reply: responseText,
      analysis,
      additionalInfo,
    });
  } catch (error) {
    console.error("Image API error:", error);
    return NextResponse.json(
      { error: "Failed to process image", reply: "Sorry, image analysis is currently unavailable." },
      { status: 500 }
    );
  }
}
