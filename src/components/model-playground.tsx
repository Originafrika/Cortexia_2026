"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MODEL_CATALOG, estimateCost, type ModelInfo } from "@/lib/kie-ai";
import { getModelParams, type Param } from "@/lib/model-params";
import { Select } from "@/components/select";
import { detectCurrency, formatLocalPrice, formatPriceShort, type CurrencyInfo } from "@/lib/currency";

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
    const modelCost = modelInfo ? estimateCost(modelInfo.id) : 0.05;
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
        <div className="relative">
          <select value={String(val)} onChange={(e) => updateParam(p.key, e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors cursor-pointer">
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      );
    }
    if (p.type === "number") {
      return (
        <input type="number" value={Number(val)} onChange={(e) => updateParam(p.key, e.target.value)}
          min={p.min} max={p.max} step={p.step}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors" />
      );
    }
    return (
      <div className="flex items-center gap-3">
        <input type="range" value={Number(val)} onChange={(e) => updateParam(p.key, e.target.value)}
          min={p.min ?? 0} max={p.max ?? 100} step={p.step ?? 1} className="flex-1 accent-[#7850ff]" />
        <span className="text-xs text-zinc-400 w-8 text-right font-mono">{val}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
      <div className="mb-6">
        <Link href="/playground/models" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2 inline-block">← Tous les modèles</Link>
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
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors resize-none placeholder:text-zinc-600" />
          <button onClick={handleGenerate} disabled={!prompt.trim() || loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#7850ff] to-[#6366f1] text-white disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-[#7850ff]/20">
            {loading ? "Génération..." : "Générer"}
          </button>

          {result && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-2">{result}</div>
              {cost !== null && (
                <div className="text-[10px] text-zinc-600 border-t border-white/5 pt-2">
                  Coût estimé : {formatLocalPrice(cost, currency)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Paramètres</h3>
            <span className="text-[10px] text-zinc-600">{currency.code}</span>
          </div>

          {modelInfo && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Fournisseur</span>
                <span className="text-zinc-200">{modelInfo.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Prix</span>
                <span className="text-[#a78bfa]">
                  {modelInfo.pricePerReq !== undefined && formatPriceShort(modelInfo.pricePerReq, currency)}
                  {modelInfo.pricePerImg !== undefined && formatPriceShort(modelInfo.pricePerImg, currency)}
                  {modelInfo.pricePerSec !== undefined && `${formatPriceShort(modelInfo.pricePerSec, currency)}/sec`}
                  {modelInfo.inputPrice !== undefined && `${formatPriceShort(modelInfo.inputPrice, currency)}/M in`}
                </span>
              </div>
              {modelInfo.outputPrice !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Output</span>
                  <span className="text-[#a78bfa]">{formatPriceShort(modelInfo.outputPrice, currency)}/M</span>
                </div>
              )}
              {modelInfo.description && <p className="text-zinc-500 pt-1 border-t border-white/5 mt-1">{modelInfo.description}</p>}
            </div>
          )}

          {activeParams.map((p) => (
            <div key={p.key}>
              {p.key !== "model" && <label className="text-xs text-zinc-400 font-medium mb-1.5 block">{p.label} {p.unit && <span className="text-zinc-600 font-normal">({p.unit})</span>}</label>}
              {renderParamInput(p)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
