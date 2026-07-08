"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MODEL_CATALOG, estimateCost, type ModelInfo } from "@/lib/kie-ai";

interface Param {
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

interface ModelPlaygroundProps {
  modelType: "text" | "image" | "audio" | "video";
  icon: string;
  title: string;
  params: Param[];
}

export function ModelPlayground({ modelType, icon, title, params }: ModelPlaygroundProps) {
  const [prompt, setPrompt] = useState("");
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const v: Record<string, string | number> = {};
    params.forEach((p) => { v[p.key] = p.default; });
    return v;
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  const selectedModelId = String(values.model ?? "");
  const modelInfo: ModelInfo | undefined = useMemo(
    () => MODEL_CATALOG[modelType]?.find((m) => m.id === selectedModelId),
    [modelType, selectedModelId]
  );

  function updateParam(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);

    const modelCost = modelInfo
      ? estimateCost(modelInfo.id)
      : modelType === "text" ? 0.05 : modelType === "image" ? 0.03 : modelType === "audio" ? 0.03 : 0.06;

    setTimeout(() => {
      setResult(`**${title} généré**\n\nPrompt : "${prompt}"\n\nParamètres : ${JSON.stringify(values, null, 2)}\n\n*Mode démo — la connexion Kie AI est en cours.*`);
      setCost(modelCost);
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
      <div className="mb-6">
        <Link href="/playground/models" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2 inline-block">
          ← Tous les modèles
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-sm text-zinc-500">Paramètres avancés pour un contrôle précis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décris ce que tu veux générer..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors resize-none placeholder:text-zinc-600"
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#7850ff] to-[#6366f1] text-white disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-[#7850ff]/20"
          >
            {loading ? "Génération..." : "Générer"}
          </button>

          {result && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-2">{result}</div>
              {cost !== null && (
                <div className="text-[10px] text-zinc-600 border-t border-white/5 pt-2">
                  Coût estimé : {cost.toFixed(2)} €
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Paramètres</h3>
          {modelInfo && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Fournisseur</span>
                <span className="text-zinc-200">{modelInfo.provider}</span>
              </div>
              {modelInfo.pricePerReq !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Prix</span>
                  <span className="text-[#a78bfa]">${modelInfo.pricePerReq.toFixed(4)}/req</span>
                </div>
              )}
              {modelInfo.pricePerImg !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Prix</span>
                  <span className="text-[#a78bfa]">${modelInfo.pricePerImg.toFixed(3)}/img</span>
                </div>
              )}
              {modelInfo.pricePerSec !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Prix</span>
                  <span className="text-[#a78bfa]">${modelInfo.pricePerSec.toFixed(3)}/sec</span>
                </div>
              )}
              {modelInfo.inputPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Input</span>
                  <span className="text-[#a78bfa]">${modelInfo.inputPrice}/M tokens</span>
                </div>
              )}
              {modelInfo.outputPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Output</span>
                  <span className="text-[#a78bfa]">${modelInfo.outputPrice}/M tokens</span>
                </div>
              )}
              {modelInfo.description && (
                <p className="text-zinc-500 pt-1 border-t border-white/5 mt-1">{modelInfo.description}</p>
              )}
            </div>
          )}
          {params.map((p) => (
            <div key={p.key}>
              <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
                {p.label} {p.unit && <span className="text-zinc-600">({p.unit})</span>}
              </label>
              {p.type === "select" && (
                <select
                  value={String(values[p.key])}
                  onChange={(e) => updateParam(p.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors"
                >
                  {p.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
              {p.type === "number" && (
                <input
                  type="number"
                  value={Number(values[p.key])}
                  onChange={(e) => updateParam(p.key, e.target.value)}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors"
                />
              )}
              {p.type === "slider" && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={Number(values[p.key])}
                    onChange={(e) => updateParam(p.key, e.target.value)}
                    min={p.min ?? 0}
                    max={p.max ?? 100}
                    step={p.step ?? 1}
                    className="flex-1 accent-[#7850ff]"
                  />
                  <span className="text-xs text-zinc-400 w-8 text-right">{values[p.key]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
