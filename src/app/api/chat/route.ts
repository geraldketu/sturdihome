import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getChatModel } from "@/lib/ai/model";
import { SYSTEM_PROMPT } from "@/lib/ai/knowledge";
import { isRateLimited } from "@/lib/ai/rate-limit";

export const maxDuration = 30;

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest) {
  const chatModel = getChatModel();
  if (!chatModel) {
    return NextResponse.json({ error: "Chat assistant is not configured yet." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const messages: UIMessage[] | undefined = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const trimmedMessages = messages.slice(-MAX_MESSAGES);
  const tooLong = trimmedMessages.some((m) =>
    m.parts?.some((p) => p.type === "text" && p.text.length > MAX_MESSAGE_LENGTH),
  );
  if (tooLong) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const result = streamText({
    model: chatModel.model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(trimmedMessages),
    providerOptions: chatModel.providerOptions,
  });

  return result.toUIMessageStreamResponse();
}
