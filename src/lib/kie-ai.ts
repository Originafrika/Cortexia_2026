export type ModelType = "text" | "image" | "audio" | "video";

export interface GenerateParams {
  prompt: string;
  model?: string;
  type: ModelType;
  params?: Record<string, unknown>;
}

export interface GenerateResult {
  id: string;
  output: string | string[];
  model: string;
  type: ModelType;
  cost: number;
}

const KIE_BASE = process.env.KIE_AI_BASE_URL ?? "https://api.kie.ai/v1";
const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";

export async function generate(params: GenerateParams): Promise<GenerateResult> {
  const res = await fetch(`${KIE_BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIE_KEY}`,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      model: params.model,
      type: params.type,
      ...params.params,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kie AI error (${res.status}): ${err}`);
  }

  return res.json();
}

export async function getModels() {
  const res = await fetch(`${KIE_BASE}/models`, {
    headers: { Authorization: `Bearer ${KIE_KEY}` },
  });
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json() as Promise<Array<{ id: string; name: string; type: ModelType; price: number }>>;
}
