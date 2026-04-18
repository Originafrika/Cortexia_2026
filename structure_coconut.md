# CORTEXIA ENTERPRISE — PROMPT DE BUILD COMPLET
# Landing Enterprise → Dashboard → Coconut (Image/Vidéo/Campagne) → Cocoblend Canvas Infini
# Stack : Next.js 14 · Neon Auth · Neon DB · Drizzle · Stripe · React Flow · Kie AI · Cloudflare Workers AI · Groq

---

## 0. CONTEXTE ET PÉRIMÈTRE

Ce prompt couvre exclusivement le segment Enterprise de Cortexia :
- Landing enterprise (/for/enterprise)
- Authentification via Neon Auth
- Dashboard enterprise
- Agent Coconut en 3 modes (Image / Vidéo / Campagne)
- Cocoblend : canvas infini React Flow (le résultat visuel du Cocoboard)
- Paiements Stripe uniquement (abonnement 999$/mois + packs crédits)
- LLM intelligent avec cascade de providers (gratuit en premier, payant en fallback)

L'UI des 3 pages Coconut (Image, Vidéo, Campagne) et la landing enterprise EXISTENT DÉJÀ.
L'UI Cocoblend (canvas infini React Flow) N'EXISTE PAS encore → à construire.
Focus sur : logique métier complète + Cocoblend canvas + intégrations.

---

## 1. STACK TECHNIQUE ENTERPRISE

```
Auth            : Neon Auth (stack officielle — pas NextAuth, pas Supabase)
Base de données : Neon PostgreSQL + Drizzle ORM
Stockage        : Cloudflare R2
Paiements       : Stripe uniquement (enterprise)
Queue jobs      : Upstash QStash
Real-time       : SSE via Upstash Redis pub/sub
Canvas infini   : React Flow (@xyflow/react v12)
Export vidéo    : ffmpeg.wasm (client-side)

LLM CASCADE (ordre de priorité, du moins cher au plus cher) :
  1. Cloudflare Workers AI  → gratuit jusqu'à 10K neurons/jour
  2. Groq API               → gratuit (rate limits généreux)
  3. Nvidia Build            → fallback si Groq saturé
  4. Kie AI                  → dernier recours payant
```

---

## 2. CASCADE LLM — LOGIQUE DÉTAILLÉE

### Pourquoi une cascade ?

Le LLM sert uniquement à générer le Cocoboard (plan JSON structuré).
C'est du texte → les modèles de génération image/vidéo (Kie AI) ne sont pas concernés.
On peut utiliser des modèles LLM bien moins chers, voire gratuits, pour cette tâche.

### Providers dans l'ordre

```typescript
// lib/llm/cascade.ts

export const LLM_PROVIDERS = {
  // 1. Cloudflare Workers AI — 10K neurons/day free
  // Meilleur pour : simple et medium complexity
  // Modèle recommandé : @cf/meta/llama-4-scout-17b-16e-instruct
  //   → $0.27/M input, $0.85/M output → très compétitif
  // Modèle alternatif : @cf/qwen/qwen3-30b-a3b-fp8
  //   → $0.051/M input, $0.335/M output → ultra cheap
  cloudflare: {
    name: 'cloudflare',
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/',
    models: {
      fast:    '@cf/meta/llama-4-scout-17b-16e-instruct', // 30K ctx, vision
      cheap:   '@cf/qwen/qwen3-30b-a3b-fp8',             // très économique
      smart:   '@cf/qwen/qwq-32b',                       // raisonnement
    },
    freeNeuronsPerDay: 10000,
    costPer1KNeurons: 0.011, // après le free tier
  },

  // 2. Groq — Gratuit avec rate limits généreux
  // Meilleur pour : complexité medium à élevée, réponse rapide
  // Rate limits enterprise Cortexia :
  //   llama-3.3-70b-versatile : 1K req/day, 100K tokens/min
  //   moonshotai/kimi-k2-instruct : 1K req/day, 10K tokens/min
  //   qwen/qwen3-32b : 1K req/day
  groq: {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      fast:    'llama-3.1-8b-instant',           // 14.4K req/day
      smart:   'llama-3.3-70b-versatile',        // 1K req/day, très capable
      best:    'moonshotai/kimi-k2-instruct',    // 1K req/day, excellent
      code:    'qwen/qwen3-32b',                 // 1K req/day
    },
    freeRPD: { 'llama-3.1-8b-instant': 14400, 'llama-3.3-70b-versatile': 1000 },
  },

  // 3. Nvidia Build — Free tier disponible
  // Backup si Groq rate-limited
  nvidia: {
    name: 'nvidia',
    baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: {
      smart: 'meta/llama-4-scout-17b-16e-instruct',
      best:  'nvidia/llama-3.3-nemotron-super-49b-v1',
    },
    // Free credits à l'inscription — suffisant pour le MVP
  },

  // 4. Kie AI — Dernier recours
  // Utilisé uniquement si les 3 précédents échouent ou sont épuisés
  kie: {
    name: 'kie',
    baseUrl: 'https://api.kie.ai/v1/chat/completions',
    models: {
      fast:  'gemini-2.5-flash-openai',  // $0.09/M input
      smart: 'gemini-3-flash-openai',    // $0.15/M input
      best:  'gemini-3.1-pro-openai',    // $0.50/M input
    },
  },
}

// Sélection du modèle selon la complexité du job
export function selectLLMForJob(
  mode: 'image' | 'video' | 'campaign',
  assetCount: number,
  intentLength: number,
): { provider: string; model: string } {
  const isComplex = mode === 'campaign' || assetCount > 4 || intentLength > 300
  const isMedium  = mode === 'video' || assetCount > 1 || intentLength > 100

  // Cascade : essayer dans l'ordre
  // Simple  → Cloudflare (free neurons) → Groq fast
  // Medium  → Groq smart → Cloudflare smart
  // Complex → Groq best (kimi-k2) → Nvidia → Kie

  if (!isComplex && !isMedium) {
    return { provider: 'cloudflare', model: '@cf/qwen/qwen3-30b-a3b-fp8' }
  }
  if (isMedium && !isComplex) {
    return { provider: 'groq', model: 'llama-3.3-70b-versatile' }
  }
  // Complex
  return { provider: 'groq', model: 'moonshotai/kimi-k2-instruct' }
}
```

### Implémentation de la cascade avec fallback

```typescript
// lib/llm/router.ts

export async function callLLMWithFallback(params: {
  systemPrompt: string
  userMessage: string
  mode: 'image' | 'video' | 'campaign'
  assetCount: number
  intentLength: number
  jsonMode?: boolean
  maxTokens?: number
}): Promise<string> {
  const { systemPrompt, userMessage, mode, assetCount, intentLength, jsonMode, maxTokens = 4000 } = params

  // Ordre de tentative
  const attempts = [
    { provider: 'cloudflare', model: assetCount > 2
        ? '@cf/meta/llama-4-scout-17b-16e-instruct'
        : '@cf/qwen/qwen3-30b-a3b-fp8' },
    { provider: 'groq',       model: mode === 'campaign'
        ? 'moonshotai/kimi-k2-instruct'
        : 'llama-3.3-70b-versatile' },
    { provider: 'nvidia',     model: 'meta/llama-4-scout-17b-16e-instruct' },
    { provider: 'kie',        model: mode === 'campaign'
        ? 'gemini-3.1-pro-openai'
        : 'gemini-3-flash-openai' },
  ]

  let lastError: Error | null = null

  for (const attempt of attempts) {
    try {
      const result = await callProvider({
        provider: attempt.provider,
        model: attempt.model,
        systemPrompt,
        userMessage,
        jsonMode: jsonMode ?? true,
        maxTokens,
      })

      // Logger pour analytics
      console.log(`LLM success: ${attempt.provider}/${attempt.model}`)
      return result

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // Si rate limit ou quota → essayer le suivant
      const isQuotaError = lastError.message.includes('rate_limit')
        || lastError.message.includes('429')
        || lastError.message.includes('quota')
        || lastError.message.includes('exceeded')

      if (!isQuotaError) {
        // Erreur non-quota (réseau, timeout) → aussi essayer le suivant
        console.warn(`LLM error on ${attempt.provider}: ${lastError.message}`)
      } else {
        console.warn(`LLM quota exceeded on ${attempt.provider}, falling back...`)
      }
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`)
}

async function callProvider(params: {
  provider: string
  model: string
  systemPrompt: string
  userMessage: string
  jsonMode: boolean
  maxTokens: number
}): Promise<string> {
  const { provider, model, systemPrompt, userMessage, jsonMode, maxTokens } = params
  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  }

  switch (provider) {
    case 'cloudflare': {
      const accountId = process.env.CF_ACCOUNT_ID!
      const apiToken  = process.env.CF_API_TOKEN!
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: body.messages, max_tokens: maxTokens }),
        }
      )
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`CF ${res.status}: ${err}`)
      }
      const data = await res.json()
      return data.result?.response || data.result?.choices?.[0]?.message?.content || ''
    }

    case 'groq': {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, model }),
      })
      if (!res.ok) { const e = await res.text(); throw new Error(`Groq ${res.status}: ${e}`) }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    case 'nvidia': {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, model }),
      })
      if (!res.ok) { const e = await res.text(); throw new Error(`Nvidia ${res.status}: ${e}`) }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    case 'kie': {
      const res = await fetch('https://api.kie.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, model }),
      })
      if (!res.ok) { const e = await res.text(); throw new Error(`Kie ${res.status}: ${e}`) }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
```

---

## 3. NEON AUTH — SETUP COMPLET

```typescript
// Neon Auth est la stack auth native de Neon DB
// npm install @neondatabase/auth

// lib/auth/neon.ts
import { NeonAuthClient } from '@neondatabase/auth'

export const neonAuth = new NeonAuthClient({
  apiKey: process.env.NEON_AUTH_API_KEY!,
  projectId: process.env.NEON_PROJECT_ID!,
})

// app/api/auth/[...neon]/route.ts
import { neonAuth } from '@/lib/auth/neon'
export const { GET, POST } = neonAuth.handlers({
  providers: ['google', 'email-magic-link'],
  callbacks: {
    onSignUp: async (user) => {
      // Créer le wallet et le profil enterprise automatiquement
      await createEnterpriseProfile(user.id, user.email)
    },
  },
})

// middleware.ts
import { neonAuthMiddleware } from '@neondatabase/auth/middleware'
export const middleware = neonAuthMiddleware({
  publicRoutes: ['/', '/for/enterprise', '/for/creators', '/for/developers',
                 '/pricing', '/api/webhooks/stripe'],
  loginPath: '/login',
})

// Récupérer l'user dans une Server Component/Route Handler
import { getSession } from '@neondatabase/auth/server'
const session = await getSession()
// session.user.id, session.user.email
```

---

## 4. STRIPE — ENTERPRISE UNIQUEMENT

```typescript
// lib/payments/stripe-enterprise.ts
// npm install stripe

import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

// ─── ABONNEMENT 999$/MOIS ────────────────────────────────────

export async function createEnterpriseCheckout(params: {
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: params.userEmail,
    line_items: [{ price: process.env.STRIPE_PRICE_ENTERPRISE!, quantity: 1 }],
    metadata: { cortexia_user_id: params.userId, plan: 'enterprise_999' },
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
    subscription_data: {
      metadata: { cortexia_user_id: params.userId },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })
  return session.url!
}

// ─── PACKS CRÉDITS (1000 × N) — ABONNEMENT ACTIF REQUIS ─────

export async function createCreditPackCheckout(params: {
  userId: string
  lots: 1 | 2 | 5 | 10
  hasActiveSubscription: boolean  // VÉRIFIER AVANT D'APPELER
  successUrl: string
  cancelUrl: string
}) {
  if (!params.hasActiveSubscription) {
    throw new Error('An active Enterprise subscription is required to purchase credit packs.')
  }

  const amountUsd = params.lots * 90
  const creditsToAdd = params.lots * 1000

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: amountUsd * 100,
        product_data: {
          name: `Cortexia — ${creditsToAdd.toLocaleString()} crédits Enterprise`,
          description: `${params.lots} lot(s) × 1 000 crédits à $0.09/crédit`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      cortexia_user_id: params.userId,
      credits_to_add:   creditsToAdd.toString(),
      payment_type:     'enterprise_topup',
      lots:             params.lots.toString(),
    },
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
  })
  return session.url!
}

// ─── WEBHOOK ─────────────────────────────────────────────────

export async function handleStripeWebhook(body: string, sig: string) {
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.CheckoutSession
      const userId = s.metadata?.cortexia_user_id
      if (!userId) break

      if (s.metadata?.payment_type === 'enterprise_topup') {
        const credits = parseInt(s.metadata.credits_to_add || '0')
        await creditEnterpriseWallet(userId, credits, 'topup', s.id)
      } else if (s.mode === 'subscription') {
        await activateEnterpriseSubscription(userId, s.subscription as string)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const inv = event.data.object as Stripe.Invoice
      const userId = (inv.subscription_details?.metadata || {})['cortexia_user_id']
      if (userId) {
        // Renouvellement mensuel → reset + 10 000 crédits
        await renewEnterpriseCredits(userId, 10000)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = (sub.metadata || {})['cortexia_user_id']
      if (userId) await cancelEnterpriseSubscription(userId)
      break
    }
  }
}
```

---

## 5. SCHÉMA NEON DB — ENTERPRISE

```typescript
// lib/db/schema-enterprise.ts (s'ajoute au schema global)
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, numeric, unique } from 'drizzle-orm/pg-core'

// Subscriptions enterprise
export const subscriptions = pgTable('subscriptions', {
  id:                   uuid('id').defaultRandom().primaryKey(),
  userId:               uuid('user_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId:     text('stripe_customer_id'),
  status:               text('status').default('inactive'), // inactive|active|cancelled|past_due
  creditsMonthly:       integer('credits_monthly').default(10000),
  currentPeriodEnd:     timestamp('current_period_end'),
  cancelledAt:          timestamp('cancelled_at'),
  createdAt:            timestamp('created_at').defaultNow(),
})

// Wallets crédits enterprise
export const enterpriseWallets = pgTable('enterprise_wallets', {
  id:             uuid('id').defaultRandom().primaryKey(),
  userId:         uuid('user_id').notNull().unique(),
  balance:        integer('balance').notNull().default(0),
  totalConsumed:  integer('total_consumed').default(0),
  updatedAt:      timestamp('updated_at').defaultNow(),
})

// Jobs Coconut (Cocoboard + Cocoblend)
export const cocoboardJobs = pgTable('cocoboard_jobs', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  userId:              uuid('user_id').notNull(),
  mode:                text('mode').notNull(),        // image|video|campaign
  intent:              text('intent').notNull(),
  assets:              jsonb('assets').default([]),   // AssetItem[]
  cocoboard:           jsonb('cocoboard'),            // Cocoboard JSON (validé Zod)
  // RÈGLE FONDAMENTALE : deux compteurs séparés, jamais mélangés
  creditsCocoboard:    integer('credits_cocoboard').default(100), // FIXE 100
  creditsGeneration:   integer('credits_generation').default(0),  // réel des générations
  // Exécution
  blendOutputs:        jsonb('blend_outputs').default({}), // { step_id: url_r2 }
  status:              text('status').default('pending'),
  // pending|analyzing|awaiting_validation|blending|done|failed
  finalOutputUrl:      text('final_output_url'),
  errorMessage:        text('error_message'),
  modificationCount:   integer('modification_count').default(0),
  // LLM utilisé (pour analytics et debug)
  llmProvider:         text('llm_provider'),  // cloudflare|groq|nvidia|kie
  llmModel:            text('llm_model'),
  createdAt:           timestamp('created_at').defaultNow(),
  updatedAt:           timestamp('updated_at').defaultNow(),
})

// Transactions crédits enterprise
export const enterpriseTransactions = pgTable('enterprise_transactions', {
  id:          uuid('id').defaultRandom().primaryKey(),
  userId:      uuid('user_id').notNull(),
  amount:      integer('amount').notNull(),  // positif=crédit, négatif=débit
  type:        text('type').notNull(),       // subscription_grant|topup|cocoboard|generation|refund
  description: text('description'),
  referenceId: uuid('reference_id'),        // job_id ou stripe_session_id
  createdAt:   timestamp('created_at').defaultNow(),
})
```

---

## 6. COCOBLEND — CANVAS INFINI REACT FLOW

### Concept fondamental

Quand l'enterprise valide le Cocoboard, au lieu d'un simple loader,
le Cocoblend s'ouvre comme un **canvas infini React Flow**.
Les nœuds du Cocoboard sont rendus comme des nodes React Flow.
L'exécution se fait step par step, chaque nœud s'illumine au fur et à mesure.
L'user peut zoomer, naviguer, voir chaque output généré directement dans son nœud.

### Structure du canvas

```
AVANT EXÉCUTION (awaiting_validation) :
  Tous les nœuds sont en état "pending" (gris)
  Les edges (flèches) sont visibles mais inactifs
  Bouton "Lancer Cocoblend" en haut du canvas

PENDANT L'EXÉCUTION (blending) :
  Nœud actif → bordure violet animée (pulse)
  Nœud terminé → preview de l'output dans la card
  Nœud en attente → grisé
  Edges vers un nœud terminé → animation de flux violet (stroke-dasharray)

APRÈS EXÉCUTION (done) :
  Tous les nœuds affichent leur output
  Bouton "Exporter" en haut
  Pour la vidéo : bouton "Assembler et exporter" lance ffmpeg.wasm
```

### Mapping Cocoboard → React Flow nodes

```typescript
// lib/cocoblend/cocoboard-to-nodes.ts

import type { Node, Edge } from '@xyflow/react'
import type { CocoboardStep, Cocoboard } from '@/lib/coconut/schemas'

export interface CocoblendNodeData {
  stepId:       string
  stepOrder:    number
  type:         string          // T2I, I2V, T2V, etc.
  model:        string
  prompt:       string
  description:  string
  creditsEstimate: number
  status:       'pending' | 'processing' | 'done' | 'failed'
  outputUrl?:   string
  errorMsg?:    string
}

// Convertit un Cocoboard JSON en nodes et edges React Flow
export function cocoboardToFlow(
  cocoboard: Cocoboard,
  jobId: string,
): { nodes: Node<CocoblendNodeData>[]; edges: Edge[] } {
  const steps = cocoboard.mode === 'campaign'
    ? extractAllCampaignSteps(cocoboard)
    : cocoboard.steps

  // Layout automatique : colonnes selon les dépendances
  const { positions } = computeLayout(steps)

  const nodes: Node<CocoblendNodeData>[] = steps.map((step) => ({
    id:       step.id,
    type:     'cocoblend-step',    // custom node type
    position: positions[step.id] || { x: 0, y: 0 },
    data: {
      stepId:       step.id,
      stepOrder:    step.order,
      type:         step.type,
      model:        step.model,
      prompt:       step.prompt,
      description:  step.stepDescription,
      creditsEstimate: step.creditsEstimate,
      status:       'pending',
    },
  }))

  const edges: Edge[] = []
  for (const step of steps) {
    for (const dep of step.dependencies) {
      edges.push({
        id:           `${dep}->${step.id}`,
        source:       dep,
        target:       step.id,
        type:         'cocoblend-edge',   // custom edge animé
        animated:     false,
        style:        { stroke: '#2D2D4A', strokeWidth: 1.5 },
      })
    }
  }

  return { nodes, edges }
}

// Layout en colonnes (dag layout simple)
function computeLayout(steps: CocoboardStep[]): { positions: Record<string, { x: number; y: number }> } {
  const positions: Record<string, { x: number; y: number }> = {}
  const CARD_W = 280, CARD_H = 200, GAP_X = 80, GAP_Y = 40
  const columns: string[][] = []  // colonnes de step IDs
  const placed = new Set<string>()

  // Grouper par niveau de dépendance (BFS)
  const roots = steps.filter(s => s.dependencies.length === 0)
  let currentLevel = roots.map(s => s.id)

  while (currentLevel.length > 0) {
    columns.push(currentLevel)
    currentLevel.forEach(id => placed.add(id))
    const nextLevel = steps
      .filter(s => !placed.has(s.id) && s.dependencies.every(d => placed.has(d)))
      .map(s => s.id)
    currentLevel = nextLevel
  }

  // Positionner
  columns.forEach((col, colIdx) => {
    const totalH = col.length * (CARD_H + GAP_Y) - GAP_Y
    col.forEach((id, rowIdx) => {
      positions[id] = {
        x: colIdx * (CARD_W + GAP_X),
        y: rowIdx * (CARD_H + GAP_Y) - totalH / 2,
      }
    })
  })

  return { positions }
}
```

### CocoblendStepNode — Custom React Flow Node

```typescript
// components/cocoblend/CocoblendStepNode.tsx

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { CocoblendNodeData } from '@/lib/cocoblend/cocoboard-to-nodes'

const TYPE_COLORS: Record<string, string> = {
  'T2I':    '#0F6E56',  // teal
  'I2I':    '#185FA5',  // blue
  'T2V':    '#993C1D',  // coral
  'I2V':    '#854F0B',  // amber
  'EXTEND': '#534AB7',  // violet
  'MERGE':  '#3C3489',  // deep violet
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'border-[#2D2D4A] bg-[#0F0F18]',
  processing: 'border-violet-500 bg-[#0F0F18] animate-pulse-border',
  done:       'border-[#0F6E56] bg-[#0F0F18]',
  failed:     'border-red-800 bg-[#0F0F18]',
}

export const CocoblendStepNode = memo(({ data, id }: NodeProps<CocoblendNodeData>) => {
  const typeColor = TYPE_COLORS[data.type] || '#534AB7'
  const statusStyle = STATUS_STYLES[data.status]

  return (
    <>
      {/* Handle entrée (en haut) */}
      <Handle type="target" position={Position.Left}
        style={{ background: '#534AB7', border: '1px solid #2D2D4A', width: 8, height: 8 }} />

      {/* Card du nœud */}
      <div className={`w-[280px] rounded-xl border ${statusStyle} overflow-hidden select-none`}>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2"
             style={{ borderBottom: `1px solid ${typeColor}20` }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center
                           text-[10px] font-mono font-bold text-white"
                style={{ background: typeColor }}>
            {data.stepOrder}
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider"
                style={{ color: typeColor }}>
            {data.type}
          </span>
          <span className="ml-auto text-[10px] font-mono text-[#5A5A8A]">
            {data.model.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Description */}
        <div className="px-3 py-2">
          <p className="text-[12px] text-[#9999BB] leading-tight line-clamp-2">
            {data.description}
          </p>
        </div>

        {/* Output preview (quand done) */}
        {data.status === 'done' && data.outputUrl && (
          <div className="px-3 pb-3">
            {data.type.includes('V') ? (
              <video src={data.outputUrl} autoPlay muted loop playsInline
                className="w-full h-[120px] object-cover rounded-lg border border-[#2D2D4A]" />
            ) : (
              <img src={data.outputUrl} alt={data.description}
                className="w-full h-[120px] object-cover rounded-lg border border-[#2D2D4A]" />
            )}
          </div>
        )}

        {/* Processing indicator */}
        {data.status === 'processing' && (
          <div className="px-3 pb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500 animate-ping" />
            <span className="text-[11px] text-violet-400 font-mono">Génération...</span>
          </div>
        )}

        {/* Pending indicator */}
        {data.status === 'pending' && (
          <div className="px-3 pb-2">
            <span className="text-[10px] text-[#5A5A8A] font-mono">
              ~{data.creditsEstimate} crédits
            </span>
          </div>
        )}

        {/* Error */}
        {data.status === 'failed' && data.errorMsg && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-red-400 line-clamp-2">{data.errorMsg}</p>
          </div>
        )}
      </div>

      {/* Handle sortie (à droite) */}
      <Handle type="source" position={Position.Right}
        style={{ background: '#534AB7', border: '1px solid #2D2D4A', width: 8, height: 8 }} />
    </>
  )
})
CocoblendStepNode.displayName = 'CocoblendStepNode'
```

### CocoblendCanvas — Le canvas principal

```typescript
// components/cocoblend/CocoblendCanvas.tsx

'use client'

import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  BackgroundVariant, type Node, type Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CocoblendStepNode } from './CocoblendStepNode'
import { cocoboardToFlow } from '@/lib/cocoblend/cocoboard-to-nodes'
import { useCoconutStore } from '@/stores/coconutStore'
import type { Cocoboard } from '@/lib/coconut/schemas'

const NODE_TYPES = { 'cocoblend-step': CocoblendStepNode }

interface Props {
  cocoboard:   Cocoboard
  jobId:       string
  onValidate:  () => void     // lance Cocoblend
  onExport:    () => void     // export final
  canStart:    boolean        // abonnement actif + crédits suffisants
}

export function CocoblendCanvas({ cocoboard, jobId, onValidate, onExport, canStart }: Props) {
  const { stepProgress, status, totalGenCredits } = useCoconutStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Initialiser le canvas depuis le Cocoboard
  useEffect(() => {
    const { nodes: initNodes, edges: initEdges } = cocoboardToFlow(cocoboard, jobId)
    setNodes(initNodes)
    setEdges(initEdges)
  }, [cocoboard, jobId])

  // Mettre à jour les nœuds au fur et à mesure des SSE
  useEffect(() => {
    setNodes((nds) => nds.map((node) => {
      const progress = stepProgress[node.id]
      if (!progress) return node
      return {
        ...node,
        data: {
          ...node.data,
          status:    progress.status,
          outputUrl: progress.outputUrl,
          errorMsg:  progress.errorMsg,
        },
      }
    }))

    // Animer les edges vers les nœuds terminés
    setEdges((eds) => eds.map((edge) => {
      const targetDone = stepProgress[edge.target]?.status === 'done'
      return {
        ...edge,
        animated: targetDone,
        style: {
          stroke: targetDone ? '#534AB7' : '#2D2D4A',
          strokeWidth: targetDone ? 2 : 1.5,
        },
      }
    }))
  }, [stepProgress])

  // Crédits estimés totaux de génération
  const estimatedGen = cocoboard.mode === 'campaign'
    ? (cocoboard as any).estimatedCreditsGeneration || 0
    : (cocoboard as any).estimatedCreditsGeneration || 0

  return (
    <div className="w-full h-full relative" style={{ background: '#000000' }}>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between
                      px-4 py-3 bg-[#000000]/80 backdrop-blur border-b border-[#1A1A2E]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono font-bold text-white">Cocoblend</span>
          <span className="text-[11px] font-mono text-[#5A5A8A]">
            {cocoboard.mode === 'campaign'
              ? `${(cocoboard as any).totalPosts} posts`
              : `${cocoboard.steps?.length || 0} steps`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Coût séparé — règle fondamentale */}
          <div className="text-[11px] font-mono text-[#5A5A8A]">
            Cocoboard : <span className="text-white">100 cr.</span>
            {' + '}
            Génération : <span className="text-white">~{estimatedGen} cr.</span>
          </div>

          {status === 'awaiting_validation' && (
            <button onClick={onValidate} disabled={!canStart}
              className="px-4 py-2 rounded-full text-[12px] font-mono font-bold
                         bg-violet-500 hover:bg-violet-400 text-white
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors">
              {canStart ? 'Lancer Cocoblend →' : 'Crédits insuffisants'}
            </button>
          )}

          {status === 'blending' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500 animate-ping" />
              <span className="text-[12px] font-mono text-violet-400">Génération en cours...</span>
            </div>
          )}

          {status === 'done' && (
            <button onClick={onExport}
              className="px-4 py-2 rounded-full text-[12px] font-mono font-bold
                         bg-[#0F6E56] hover:bg-[#1D9E75] text-white transition-colors">
              Télécharger le résultat ↓
            </button>
          )}
        </div>
      </div>

      {/* Canvas React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        panOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}>

        {/* Fond grille de points très subtile — premium, pas cheap */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(83,74,183,0.06)"
          style={{ background: '#000000' }} />

        <Controls
          style={{
            background: '#0F0F18',
            border: '1px solid #1A1A2E',
            borderRadius: '8px',
            bottom: 20,
            left: 20,
          }} />

        <MiniMap
          style={{
            background: '#0A0A0F',
            border: '1px solid #1A1A2E',
            borderRadius: '8px',
          }}
          nodeColor={(node) => {
            const s = (node.data as any).status
            if (s === 'done') return '#0F6E56'
            if (s === 'processing') return '#534AB7'
            if (s === 'failed') return '#A32D2D'
            return '#2D2D4A'
          }} />
      </ReactFlow>
    </div>
  )
}
```

---

## 7. SYSTÈME DE PROMPTS COCONUT — TROIS MODES

### Philosophie des prompts

Le system prompt de Coconut doit :
1. Produire du JSON strict (zero markdown, zero texte autour)
2. Gérer toute complexité — de l'affiche simple au film publicitaire 60s
3. S'adapter à la richesse et au nombre des assets fournis
4. Estimer les crédits correctement
5. Gérer les assets manquants sans bloquer

### Workflow de génération du Cocoboard (logique complète)

```
1. L'user soumet : intent (texte) + assets (liste de fichiers R2)
2. On sélectionne le LLM via la cascade (CF Workers → Groq → Nvidia → Kie)
3. On construit le message utilisateur avec l'intent et la description des assets
4. On appelle le LLM avec le system prompt du mode
5. On parse et valide le JSON avec Zod (3 retries si invalide)
6. On sauvegarde le Cocoboard en DB
7. On notifie le frontend via SSE → le canvas React Flow s'affiche
8. L'user valide → Cocoblend s'exécute step par step

Pour les images et vidéos RÉELLES : toujours Kie AI (jamais de fallback gratuit).
Les modèles gratuits (CF, Groq, Nvidia) ne sont utilisés que pour le LLM de planification.
```

### System prompt mode IMAGE (production-ready)

```
You are Coconut, an autonomous creative AI agent for African and international advertising.

Analyze the intent and assets. Generate a Cocoboard — a structured production plan.
Output: ONLY valid JSON. No markdown. No text before or after. Ever.

MODELS AVAILABLE:
  flux-2-pro      → photorealistic, multi-reference (max 8), text rendering
  nano-banana-pro → 4K quality, character consistency, luxury aesthetics, African subjects
  nano-banana-2   → fast I2I editing, compositing, adding elements to images
  qwen2-image     → structured text, graphic design, heavy-text posters

RESOLUTION COSTS: 1K=2cr, 2K=3cr (nano-banana-pro), 4K=4cr

COMPLEXITY RULES:
  simple  (1 step)  : single prompt → single output
  medium  (2-3 steps): background gen → composite OR style → text
  complex (4+ steps): background → subjects → assets → composite → text/branding

PROMPT MINIMUM: 60 words. Include: subject + environment + lighting + style + camera + palette + quality tags.
ALWAYS end prompts with: "ultra-detailed, professional photography/design, award-winning, sharp"
For African subjects: specify real skin tones, authentic cultural elements, West/Central/East African specifics.
For I2I steps: start "Transform the provided reference image: "

OUTPUT FORMAT:
{
  "mode": "image",
  "complexity": "simple|medium|complex",
  "missingAssets": [],
  "finalDescription": "One precise sentence describing the expected output",
  "estimatedCreditsGeneration": <int>,
  "steps": [{
    "id": "step_1",
    "order": 1,
    "type": "T2I|I2I",
    "model": "flux-2-pro|nano-banana-pro|nano-banana-2|qwen2-image",
    "prompt": "<60+ words>",
    "negativePrompt": "<optional>",
    "referenceIds": [],
    "resolution": "1K|2K|4K",
    "aspectRatio": "1:1|16:9|9:16|4:5|3:2|2:3",
    "dependencies": [],
    "stepDescription": "Human-readable: what this step produces",
    "creditsEstimate": <int>
  }]
}
```

### System prompt mode VIDEO (production-ready)

```
You are Coconut, an autonomous AI film director for cinematic advertising.

Analyze the brief and assets. Generate a shot-by-shot production plan.
Output: ONLY valid JSON. No markdown. No text before or after. Ever.

MODELS:
  kling-3-std    → T2V/I2V, up to 15s, standard quality    | 2-3cr/s
  kling-3-pro    → T2V/I2V, hero shots, highest quality     | 3-4cr/s
  wan-2.6        → complex scenes, stable characters, 1080p | 8-22cr fixed
  seedance-1.5   → cinematic control, native audio sync     | ~2cr/s
  kling-2.6-motion → motion transfer from reference video   | 6-9cr/s

DURATION LIMITS: kling=max15s | wan=5/10/15s | seedance=4/8/12s
CREDIT ESTIMATE: kling-std 5s=10cr, 10s=20cr | kling-pro 5s=15cr | wan 720p 10s=15cr

NARRATIVE ARC: hook (0-3s) → development → climax/reveal → CTA
EACH SHOT: start/end frames must connect visually. Describe exactly.
PROMPTS: shot type + camera movement + subject + environment + lighting + grade + timing (80+ words)

OUTPUT FORMAT:
{
  "mode": "video",
  "complexity": "simple|medium|complex",
  "missingAssets": [],
  "finalDescription": "Brief description",
  "totalEstimatedDuration": <seconds>,
  "estimatedCreditsGeneration": <int>,
  "steps": [{
    "id": "shot_1",
    "order": 1,
    "type": "T2V|I2V|EXTEND",
    "model": "kling-3-std|kling-3-pro|wan-2.6|seedance-1.5|kling-2.6-motion",
    "prompt": "<80+ words cinematic>",
    "referenceIds": [],
    "duration": <5|8|10|12|15>,
    "resolution": "720p|1080p",
    "withAudio": true|false,
    "startFrame": "Precise visual description of first frame",
    "endFrame": "Precise visual description of last frame",
    "cameraMovement": "static|dolly_in|dolly_out|pan_left|pan_right|crane_up|orbit|handheld",
    "transitionToNext": "cut|dissolve|match_cut|whip_pan",
    "dependencies": [],
    "stepDescription": "Human-readable shot description",
    "creditsEstimate": <int>
  }]
}
```

### System prompt mode CAMPAGNE (production-ready)

```
You are Coconut, an autonomous AI marketing strategist and senior community manager.

Generate a complete 30-day content campaign. Every post must serve the narrative arc.
Output: ONLY valid JSON. No markdown. No text before or after. Ever.

NARRATIVE ARC (mandatory structure):
  Week 1: TEASER — mystery, curiosity, no reveal
  Week 2: LAUNCH — hero content, maximum creative investment
  Week 3: SOCIAL PROOF — trust, testimonials, demonstrations
  Week 4: CONVERSION — urgency, value, clear CTAs

CAPTION FORMAT (mandatory for every post):
  Line 1: Hook (stop-scroll — question/bold statement/surprising fact)
  Lines 2-4: Body (specific, not generic)
  Last line: CTA (one clear action verb)
  Hashtags: 5-10 (mix niche + broad)

PLATFORM FREQUENCY: Instagram max 1x/day | TikTok max 2x/day | Facebook 3-4x/week
POSTING TIMES: Instagram 7-9am/12-2pm/6-9pm | TikTok 9-11am/7-11pm | Facebook 9am-3pm

For each post's cocoboardSteps: use same format as image/video Cocoboard steps.
Keep posts realistic: 14-21 posts for 30 days is better than 40 generic posts.

OUTPUT FORMAT:
{
  "mode": "campaign",
  "brand": "<name>",
  "campaignName": "<creative name>",
  "objective": "<one sentence measurable goal>",
  "targetAudience": "<age, location, interests, behavior>",
  "campaignNarrative": "<3 sentences: story arc from day 1 to day 30>",
  "duration": "<e.g. April 2025>",
  "platforms": ["instagram", "tiktok", "facebook"],
  "totalPosts": <int>,
  "estimatedCreditsGeneration": <int>,
  "posts": [{
    "id": "post_1",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "platform": "instagram|tiktok|facebook",
    "type": "image|video|story|reel|carousel",
    "contentBrief": "Strategic why — what story, what emotion, why now",
    "caption": "Full caption with hook + body + CTA + hashtags",
    "cocoboardSteps": [<image or video steps format>]
  }]
}
```

---

## 8. ORCHESTRATEUR COCONUT — LOGIQUE COMPLÈTE

```typescript
// lib/coconut/orchestrator.ts
// Appelle callLLMWithFallback (CF → Groq → Nvidia → Kie)
// Valide avec Zod, retry 3 fois si JSON invalide
// Exécute le blend step-by-step en débitant les crédits de génération

// RÈGLE FONDAMENTALE :
// - Les 100 crédits du Cocoboard sont débités À LA SOUMISSION du formulaire
// - Les crédits de génération sont débités step-by-step PENDANT le blend
// - Ces deux montants ne se mélangent jamais dans la DB ni dans l'UI

// FLOW COMPLET :
// POST /api/coconut/cocoboard → débit 100cr → create job → QStash analyze
// QStash analyze → callLLMWithFallback → Zod validate → save cocoboard → SSE notify
// POST /api/coconut/cocoboard/[id]/validate → QStash blend
// QStash blend → for each step: debit credits → Kie AI generate → upload R2 → SSE notify
// SSE "blend_done" → canvas React Flow affiche tous les outputs

// POUR LES GÉNÉRATIONS RÉELLES (images et vidéos) : TOUJOURS Kie AI
// Flux 2 Pro, Nano Banana Pro, Kling 3.0, WAN 2.6 → Kie AI uniquement
// Les providers gratuits (CF Workers AI, Groq) = LLM de planification SEULEMENT

// GESTION DES ERREURS :
// Si step raté → continuer les autres steps non-dépendants
// Si crédits insuffisants en cours de blend → pausé + notification
// Si 3 retries LLM tous échouent → rembourser 100 crédits + notifier
```

---

## 9. PAGES ENTERPRISE — STRUCTURE COMPLÈTE

### Layout enterprise

```
app/(enterprise)/
├── layout.tsx                    ← Sidebar + Topbar enterprise
├── page.tsx                      ← Dashboard (metrics + quick actions)
├── coconut/
│   ├── image/
│   │   └── page.tsx              ← Formulaire + CocoboardViewer + CocoblendCanvas
│   ├── video/
│   │   └── page.tsx              ← Formulaire + CocoboardViewer + CocoblendCanvas
│   └── campaign/
│       └── page.tsx              ← Formulaire + CocoboardViewer + CampaignCalendar + CocoblendCanvas
├── jobs/
│   └── page.tsx                  ← Historique tous les jobs
└── billing/
    └── page.tsx                  ← Abonnement + packs crédits
```

### Page Coconut (commune aux 3 modes) — Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ SIDEBAR (160px)     │ PANEL GAUCHE (420px)  │ PANEL DROIT (flex) │
│                     │                       │                     │
│ Mode Image    ●     │ Intent textarea       │ État 0: illustration│
│ Mode Vidéo          │ Asset uploader        │ État 1: LLM progress│
│ Mode Campagne       │ Bouton Cocoboard      │ État 2: Cocoboard   │
│ ─────────────       │ [100 crédits fixes]   │   steps validables  │
│ Historique jobs     │ ─────────────────     │ État 3: Canvas      │
│                     │ Note: crédits séparés │   React Flow infini │
│ Crédits : 7 842     │ "génération estimée   │   (Cocoblend)       │
│ [Top-up]            │ ~X crédits en plus"   │ État 4: done +      │
│                     │                       │   export button     │
└──────────────────────────────────────────────────────────────────┘
```

### Transition vers le canvas (moment clé UX)

```
Quand le Cocoboard est prêt (awaiting_validation) :
  → Le panel droit affiche la liste des steps avec un bouton "Valider"
  → Au clic "Valider → Lancer Cocoblend"
  → ANIMATION : le panel droit se transforme en canvas plein écran
     (Framer Motion : expand depuis le panel, le formulaire se slide hors écran)
  → Le canvas React Flow apparaît avec tous les nœuds en état "pending"
  → Bouton "Lancer Cocoblend" en haut du canvas
  → Les nœuds s'illuminent au fur et à mesure via SSE

Pour revenir au formulaire depuis le canvas :
  → Bouton "← Modifier le brief" en haut gauche
  → Canvas se referme, formulaire réapparaît
```

---

## 10. VARIABLES D'ENVIRONNEMENT ENTERPRISE

```env
# Neon Auth
NEON_AUTH_API_KEY=...
NEON_PROJECT_ID=...

# Neon Database
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/cortexia?sslmode=require

# Stripe (enterprise uniquement)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ENTERPRISE=price_...       # abonnement 999$/mois

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=cortexia-outputs
NEXT_PUBLIC_R2_PUBLIC_URL=https://outputs.cortexia.app

# LLM CASCADE — du moins cher au plus cher
CF_ACCOUNT_ID=...                        # Cloudflare Workers AI (gratuit 10K neurons/day)
CF_API_TOKEN=...
GROQ_API_KEY=gsk_...                     # Groq (gratuit avec rate limits)
NVIDIA_API_KEY=nvapi-...                 # Nvidia Build (free credits)
KIE_API_KEY=...                          # Kie AI (payant — dernier recours LLM)

# Kie AI (générations image/vidéo — toujours payant)
KIE_API_BASE=https://api.kie.ai

# Queue
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# Redis SSE
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://cortexia.app
```

---

## 11. ORDRE DE BUILD — ENTERPRISE COMPLET

```
SPRINT 1 — INFRA (2h)
  ☐ Neon Auth setup + middleware
  ☐ Neon DB + Drizzle migrations (subscriptions, enterprise_wallets, cocoboard_jobs)
  ☐ R2 storage helpers (uploadBuffer, uploadFromUrl, getSignedUrl)
  ☐ SSE helper (createSSEResponse via Upstash)

SPRINT 2 — STRIPE (3h)
  ☐ createEnterpriseCheckout (abonnement 999$)
  ☐ createCreditPackCheckout (1000 crédits × N, abonnement requis)
  ☐ handleStripeWebhook (subscription + topup + renewal)
  ☐ Page billing enterprise (afficher statut abo + bouton top-up)
  ☐ Protection : packs crédits bloqués si pas d'abonnement actif

SPRINT 3 — CASCADE LLM (4h)
  ☐ Cloudflare Workers AI adapter
  ☐ Groq adapter
  ☐ Nvidia Build adapter
  ☐ Kie AI LLM adapter
  ☐ callLLMWithFallback (cascade avec retry et logging)
  ☐ Tests avec les 3 prompts Coconut

SPRINT 4 — COCONUT CORE (5h)
  ☐ Schémas Zod (CocoboardStep, CocoboardImage, Video, Campaign)
  ☐ Orchestrateur : generateCocoboard + modifyCocoboard + runCocoblend
  ☐ Routes API coconut (POST cocoboard, PATCH modify, POST validate, GET SSE, POST upload)
  ☐ QStash handlers (analyze + blend)
  ☐ Credit service (debit atomique Neon, crédits Cocoboard vs génération séparés)

SPRINT 5 — COCOBLEND CANVAS (6h)  ← priorité UI manquante
  ☐ cocoboardToFlow (Cocoboard JSON → React Flow nodes + edges)
  ☐ computeLayout (dag layout en colonnes)
  ☐ CocoblendStepNode (custom node : header + description + preview + statuts)
  ☐ CocoblendCanvas (ReactFlow + Background dots + Controls + MiniMap)
  ☐ Zustand store (handleSSEMessage → update nodes statuts)
  ☐ Animation de transition formulaire → canvas (Framer Motion)
  ☐ Export vidéo : VideoTimeline + ffmpeg.wasm pour le mode vidéo
  ☐ CampaignCalendar fonctionnel pour le mode campagne

SPRINT 6 — INTÉGRATION PAGES (3h)
  ☐ Page /enterprise/coconut/image → formulaire + cocoboardViewer + CocoblendCanvas
  ☐ Page /enterprise/coconut/video → idem + VideoTimeline
  ☐ Page /enterprise/coconut/campaign → idem + CampaignCalendar
  ☐ Page /enterprise/jobs → historique + statuts + réouvrir un job
  ☐ Dashboard enterprise → metrics (crédits, jobs ce mois, abonnement)

SPRINT 7 — KIE AI GÉNÉRATIONS (4h)
  ☐ kieGenerateImage (flux-2-pro, nano-banana-pro, nano-banana-2, qwen2)
  ☐ kieGenerateVideo (kling-3-std, kling-3-pro, wan-2.6, seedance-1.5, kling-2.6-motion)
  ☐ Watermark service (Sharp — pour les outputs demandés sans watermark sur enterprise)
  ☐ Tests end-to-end : formulaire → Cocoboard → Cocoblend canvas → résultat

TOTAL ESTIMÉ : ~27h de développement
```