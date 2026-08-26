import "server-only";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { SharedV4ProviderOptions } from "@ai-sdk/provider";

export interface ChatModelConfig {
  model: LanguageModel;
  providerOptions?: SharedV4ProviderOptions;
}

// Provider is chosen by whichever key is configured, so swapping providers later is just
// an env var change -- no code change needed.
export function getChatModel(): ChatModelConfig | null {
  if (process.env.HF_TOKEN) {
    const hf = createOpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1",
    });
    // gpt-oss-120b is a reasoning model; low effort keeps replies fast and cheap for a
    // chat widget that doesn't need visible chain-of-thought.
    return {
      model: hf.chat("openai/gpt-oss-120b"),
      providerOptions: { openai: { reasoningEffort: "low" } },
    };
  }

  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return { model: groq("openai/gpt-oss-120b") };
  }

  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return { model: openai("gpt-4o-mini") };
  }

  return null;
}
