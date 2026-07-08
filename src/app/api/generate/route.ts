import { NextResponse } from "next/server";
import { MODEL_CATALOG, estimateCost } from "@/lib/kie-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, type, params } = body;

    if (!prompt || !type) {
      return NextResponse.json({ error: "prompt and type are required" }, { status: 400 });
    }

    const cost = model ? estimateCost(model) : 0;

    return NextResponse.json({
      id: crypto.randomUUID(),
      output: `[${type}] Généré : "${prompt}"`,
      model: model ?? "unknown",
      type,
      cost,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(MODEL_CATALOG);
}
