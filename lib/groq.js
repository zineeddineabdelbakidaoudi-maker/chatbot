import { getModel } from "./modelRouter";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Get Groq API key with validation
 */
function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.local");
  }
  return key;
}

/**
 * Make a safe chat completion request to Groq.
 * Strips unsupported OpenAI fields (logprobs, logit_bias, top_logprobs, name, n!=1).
 */
async function chatCompletion(messages, options = {}) {
  const {
    model = getModel("main"),
    temperature = 0.3,
    max_tokens = 1024,
    stream = false,
  } = options;

  // Build safe payload — only Groq-supported fields
  const payload = {
    model,
    messages: messages.map(({ role, content }) => ({ role, content })),
    temperature,
    max_tokens,
    stream,
    n: 1,
  };

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    const status = res.status;

    if (status === 400) throw new Error(`Invalid request to Groq (400). Model: ${model}. ${errorBody.slice(0, 150)}`);
    if (status === 401) throw new Error("Invalid GROQ_API_KEY. Check your key.");
    if (status === 403) throw new Error(`Model access blocked (403). Model: ${model}. Check Groq Console permissions.`);
    if (status === 404) throw new Error(`Model not found (404). Model: ${model}. Verify model ID.`);
    if (status === 429) throw new Error("Groq rate limit reached. Please wait and retry.");
    if (status === 503) throw new Error("Groq service temporarily unavailable. Please retry.");

    throw new Error(`Groq API error ${status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Unexpected Groq response format: no choices returned");
  }
  return data.choices[0].message.content || "";
}

/**
 * Generate an answer using Groq (MAIN model)
 */
export async function generateAnswer(systemPrompt, userMessage, context, history) {
  try {
    const messages = [];

    // System message with context
    messages.push({
      role: "system",
      content: `${systemPrompt}\n\n---\nRetrieved Context:\n${context}\n---`,
    });

    // Conversation history
    if (history && history.length > 0) {
      for (const m of history) {
        messages.push({ role: m.role, content: m.content });
      }
    }

    // Current user message
    messages.push({ role: "user", content: userMessage });

    return await chatCompletion(messages, {
      model: getModel("main"),
      temperature: 0.3,
      max_tokens: 1024,
    });
  } catch (error) {
    console.error("Groq generateAnswer error:", error.message);
    throw error;
  }
}

/**
 * Generate a rolling summary of conversation (FAST model)
 */
export async function generateSummary(msgs) {
  try {
    const transcript = msgs
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    return await chatCompletion(
      [
        {
          role: "system",
          content: "You are a summarizer. Respond with ONLY a 2-3 sentence summary.",
        },
        {
          role: "user",
          content: `Summarize this conversation, focusing on Hunter x Hunter topics discussed:\n\n${transcript}`,
        },
      ],
      { model: getModel("fast"), temperature: 0.2, max_tokens: 200 }
    );
  } catch (error) {
    console.error("Summary generation error:", error.message);
    return "";
  }
}

/**
 * Classify a message using LLM (FAST model — fallback for keyword classifier)
 */
export async function classifyWithLLM(message) {
  try {
    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            'Classify the user message into exactly one category. Respond with ONLY the category name.\n\nCategories:\n- "hunterxhunter" — questions about the anime/manga Hunter x Hunter\n- "team_info" — questions about the project team, creators, developers\n- "off_topic" — anything else',
        },
        { role: "user", content: message },
      ],
      { model: getModel("fast"), temperature: 0, max_tokens: 20 }
    );

    const cat = result.trim().toLowerCase();
    if (cat.includes("hunterxhunter")) return "hunterxhunter";
    if (cat.includes("team")) return "team_info";
    return "off_topic";
  } catch {
    return "off_topic";
  }
}

/**
 * Transcribe audio using Groq Whisper (STT model)
 */
export async function transcribeAudio(audioBuffer, filename = "audio.webm") {
  try {
    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer]), filename);
    formData.append("model", getModel("stt"));
    formData.append("language", "en");
    formData.append("response_format", "json");

    const res = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Transcription failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("Groq transcription error:", error.message);
    throw error;
  }
}

/**
 * Analyze an image using Groq Vision model
 */
export async function analyzeImage(base64Data, mimeType) {
  try {
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "You are a Hunter x Hunter expert. Analyze this image and determine if it shows a Hunter x Hunter character.\n\nIf it IS a Hunter x Hunter character:\n- Identify the character name\n- Give a confidence level (high, medium, low)\n- Provide a brief description of the character\n\nIf it is NOT a Hunter x Hunter character:\n- Say \"This does not appear to be a Hunter x Hunter character.\"\n\nIf you are not fully sure, say: \"I am not fully sure, but this may be [character name].\"\n\nRespond in JSON format: { \"character\": \"name or null\", \"confidence\": \"high/medium/low/none\", \"description\": \"...\" }" },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
        ]
      }
    ];

    const result = await chatCompletion(messages, {
      model: getModel("image"),
      temperature: 0.2,
      max_tokens: 500
    });
    
    const text = result;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { character: null, confidence: "none", description: text };
  } catch (error) {
    console.error("Groq image analysis error:", error.message);
    throw error;
  }
}

