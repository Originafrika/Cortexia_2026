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
    { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "Anthropic", type: "text", inputPrice: 1.425, outputPrice: 7.150, description: "Raisonnement avancé et codage de pointe" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic", type: "text", inputPrice: 1.75, outputPrice: 8.75, description: "Opus génération précédente" },
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", type: "text", inputPrice: 0.850, outputPrice: 4.275, description: "Bon équilibre vitesse/qualité" },
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "Anthropic", type: "text", inputPrice: 1.05, outputPrice: 5.25, description: "Sonnet fiable" },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", type: "text", inputPrice: 0.35, outputPrice: 1.75, description: "Rapide et économique" },
    { id: "claude-fable-5", name: "Claude Fable 5", provider: "Anthropic", type: "text", inputPrice: 4.00, outputPrice: 20.00, description: "Modèle de pointe Anthropic" },
    { id: "gpt-5-5", name: "GPT-5.5", provider: "OpenAI", type: "text", inputPrice: 1.40, outputPrice: 8.40, description: "Dernier modèle OpenAI, raisonnement avancé" },
    { id: "gpt-5-4", name: "GPT-5.4", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Équilibre performance/coût" },
    { id: "gpt-5-4-codex", name: "GPT-5.4 Codex", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Optimisé pour le code" },
    { id: "gpt-5-2", name: "GPT-5.2", provider: "OpenAI", type: "text", inputPrice: 0.44, outputPrice: 3.50, description: "Léger et rapide" },
    { id: "gemini-3-1-pro", name: "Gemini 3.1 Pro", provider: "Google", type: "text", inputPrice: 0.50, outputPrice: 3.50, description: "Dernier Pro Google" },
    { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "Google", type: "text", inputPrice: 0.50, outputPrice: 3.50, description: "Pro nouvelle génération" },
    { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", type: "text", inputPrice: 0.15, outputPrice: 0.90, description: "Flash puissant et économique" },
    { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", type: "text", inputPrice: 0.38, outputPrice: 3.00, description: "Raisonnement longue-contexte" },
    { id: "gemini-2-5-flash", name: "Gemini 2.5 Flash", provider: "Google", type: "text", inputPrice: 0.09, outputPrice: 0.75, description: "Le plus économique, idéal pour le volume" },
  ],
  image: [
    { id: "gpt-image-2-1k", name: "GPT Image 2 (1K)", provider: "OpenAI", type: "image", pricePerImg: 0.030, description: "Meilleur rapport qualité/prix OpenAI" },
    { id: "gpt-image-2-2k", name: "GPT Image 2 (2K)", provider: "OpenAI", type: "image", pricePerImg: 0.050, description: "Haute résolution" },
    { id: "gpt-image-2-4k", name: "GPT Image 2 (4K)", provider: "OpenAI", type: "image", pricePerImg: 0.080, description: "Ultra haute définition" },
    { id: "nano-banana-2-1k", name: "Nano Banana 2 (1K)", provider: "Google", type: "image", pricePerImg: 0.040, description: "Rapide et économique Google" },
    { id: "nano-banana-2-2k", name: "Nano Banana 2 (2K)", provider: "Google", type: "image", pricePerImg: 0.060, description: "Équilibré Google" },
    { id: "nano-banana-2-4k", name: "Nano Banana 2 (4K)", provider: "Google", type: "image", pricePerImg: 0.090, description: "Haute qualité Google" },
    { id: "nano-banana-pro", name: "Nano Banana Pro", provider: "Google", type: "image", pricePerImg: 0.090, description: "Pro, 2K et 4K" },
    { id: "flux-2-pro", name: "Flux 2 Pro", provider: "Black Forest Labs", type: "image", pricePerImg: 0.025, description: "Haute qualité, rendu précis" },
    { id: "seedream-4-5", name: "Seedream 4.5", provider: "ByteDance", type: "image", pricePerImg: 0.032, description: "Créatif et photoréaliste" },
    { id: "gpt-image-1-5", name: "GPT Image 1.5", provider: "OpenAI", type: "image", pricePerImg: 0.020, description: "Économique OpenAI" },
    { id: "gpt-4o-image", name: "GPT-4o Image", provider: "OpenAI", type: "image", pricePerImg: 0.030, description: "Compréhension unifiée texte+vision" },
    { id: "z-image", name: "Z-Image", provider: "Alibaba", type: "image", pricePerImg: 0.004, description: "Le moins cher, idéal pour tests" },
  ],
  audio: [
    { id: "suno-v5-5", name: "Suno V5.5", provider: "Suno", type: "audio", pricePerReq: 0.002, description: "Musique et chansons, version V5.5" },
    { id: "eleven-labs-tts", name: "ElevenLabs TTS", provider: "ElevenLabs", type: "audio", pricePerReq: 0.00007, description: "Text-to-speech par 1K caractères" },
    { id: "eleven-music", name: "Eleven Music", provider: "ElevenLabs", type: "audio", pricePerReq: 0.070, description: "Génération musicale ElevenLabs" },
    { id: "eleven-flash-v2-5", name: "Flash V2.5 TTS", provider: "ElevenLabs", type: "audio", pricePerReq: 0.030, description: "Text-to-speech turbo" },
    { id: "eleven-speech-to-text", name: "Speech to Text", provider: "ElevenLabs", type: "audio", pricePerReq: 0.018, description: "Transcription vocale" },
  ],
  video: [
    { id: "veo-3-1-1080p", name: "Veo 3.1 (1080p)", provider: "Google", type: "video", pricePerReq: 1.28, description: "Qualité cinématique 1080p" },
    { id: "veo-3-1-4k", name: "Veo 3.1 (4K)", provider: "Google", type: "video", pricePerReq: 1.85, description: "Qualité cinématique 4K" },
    { id: "kling-3-0", name: "Kling 3.0", provider: "Kuaishou", type: "video", pricePerSec: 0.070, description: "Animation réaliste, contrôle caméra" },
    { id: "seedance-2-0", name: "Seedance 2.0", provider: "ByteDance", type: "video", pricePerSec: 0.057, description: "Réaliste, avatars virtuels" },
    { id: "grok-imagine-720p", name: "Grok Imagine (720p)", provider: "xAI", type: "video", pricePerSec: 0.015, description: "Vidéo économique xAI" },
    { id: "grok-imagine-480p", name: "Grok Imagine (480p)", provider: "xAI", type: "video", pricePerSec: 0.008, description: "Très économique, tests" },
    { id: "gen-4-5", name: "Gen-4.5", provider: "Runway", type: "video", pricePerReq: 0.060, description: "Génération vidéo Runway" },
    { id: "hailuo-2-3", name: "Hailuo 2.3", provider: "MiniMax", type: "video", pricePerReq: 0.150, description: "Styles multiples" },
    { id: "infinitetalk", name: "InfiniteTalk", provider: "MeiGen AI", type: "video", pricePerSec: 0.015, description: "Avatars parlants" },
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
