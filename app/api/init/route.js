import { NextResponse } from "next/server";
import { initializeVectorStore, getStoreStats } from "@/lib/vectorStore";

export async function GET() {
  try {
    const result = await initializeVectorStore();
    const stats = getStoreStats();
    return NextResponse.json({ ...result, stats });
  } catch (error) {
    console.error("Init API error:", error);
    return NextResponse.json({ error: "Failed to initialize", status: "error" }, { status: 500 });
  }
}
