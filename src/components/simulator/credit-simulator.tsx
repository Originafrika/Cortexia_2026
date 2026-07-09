"use client";

import { useState, useMemo } from "react";
import { MODEL_CATALOG, type ModelInfo, estimateCost } from "@/lib/kie-ai";
import { detectCurrency, formatLocalPrice, formatPriceShort } from "@/lib/currency";

const PRESETS = [5, 10, 25, 50, 100];
const MARGIN = 0.25;

type ModelType = "text" | "image" | "audio" | "video";
const typeIcons: Record<ModelType, string> = { text: "✍️", image: "🎨", audio: "🎵", video: "🎬" };

function computeUsage(model: ModelInfo, budget: number): { count: number; label: string } {
  const cost = estimateCost(model.id);
  if (cost <= 0) return { count: 0, label: "—" };
  const effectiveCost = cost * (1 + MARGIN);
  const count = Math.floor(budget / effectiveCost);
  const unit =
    model.pricePerReq ? "générations" :
    model.pricePerImg ? "images" :
    model.pricePerSec ? "secondes" :
    model.inputPrice ? "appels (~1K tokens)" :
    "unités";
  return { count, label: `${count.toLocaleString()} ${unit}` };
}

export function CreditSimulator() {
  const currency = useMemo(() => detectCurrency(), []);
  const [budget, setBudget] = useState(10);
  const [selectedType, setSelectedType] = useState<ModelType>("image");
  const [customBudget, setCustomBudget] = useState("");

  const models = MODEL_CATALOG[selectedType];
  const topModels = models.slice(0, 8);

  function handlePreset(v: number) { setBudget(v); setCustomBudget(""); }
  function handleCustom(v: string) {
    setCustomBudget(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) setBudget(n);
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <h3 className="text-lg font-bold text-white mb-1">Simulateur de crédit</h3>
      <p className="text-sm text-zinc-500 mb-6">
        Combien de générations avec un budget donné ? (marge {MARGIN * 100}% incluse)
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["text", "image", "audio", "video"] as ModelType[]).map((t) => (
          <button key={t} onClick={() => setSelectedType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === t ? "bg-[#7850ff] text-white" : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"}`}
          >
            {typeIcons[t]} {t === "text" ? "Texte" : t === "image" ? "Image" : t === "audio" ? "Audio" : "Vidéo"} ({models.length})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-zinc-400">Budget :</span>
        {PRESETS.map((p) => (
          <button key={p} onClick={() => handlePreset(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${budget === p && !customBudget ? "bg-[#7850ff]/20 text-[#a78bfa] border border-[#7850ff]/30" : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"}`}
          >
            {formatLocalPrice(p, currency)}
          </button>
        ))}
        <div className="relative">
          <input type="number" min={1} value={customBudget}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="Montant"
            className="w-24 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors placeholder:text-zinc-600"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{currency.code}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase">
              <th className="text-left py-2 pr-4">Modèle</th>
              <th className="text-right py-2 px-4">Prix unitaire</th>
              <th className="text-right py-2 pl-4">Avec {budget} {currency.code}</th>
            </tr>
          </thead>
          <tbody>
            {topModels.map((m) => {
              const usage = computeUsage(m, budget);
              const cost = estimateCost(m.id);
              return (
                <tr key={m.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="text-white font-medium">{m.name}</div>
                    <div className="text-[10px] text-zinc-600">{m.provider}</div>
                  </td>
                  <td className="text-right py-3 px-4 text-zinc-300 whitespace-nowrap">
                    {formatPriceShort(cost, currency)}
                  </td>
                  <td className="text-right py-3 pl-4 text-[#a78bfa] font-medium whitespace-nowrap">
                    {usage.label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-zinc-600 mt-4 text-center">
        Prix basés sur le catalogue Kie AI 2026. Marge Cortexia : {MARGIN * 100}%. Les prix peuvent varier.
      </p>
    </div>
  );
}
