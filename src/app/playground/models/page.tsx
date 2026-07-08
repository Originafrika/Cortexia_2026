import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const models = [
  { id: "text", name: "Texte", icon: "✍️", desc: "Génération de texte, code, analyses — GPT, Claude, Llama et plus.", params: ["Température", "Max tokens", "Top P"], price: "0,05 € / 1000 tokens" },
  { id: "image", name: "Image", icon: "🎨", desc: "Génération d'images — Stable Diffusion, DALL-E, Midjourney via API.", params: ["Résolution", "Style", "Seed", "Steps"], price: "0,10 € / génération" },
  { id: "audio", name: "Audio", icon: "🎵", desc: "Génération vocale et musicale — ElevenLabs, MusicGen, Bark.", params: ["Durée", "Voix", "Format", "Température"], price: "0,15 € / minute" },
  { id: "video", name: "Vidéo", icon: "🎬", desc: "Génération vidéo — Runway, Kling, Pika. Paramètres avancés disponibles.", params: ["Durée", "Résolution", "Style", "Seed"], price: "0,50 € / génération" },
];

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
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/playground/${m.id}`}
              className="rounded-xl border border-white/5 bg-white/3 p-6 hover:border-[#7850ff]/20 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-white font-semibold">{m.name}</h2>
                    <span className="text-xs text-zinc-500">{m.price}</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-3">{m.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.params.map((p) => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">{p}</span>
                    ))}
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </Link>
          ))}
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
