import { accountGate } from "@/lib/approval";
﻿import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { getChatModel } from "@/lib/ai/model";
import { SYSTEM_PROMPT } from "@/lib/ai/knowledge";
import { getSessionUser } from "@/lib/auth";
import { authRateLimited } from "@/lib/auth-throttle";
import { chatInputSchema } from "@/lib/chat-validation";
import { consumeCharacterAccess } from "@/lib/character-entitlements";
export const maxDuration = 30;
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Join SturdiHome to Continue", joinUrl: "/join-network" }, { status: 401 });
  if (await accountGate(user)) return NextResponse.json({ error: "Agreement and admin approval required" }, { status: 403 });
  if ((user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") || (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED")) return NextResponse.json({error:"Account approval required"},{status:403});
  if (req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({error:"Forbidden"},{status:403});
  if (await authRateLimited("chat-user", user.id, 60)) return NextResponse.json({error:"Too many messages. Please try again later."},{status:429});
  // Bound the actual stream, not only an attacker-controlled Content-Length header.
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({error:"Invalid request"},{status:400});
  const chunks: Uint8Array[]=[]; let size=0;
  while (true) { const {done,value}=await reader.read(); if(done)break; size+=value.length;
    if(size>128*1024){await reader.cancel();return NextResponse.json({error:"Request too large"},{status:413});} chunks.push(value);
  }
  let body: unknown;
  try { body=JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return NextResponse.json({error:"Invalid request"},{status:400}); }
  const parsed=chatInputSchema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Invalid conversation. Send text messages of up to 2,000 characters."},{status:400});
  const entitlement = await consumeCharacterAccess(user.id, parsed.data.character);
  if (!entitlement.allowed) return NextResponse.json({ error: "Character access purchased required", purchaseRequired: true }, { status: 402 });
  const chatModel=getChatModel();
  if(!chatModel)return NextResponse.json({error:"Chat assistant is not configured yet."},{status:503});
  try {
    const characterPrompt = "You are speaking as Bixy, the warm, dependable SturdiHome guide. Use family-friendly humor and keep the conversation focused on helpful SturdiHome topics.";
    const result=streamText({model:chatModel.model,system:`${SYSTEM_PROMPT}\n\n${characterPrompt}`,messages:await convertToModelMessages(parsed.data.messages.slice(-20)),providerOptions:chatModel.providerOptions});
    return result.toUIMessageStreamResponse({onError:()=>"The assistant is temporarily unavailable. Please try again."});
  } catch {return NextResponse.json({error:"The assistant is temporarily unavailable."},{status:503});}
}
