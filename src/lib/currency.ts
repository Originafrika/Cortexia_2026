export type CurrencyInfo = { code: string; symbol: string; rate: number; locale: string };

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, XOF: 605, XAF: 605, CDF: 2900,
  GHS: 15.5, NGN: 1600, KES: 130, TZS: 2500, UGX: 3700,
  RWF: 1350, MAD: 10, DZD: 135, TND: 3.1, EGP: 48, ZAR: 18,
  GBP: 0.78, CNY: 7.25, JPY: 155, BRL: 5.5, INR: 83,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", BJ: "XOF", TG: "XOF", NE: "XOF",
  CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", GQ: "XAF", CF: "XAF",
  CD: "CDF", GH: "GHS", NG: "NGN", KE: "KES", TZ: "TZS", UG: "UGX",
  RW: "RWF", MA: "MAD", DZ: "DZD", TN: "TND", EG: "EGP", ZA: "ZAR",
  US: "USD", GB: "GBP", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", BE: "EUR", NL: "EUR", CN: "CNY", JP: "JPY", BR: "BRL",
  IN: "INR",
};

const LANG_CURRENCY_FALLBACK: Record<string, string> = {
  fr: "EUR", en: "USD", es: "EUR", pt: "EUR", de: "EUR",
  it: "EUR", nl: "EUR", ja: "JPY", zh: "CNY", ar: "USD",
  sw: "TZS", ha: "NGN", yo: "NGN", ig: "NGN", am: "ETB",
  wo: "XOF",
};

function getTimezoneCurrency(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return null;
    const region = tz.split("/")[0];
    if (region === "Africa") {
      const city = tz.split("/")[1];
      if (["Dakar", "Abidjan", "Bamako", "Ouagadougou", "Niamey", "Lome"].includes(city)) return "XOF";
      if (["Douala", "Yaounde", "Libreville", "Brazzaville"].includes(city)) return "XAF";
      if (["Kinshasa", "Lubumbashi"].includes(city)) return "CDF";
      if (["Accra"].includes(city)) return "GHS";
      if (["Lagos"].includes(city)) return "NGN";
      if (["Nairobi"].includes(city)) return "KES";
      if (["Dar_es_Salaam"].includes(city)) return "TZS";
      if (["Kampala"].includes(city)) return "UGX";
      if (["Kigali"].includes(city)) return "RWF";
      if (["Casablanca", "Rabat"].includes(city)) return "MAD";
      if (["Tunis"].includes(city)) return "TND";
      if (["Algiers"].includes(city)) return "DZD";
      if (["Cairo"].includes(city)) return "EGP";
      if (["Johannesburg", "Cape_Town"].includes(city)) return "ZAR";
    }
    if (region === "Europe") return "EUR";
    if (region === "America") return "USD";
    if (region === "Asia" && tz.includes("Tokyo")) return "JPY";
    if (region === "Asia" && tz.includes("Shanghai")) return "CNY";
    if (region === "Asia" && tz.includes("Kolkata")) return "INR";
  } catch { /* ignore */ }
  return null;
}

export function detectCurrency(): CurrencyInfo {
  if (typeof navigator === "undefined") return { code: "USD", symbol: "$", rate: 1, locale: "en-US" };

  let currencyCode = "USD";
  let locale = "en-US";

  try {
    const langs = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language || "en-US"];
    locale = langs[0];

    for (const lang of langs) {
      const parts = lang.split("-");
      const country = parts[1]?.toUpperCase();
      const langCode = parts[0]?.toLowerCase();

      if (country && COUNTRY_CURRENCY[country]) {
        currencyCode = COUNTRY_CURRENCY[country];
        break;
      }
      if (langCode && LANG_CURRENCY_FALLBACK[langCode]) {
        currencyCode = LANG_CURRENCY_FALLBACK[langCode];
      }
    }

    if (currencyCode === "USD") {
      const tzCurrency = getTimezoneCurrency();
      if (tzCurrency) currencyCode = tzCurrency;
    }

    const rate = RATES[currencyCode] ?? 1;
    const fmt = new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2 });
    let symbol = currencyCode;
    try {
      symbol = fmt.format(0).replace(/0/g, "").replace(/[\s,.]/g, "").trim() || currencyCode;
    } catch { /* use default */ }

    return { code: currencyCode, symbol, rate, locale };
  } catch {
    return { code: currencyCode, symbol: "$", rate: 1, locale: "en-US" };
  }
}

export function formatLocalPrice(usdAmount: number, currency?: CurrencyInfo): string {
  const c = currency ?? detectCurrency();
  const local = usdAmount * c.rate;
  try {
    const digits = local < 0.0001 ? 6 : local < 0.01 ? 4 : local < 1 ? 3 : 2;
    const fmt = new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, minimumFractionDigits: digits, maximumFractionDigits: digits });
    return fmt.format(local);
  } catch {
    return `${c.symbol}${local.toFixed(2)}`;
  }
}

export function formatPriceShort(usdAmount: number, currency?: CurrencyInfo): string {
  const c = currency ?? detectCurrency();
  const local = usdAmount * c.rate;
  if (local < 0.0001) return `${c.symbol}${(local * 1000).toFixed(4)}/${c.code === "XOF" ? "1000req" : "K"}`;
  if (local < 0.01) return `${c.symbol}${(local * 100).toFixed(2)}/100`;
  if (local < 1) return `${c.symbol}${(local * 1000).toFixed(2)}/${c.code === "XOF" ? "K" : "K"}`;
  return `${c.symbol}${local.toFixed(2)}`;
}
