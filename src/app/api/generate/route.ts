import { NextResponse } from "next/server";
import { generate, getModels } from "@/lib/kie-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, type, params } = body;

    if (!prompt || !type) {
      return NextResponse.json({ error: "prompt and type are required" }, { status: 400 });
    }

    const result = await generate({ prompt, model, type, params });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const models = await getModels();
    return NextResponse.json(models);
  } catch (err) {
    console.error("Models error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch models" },
      { status: 500 }
    );
  }
}
