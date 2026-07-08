import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MODEL_CATALOG } from "@/lib/kie-ai";

const modelSummary: Record<string, { name: string; icon: string; desc: string; params: string[] }> = {
  text: { name: "Texte", icon: "✍️", desc: "Claude, GPT, Gemini — raisonnement, code, analyse.", params: ["Température", "Max tokens", "Top P"] },
  image: { name: "Image", icon: "🎨", desc: "Flux, Ideogram, Imagen, Grok — génération et édition.", params: ["Résolution", "Style", "Seed", "Steps"] },
  audio: { name: "Audio", icon: "🎵", desc: "ElevenLabs, Suno — TTS, musique, effets sonores.", params: ["Durée", "Style", "Format", "Créativité"] },
  video: { name: "Vidéo", icon: "🎬", desc: "Veo, Runway, Kling, Seedance — text-to-video & image-to-video.", params: ["Durée", "Résolution", "Style", "Seed"] },
};

export default function ModelsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Tous les modèles</h1>
          <p className="text-zinc-400 text-sm">
            Choisis un type de modèle et paramètre chaque génération.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {(Object.entries(modelSummary) as [string, typeof modelSummary['text']][]).map(([id, m]) => {
            const models = MODEL_CATALOG[id as keyof typeof MODEL_CATALOG];
            const minPrice = models.reduce((min, mdl) => {
              const p = mdl.pricePerReq ?? mdl.pricePerImg ?? mdl.pricePerSec ?? mdl.inputPrice ?? 0;
              return p < min ? p : min;
            }, Infinity);
            const priceLabel = minPrice < 0.01 ? `à partir de $${minPrice.toFixed(4)}` : `à partir de $${minPrice.toFixed(3)}`;
            return (
              <Link
                key={id}
                href={`/playground/${id}`}
                className="rounded-xl border border-white/5 bg-white/3 p-6 hover:border-[#7850ff]/20 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{m.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-white font-semibold">{m.name}</h2>
                      <span className="text-xs text-zinc-500">{priceLabel}</span>
                    </div>
                    <p className="text-zinc-500 text-sm mb-3">{m.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.params.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">{p}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {models.slice(0, 5).map((mdl) => (
                        <span key={mdl.id} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7850ff]/10 text-[#a78bfa] border border-[#7850ff]/15">{mdl.provider}</span>
                      ))}
                      {models.length > 5 && <span className="text-[9px] text-zinc-600 self-center">+{models.length - 5}</span>}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all"
          >
            ← Retour au playground unifié
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
