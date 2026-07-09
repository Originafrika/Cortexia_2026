"use client";

import { useState, FormEvent } from "react";
import { Select } from "@/components/select";

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
  const [country, setCountry] = useState("");

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
          className="input-base"
        />
      </div>
      <div className="text-left">
        <label className="text-sm text-zinc-400 font-medium mb-1.5 block">
          Pays
        </label>
        <Select
          value={country}
          onChange={(v) => setCountry(v)}
          options={[{ value: "", label: "Sélectionne ton pays" }, ...COUNTRIES]}
          className="w-full"
        />
        <input type="hidden" name="country" value={country} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3"
      >
        {loading ? "Inscription..." : "Rejoindre la waitlist"}
      </button>
      <p className="text-xs text-zinc-600 text-center">Pas de spam. Juste un email quand on lance.</p>
    </form>
  );
}
