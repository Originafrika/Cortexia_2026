"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MODEL_CATALOG } from "@/lib/kie-ai";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "audio" | "video";
  cost?: number;
}

const quickActions = [
  { label: "Écrire un poème", prompt: "Écris un poème sur la créativité" },
  { label: "Générer une image", prompt: "Un coucher de soleil sur les toits de Dakar, style numérique" },
  { label: "Produire un son", prompt: "Un jingle court et entraînant pour une marque de mode africaine" },
];

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(prompt?: string) {
    const text = prompt ?? input;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    // Mock response for now — will wire to Kie AI
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Résultat généré**\n\nPrompt : "${text}"\n\n*Le playground est en version démo. Les modèles seront connectés via Kie AI au lancement.*`,
          type: "text",
          cost: 0.05,
        },
      ]);
      setLoading(false);
    }, 1500);
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Playground</h1>
          <p className="text-sm text-zinc-500 mb-4">
            Décris ce que tu veux générer — texte, image, audio ou vidéo.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-zinc-500 self-center mr-1">Mode avancé :</span>
            <Link href="/playground/text" className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors">✍️ Texte ({MODEL_CATALOG.text.length})</Link>
            <Link href="/playground/image" className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors">🎨 Image ({MODEL_CATALOG.image.length})</Link>
            <Link href="/playground/audio" className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors">🎵 Audio ({MODEL_CATALOG.audio.length})</Link>
            <Link href="/playground/video" className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors">🎬 Vidéo ({MODEL_CATALOG.video.length})</Link>
            <Link href="/playground/models" className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#7850ff]/10 border border-[#7850ff]/20 text-[#a78bfa] hover:bg-[#7850ff]/20 transition-colors">Voir tous les modèles →</Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-[500px] pr-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-zinc-500 text-sm max-w-xs">
                Commence par décrire ce que tu veux créer. Tu peux aussi essayer une suggestion rapide.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.prompt)}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[#7850ff] text-white rounded-br-sm"
                    : "bg-white/5 border border-white/10 text-zinc-300 rounded-bl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.cost !== undefined && msg.role === "assistant" && (
                  <div className="text-[10px] text-zinc-600 mt-2 border-t border-white/5 pt-2">
                    Coût : {msg.cost.toFixed(2)} €
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-xl rounded-bl-sm px-4 py-3 text-sm text-zinc-500">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-75">●</span>
                  <span className="animate-pulse delay-150">●</span>
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Décris ce que tu veux générer..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors placeholder:text-zinc-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#7850ff] to-[#6366f1] text-white disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-[#7850ff]/20"
          >
            Envoyer
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
