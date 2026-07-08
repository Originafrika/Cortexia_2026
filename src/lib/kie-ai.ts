export type ModelType = "text" | "image" | "audio" | "video";

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  inputPrice?: number;
  outputPrice?: number;
  pricePerReq?: number;
  pricePerSec?: number;
  pricePerImg?: number;
  context?: number;
  description?: string;
  capabilities?: string[];
}

export const MODEL_CATALOG: Record<ModelType, ModelInfo[]> = {
  text: [
    { id: "claude-4-5-haiku", name: "Claude 4.5 Haiku", provider: "Anthropic", type: "text", inputPrice: 0.35, outputPrice: 1.75, description: "Rapide et économique pour les tâches courantes" },
    { id: "claude-4-5-sonnet", name: "Claude 4.5 Sonnet", provider: "Anthropic", type: "text", inputPrice: 1.05, outputPrice: 5.25, description: "Bon équilibre vitesse/qualité" },
    { id: "claude-4-5-opus", name: "Claude 4.5 Opus", provider: "Anthropic", type: "text", inputPrice: 1.75, outputPrice: 8.75, description: "Raisonnement avancé et tâches complexes" },
    { id: "claude-4-6-sonnet", name: "Claude 4.6 Sonnet", provider: "Anthropic", type: "text", inputPrice: 1.05, outputPrice: 5.25, description: "Dernière version Sonnet" },
    { id: "claude-4-6-opus", name: "Claude 4.6 Opus", provider: "Anthropic", type: "text", inputPrice: 1.75, outputPrice: 8.75, description: "Dernière version Opus" },
    { id: "claude-fable-5", name: "Claude Fable 5", provider: "Anthropic", type: "text", inputPrice: 4.00, outputPrice: 20.00, description: "Modèle de pointe Anthropic" },
    { id: "gpt-5-2", name: "GPT-5.2", provider: "OpenAI", type: "text", inputPrice: 0.44, outputPrice: 3.50, description: "Léger et rapide" },
    { id: "gpt-5-4", name: "GPT-5.4", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Équilibre performance/coût" },
    { id: "gpt-5-4-codex", name: "GPT-5.4 Codex", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Optimisé pour le code" },
    { id: "gemini-2-5-flash", name: "Gemini 2.5 Flash", provider: "Google", type: "text", inputPrice: 0.09, outputPrice: 0.75, description: "Le plus économique, idéal pour le volume" },
    { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", type: "text", inputPrice: 0.38, outputPrice: 3.00, description: "Raisonnement longue-contexte" },
    { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", type: "text", inputPrice: 0.15, outputPrice: 0.90, description: "Flash nouvelle génération" },
    { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "Google", type: "text", inputPrice: 0.50, outputPrice: 3.50, description: "Pro nouvelle génération" },
  ],
  image: [
    { id: "flux-2-pro", name: "Flux 2 Pro", provider: "Black Forest Labs", type: "image", pricePerImg: 0.025, description: "Haute qualité, rendu précis" },
    { id: "flux-2-flex", name: "Flux 2 Flex", provider: "Black Forest Labs", type: "image", pricePerImg: 0.070, description: "Flexible, styles variés" },
    { id: "gpt-image-1-5", name: "GPT Image 1.5", provider: "OpenAI", type: "image", pricePerImg: 0.020, description: "Économique, bon rendu général" },
    { id: "gpt-4o-image", name: "GPT-4o Image", provider: "OpenAI", type: "image", pricePerImg: 0.030, description: "Compréhension unifiée texte+vision" },
    { id: "gemini-3-pro-image", name: "Gemini 3 Pro Image", provider: "Google", type: "image", pricePerImg: 0.090, description: "Haute qualité Google" },
    { id: "gemini-3-1-flash-image", name: "Gemini 3.1 Flash Image", provider: "Google", type: "image", pricePerImg: 0.040, description: "Rapide et économique" },
    { id: "imagen-4", name: "Imagen 4", provider: "Google", type: "image", pricePerImg: 0.020, description: "Photoréalisme Google" },
    { id: "ideogram-3-0", name: "Ideogram 3.0", provider: "Ideogram", type: "image", pricePerImg: 0.018, description: "Excellent rendu typographique" },
    { id: "seedream-5-0-lite", name: "Seedream 5.0 Lite", provider: "ByteDance", type: "image", pricePerImg: 0.028, description: "Créatif et économique" },
    { id: "grok-aurora", name: "Grok Aurora", provider: "xAI", type: "image", pricePerImg: 0.020, description: "Photoréaliste xAI" },
    { id: "qwen-image", name: "Qwen Image", provider: "Alibaba", type: "image", pricePerImg: 0.020, description: "Multilingue" },
    { id: "wan-2-7-image-pro", name: "Wan 2.7 Image Pro", provider: "Alibaba", type: "image", pricePerImg: 0.060, description: "Haute qualité Wan" },
    { id: "z-image", name: "Z-Image", provider: "Alibaba", type: "image", pricePerImg: 0.004, description: "Le moins cher, idéal pour tests" },
  ],
  audio: [
    { id: "eleven-flash-v2-5", name: "Flash V2.5 TTS", provider: "ElevenLabs", type: "audio", pricePerReq: 0.030, description: "Text-to-speech rapide" },
    { id: "eleven-music", name: "Eleven Music", provider: "ElevenLabs", type: "audio", pricePerReq: 0.070, description: "Génération musicale" },
    { id: "suno-v5-5", name: "Suno V5.5", provider: "Suno", type: "audio", pricePerReq: 0.060, description: "Musique et chansons" },
    { id: "eleven-sound-effect-v2", name: "Sound Effect V2", provider: "ElevenLabs", type: "audio", pricePerReq: 0.0012, description: "Effets sonores" },
    { id: "eleven-speech-to-text", name: "Speech to Text", provider: "ElevenLabs", type: "audio", pricePerReq: 0.018, description: "Transcription vocale" },
  ],
  video: [
    { id: "veo-3-1", name: "Veo 3.1", provider: "Google", type: "video", pricePerReq: 0.025, description: "Cinématique, text-to-video & image-to-video" },
    { id: "gen-4-5", name: "Gen-4.5", provider: "Runway", type: "video", pricePerReq: 0.060, description: "Génération vidéo Runway" },
    { id: "kling-3-0", name: "Kling 3.0", provider: "Kuaishou", type: "video", pricePerSec: 0.070, description: "Animation réaliste, contrôle caméra" },
    { id: "kling-2-6", name: "Kling 2.6", provider: "Kuaishou", type: "video", pricePerReq: 0.275, description: "Stable, qualité professionnelle" },
    { id: "hailuo-2-3", name: "Hailuo 2.3", provider: "MiniMax", type: "video", pricePerReq: 0.150, description: "Styles multiples, bon équilibre" },
    { id: "seedance-2-0", name: "Seedance 2.0", provider: "ByteDance", type: "video", pricePerSec: 0.057, description: "Réaliste, avatars virtuels" },
    { id: "wan-2-6", name: "Wan 2.6", provider: "Alibaba", type: "video", pricePerReq: 0.350, description: "Turbo performance" },
    { id: "aleph", name: "Aleph", provider: "Runway", type: "video", pricePerReq: 0.550, description: "Haut de gamme Runway" },
    { id: "infinitetalk", name: "InfiniteTalk", provider: "MeiGen AI", type: "video", pricePerSec: 0.015, description: "Avatars parlants longue durée" },
  ],
};

export interface GenerateParams {
  prompt: string;
  model: string;
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

const KIE_BASE = process.env.KIE_AI_BASE_URL ?? "https://api.kie.ai";
const KIE_KEY = process.env.KIE_AI_API_KEY ?? "";

async function kieFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${KIE_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KIE_KEY}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kie AI error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function generateChat(modelId: string, messages: { role: string; content: string }[], temperature = 0.7) {
  return kieFetch("/api/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({ model: modelId, messages, temperature }),
  });
}

export async function createTask(modelId: string, params: Record<string, unknown>) {
  return kieFetch("/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({ model: modelId, ...params }),
  });
}

export async function getTaskResult(taskId: string) {
  return kieFetch(`/api/v1/jobs/recordInfo?taskId=${taskId}`);
}

export async function checkCredits() {
  return kieFetch("/api/v1/chat/credit");
}

export function estimateCost(modelId: string, usage?: { inputTokens?: number; outputTokens?: number }): number {
  const allModels = Object.values(MODEL_CATALOG).flat();
  const model = allModels.find((m) => m.id === modelId);
  if (!model) return 0;

  if (model.pricePerReq) return model.pricePerReq;
  if (model.pricePerImg) return model.pricePerImg;
  if (model.pricePerSec) return model.pricePerSec;
  if (model.inputPrice && usage) {
    const inCost = ((usage.inputTokens ?? 0) / 1_000_000) * model.inputPrice;
    const outCost = ((usage.outputTokens ?? 0) / 1_000_000) * (model.outputPrice ?? model.inputPrice);
    return inCost + outCost;
  }
  return model.inputPrice ?? 0;
}

export function getModelsByType(type: ModelType) {
  return MODEL_CATALOG[type] ?? [];
}
