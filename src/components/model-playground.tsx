"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MODEL_CATALOG, estimateCost, type ModelInfo } from "@/lib/kie-ai";
import { getModelParams, type Param } from "@/lib/model-params";
import { Select } from "@/components/select";
import { detectCurrency, formatLocalPrice, type CurrencyInfo } from "@/lib/currency";
import { ParamSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ModelPlaygroundProps {
  modelType: "text" | "image" | "audio" | "video";
  icon: string;
  title: string;
}

export function ModelPlayground({ modelType, icon, title }: ModelPlaygroundProps) {
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: "USD", symbol: "$", rate: 1, locale: "en-US" });
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  useEffect(() => { setCurrency(detectCurrency()); }, []);

  const models = MODEL_CATALOG[modelType];
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? "");

  const activeParams = useMemo(() => {
    return getModelParams(modelType, selectedModelId, models);
  }, [modelType, selectedModelId, models]);

  const [values, setValues] = useState<Record<string, string | number>>({});
  useEffect(() => {
    const v: Record<string, string | number> = {};
    activeParams.forEach((p) => { v[p.key] = p.default; });
    setValues(v);
  }, [activeParams]);

  const modelInfo: ModelInfo | undefined = useMemo(
    () => models.find((m) => m.id === selectedModelId),
    [selectedModelId, models]
  );

  const dynamicCost = useMemo(() => {
    if (!modelInfo) return null;

    if (modelInfo.pricePerReq !== undefined) return modelInfo.pricePerReq;

    if (modelInfo.pricePerImg !== undefined) {
      const n = Number(values.n) || 1;
      return modelInfo.pricePerImg * n;
    }

    if (modelInfo.pricePerSec !== undefined) {
      const duration = Number(values.duration) || 5;
      return modelInfo.pricePerSec * duration;
    }

    if (modelInfo.inputPrice !== undefined) {
      const inTokens = 1000;
      const outTokens = 500;
      const inCost = (inTokens / 1_000_000) * modelInfo.inputPrice;
      const outCost = (outTokens / 1_000_000) * (modelInfo.outputPrice ?? modelInfo.inputPrice);
      return inCost + outCost;
    }

    return 0;
  }, [modelInfo, values]);

  function updateParam(key: string, value: string) {
    if (key === "model") {
      setSelectedModelId(value);
      const newParams = getModelParams(modelType, value, models);
      const v: Record<string, string | number> = {};
      newParams.forEach((p) => { v[p.key] = p.default; });
      setValues(v);
      return;
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const modelCost = dynamicCost ?? 0.05;
    setTimeout(() => {
      setResult(`**${title} généré**\n\nPrompt : "${prompt}"\n\nParamètres : ${JSON.stringify(values, null, 2)}\n\n*Mode démo — la connexion Kie AI est en cours.*`);
      setCost(modelCost);
      setLoading(false);
    }, 1500);
  }

  const modelOptions = models.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` }));

  function renderParamInput(p: Param) {
    const val = values[p.key] ?? p.default;
    if (p.type === "select") {
      const opts = p.options ?? [];
      if (p.key === "model") {
        return (
          <Select value={String(val)} onChange={(v) => updateParam(p.key, v)} options={modelOptions} />
        );
      }
      return (
        <Select value={String(val)} onChange={(v) => updateParam(p.key, v)} options={opts} />
      );
    }
    if (p.type === "number") {
      return (
        <input type="number" value={Number(val)} onChange={(e) => updateParam(p.key, e.target.value)}
          min={p.min} max={p.max} step={p.step}
          className="input-base" />
      );
    }
    return (
      <div className="flex items-center gap-3">
        <input type="range" value={Number(val)} onChange={(e) => updateParam(p.key, e.target.value)}
          min={p.min ?? 0} max={p.max ?? 100} step={p.step ?? 1}
          className="flex-1 accent-[#7850ff] h-1.5 cursor-pointer" />
        <span className="text-xs text-zinc-400 w-8 text-right font-mono tabular-nums">{val}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
      <div className="mb-6 animate-fade-in">
        <Link href="/playground/models" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2 inline-block focus-ring rounded px-1">← Tous les modèles</Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-sm text-zinc-500">{models.length} modèles disponibles</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décris ce que tu veux générer..." rows={4}
            className="input-base resize-none min-h-[100px]" />

          <button onClick={handleGenerate} disabled={!prompt.trim() || loading}
            className="btn-primary w-full py-3">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
                Génération...
              </span>
            ) : "Générer"}
          </button>

          {loading && !result && (
            <div className="space-y-3 animate-fade-in p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
            </div>
          )}

          {result && (
            <div className="card-base p-4 animate-scale-in">
              <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-2">{result}</div>
              {cost !== null && (
                <div className="text-[10px] text-zinc-600 border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
                  <span>Coût estimé</span>
                  <span className="text-[#a78bfa] font-medium">{formatLocalPrice(cost, currency)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Paramètres</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">{currency.code}</span>
          </div>

          {modelInfo ? (
            <Card className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Fournisseur</span>
                <span className="text-zinc-200">{modelInfo.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Prix estimé</span>
                <span className="text-[#a78bfa]">{dynamicCost !== null ? formatLocalPrice(dynamicCost, currency) : "—"}</span>
              </div>
              {modelInfo.inputPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Input</span>
                  <span className="text-zinc-300">{formatLocalPrice(modelInfo.inputPrice, currency)}/M tokens</span>
                </div>
              )}
              {modelInfo.outputPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Output</span>
                  <span className="text-zinc-300">{formatLocalPrice(modelInfo.outputPrice, currency)}/M tokens</span>
                </div>
              )}
              {modelInfo.description && <p className="text-zinc-500 pt-1.5 border-t border-white/5 mt-1.5">{modelInfo.description}</p>}
            </Card>
          ) : (
            <ParamSkeleton />
          )}

          {activeParams.map((p, i) => (
            <div key={p.key} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              {p.key !== "model" && <label className="text-xs text-zinc-400 font-medium mb-1.5 block">{p.label} {p.unit && <span className="text-zinc-600 font-normal">({p.unit})</span>}</label>}
              {renderParamInput(p)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
