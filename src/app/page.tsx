import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="gradient-hero absolute inset-0 pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#7850ff]/10 border border-[#7850ff]/30 text-[#a78bfa] mb-6">
              Bientôt disponible
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white mb-5 tracking-tight">
              Tous les modèles d&apos;IA.<br />
              Un seul <span className="gradient-text">playground</span>.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Texte, image, audio, vidéo — génère ce que tu veux avec les meilleurs modèles.
              Paie uniquement ce que tu génères, même par Mobile Money.
              Pas d&apos;abonnement, pas de carte bancaire nécessaire.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/#waitlist"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#7850ff] to-[#6366f1] text-white hover:shadow-lg hover:shadow-[#7850ff]/30 transition-all"
              >
                Rejoindre la waitlist
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all"
              >
                Voir le playground
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Pourquoi Cortexia existe
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Les créateurs des marchés émergents n&apos;ont aucun moyen d&apos;utiliser l&apos;IA de pointe
              sans carte bancaire internationale et sans abonnement. Cortexia change ça.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "💳", title: "Pas de CB ? Pas de problème", desc: "Paiement par Mobile Money (Wave, Orange Money, MTN). Pas besoin de carte Visa." },
              { icon: "📦", title: "Pas d'abonnement", desc: "Tu paies ce que tu génères. Pas de forfait, pas de crédits qui expirent." },
              { icon: "🎨", title: "Toutes les modalités", desc: "Texte, image, audio, vidéo — tous les modèles dans une seule interface." },
              { icon: "🌍", title: "Conçu pour les créateurs du monde entier", desc: "Afrique, Asie, Amérique Latine — partout où l'abonnement à la carte exclut." },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-white/5 bg-white/3 p-6 hover:border-[#7850ff]/20 hover:bg-white/5 transition-all">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{card.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">
            Comment ça marche
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Ajoute du crédit", desc: "Par Mobile Money, carte bancaire ou crypto. Aucun abonnement." },
              { num: "2", title: "Génère ce que tu veux", desc: "Décris en langage naturel ou utilise les paramètres avancés." },
              { num: "3", title: "Paie par génération", desc: "Quelques centimes par génération. Tu vois le prix avant d'exécuter." },
            ].map((step) => (
              <div key={step.num}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7850ff]/20 to-[#00c8ff]/10 border border-[#7850ff]/20 flex items-center justify-center mx-auto mb-4 font-bold text-[#a78bfa]">
                  {step.num}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Une tarification transparente
          </h2>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto">
            Tu ne paies que ce que tu utilises. Voici un aperçu des prix par génération.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {[
              { name: "Texte", price: "0,05 €", unit: "/ 1000 tokens", tags: ["Mobile Money", "Carte"] },
              { name: "Image", price: "0,10 €", unit: "/ génération", tags: ["Mobile Money", "Carte"], featured: true },
              { name: "Audio", price: "0,15 €", unit: "/ minute", tags: ["Mobile Money", "Crypto"] },
              { name: "Vidéo", price: "0,50 €", unit: "/ génération", tags: ["Carte", "Crypto"], featured: true },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl border p-5 text-left ${p.featured ? "border-[#7850ff]/30 bg-[#7850ff]/5" : "border-white/5 bg-white/3"}`}>
                <h4 className="text-xs text-zinc-500 font-medium mb-1.5">{p.name}</h4>
                <div className="text-white font-bold text-lg mb-1">{p.price} <span className="text-xs font-normal text-zinc-500">{p.unit}</span></div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tags.map((t) => (
                    <span key={t} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      t === "Mobile Money" ? "bg-[#00c8ff]/10 text-[#22d3ee]" :
                      t === "Carte" ? "bg-amber-500/10 text-amber-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    }`}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="waitlist" className="max-w-lg mx-auto px-6 py-20">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-8 sm:p-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              Sois parmi les premiers
            </h2>
            <p className="text-zinc-400 text-sm text-center mb-8">
              Laisse ton email et ton pays — on te prévient dès le lancement.
            </p>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
