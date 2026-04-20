# Vercel API Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all API routes (auth, feed, credits, generation) work in production on Vercel by converting from Express to Next.js API routes.

**Architecture:** This is a Vite project that needs Next.js support for API routes. We'll add Next.js and configure Vercel to use Next.js API routes.

**Tech Stack:** Vite, Next.js, Vercel Serverless Functions

---

## File Structure Analysis

### Existing API Routes (already in src/app/api/)
- Auth: `/api/auth/signin`, `/api/auth/signup`, `/api/auth/profile/[userId]`
- Feed: `/api/feed`, `/api/feed/publish`, `/api/feed/[postId]/like`, `/api/feed/[postId]/comments`
- Credits: `/api/credits`
- Storage: `/api/storage/*`
- Generation: `/api/generation`, `/api/image/kie-ai/*`

### Files to Create/Modify
- Create: `next.config.js` (Next.js configuration)
- Modify: `package.json` (add Next.js dependencies)
- Modify: `vite.config.ts` (configure for Vercel)
- Create: `vercel.json` (Vercel configuration)

---

## Task 1: Add Next.js Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add Next.js to package.json**

Run locally:
```bash
npm install next@latest react react-dom
```

Then add to package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

- [ ] **Step 2: Create next.config.js**

Create file `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

module.exports = nextConfig;
```

- [ ] **Step 3: Update vite.config.ts for production**

Modify vite.config.ts to only use proxy in development:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    } : undefined,
  },
});
```

- [ ] **Step 4: Create vercel.json for API routing**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

- [ ] **Step 5: Commit changes**

```bash
git add -A
git commit -m "feat: add Next.js for API routes support"
```

---

## Task 2: Fix API Route Imports

**Files:**
- Modify: All route files in `src/app/api/*/route.ts`

- [ ] **Step 1: Check current route imports**

The routes use `drizzle-orm` which may not be installed. Check and fix imports.

Current problematic imports in routes:
- `import { db } from '../../../lib/db';`
- `import { users } from '../../../lib/db/schema';`

Fix: Make sure `drizzle-orm` and `drizzle-kit` are in dependencies.

- [ ] **Step 2: Add drizzle dependencies if missing**

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: add missing drizzle dependencies"
```

---

## Task 3: Test API Routes

**Files:**
- Test: Deploy to Vercel

- [ ] **Step 1: Push changes to GitHub**

```bash
git push
```

- [ ] **Step 2: Wait for Vercel deployment**

- [ ] **Step 3: Test auth API**

```bash
curl -X POST https://cortexia-2026.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

Expected: JSON response (not 404)

- [ ] **Step 4: Test feed API**

```bash
curl https://cortexia-2026.vercel.app/api/feed
```

Expected: JSON with creations array

- [ ] **Step 5: Commit success**

```bash
git commit -m "chore: API routes working on Vercel"
```

---

## Summary

This plan adds Next.js support to the Vite project to enable API routes on Vercel. After implementation:
- Auth routes will work (`/api/auth/*`)
- Feed routes will work (`/api/feed/*`)
- Credits routes will work (`/api/credits`)
- All other API routes will work

**Alternative:** If this is too complex, consider deploying Express server separately on Railway/Render and keeping Vite frontend on Vercel.
