export const config = {
  neon: {
    databaseUrl: process.env.DATABASE_URL!,
  },
  kie: {
    apiKey: process.env.KIE_AI_API_KEY!,
    baseUrl: process.env.KIE_AI_BASE_URL ?? "https://api.kie.ai/v1",
  },
  fedapay: {
    apiKey: process.env.FEDAPAY_API_KEY!,
    secret: process.env.FEDAPAY_SECRET!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
};
