# Cortexia

AI-powered creative platform for generating images and sharing to community feed.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development
npm run dev
```

## 🌐 Production

Deployed on Vercel: **https://cortexia-2026.vercel.app**

### Environment Variables Required

Copy `.env.example` to `.env.local` and configure:

- `DATABASE_URL` - Neon PostgreSQL
- `R2_*` - Cloudflare R2 storage
- `CF_*` - Cloudflare AI
- `STRIPE_*` - Payment processing (optional)

## 🔧 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/feed` | Community feed |
| `/api/feed/publish` | Publish creation to feed |
| `/api/credits` | User credits management |

## 📝 Testing Feed

1. Generate an image using Flux (free model)
2. Click "Publish" to share to feed
3. Visit feed to see your post
