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

export const VEO_3_1_PRICES: Record<string, Record<string, number>> = {
  lite: { "720p": 0.15, "1080p": 0.175, "4k": 0.75 },
  fast: { "720p": 0.30, "1080p": 0.325, "4k": 0.90 },
  quality: { "720p": 1.25, "1080p": 1.275, "4k": 1.85 },
};

export const MODEL_CATALOG: Record<ModelType, ModelInfo[]> = {
  text: [
    { id: "claude-opus-4-8", name: "Claude Opus 4.8", provider: "Anthropic", type: "text", inputPrice: 2.00, outputPrice: 10.00, description: "Dernier Opus, performances améliorées" },
    { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "Anthropic", type: "text", inputPrice: 1.425, outputPrice: 7.150, description: "Raisonnement avancé et codage de pointe" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic", type: "text", inputPrice: 1.425, outputPrice: 7.15, description: "Opus génération précédente" },
    { id: "claude-opus-4-5", name: "Claude Opus 4.5", provider: "Anthropic", type: "text", inputPrice: 1.425, outputPrice: 7.15, description: "Opus classique fiable" },
    { id: "claude-sonnet-5", name: "Claude Sonnet 5", provider: "Anthropic", type: "text", inputPrice: 0.85, outputPrice: 4.275, description: "Dernier Sonnet, raisonnement renforcé" },
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", type: "text", inputPrice: 0.85, outputPrice: 4.275, description: "Bon équilibre vitesse/qualité" },
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "Anthropic", type: "text", inputPrice: 0.85, outputPrice: 4.275, description: "Sonnet fiable" },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", type: "text", inputPrice: 0.275, outputPrice: 1.425, description: "Rapide et économique" },
    { id: "claude-fable-5", name: "Claude Fable 5", provider: "Anthropic", type: "text", inputPrice: 4.00, outputPrice: 20.00, description: "Modèle de pointe Anthropic" },
    { id: "gpt-5-5", name: "GPT-5.5", provider: "OpenAI", type: "text", inputPrice: 1.40, outputPrice: 8.40, description: "Dernier modèle OpenAI, raisonnement avancé" },
    { id: "gpt-5-4", name: "GPT-5.4", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Équilibre performance/coût" },
    { id: "gpt-5-4-codex", name: "GPT-5.4 Codex", provider: "OpenAI", type: "text", inputPrice: 0.70, outputPrice: 5.60, description: "Optimisé pour le code" },
    { id: "gpt-5-2", name: "GPT-5.2", provider: "OpenAI", type: "text", inputPrice: 0.44, outputPrice: 3.50, description: "Léger et rapide" },
    { id: "grok-4-5", name: "Grok 4.5", provider: "xAI", type: "text", inputPrice: 0.60, outputPrice: 3.00, description: "Dernier Grok, multimodal" },
    { id: "grok-4-3", name: "Grok 4.3", provider: "xAI", type: "text", inputPrice: 0.40, outputPrice: 2.00, description: "Grok rapide et économique" },
    { id: "gemini-3-5-flash", name: "Gemini 3.5 Flash", provider: "Google", type: "text", inputPrice: 0.45, outputPrice: 2.70, description: "Flash nouvelle génération, ultra-rapide" },
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
    { id: "nano-banana-2-lite", name: "Nano Banana 2 Lite", provider: "Google", type: "image", pricePerImg: 0.025, description: "Léger et rapide" },
    { id: "imagen-4", name: "Imagen 4", provider: "Google", type: "image", pricePerImg: 0.020, description: "Dernier modèle Google" },
    { id: "imagen-4-fast", name: "Imagen 4 Fast", provider: "Google", type: "image", pricePerImg: 0.020, description: "Génération rapide Google" },
    { id: "imagen-4-ultra", name: "Imagen 4 Ultra", provider: "Google", type: "image", pricePerImg: 0.060, description: "Ultra haute qualité Google" },
    { id: "flux-2-pro", name: "Flux 2 Pro", provider: "Black Forest Labs", type: "image", pricePerImg: 0.025, description: "Haute qualité, rendu précis" },
    { id: "flux-2-flex", name: "Flux 2 Flex", provider: "Black Forest Labs", type: "image", pricePerImg: 0.070, description: "Flux économique, génération rapide" },
    { id: "seedream-5-pro", name: "Seedream 5.0 Pro", provider: "ByteDance", type: "image", pricePerImg: 0.050, description: "Meilleur Seedream, photoréaliste" },
    { id: "seedream-5-lite", name: "Seedream 5.0 Lite", provider: "ByteDance", type: "image", pricePerImg: 0.028, description: "Seedream léger et rapide" },
    { id: "seedream-4-5", name: "Seedream 4.5", provider: "ByteDance", type: "image", pricePerImg: 0.033, description: "Créatif et photoréaliste" },
    { id: "seedream-4-0", name: "Seedream 4.0", provider: "ByteDance", type: "image", pricePerImg: 0.035, description: "Seedream génération précédente" },
    { id: "seedream-3-0", name: "Seedream 3.0", provider: "ByteDance", type: "image", pricePerImg: 0.020, description: "Seedream classique économique" },
    { id: "gpt-image-1-5", name: "GPT Image 1.5", provider: "OpenAI", type: "image", pricePerImg: 0.020, description: "Économique OpenAI" },
    { id: "gpt-4o-image", name: "GPT-4o Image", provider: "OpenAI", type: "image", pricePerImg: 0.030, description: "Compréhension unifiée texte+vision" },
    { id: "grok-imagine-t2i", name: "Grok Imagine T2I", provider: "xAI", type: "image", pricePerImg: 0.025, description: "Génération texte→image Grok" },
    { id: "grok-imagine-i2i", name: "Grok Imagine I2I", provider: "xAI", type: "image", pricePerImg: 0.030, description: "Édition image→image Grok" },
    { id: "ideogram-v3", name: "Ideogram V3", provider: "Ideogram", type: "image", pricePerImg: 0.018, description: "Typographie et design précis" },
    { id: "qwen-t2i", name: "Qwen T2I", provider: "Alibaba", type: "image", pricePerImg: 0.020, description: "Multilingue, texte→image" },
    { id: "qwen-i2i", name: "Qwen I2I", provider: "Alibaba", type: "image", pricePerImg: 0.028, description: "Édition image Alibaba" },
    { id: "qwen2-t2i", name: "Qwen2 T2I", provider: "Alibaba", type: "image", pricePerImg: 0.028, description: "Nouvelle génération Qwen" },
    { id: "topaz-upscale", name: "Topaz Upscale", provider: "Topaz", type: "image", pricePerImg: 0.040, description: "Agrandissement HD par IA" },
    { id: "recraft-upscale", name: "Recraft Upscale", provider: "Recraft", type: "image", pricePerImg: 0.025, description: "Agrandissement Recraft" },
    { id: "recraft-bg-remove", name: "Recraft BG Remove", provider: "Recraft", type: "image", pricePerImg: 0.015, description: "Suppression d'arrière-plan" },
    { id: "z-image", name: "Z-Image", provider: "Alibaba", type: "image", pricePerImg: 0.004, description: "Le moins cher, idéal pour tests" },
    { id: "wan-2-7-image", name: "Wan 2.7 Image", provider: "Wan", type: "image", pricePerImg: 0.024, description: "Génération et édition Wan" },
    { id: "wan-2-7-image-pro", name: "Wan 2.7 Image Pro", provider: "Wan", type: "image", pricePerImg: 0.060, description: "Wan Pro haute qualité" },
  ],
  audio: [
    { id: "suno-v5-5", name: "Suno V5.5", provider: "Suno", type: "audio", pricePerReq: 0.060, description: "Musique et chansons, version V5.5" },
    { id: "eleven-labs-tts", name: "ElevenLabs TTS", provider: "ElevenLabs", type: "audio", pricePerReq: 0.00007, description: "Text-to-speech par 1K caractères" },
    { id: "eleven-music", name: "Eleven Music", provider: "ElevenLabs", type: "audio", pricePerReq: 0.070, description: "Génération musicale ElevenLabs" },
    { id: "eleven-flash-v2-5", name: "Flash V2.5 TTS", provider: "ElevenLabs", type: "audio", pricePerReq: 0.030, description: "Text-to-speech turbo" },
    { id: "eleven-speech-to-text", name: "Speech to Text", provider: "ElevenLabs", type: "audio", pricePerReq: 0.018, description: "Transcription vocale" },
    { id: "eleven-tts-multi-v2", name: "TTS Multilingual V2", provider: "ElevenLabs", type: "audio", pricePerReq: 0.010, description: "Multilingue, voix naturelles" },
    { id: "eleven-audio-isolation", name: "Audio Isolation", provider: "ElevenLabs", type: "audio", pricePerReq: 0.015, description: "Isolement audio par IA" },
    { id: "eleven-dialogue-v3", name: "Text to Dialogue V3", provider: "ElevenLabs", type: "audio", pricePerReq: 0.070, description: "14cr/1000 caractères. Génération de dialogues" },
  ],
  video: [
    { id: "veo-3-1", name: "Veo 3.1", provider: "Google", type: "video", pricePerReq: 0.15, description: "Lite/Fast/Quality selon résolution. Audio natif, contrôle Start & End Frame." },
    { id: "kling-3-0", name: "Kling 3.0", provider: "Kuaishou", type: "video", pricePerSec: 0.070, description: "Standard no audio. Pro: 18cr/s ($0.09), 4K: 67cr/s ($0.335)" },
    { id: "kling-v3-turbo", name: "Kling V3 Turbo", provider: "Kuaishou", type: "video", pricePerSec: 0.09, description: "720p base. 1080p: 22.5cr/s ($0.1125/s)" },
    { id: "kling-v2-1-pro", name: "Kling V2.1 Pro", provider: "Kuaishou", type: "video", pricePerReq: 0.125, description: "Kling 2.1, contrôle de mouvements" },
    { id: "kling-v2-1-standard", name: "Kling V2.1 Standard", provider: "Kuaishou", type: "video", pricePerReq: 0.125, description: "Kling 2.1 standard" },
    { id: "kling-2-6", name: "Kling 2.6", provider: "Kuaishou", type: "video", pricePerReq: 0.275, description: "Kling 2.6, contrôle de mouvement" },
    { id: "seedance-2-0", name: "Seedance 2.0", provider: "ByteDance", type: "video", pricePerSec: 0.045, description: "480p base. 720p: 20cr/s ($0.10/s)" },
    { id: "seedance-2-fast", name: "Seedance 2.0 Fast", provider: "ByteDance", type: "video", pricePerSec: 0.045, description: "480p base. 720p: 20cr/s ($0.10/s)" },
    { id: "seedance-2-mini", name: "Seedance 2.0 Mini", provider: "ByteDance", type: "video", pricePerSec: 0.03, description: "480p base. 720p: 12.5cr/s" },
    { id: "seedance-1-5-pro", name: "Seedance 1.5 Pro", provider: "ByteDance", type: "video", pricePerReq: 0.15, description: "Seedance Pro classique" },
    { id: "grok-imagine-720p", name: "Grok Imagine (720p)", provider: "xAI", type: "video", pricePerReq: 0.30, description: "Vidéo économique xAI" },
    { id: "grok-imagine-480p", name: "Grok Imagine (480p)", provider: "xAI", type: "video", pricePerReq: 0.15, description: "Très économique, tests" },
    { id: "grok-imagine-v1-5", name: "Grok Imagine 1.5 Preview", provider: "xAI", type: "video", pricePerSec: 0.008, description: "480p base. 720p: 3cr/s (~$0.015/s)" },
    { id: "gen-4-5", name: "Gen-4.5", provider: "Runway", type: "video", pricePerReq: 0.060, description: "Génération vidéo Runway" },
    { id: "hailuo-2-3", name: "Hailuo 2.3", provider: "MiniMax", type: "video", pricePerReq: 0.150, description: "Styles multiples" },
    { id: "hailuo-pro", name: "Hailuo Pro", provider: "MiniMax", type: "video", pricePerReq: 0.250, description: "Hailuo haute qualité" },
    { id: "hailuo-standard", name: "Hailuo Standard", provider: "MiniMax", type: "video", pricePerReq: 0.060, description: "Hailuo standard économique" },
    { id: "wan-2-6", name: "Wan 2.6", provider: "Wan", type: "video", pricePerReq: 0.350, description: "Texte et image→vidéo" },
    { id: "wan-2-7-t2v", name: "Wan 2.7 T2V", provider: "Wan", type: "video", pricePerSec: 0.08, description: "720p base. 1080p: 24cr/s ($0.12/s)" },
    { id: "wan-2-7-i2v", name: "Wan 2.7 I2V", provider: "Wan", type: "video", pricePerSec: 0.08, description: "720p base. 1080p: 24cr/s ($0.12/s)" },
    { id: "topaz-video-upscale", name: "Topaz Video Upscale", provider: "Topaz", type: "video", pricePerReq: 0.080, description: "Agrandissement vidéo HD" },
    { id: "infinitetalk", name: "InfiniteTalk", provider: "MeiGen AI", type: "video", pricePerSec: 0.015, description: "Avatars parlants à partir d'audio" },
    { id: "omnihuman-1-5", name: "OmniHuman 1.5", provider: "OmniHuman", type: "video", pricePerSec: 0.135, description: "27cr/s. Génération de personnages humains" },
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
