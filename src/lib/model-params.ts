import type { ModelInfo } from "./kie-ai";

export interface Param {
  key: string;
  label: string;
  type: "select" | "number" | "slider";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  default: string | number;
  unit?: string;
}

type ModelParamsMap = Record<string, Record<string, Param[]>>;

const MODEL_SPECIFIC_PARAMS: ModelParamsMap = {
  text: {
    default: [
      { key: "temperature", label: "Température", type: "slider", min: 0, max: 2, step: 0.1, default: 0.7 },
      { key: "maxTokens", label: "Max tokens", type: "slider", min: 100, max: 16384, step: 100, default: 2048, unit: "tokens" },
      { key: "topP", label: "Top P", type: "slider", min: 0, max: 1, step: 0.05, default: 1.0 },
    ],
    "gpt-5-5": [
      { key: "reasoningEffort", label: "Effort de raisonnement", type: "select", default: "medium", options: [
        { value: "low", label: "Faible (rapide)" },
        { value: "medium", label: "Moyen" },
        { value: "high", label: "Élevé (profond)" },
      ]},
      { key: "temperature", label: "Température", type: "slider", min: 0, max: 2, step: 0.1, default: 0.7 },
      { key: "maxTokens", label: "Max tokens", type: "slider", min: 100, max: 32768, step: 100, default: 4096, unit: "tokens" },
      { key: "topP", label: "Top P", type: "slider", min: 0, max: 1, step: 0.05, default: 1.0 },
    ],
    "gpt-5-4-codex": [
      { key: "temperature", label: "Température", type: "slider", min: 0, max: 2, step: 0.1, default: 0.2 },
      { key: "maxTokens", label: "Max tokens", type: "slider", min: 100, max: 32768, step: 100, default: 8192, unit: "tokens" },
      { key: "topP", label: "Top P", type: "slider", min: 0, max: 1, step: 0.05, default: 0.9 },
    ],
  },
  image: {
    default: [
      { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
        { value: "512x512", label: "512 × 512" },
        { value: "768x768", label: "768 × 768" },
        { value: "1024x1024", label: "1024 × 1024" },
        { value: "1216x832", label: "1216 × 832" },
      ]},
      { key: "n", label: "Nombre d'images", type: "select", default: "1", options: [
        { value: "1", label: "1 image" },
        { value: "2", label: "2 images" },
        { value: "4", label: "4 images" },
      ]},
    ],
    "gpt-image-2-1k": [
      { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
        { value: "1024x1024", label: "1024 × 1024 (1K)" },
        { value: "1216x832", label: "1216 × 832" },
      ]},
      { key: "n", label: "Nombre d'images", type: "select", default: "1", options: [
        { value: "1", label: "1 image — $0.03" },
        { value: "2", label: "2 images — $0.035" },
        { value: "4", label: "4 images — $0.04" },
      ]},
    ],
    "gpt-image-2-2k": [
      { key: "resolution", label: "Résolution", type: "select", default: "2048x2048", options: [
        { value: "2048x2048", label: "2048 × 2048 (2K)" },
      ]},
      { key: "n", label: "Nombre d'images", type: "select", default: "1", options: [
        { value: "1", label: "1 image — $0.05" },
        { value: "2", label: "2 images — $0.055" },
      ]},
    ],
    "gpt-image-2-4k": [
      { key: "resolution", label: "Résolution", type: "select", default: "4096x4096", options: [
        { value: "4096x4096", label: "4096 × 4096 (4K)" },
      ]},
      { key: "n", label: "Nombre d'images", type: "select", default: "1", options: [
        { value: "1", label: "1 image — $0.08" },
      ]},
    ],
    "flux-2-pro": [
      { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
        { value: "1024x1024", label: "1024 × 1024" },
        { value: "1216x832", label: "1216 × 832" },
        { value: "832x1216", label: "832 × 1216" },
        { value: "1536x1024", label: "1536 × 1024" },
      ]},
      { key: "guidanceScale", label: "Guidance scale", type: "slider", min: 1, max: 20, step: 0.5, default: 7.0 },
      { key: "steps", label: "Steps", type: "slider", min: 1, max: 50, step: 1, default: 28 },
      { key: "seed", label: "Seed", type: "number", min: 0, max: 999999, default: 0 },
    ],
    "z-image": [
      { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
        { value: "512x512", label: "512 × 512" },
        { value: "768x768", label: "768 × 768" },
        { value: "1024x1024", label: "1024 × 1024" },
      ]},
      { key: "n", label: "Nombre d'images", type: "select", default: "1", options: [
        { value: "1", label: "1 image" },
        { value: "2", label: "2 images" },
        { value: "4", label: "4 images" },
      ]},
    ],
  },
  video: {
    default: [
      { key: "duration", label: "Durée", type: "select", default: "5", options: [
        { value: "5", label: "5 secondes" },
        { value: "10", label: "10 secondes" },
      ]},
      { key: "resolution", label: "Résolution", type: "select", default: "1080p", options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
        { value: "4k", label: "4K" },
      ]},
    ],
    "veo-3-1": [
      { key: "mode", label: "Mode", type: "select", default: "fast", options: [
        { value: "lite", label: "Lite — économique" },
        { value: "fast", label: "Fast — rapide" },
        { value: "quality", label: "Quality — meilleur" },
      ]},
      { key: "resolution", label: "Résolution", type: "select", default: "1080p", options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
        { value: "4k", label: "4K" },
      ]},
      { key: "promptType", label: "Type d'entrée", type: "select", default: "text", options: [
        { value: "text", label: "Texte → Vidéo" },
        { value: "image", label: "Image → Vidéo" },
      ]},
      { key: "duration", label: "Durée", type: "select", default: "8", options: [
        { value: "5", label: "5 secondes" },
        { value: "8", label: "8 secondes" },
        { value: "10", label: "10 secondes" },
        { value: "15", label: "15 secondes" },
      ]},
    ],
    "kling-3-0": [
      { key: "duration", label: "Durée", type: "select", default: "5", options: [
        { value: "5", label: "5 secondes" },
        { value: "10", label: "10 secondes" },
      ]},
      { key: "resolution", label: "Résolution", type: "select", default: "1080p", options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
      ]},
      { key: "motionStrength", label: "Force du mouvement", type: "slider", min: 0, max: 1, step: 0.1, default: 0.5 },
    ],
    "seedance-2-0": [
      { key: "duration", label: "Durée", type: "select", default: "5", options: [
        { value: "5", label: "5 secondes" },
        { value: "10", label: "10 secondes" },
        { value: "15", label: "15 secondes" },
        { value: "30", label: "30 secondes" },
      ]},
      { key: "resolution", label: "Résolution", type: "select", default: "1080p", options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
      ]},
    ],
    "grok-imagine-720p": [
      { key: "duration", label: "Durée", type: "select", default: "10", options: [
        { value: "5", label: "5 secondes" },
        { value: "10", label: "10 secondes" },
        { value: "20", label: "20 secondes" },
        { value: "30", label: "30 secondes" },
      ]},
      { key: "promptType", label: "Type d'entrée", type: "select", default: "text", options: [
        { value: "text", label: "Texte → Vidéo" },
        { value: "image", label: "Image → Vidéo" },
      ]},
    ],
    "grok-imagine-480p": [
      { key: "duration", label: "Durée", type: "select", default: "10", options: [
        { value: "5", label: "5 secondes" },
        { value: "10", label: "10 secondes" },
        { value: "20", label: "20 secondes" },
        { value: "30", label: "30 secondes" },
      ]},
    ],
  },
  audio: {
    default: [
      { key: "duration", label: "Durée", type: "slider", min: 5, max: 300, step: 5, default: 30, unit: "secondes" },
    ],
    "suno-v5-5": [
      { key: "style", label: "Style musical", type: "select", default: "auto", options: [
        { value: "auto", label: "Automatique" },
        { value: "pop", label: "Pop" },
        { value: "hiphop", label: "Hip-Hop" },
        { value: "jazz", label: "Jazz" },
        { value: "classical", label: "Classique" },
        { value: "afrobeat", label: "Afrobeat" },
        { value: "electronic", label: "Électronique" },
      ]},
      { key: "duration", label: "Durée", type: "slider", min: 15, max: 120, step: 5, default: 30, unit: "secondes" },
      { key: "instrumental", label: "Instrumental", type: "select", default: "false", options: [
        { value: "false", label: "Avec voix" },
        { value: "true", label: "Instrumental seulement" },
      ]},
    ],
    "eleven-labs-tts": [
      { key: "voice", label: "Voix", type: "select", default: "default", options: [
        { value: "default", label: "Voix par défaut" },
        { value: "male-1", label: "Voix masculine" },
        { value: "female-1", label: "Voix féminine" },
      ]},
      { key: "stability", label: "Stabilité", type: "slider", min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: "similarityBoost", label: "Similarité", type: "slider", min: 0, max: 1, step: 0.05, default: 0.75 },
    ],
    "eleven-music": [
      { key: "duration", label: "Durée", type: "slider", min: 10, max: 120, step: 5, default: 30, unit: "secondes" },
      { key: "style", label: "Style", type: "select", default: "auto", options: [
        { value: "auto", label: "Automatique" },
        { value: "instrumental", label: "Instrumental" },
        { value: "ambient", label: "Ambient" },
      ]},
    ],
    "eleven-flash-v2-5": [
      { key: "voice", label: "Voix", type: "select", default: "default", options: [
        { value: "default", label: "Voix par défaut" },
        { value: "male-1", label: "Voix masculine" },
        { value: "female-1", label: "Voix féminine" },
      ]},
    ],
  },
};

export function getModelParams(modelType: string, modelId: string, modelList: ModelInfo[]): Param[] {
  const categoryParams = MODEL_SPECIFIC_PARAMS[modelType];
  if (!categoryParams) return [];

  const specific = categoryParams[modelId] ?? categoryParams["default"] ?? [];

  if (specific.some((p) => p.key === "model")) return specific;

  const modelOptions = modelList.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` }));
  return [{ key: "model", label: "Modèle", type: "select", default: modelId, options: modelOptions }, ...specific];
}
