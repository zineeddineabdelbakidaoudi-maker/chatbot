import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/groq";
import { getModel } from "@/lib/modelRouter";

/**
 * Server-side speech-to-text using Groq Whisper.
 * Accepts audio file as FormData.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = audioFile.name || "audio.webm";

    const text = await transcribeAudio(buffer, filename);

    return NextResponse.json({ text, model: getModel("stt") });
  } catch (error) {
    console.error("Transcribe API error:", error.message);
    return NextResponse.json(
      { error: "Transcription failed. " + error.message, text: "" },
      { status: 500 }
    );
  }
}
