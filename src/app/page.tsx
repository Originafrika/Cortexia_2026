import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WaitlistForm } from "@/components/waitlist-form";
import { CreditSimulator } from "@/components/simulator/credit-simulator";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="gradient-hero absolute inset-0 pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#7850ff]/10 border border-[#7850ff]/30 text-[#a78bfa] mb-6 animate-fade-in">
              Bientôt disponible
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white mb-5 tracking-tight animate-fade-in-up">
              Tous les modèles d&apos;IA.<br />
              Un seul <span className="gradient-text">playground</span>.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up stagger-1">
              Tous les modèles d&apos;IA — texte, image, audio, vidéo — dans un seul playground.
              Aucun abonnement : paie uniquement ce que tu génères, par Mobile Money,
              carte bancaire ou crypto.
            </p>
            <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up stagger-2">
              <Link href="/#waitlist" className="btn-primary px-8 py-3.5 text-base">
                Rejoindre la waitlist
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link href="/playground" className="btn-secondary px-8 py-3.5 text-base">
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
              Aujourd&apos;hui, utiliser les meilleurs modèles d&apos;IA sans abonnement
              et sans jongler entre 5 plateformes est impossible. Cortexia est le premier
              playground qui réunit tout — sans abonnement, sans compromis.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🎨", title: "Tous les modèles, un seul endroit", desc: "Texte, image, audio, vidéo — plus besoin de 5 comptes. Une interface, tous les providers." },
              { icon: "📦", title: "Paie à l'usage, pas d'abonnement", desc: "Tu génères, tu paies. Pas de forfait mensuel, pas de crédits qui expirent dans 90 jours." },
              { icon: "💳", title: "Mobile Money, carte ou crypto", desc: "Wave, Orange Money, MTN, Visa, USDC — paie comme tu veux, pas comme on t'impose." },
              { icon: "🔌", title: "API incluse", desc: "Le playground pour créer, l'API pour automatiser. Même compte, même wallet, même tarif." },
            ].map((card, i) => (
              <Card key={card.title} className="p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{card.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
              </Card>
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
            ].map((step, i) => (
              <div key={step.num} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7850ff]/20 to-[#00c8ff]/10 border border-[#7850ff]/20 flex items-center justify-center font-bold text-[#a78bfa] transition-transform hover:scale-110">
                  {step.num}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
            Simule tes coûts
          </h2>
          <p className="text-zinc-400 text-center mb-10 max-w-md mx-auto">
            Combien de générations avec ton budget ? Les prix s&apos;affichent dans ta devise locale.
          </p>
          <CreditSimulator />
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Paiements adaptés à toi
          </h2>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto">
            Mobile Money, carte bancaire, crypto — paie avec ce qui existe dans ton pays.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Wave", region: "Sénégal, CI, ML, BF", type: "Mobile Money" },
              { name: "Orange Money", region: "Afrique francophone", type: "Mobile Money" },
              { name: "MTN MoMo", region: "GH, CI, CM, UG", type: "Mobile Money" },
              { name: "Airtel Money", region: "KE, TZ, UG, MW", type: "Mobile Money" },
              { name: "Visa / MC", region: "Monde", type: "Carte" },
              { name: "USDC", region: "Blockchain", type: "Crypto" },
            ].map((p, i) => (
              <Card key={p.name} className="p-4 text-left min-w-[160px] animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`text-[10px] font-semibold mb-1.5 ${
                  p.type === "Mobile Money" ? "text-[#22d3ee]" :
                  p.type === "Carte" ? "text-amber-400" : "text-emerald-400"
                }`}>{p.type}</div>
                <h4 className="text-white font-semibold text-sm">{p.name}</h4>
                <p className="text-zinc-600 text-[10px] mt-1">{p.region}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="waitlist" className="max-w-lg mx-auto px-6 py-20">
          <Card elevated className="p-8 sm:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Sois parmi les premiers
            </h2>
            <p className="text-zinc-400 text-sm mb-8">
              Laisse ton email et ton pays — on te prévient dès le lancement.
            </p>
            <WaitlistForm />
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
