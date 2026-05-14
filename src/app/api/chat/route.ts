import { deterministicAssistantReply, type VaultRow } from "@/lib/cactus";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = String(body.apiKey ?? "").trim();
    const prompt = String(body.prompt ?? body.messages?.at?.(-1)?.content ?? "Help me analyze this deal");
    const mode = String(body.mode ?? "Analyze");
    const vaultContext = Array.isArray(body.vaultContext) ? body.vaultContext as VaultRow[] : [];

    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json({
        provider: "cactus-fallback",
        connected: false,
        content: deterministicAssistantReply(prompt, vaultContext, mode),
      });
    }

    const messages = [
      {
        role: "system",
        content: "You are Cactus, a concise CRE analysis assistant. Use selected Vault rows as primary context, cite source fields, distinguish direct comps from MSA/state/national benchmarks, and produce actionable next steps.",
      },
      {
        role: "user",
        content: `Mode: ${mode}\nPrompt: ${prompt}\nSelected Vault context:\n${JSON.stringify(vaultContext, null, 2)}`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || "gpt-4o-mini",
        messages,
        temperature: 0.25,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({
        provider: "openai-error-fallback",
        connected: false,
        error: detail.slice(0, 280),
        content: deterministicAssistantReply(prompt, vaultContext, mode),
      }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json({
      provider: "openai",
      connected: true,
      content: data.choices?.[0]?.message?.content ?? deterministicAssistantReply(prompt, vaultContext, mode),
    });
  } catch (error) {
    return NextResponse.json({
      provider: "cactus-fallback",
      connected: false,
      error: error instanceof Error ? error.message : "Unknown chat error",
      content: "Cactus could not complete the live call, but your Vault data is safe. Try again or check the API key in Settings.",
    }, { status: 200 });
  }
}
