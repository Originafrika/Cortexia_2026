"use client";

import { useState, FormEvent } from "react";

const COUNTRIES = [
  { value: "BF", label: "Burkina Faso" }, { value: "BI", label: "Burundi" },
  { value: "BJ", label: "Bénin" }, { value: "CI", label: "Côte d'Ivoire" },
  { value: "CM", label: "Cameroun" }, { value: "CD", label: "Congo (RDC)" },
  { value: "CG", label: "Congo (Brazzaville)" }, { value: "DZ", label: "Algérie" },
  { value: "EG", label: "Égypte" }, { value: "ET", label: "Éthiopie" },
  { value: "GA", label: "Gabon" }, { value: "GH", label: "Ghana" },
  { value: "GN", label: "Guinée" }, { value: "HT", label: "Haïti" },
  { value: "KE", label: "Kenya" }, { value: "MA", label: "Maroc" },
  { value: "MG", label: "Madagascar" }, { value: "ML", label: "Mali" },
  { value: "MR", label: "Mauritanie" }, { value: "MU", label: "Maurice" },
  { value: "MW", label: "Malawi" }, { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" }, { value: "RW", label: "Rwanda" },
  { value: "SN", label: "Sénégal" }, { value: "TD", label: "Tchad" },
  { value: "TG", label: "Togo" }, { value: "TN", label: "Tunisie" },
  { value: "TZ", label: "Tanzanie" }, { value: "UG", label: "Ouganda" },
  { value: "ZA", label: "Afrique du Sud" }, { value: "ZM", label: "Zambie" },
  { value: "ZW", label: "Zimbabwe" }, { value: "US", label: "États-Unis" },
  { value: "FR", label: "France" }, { value: "CA", label: "Canada" },
  { value: "BR", label: "Brésil" }, { value: "IN", label: "Inde" },
  { value: "ID", label: "Indonésie" }, { value: "PH", label: "Philippines" },
  { value: "PK", label: "Pakistan" }, { value: "BD", label: "Bangladesh" },
  { value: "VN", label: "Viêt Nam" }, { value: "MX", label: "Mexique" },
  { value: "CO", label: "Colombie" }, { value: "PE", label: "Pérou" },
  { value: "other", label: "Autre" },
];

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          country: data.get("country"),
        }),
      });
    } catch {
      // Graceful fallback — show success anyway
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-2xl">
          ✓
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Merci !</h3>
        <p className="text-zinc-400 text-sm">On te prévient dès le lancement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-left">
        <label htmlFor="email" className="text-sm text-zinc-400 font-medium mb-1.5 block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="toto@exemple.com"
          className="w-full px-3.5 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors placeholder:text-zinc-600"
        />
      </div>
      <div className="text-left">
        <label htmlFor="country" className="text-sm text-zinc-400 font-medium mb-1.5 block">
          Pays
        </label>
        <select
          id="country"
          name="country"
          required
          defaultValue=""
          className="w-full px-3.5 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#7850ff] transition-colors"
        >
          <option value="" disabled>Sélectionne ton pays</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#7850ff] to-[#6366f1] text-white hover:shadow-lg hover:shadow-[#7850ff]/20 transition-all disabled:opacity-60"
      >
        {loading ? "Inscription..." : "Rejoindre la waitlist"}
      </button>
      <p className="text-xs text-zinc-600 text-center">Pas de spam. Juste un email quand on lance.</p>
    </form>
  );
}
