import { NextRequest, NextResponse } from "next/server";

const AI_PROVIDER = (process.env.AI_PROVIDER || "groq") as
  | "groq"
  | "huggingface"
  | "openai"
  | "ollama";

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  useJsonFormat: boolean = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  interface GroqRequestBody {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    response_format?: { type: string };
  }

  const body: GroqRequestBody = {
    model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.7,
  };

  if (useJsonFormat) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Groq Error: ${msg}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(
  messages: Array<{ role: string; content: string }>,
  useJsonFormat: boolean = false
): Promise<string> {
  switch (AI_PROVIDER) {
    case "groq":
      return await callGroq(messages, useJsonFormat);
    default:
      return await callGroq(messages, useJsonFormat);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, useJsonFormat = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const response = await callAI(messages, useJsonFormat);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to call AI";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
