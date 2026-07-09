type CurrencyInfo = { code: string; symbol: string; rate: number; locale: string };

const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  XOF: 605,
  XAF: 605,
  CDF: 2900,
  GHS: 15.5,
  NGN: 1600,
  KES: 130,
  TZS: 2500,
  UGX: 3700,
  RWF: 1350,
  MAD: 10,
  DZD: 135,
  TND: 3.1,
  EGP: 48,
  ZAR: 18,
  GBP: 0.78,
  CNY: 7.25,
  JPY: 155,
  BRL: 5.5,
  INR: 83,
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

export function detectCurrency(): CurrencyInfo {
  if (typeof navigator === "undefined") return { code: "USD", symbol: "$", rate: 1, locale: "en-US" };
  const lang = navigator.language || "en-US";
  const locale = lang;
  try {
    const country = lang.split("-")[1]?.toUpperCase();
    const currencyCode = country ? (COUNTRY_CURRENCY[country] ?? "USD") : "USD";
    const rate = RATES[currencyCode] ?? 1;
    const symbol = new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2 })
      .format(0).replace(/0/g, "").replace(/\s/g, "").trim() || currencyCode;
    return { code: currencyCode, symbol, rate, locale };
  } catch {
    return { code: "USD", symbol: "$", rate: 1, locale: "en-US" };
  }
}

export function formatLocalPrice(usdAmount: number, currency?: CurrencyInfo): string {
  const c = currency ?? detectCurrency();
  const local = usdAmount * c.rate;
  try {
    const fmt = new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, minimumFractionDigits: 2, maximumFractionDigits: local < 0.01 ? 6 : local < 1 ? 4 : 2 });
    return fmt.format(local);
  } catch {
    return `${c.symbol}${local.toFixed(2)}`;
  }
}

export function formatPriceShort(usdAmount: number, currency?: CurrencyInfo): string {
  const c = currency ?? detectCurrency();
  const local = usdAmount * c.rate;
  if (local < 0.0001) return `${(local * 1000).toFixed(2)} ${c.code}/K`;
  if (local < 0.01) return `${(local * 100).toFixed(2)} ${c.code}/100`;
  if (local < 1) return `${(local * 1000).toFixed(2)} ${c.code}/K`;
  return formatLocalPrice(usdAmount, c);
}
