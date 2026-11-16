import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY тохируулаагүй байна. .env.local файлд key-гээ нэмнэ үү." },
      { status: 503 },
    );
  }

  let messages: ChatMessage[];
  try {
    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      body.messages.length > 40 ||
      !body.messages.every(
        (message): message is ChatMessage =>
          !!message &&
          typeof message === "object" &&
          "role" in message &&
          (message.role === "user" || message.role === "assistant") &&
          "content" in message &&
          typeof message.content === "string" &&
          message.content.length > 0 &&
          message.content.length <= 12000,
      )
    ) {
      return NextResponse.json({ error: "Зурвасын формат буруу байна." }, { status: 400 });
    }
    messages = body.messages;
  } catch {
    return NextResponse.json({ error: "Хүсэлтийн өгөгдлийг уншиж чадсангүй." }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      messages,
    });
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Claude-той холбогдож чадсангүй. API key болон эрхээ шалгана уу." },
      { status: 502 },
    );
  }
}
