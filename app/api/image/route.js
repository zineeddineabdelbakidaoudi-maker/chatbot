import { NextResponse } from "next/server";
import { searchVectorStore, initializeVectorStore } from "@/lib/vectorStore";
import { analyzeImage } from "@/lib/groq";
import { processQueryText } from "@/lib/normalize";

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

    if (analysis.in_domain !== "yes" || !analysis.character || analysis.character === "unknown") {
      return NextResponse.json({
        reply: "I can only identify Hunter x Hunter characters. This image does not appear to match a supported HxH character.",
        analysis,
        additionalInfo: null
      });
    }

    // Normalize character name
    const normalizedChar = processQueryText(analysis.character);

    // If a character was identified, validate against knowledge base
    let additionalInfo = null;
    await initializeVectorStore();
    const results = await searchVectorStore(normalizedChar, 1, "character");
    
    if (!results || results.length === 0 || results[0].score < 1.0) {
      return NextResponse.json({
        reply: "I can only identify Hunter x Hunter characters. This image does not appear to match a supported HxH character.",
        analysis,
        additionalInfo: null
      });
    }

    additionalInfo = results.map((r) => ({ title: r.title, content: r.content, score: r.score }));

    // Build response text
    let responseText = "";
    if (analysis.confidence === "high") {
      responseText = `This is **${analysis.character}**!`;
    } else if (analysis.confidence === "medium") {
      responseText = `I believe this is **${analysis.character}**.`;
    } else {
      responseText = `I am not fully sure, but this may be **${analysis.character}**.`;
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
