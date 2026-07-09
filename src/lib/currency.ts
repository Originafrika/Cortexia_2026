export type CurrencyInfo = { code: string; symbol: string; rate: number; locale: string };

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, XOF: 605, XAF: 605, CDF: 2900,
  GHS: 15.5, NGN: 1600, KES: 130, TZS: 2500, UGX: 3700,
  RWF: 1350, MAD: 10, DZD: 135, TND: 3.1, EGP: 48, ZAR: 18,
  GBP: 0.78, CNY: 7.25, JPY: 155, BRL: 5.5, INR: 83,
  SLL: 21000, ETB: 115, BIF: 2850, MZN: 64, MWK: 1730,
  PAB: 1, AED: 3.67, SAR: 3.75, CHF: 0.87, SEK: 10.2,
  NOK: 9.8, DKK: 6.7, PLN: 3.85, AUD: 1.5, CAD: 1.37,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", BJ: "XOF", TG: "XOF", NE: "XOF",
  CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", GQ: "XAF", CF: "XAF",
  CD: "CDF", GH: "GHS", NG: "NGN", KE: "KES", TZ: "TZS", UG: "UGX",
  RW: "RWF", MA: "MAD", DZ: "DZD", TN: "TND", EG: "EGP", ZA: "ZAR",
  US: "USD", GB: "GBP", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", BE: "EUR", NL: "EUR",
  CN: "CNY", JP: "JPY", BR: "BRL", IN: "INR",
  SL: "SLL", LR: "LRD", ET: "ETB", BI: "BIF", MZ: "MZN", MW: "MWK",
  PA: "PAB", AE: "AED", SA: "SAR", CH: "CHF", SE: "SEK", NO: "NOK",
  DK: "DKK", PL: "PLN", AU: "AUD", CA: "CAD", MX: "MXN", CO: "COP",
  CL: "CLP", PE: "PEN", AR: "ARS", AO: "AOA", MG: "MGA", MU: "MUR",
  ZM: "ZMW", BW: "BWP", NA: "NAD", LS: "LSL", SZ: "SZL",
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
    const parts = tz.split("/");
    const region = parts[0];
    const city = parts[1];

    if (region === "Africa") {
      if (["Dakar", "Abidjan", "Bamako", "Ouagadougou", "Niamey", "Lome", "Porto-Novo", "Nouakchott", "Conakry", "Freetown", "Monrovia", "Banjul", "Bissau"].includes(city)) return "XOF";
      if (["Douala", "Yaounde", "Libreville", "Brazzaville", "Bangui", "Ndjamena", "Malabo"].includes(city)) return "XAF";
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
      if (["Maputo"].includes(city)) return "MZN";
      if (["Lilongwe", "Blantyre"].includes(city)) return "MWK";
      if (["Bujumbura"].includes(city)) return "BIF";
      if (["Addis_Ababa"].includes(city)) return "ETB";
      if (["Luanda"].includes(city)) return "AOA";
      if (["Antananarivo"].includes(city)) return "MGA";
      if (["Port_Louis"].includes(city)) return "MUR";
      if (["Lusaka"].includes(city)) return "ZMW";
      if (["Gaborone"].includes(city)) return "BWP";
      if (["Harare"].includes(city)) return "ZWL";
      if (["Windhoek"].includes(city)) return "NAD";
      if (["Maseru"].includes(city)) return "LSL";
      if (["Mbabane"].includes(city)) return "SZL";
      if (["Freetown"].includes(city)) return "SLL";
      if (["Monrovia"].includes(city)) return "LRD";
    }
    if (region === "Europe") return "EUR";
    if (region === "America") {
      if (city) {
        if (["New_York", "Washington", "Los_Angeles", "Chicago", "Denver", "Phoenix", "Anchorage", "Honolulu", "Miami", "Boston", "Seattle", "San_Francisco", "Dallas", "Atlanta", "Houston"].includes(city)) return "USD";
        if (["Toronto", "Vancouver", "Montreal", "Ottawa", "Edmonton", "Winnipeg", "Halifax"].includes(city)) return "CAD";
        if (["Sao_Paulo", "Rio_de_Janeiro", "Brasilia", "Salvador", "Fortaleza", "Manaus", "Recife"].includes(city)) return "BRL";
        if (["Mexico_City", "Cancun", "Guadalajara", "Monterrey"].includes(city)) return "MXN";
        if (["Bogota"].includes(city)) return "COP";
        if (["Santiago"].includes(city)) return "CLP";
        if (["Lima"].includes(city)) return "PEN";
        if (["Buenos_Aires", "Cordoba", "Rosario"].includes(city)) return "ARS";
        if (["Panama"].includes(city)) return "PAB";
      }
      return "USD";
    }
    if (region === "Asia") {
      if (tz.includes("Tokyo")) return "JPY";
      if (tz.includes("Shanghai") || tz.includes("Beijing") || tz.includes("Hong_Kong") || tz.includes("Taipei")) return "CNY";
      if (tz.includes("Kolkata") || tz.includes("Mumbai") || tz.includes("Delhi") || tz.includes("Chennai") || tz.includes("Bangalore")) return "INR";
      if (tz.includes("Seoul")) return "KRW";
      if (tz.includes("Singapore")) return "SGD";
      if (tz.includes("Dubai") || tz.includes("Abu_Dhabi") || tz.includes("Muscat")) return "AED";
      if (tz.includes("Riyadh") || tz.includes("Jeddah") || tz.includes("Qatar")) return "SAR";
      if (tz.includes("Bangkok")) return "THB";
      if (tz.includes("Jakarta")) return "IDR";
      if (tz.includes("Manila")) return "PHP";
      if (tz.includes("Kuala_Lumpur")) return "MYR";
      if (tz.includes("Hanoi") || tz.includes("Ho_Chi_Minh")) return "VND";
      if (tz.includes("Islamabad") || tz.includes("Karachi") || tz.includes("Lahore")) return "PKR";
      if (tz.includes("Dhaka")) return "BDT";
      if (tz.includes("Colombo")) return "LKR";
      if (tz.includes("Kathmandu")) return "NPR";
      if (tz.includes("Tel_Aviv") || tz.includes("Jerusalem")) return "ILS";
      if (tz.includes("Ankara") || tz.includes("Istanbul")) return "TRY";
    }
    if (region === "Pacific") {
      if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane")) return "AUD";
      if (tz.includes("Auckland")) return "NZD";
    }
  } catch { /* ignore */ }
  return null;
}

export function detectCurrency(): CurrencyInfo {
  if (typeof navigator === "undefined") return { code: "USD", symbol: "$", rate: 1, locale: "en-US" };

  let currencyCode = "USD";
  let locale = "en-US";

  try {
    const tzCurrency = getTimezoneCurrency();

    const langs = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language || "en-US"];
    locale = langs[0];

    if (!tzCurrency) {
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
    } else {
      currencyCode = tzCurrency;
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
