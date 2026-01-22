# 🎯 PROMPT COMPLET POUR DÉVELOPPER CORTEXIA CREATION HUB V3

> **Date :** Janvier 2026  
> **Version :** 3.1 Production  
> **Framework :** React + TypeScript + Tailwind CSS v4 + Supabase + Hono

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Architecture Globale](#1-vision--architecture-globale)
2. [Beauty Design System (BDS)](#2-beauty-design-system-bds)
3. [Architecture Technique](#3-architecture-technique)
4. [Système d'Authentification](#4-système-dauthentification)
5. [Types d'Utilisateurs & Routing](#5-types-dutilisateurs--routing)
6. [Système de Crédits](#6-système-de-crédits)
7. [Module Feed Communautaire](#7-module-feed-communautaire)
8. [Module CreateHub](#8-module-createhub)
9. [Module Coconut V14](#9-module-coconut-v14)
10. [Module Creator System](#10-module-creator-system)
11. [Module Enterprise](#11-module-enterprise)
12. [Module API Dashboard](#12-module-api-dashboard)
13. [Backend Architecture](#13-backend-architecture)
14. [Intégrations Externes](#14-intégrations-externes)
15. [Déploiement & Production](#15-déploiement--production)

---

## 1. VISION & ARCHITECTURE GLOBALE

### 1.1 Qu'est-ce que Cortexia ?

**Cortexia Creation Hub** est une plateforme d'intelligence artificielle générative complète qui remplace un UI/UX designer, graphiste, directeur artistique et DOP via une orchestration multi-AI premium.

**Objectif principal :**
Démocratiser la création IA professionnelle pour trois audiences :
- 👤 **Particuliers** : Créateurs, artistes (Feed + CreateHub + Creator System)
- 🏢 **Entreprises** : Marketing, publicité (Coconut V13 Pro + V14 exclusif)
- 💻 **Développeurs** : Intégration API (Dashboard + Documentation)

### 1.2 Architecture Adaptive

```
┌─────────────────────────────────────────────────────────────┐
│              LANDING PAGE (Route Universelle)                │
│                  https://cortexia.app/                       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    👤 PARTICULIER   🏢 ENTREPRISE   💻 DÉVELOPPEUR
        │                │                │
  ┌─────┴─────┐         │          ┌─────┴─────┐
  │           │         │          │           │
Feed +    Creator    Coconut     API      Dashboard
CreateHub  System    V13/V14   Routes    Analytics
  │           │         │          │           │
  └───────────┴─────────┴──────────┴───────────┘
              │
        KV Store (Supabase)
```

### 1.3 Flow Global de Navigation

```typescript
// Route Entry Point
/ → LandingPage.tsx
  ├─ Non-authentifié
  │  ├─ /feed → Feed (read-only)
  │  └─ /login | /signup → Auth Flow
  │
  └─ Authentifié (userId récupéré)
     ├─ Onboarding (si non complété)
     │  └─ UserTypeSelector → Choix type compte
     │
     └─ Redirection selon userType :
        ├─ "individual" → /feed (default home)
        ├─ "enterprise" → /coconut-v14 (default home)
        └─ "developer" → /dashboard (default home)
```

---

## 2. BEAUTY DESIGN SYSTEM (BDS)

### 2.1 Philosophie - Les 7 Arts de Perfection Divine

Le BDS fusionne UI/UX moderne avec une dimension symbolique inspirée des 7 Arts Libéraux :

1. **Grammaire du Design** - Cohérence des composants
2. **Logique du Système** - Parcours utilisateurs évidents
3. **Rhétorique du Message** - Communication impactante
4. **Arithmétique** - Rythme et harmonie visuelle
5. **Géométrie** - Proportions divines (ratios 4/8/16)
6. **Musique** - Rythme visuel & sonore (micro-interactions)
7. **Astronomie** - Vision systémique & perspectives

### 2.2 Palette Coconut Warm (Exclusive)

**Palette Couleurs Principales :**

```css
/* ===== COCONUT WARM PALETTE ===== */

/* Base Colors */
--color-warm-cream: #FFF9F0;      /* Background principal */
--color-warm-sand: #F5EBD9;       /* Background secondaire */
--color-warm-terracotta: #E89B7B; /* Accents chaleureux */
--color-warm-coral: #FF9B85;      /* CTA primaires */
--color-warm-peach: #FFCDB2;      /* Highlights doux */
--color-warm-mocha: #8B6F47;      /* Texte secondaire */
--color-warm-espresso: #3D2817;   /* Texte principal */

/* Gradients Signatures */
--gradient-warm-sunset: linear-gradient(135deg, #FF9B85 0%, #E89B7B 50%, #FFCDB2 100%);
--gradient-warm-glow: linear-gradient(180deg, rgba(255, 249, 240, 0) 0%, rgba(245, 235, 217, 0.8) 100%);
--gradient-warm-radial: radial-gradient(circle at 50% 0%, #FFCDB2 0%, transparent 70%);

/* Glass Effects (Liquid Glass Premium) */
--glass-warm-bg: rgba(255, 249, 240, 0.4);
--glass-warm-border: rgba(232, 155, 123, 0.2);
--glass-warm-shadow: 0 8px 32px rgba(61, 40, 23, 0.08);
--glass-warm-backdrop: blur(20px) saturate(180%);
```

**Utilisation dans Tailwind :**

```tsx
// Background
className="bg-warm-cream"

// Texte
className="text-warm-espresso"

// Gradient (avec text-transparent)
className="bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-transparent bg-clip-text"

// Glass Card
className="bg-warm-cream/40 backdrop-blur-xl border border-warm-terracotta/20 shadow-[0_8px_32px_rgba(61,40,23,0.08)]"
```

### 2.3 Typographie Premium

**Police Principale :** `Inter` (Variable Font)

```css
/* Hiérarchie Typographique */
--font-display: 700;        /* Titres hero */
--font-heading: 600;        /* H1-H3 */
--font-body: 400;           /* Corps de texte */
--font-mono: 'JetBrains Mono'; /* Code */

/* Tailles (Mobile-First) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

**Convention Gradient Text :**

```tsx
// ✅ TOUJOURS utiliser pour les textes importants
<h1 className="text-4xl font-bold bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-transparent bg-clip-text">
  Coconut V14
</h1>
```

### 2.4 Liquid Glass Components

**Principes :**
- Fond translucide avec `backdrop-blur-xl`
- Bordures subtiles colorées avec alpha 0.1-0.3
- Ombres douces multi-niveaux
- Hover states avec glow effects

**Template Glass Card :**

```tsx
<div className="
  relative overflow-hidden
  bg-warm-cream/40
  backdrop-blur-xl
  border border-warm-terracotta/20
  rounded-2xl
  shadow-[0_8px_32px_rgba(61,40,23,0.08)]
  transition-all duration-300
  hover:shadow-[0_12px_48px_rgba(232,155,123,0.15)]
  hover:border-warm-coral/30
">
  {/* Gradient Glow Top */}
  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-warm-peach/10 to-transparent pointer-events-none" />
  
  {/* Content */}
  <div className="relative z-10 p-6">
    {children}
  </div>
</div>
```

### 2.5 Animations & Micro-interactions

**Librairie :** `motion/react` (ex-Framer Motion)

**Presets standards :**

```tsx
import { motion } from 'motion/react';

// Fade In
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Scale Bounce
const scaleBounce = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

// Stagger Children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

**Sons UI :**

```tsx
import { playSound } from '@/lib/sounds';

// Sons disponibles
playSound('success');   // Génération réussie
playSound('click');     // Click bouton
playSound('error');     // Erreur
playSound('notify');    // Notification
playSound('upload');    // Upload fichier
```

### 2.6 Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Ultra-wide
};

// Hook personnalisé
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';

const { isMobile, isTablet, isDesktop } = useBreakpoint();
```

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack Technologique

**Frontend :**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling (avec tokens CSS custom)
- **Motion (Framer Motion)** - Animations
- **Sonner** - Toast notifications
- **Lucide React** - Icons

**Backend :**
- **Supabase Edge Functions** - Serverless API (Deno runtime)
- **Hono** - Web framework (routes backend)
- **KV Store** - Database (Supabase key-value storage)

**Storage :**
- **Supabase Storage** - Fichiers (images, vidéos, références)
- Buckets privés avec signed URLs

**Auth :**
- **Auth0** - Authentification (email/password + OAuth social)
- **Supabase Auth** - Fallback/intégration

### 3.2 Structure des Dossiers

```
/
├── components/
│   ├── landing/          # Landing pages par type user
│   ├── auth/             # Login, Signup, Auth0 callback
│   ├── onboarding/       # Onboarding flows
│   ├── create/           # CreateHub (generation simple)
│   ├── coconut-v14/      # Coconut V14 (orchestration premium)
│   ├── feed/             # Feed communautaire (remixes, chains)
│   ├── enterprise/       # Enterprise subscription UI
│   ├── ui/               # Base UI components (shadcn-style)
│   ├── ui-premium/       # Premium components (BDS liquid glass)
│   └── shared/           # Shared utilities
│
├── lib/
│   ├── contexts/         # React contexts (Auth, Credits, Queue)
│   ├── hooks/            # Custom hooks
│   ├── api/              # API client functions
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper utilities
│   ├── constants/        # Constants (BDS tokens, pricing)
│   └── sounds.ts         # UI sound effects
│
├── supabase/functions/server/
│   ├── index.tsx         # Main server entrypoint
│   ├── kv_store.tsx      # KV Store wrapper (PROTECTED)
│   ├── auth-routes.tsx   # Auth endpoints
│   ├── credits-manager.ts # Credits logic
│   ├── enterprise-subscription.ts # Enterprise credits system
│   ├── coconut-v14-*.ts  # Coconut V14 routes
│   ├── feed-routes.ts    # Feed API
│   └── stripe-*.ts       # Stripe payments
│
├── styles/
│   ├── globals.css       # Global styles + Tailwind v4 setup
│   └── tokens.css        # BDS design tokens
│
└── App.tsx               # Main app component (routing)
```

### 3.3 Routing Principal (App.tsx)

```tsx
// App.tsx structure
import { AuthProvider } from './lib/contexts/AuthContext';
import { CreditsProvider } from './lib/contexts/CreditsContext';
import { useAuth } from './lib/contexts/AuthContext';

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Public routes (no auth required)
  if (location.pathname === '/') {
    return <LandingPage />;
  }
  
  if (location.pathname === '/feed' && !user) {
    return <ForYouFeed readOnly />;
  }
  
  // Auth routes
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) {
    return <AuthFlow />;
  }
  
  // Protected routes (auth required)
  if (!user && !loading) {
    return <Navigate to="/login" />;
  }
  
  // Onboarding check
  if (user && !user.onboardingCompleted) {
    return <OnboardingFlow />;
  }
  
  // Main app routes (authenticated)
  return (
    <Routes>
      {/* Particulier */}
      <Route path="/feed" element={<ForYouFeed />} />
      <Route path="/create" element={<CreateHubGlass />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/creator-dashboard" element={<CreatorDashboard />} />
      
      {/* Enterprise */}
      <Route path="/coconut-v14" element={<CoconutV14App />} />
      <Route path="/enterprise/subscription" element={<EnterpriseSubscriptionManager />} />
      
      {/* Developer */}
      <Route path="/dashboard" element={<DeveloperDashboard />} />
      <Route path="/api-docs" element={<APIDocumentation />} />
      
      {/* Shared */}
      <Route path="/settings" element={<Settings />} />
      
      {/* Default redirect based on userType */}
      <Route path="*" element={<Navigate to={getDefaultRoute(user.type)} />} />
    </Routes>
  );
}

function getDefaultRoute(userType: string) {
  switch (userType) {
    case 'enterprise': return '/coconut-v14';
    case 'developer': return '/dashboard';
    default: return '/feed';
  }
}
```

---

## 4. SYSTÈME D'AUTHENTIFICATION

### 4.1 Auth0 Integration (Primary)

**Provider :** Auth0 (SaaS)

**Configuration requise (secrets Supabase) :**
```
VITE_AUTH0_DOMAIN=<tenant>.auth0.com
VITE_AUTH0_CLIENT_ID=<client_id>
VITE_AUTH0_REDIRECT_URI=https://cortexia.app/auth/callback
```

**Flow Signup :**

```typescript
// components/auth/SignupPage.tsx
import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  cacheLocation: 'localstorage',
  useRefreshTokens: true
});

// Signup avec email/password
async function handleSignup(email: string, password: string, userType: 'individual' | 'enterprise' | 'developer') {
  await auth0.loginWithRedirect({
    authorizationParams: {
      screen_hint: 'signup',
      login_hint: email,
      // Store userType in app_metadata during signup (Auth0 Action required)
      userType: userType
    }
  });
}

// Social login (Google, GitHub, Apple)
async function handleSocialLogin(connection: 'google-oauth2' | 'github' | 'apple') {
  await auth0.loginWithRedirect({
    authorizationParams: {
      connection: connection
    }
  });
}
```

**Callback Handler :**

```typescript
// components/auth/Auth0CallbackPage.tsx
async function handleCallback() {
  try {
    const result = await auth0.handleRedirectCallback();
    const user = await auth0.getUser();
    
    // Create/sync user in backend
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        userType: user.user_metadata?.userType || 'individual'
      })
    });
    
    const { userId } = await response.json();
    
    // Store in context
    setUser({ ...user, id: userId });
    
    // Redirect to onboarding or default route
    navigate(user.onboardingCompleted ? getDefaultRoute(user.userType) : '/onboarding');
  } catch (error) {
    console.error('Auth callback error:', error);
    navigate('/login?error=callback_failed');
  }
}
```

### 4.2 Backend User Management

**KV Store Keys :**

```typescript
// User profile
`user:profile:${userId}` → {
  id: string;           // UUID Supabase (primary)
  auth0Id: string;      // Auth0 sub
  email: string;
  name: string;
  picture: string;
  userType: 'individual' | 'enterprise' | 'developer';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// User type mapping (fast lookup)
`user:type:${userId}` → 'individual' | 'enterprise' | 'developer'
```

**Backend Routes :**

```typescript
// supabase/functions/server/auth-routes.tsx

// POST /auth/sync-user - Create/update user from Auth0
app.post('/auth/sync-user', async (c) => {
  const { auth0Id, email, name, picture, userType } = await c.req.json();
  
  // Check if user exists
  let user = await kv.get(`user:auth0:${auth0Id}`);
  
  if (!user) {
    // Create new user
    const userId = crypto.randomUUID();
    user = {
      id: userId,
      auth0Id,
      email,
      name,
      picture,
      userType,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:profile:${userId}`, user);
    await kv.set(`user:auth0:${auth0Id}`, userId); // Mapping
    await kv.set(`user:type:${userId}`, userType);
  } else {
    // Update existing user
    const userId = user;
    const profile = await kv.get(`user:profile:${userId}`);
    profile.name = name;
    profile.picture = picture;
    profile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, profile);
  }
  
  return c.json({ success: true, userId: user.id || user });
});

// GET /auth/user/:userId - Get user profile
app.get('/auth/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (!profile) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({ success: true, user: profile });
});
```

---

## 5. TYPES D'UTILISATEURS & ROUTING

### 5.1 Individual User (Particulier)

**Default Route :** `/feed`

**Accès :**
- ✅ Feed communautaire (like, comment, remix, download)
- ✅ CreateHub (génération simple images/vidéos/avatars)
- ✅ Creator Dashboard (stats, earnings si Top Creator)
- ✅ Profile & Settings
- ❌ Coconut V14 (sauf si Top Creator actif)
- ❌ Enterprise features
- ❌ API Dashboard

**Crédits :**
- 0 crédits gratuits mensuels (supprimés)
- Achat crédits : $0.10/crédit (minimum 100 crédits = $10)
- Crédits paid n'expirent jamais

**Onboarding Flow :**
1. Bienvenue + Objectifs (découverte, création, partage)
2. Préférences style (modern, vintage, minimal, artistic, etc.)
3. Tutorial rapide Feed + CreateHub
4. → Redirection `/feed`

### 5.2 Enterprise User

**Default Route :** `/coconut-v14`

**Accès :**
- ✅ Coconut V13 Pro (orchestration avancée - DEPRECATED mais visible)
- ✅ Coconut V14 (orchestration premium exclusive)
- ✅ Enterprise Dashboard (analytics, team management)
- ✅ Feed communautaire (lecture seule - inspiration)
- ❌ CreateHub (non nécessaire, Coconut suffisant)
- ❌ Creator System (non applicable)
- ❌ API Dashboard (option séparée si souscription Developer add-on)

**Subscription :**
- **Plan Unique :** $999/mois (récurrent via Stripe Subscriptions)
- **Crédits inclus :** 10,000 crédits mensuels (reset tous les 30 jours)
- **Add-on credits :** $0.09/crédit (Enterprise discount, minimum 1,000 = $90)
- **Usage :** Crédits mensuels d'abord, puis add-on credits
- **Sécurité :** Add-on credits utilisables SEULEMENT si subscription active

**Onboarding Flow :**
1. Bienvenue + Cas d'usage (marketing, publicité, social media)
2. Setup organisation (nom, logo, charte graphique upload)
3. Payment setup (Stripe Checkout → $999/mois)
4. Tutorial Coconut V14 (modes, workflow, CocoBoards)
5. → Redirection `/coconut-v14`

### 5.3 Developer User

**Default Route :** `/dashboard`

**Accès :**
- ✅ API Dashboard (keys, usage, limits, analytics)
- ✅ API Documentation (endpoints, examples, SDKs)
- ✅ Feed communautaire (read-only)
- ❌ CreateHub (doit utiliser API)
- ❌ Coconut V14 (doit utiliser API endpoints)
- ❌ Creator System (non applicable)

**API Pricing :**
- **Pricing :** Pay-as-you-go, $0.10/crédit
- **Rate Limits :** 100 req/min (burst: 200)
- **Webhooks :** Supported (generation complete, errors)

**Onboarding Flow :**
1. Bienvenue + Use case (intégration, automation, app)
2. Génération API key (display once, copy to clipboard)
3. Quick Start guide (curl examples, SDKs)
4. Credits package (minimum 1,000 crédits = $100)
5. → Redirection `/dashboard`

---

## 6. SYSTÈME DE CRÉDITS

### 6.1 Architecture Crédits

**KV Store Structure :**

```typescript
// INDIVIDUAL/DEVELOPER USERS
`credits:${userId}:paid` → number  // Paid credits (never expire)

// ENTERPRISE USERS
`enterprise:subscription:${userId}` → {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'unpaid';
  
  // Monthly credits (reset every 30 days)
  monthlyCredits: 10000;
  subscriptionCreditsUsed: number;
  subscriptionCreditsRemaining: number;
  
  // Add-on credits (never expire)
  addOnCredits: number;  // Read from credits:${userId}:paid
  
  // Total available
  totalCredits: number;  // subscriptionCreditsRemaining + addOnCredits
  
  // Billing
  nextResetDate: string;  // ISO date (30 days from subscription start)
  currentPeriodStart: string;
  currentPeriodEnd: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 Credits Manager (Backend)

```typescript
// supabase/functions/server/credits-manager.ts

export async function getUserCredits(userId: string): Promise<{
  free: number;
  paid: number;
}> {
  // Check if Enterprise user
  const enterpriseSub = await getEnterpriseSubscription(userId);
  if (enterpriseSub) {
    return {
      free: 0,
      paid: enterpriseSub.addOnCredits  // Only add-on credits in "paid" field
    };
  }
  
  // Individual/Developer user
  const paidCredits = await kv.get(`credits:${userId}:paid`) || 0;
  
  return {
    free: 0,  // No more free credits
    paid: Number(paidCredits)
  };
}

export async function deductCredits(userId: string, amount: number, reason?: string): Promise<void> {
  // Check if Enterprise
  const enterpriseSub = await getEnterpriseSubscription(userId);
  
  if (enterpriseSub) {
    // Enterprise: Use monthly credits first, then add-on
    return await deductEnterpriseCredits(userId, amount, reason);
  }
  
  // Individual/Developer: Deduct from paid
  const currentPaid = await kv.get(`credits:${userId}:paid`) || 0;
  const newPaid = Number(currentPaid) - amount;
  
  if (newPaid < 0) {
    throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentPaid}`);
  }
  
  await kv.set(`credits:${userId}:paid`, newPaid);
  
  // Log transaction
  await logTransaction({
    userId,
    amount: -amount,
    type: 'usage',
    reason: reason || 'Generation',
    timestamp: new Date().toISOString(),
    balanceBefore: Number(currentPaid),
    balanceAfter: newPaid
  });
}
```

### 6.3 Frontend Credits Context

```typescript
// lib/contexts/CreditsContext.tsx

export interface UserCredits {
  free: number;
  paid: number;
  
  // Enterprise fields (if applicable)
  isEnterprise?: boolean;
  monthlyCredits?: number;
  monthlyCreditsRemaining?: number;
  addOnCredits?: number;
  nextResetDate?: string;
}

export function CreditsProvider({ children, userId }: CreditsProviderProps) {
  const [credits, setCredits] = useState<UserCredits>({ free: 0, paid: 0 });
  
  // Fetch credits from backend
  const refetchCredits = async () => {
    const response = await fetch(`/api/credits/${userId}`);
    const data = await response.json();
    setCredits(data.credits);
  };
  
  // Deduct credits (optimistic update)
  const deductCredits = async (amount: number) => {
    // Optimistic update
    setCredits(prev => ({
      ...prev,
      paid: prev.paid - amount
    }));
    
    // Backend call
    try {
      await fetch(`/api/credits/${userId}/deduct`, {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
    } catch (error) {
      // Rollback on error
      refetchCredits();
      throw error;
    }
  };
  
  // Get total credits
  const getTotalCredits = () => {
    if (credits.isEnterprise) {
      return (credits.monthlyCreditsRemaining || 0) + (credits.addOnCredits || 0);
    }
    return credits.paid;
  };
  
  return (
    <CreditsContext.Provider value={{ credits, refetchCredits, deductCredits, getTotalCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}
```

### 6.4 Credits Display Component

```tsx
// components/shared/CreditsWidget.tsx

export function CreditsWidget() {
  const { credits, getTotalCredits } = useCredits();
  const { user } = useAuth();
  
  if (user.type === 'enterprise') {
    return (
      <div className="flex flex-col gap-2 p-4 bg-warm-cream/40 backdrop-blur-xl rounded-xl border border-warm-terracotta/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-mocha">Crédits totaux</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-transparent bg-clip-text">
            {getTotalCredits().toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-warm-mocha">
          <span>{credits.monthlyCreditsRemaining?.toLocaleString()} mensuels</span>
          <span>•</span>
          <span>{credits.addOnCredits?.toLocaleString()} add-on</span>
        </div>
        
        <div className="text-xs text-warm-mocha/60">
          Reset: {new Date(credits.nextResetDate!).toLocaleDateString()}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-warm-cream/40 backdrop-blur-xl rounded-full border border-warm-terracotta/20">
      <Coins className="w-4 h-4 text-warm-coral" />
      <span className="font-semibold text-warm-espresso">
        {getTotalCredits().toLocaleString()}
      </span>
      <button onClick={() => navigate('/purchase-credits')} className="text-xs text-warm-coral hover:underline">
        Top Up
      </button>
    </div>
  );
}
```

---

## 7. MODULE FEED COMMUNAUTAIRE

### 7.1 Architecture Feed

**Concept :** TikTok-style vertical scroll feed pour découvrir et interagir avec les créations IA

**Fichiers principaux :**
- `components/ForYouFeed.tsx` - Main feed component
- `components/PostDetailView.tsx` - Full-screen post view
- `components/CommentsSheet.tsx` - Comments bottom sheet
- `components/RemixScreen.tsx` - Remix flow
- `supabase/functions/server/feed-routes.ts` - Backend API

### 7.2 Feed Structure (KV Store)

```typescript
// Post data
`feed:post:${postId}` → {
  id: string;
  userId: string;           // Creator
  username: string;
  userAvatar: string;
  verified: boolean;
  
  // Content
  type: 'image' | 'video';
  imageUrl?: string;        // Signed URL (Supabase Storage)
  videoUrl?: string;        // Signed URL
  thumbnailUrl?: string;
  caption: string;
  
  // Generation metadata
  prompt: string;
  model: string;
  settings: {
    aspectRatio?: string;
    resolution?: string;
    style?: string;
  };
  
  // Stats
  likes: number;
  comments: number;
  remixes: number;
  downloads: number;
  views: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// User interactions
`feed:like:${userId}:${postId}` → true | null
`feed:bookmark:${userId}:${postId}` → true | null

// Comments
`feed:comment:${commentId}` → {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  createdAt: string;
}

// Remix chain
`feed:remix:${originalPostId}:${remixId}` → postId
```

### 7.3 Feed Component Implementation

```tsx
// components/ForYouFeed.tsx

export function ForYouFeed({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);
  
  async function fetchPosts() {
    const response = await fetch('/api/feed/posts?limit=20');
    const data = await response.json();
    setPosts(data.posts);
    setIsLoading(false);
  }
  
  // Navigation handlers
  const goToNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Load more posts
      fetchPosts();
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Keyboard navigation
  useKeyboardShortcuts({
    ArrowDown: goToNext,
    ArrowUp: goToPrevious,
    Space: () => toggleLike(posts[currentIndex].id)
  });
  
  // Touch gestures
  const bind = useSwipeable({
    onSwipedUp: goToNext,
    onSwipedDown: goToPrevious,
    preventScrollOnSwipe: true
  });
  
  const currentPost = posts[currentIndex];
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-warm-espresso" {...bind}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPost?.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {currentPost && (
            <PostDetailView
              post={currentPost}
              readOnly={readOnly || !user}
              onLike={() => handleLike(currentPost.id)}
              onComment={() => setShowComments(true)}
              onRemix={() => setShowRemix(true)}
              onShare={() => handleShare(currentPost)}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
        {posts.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
      
      {/* Comments Sheet */}
      {showComments && (
        <CommentsSheet
          postId={currentPost.id}
          onClose={() => setShowComments(false)}
        />
      )}
      
      {/* Remix Screen */}
      {showRemix && (
        <RemixScreen
          originalPost={currentPost}
          onClose={() => setShowRemix(false)}
        />
      )}
    </div>
  );
}
```

### 7.4 Post Interactions

```tsx
// Like
async function handleLike(postId: string) {
  // Optimistic update
  setLiked(!liked);
  setLikes(likes + (liked ? -1 : 1));
  
  // Backend
  await fetch(`/api/feed/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Sound effect
  if (!liked) playSound('like');
}

// Comment
function handleComment() {
  setShowCommentsSheet(true);
}

// Remix
function handleRemix() {
  navigate(`/remix/${postId}`);
}

// Download
async function handleDownload() {
  const response = await fetch(`/api/feed/posts/${postId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const blob = await response.blob();
  saveAs(blob, `cortexia-${postId}.${post.type === 'image' ? 'png' : 'mp4'}`);
  
  playSound('success');
}
```

---

## 8. MODULE CREATEHUB

### 8.1 Architecture CreateHub

**Concept :** Interface simplifiée de génération pour utilisateurs Individual

**Fichiers principaux :**
- `components/create/CreateHubGlass.tsx` - Main hub
- `components/create/tools/TextToImageV3.tsx` - Image generation
- `components/create/tools/VideoTool.tsx` - Video generation
- `components/avatar/InfiniteTalkSimpleView.tsx` - Avatar generation

### 8.2 CreateHub Layout

```tsx
// components/create/CreateHubGlass.tsx

export function CreateHubGlass() {
  const [selectedTool, setSelectedTool] = useState<'image' | 'video' | 'avatar' | null>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-warm-sand to-warm-peach/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-warm-cream/80 border-b border-warm-terracotta/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-transparent bg-clip-text">
            CreateHub
          </h1>
          
          <CreditsWidget />
        </div>
      </header>
      
      {/* Tool Selection or Active Tool */}
      {!selectedTool ? (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToolCard
              icon={<Image />}
              title="Image Generation"
              description="Create stunning images from text or references"
              onClick={() => setSelectedTool('image')}
            />
            
            <ToolCard
              icon={<Video />}
              title="Video Generation"
              description="Generate videos from text descriptions"
              onClick={() => setSelectedTool('video')}
            />
            
            <ToolCard
              icon={<User />}
              title="Talking Avatar"
              description="Animate portraits with AI voice"
              onClick={() => setSelectedTool('avatar')}
            />
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedTool(null)}
            className="mb-4 text-warm-mocha hover:text-warm-espresso flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to tools
          </button>
          
          {selectedTool === 'image' && <TextToImageV3 />}
          {selectedTool === 'video' && <VideoTool />}
          {selectedTool === 'avatar' && <InfiniteTalkSimpleView />}
        </div>
      )}
    </div>
  );
}
```

### 8.3 Image Generation Tool

```tsx
// components/create/tools/TextToImageV3.tsx

export function TextToImageV3() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-2-pro');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [references, setReferences] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const { deductCredits, hasEnoughCredits } = useCredits();
  
  // Calculate cost
  const cost = calculateCost(model, resolution);
  
  async function handleGenerate() {
    // Check credits
    if (!hasEnoughCredits(cost)) {
      toast.error('Insufficient credits');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Upload references if any
      const referenceUrls = await uploadReferences(references);
      
      // Call generation API
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio,
          resolution,
          references: referenceUrls
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      // Deduct credits
      await deductCredits(cost);
      
      // Set result
      setResult(data.imageUrl);
      
      // Play success sound
      playSound('success');
      
      // Show success toast
      toast.success('Image generated!', {
        description: `${cost} credits used`
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed', {
        description: error.message
      });
      playSound('error');
    } finally {
      setIsGenerating(false);
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Controls */}
      <div className="space-y-6">
        {/* Prompt */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20">
          <label className="block text-sm font-medium text-warm-espresso mb-2">
            Describe your image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain landscape at sunset..."
            className="w-full h-32 px-4 py-3 bg-white/50 backdrop-blur border border-warm-terracotta/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-warm-coral"
          />
        </div>
        
        {/* Model Selection */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20">
          <label className="block text-sm font-medium text-warm-espresso mb-3">
            Model
          </label>
          <div className="grid grid-cols-2 gap-3">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  model === m.id
                    ? 'border-warm-coral bg-warm-coral/10'
                    : 'border-warm-terracotta/20 bg-white/30 hover:border-warm-coral/50'
                }`}
              >
                <div className="font-semibold text-warm-espresso">{m.name}</div>
                <div className="text-xs text-warm-mocha mt-1">{m.cost} credits</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Aspect Ratio */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20">
          <label className="block text-sm font-medium text-warm-espresso mb-3">
            Aspect Ratio
          </label>
          <div className="flex gap-2">
            {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  aspectRatio === ratio
                    ? 'bg-warm-coral text-white'
                    : 'bg-white/30 text-warm-espresso hover:bg-warm-coral/20'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        
        {/* References Upload */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20">
          <label className="block text-sm font-medium text-warm-espresso mb-3">
            Reference Images (optional)
          </label>
          <SmartMultiImageUpload
            maxFiles={8}
            onUpload={(files) => setReferences(files)}
          />
        </div>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="w-full py-4 bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </span>
          ) : (
            <span>Generate ({cost} credits)</span>
          )}
        </button>
      </div>
      
      {/* Right: Preview */}
      <div className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20">
        {result ? (
          <div className="space-y-4">
            <img src={result} alt="Generated" className="w-full rounded-xl" />
            
            <div className="flex gap-3">
              <button
                onClick={() => downloadImage(result)}
                className="flex-1 py-3 bg-warm-coral text-white rounded-xl hover:bg-warm-coral/90 transition-all"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
              
              <button
                onClick={() => publishToFeed(result)}
                className="flex-1 py-3 bg-warm-terracotta text-white rounded-xl hover:bg-warm-terracotta/90 transition-all"
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                Publish
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-warm-mocha">
            <div className="text-center">
              <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your generated image will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 9. MODULE COCONUT V14

### 9.1 Architecture Coconut V14

**Concept :** Orchestration premium multi-AI remplaçant complètement un UI/UX designer professionnel

**Accès :** Enterprise users UNIQUEMENT (ou Top Creators actifs)

**Fichiers principaux :**
- `components/coconut-v14/CoconutV14App.tsx` - Main app
- `components/coconut-v14/DashboardPremium.tsx` - Dashboard
- `components/coconut-v14/IntentInputPremium.tsx` - Intent input
- `components/coconut-v14/AnalysisViewPremium.tsx` - Analysis phase
- `components/coconut-v14/GenerationViewPremium.tsx` - Generation phase
- `components/coconut-v14/CocoBoardPremium.tsx` - Results board

### 9.2 Coconut V14 Workflow

```
1. Intent Input (User describes project)
   ↓
2. AI Analysis (Gemini 2.5 Flash via Replicate)
   - Extract intent, goals, context
   - Generate creative directions (6-10 variants)
   - Suggest specs (resolution, style, mood)
   ↓
3. Direction Selection (User chooses 1-3 directions)
   ↓
4. Generation (Flux 2 Pro via Kie AI)
   - Parallel generation of selected directions
   - Real-time progress tracking
   ↓
5. CocoBoard (Results + Iterations)
   - Compare variants side-by-side
   - Iterate on selected
   - Export finals
```

### 9.3 Coconut V14 Main Component

```tsx
// components/coconut-v14/CoconutV14App.tsx

type Phase = 'input' | 'analyzing' | 'analysis' | 'generating' | 'cocoboard';

export function CoconutV14App() {
  const [phase, setPhase] = useState<Phase>('input');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [generationData, setGenerationData] = useState<GenerationResult | null>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-warm-sand to-warm-peach/20">
      {/* Navigation Header */}
      <NavigationPremium currentPhase={phase} />
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <IntentInputPremium
            onSubmit={(data) => {
              setProjectData(data);
              setPhase('analyzing');
              startAnalysis(data);
            }}
          />
        )}
        
        {phase === 'analyzing' && (
          <AnalyzingLoaderPremium />
        )}
        
        {phase === 'analysis' && analysisData && (
          <AnalysisViewPremium
            analysis={analysisData}
            onSelectDirections={(directions) => {
              setPhase('generating');
              startGeneration(directions);
            }}
          />
        )}
        
        {phase === 'generating' && (
          <GenerationViewPremium
            onComplete={(results) => {
              setGenerationData(results);
              setPhase('cocoboard');
            }}
          />
        )}
        
        {phase === 'cocoboard' && generationData && (
          <CocoBoardPremium
            project={projectData}
            results={generationData}
            onIterate={(direction) => {
              setPhase('generating');
              startIteration(direction);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 9.4 Intent Input (Phase 1)

```tsx
// components/coconut-v14/IntentInputPremium.tsx

export function IntentInputPremium({ onSubmit }: IntentInputPremiumProps) {
  const [intent, setIntent] = useState('');
  const [type, setType] = useState<'image' | 'video' | 'campaign'>('image');
  const [references, setReferences] = useState<File[]>([]);
  const [brandGuidelines, setBrandGuidelines] = useState<File | null>(null);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-transparent bg-clip-text">
            Coconut V14
          </h1>
          <p className="text-lg text-warm-mocha">
            Professional AI orchestration for creative excellence
          </p>
        </div>
        
        {/* Type Selector */}
        <TypeSelectorPremium
          selected={type}
          onChange={setType}
        />
        
        {/* Intent Input */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20 shadow-[0_8px_32px_rgba(61,40,23,0.08)]">
          <label className="block text-sm font-semibold text-warm-espresso mb-3">
            Describe your project
          </label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="I need a hero image for a luxury watch brand. The image should convey sophistication, precision, and timeless elegance..."
            className="w-full h-48 px-6 py-4 bg-white/60 backdrop-blur border border-warm-terracotta/20 rounded-2xl resize-none text-lg focus:outline-none focus:ring-2 focus:ring-warm-coral transition-all"
          />
          <div className="mt-2 text-xs text-warm-mocha">
            Be specific about goals, audience, mood, and constraints
          </div>
        </div>
        
        {/* References Upload */}
        <DragDropUpload
          label="Reference Images"
          description="Upload images that inspire your vision (optional, max 8)"
          accept="image/*"
          multiple
          maxFiles={8}
          onUpload={setReferences}
        />
        
        {/* Brand Guidelines */}
        {type === 'campaign' && (
          <DragDropUpload
            label="Brand Guidelines"
            description="Upload your brand book (PDF)"
            accept=".pdf"
            onUpload={(files) => setBrandGuidelines(files[0])}
          />
        )}
        
        {/* Submit */}
        <button
          onClick={() => onSubmit({ intent, type, references, brandGuidelines })}
          disabled={!intent}
          className="w-full py-5 bg-gradient-to-r from-warm-coral via-warm-terracotta to-warm-peach text-white text-lg font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
}
```

### 9.5 Analysis View (Phase 3)

```tsx
// components/coconut-v14/AnalysisViewPremium.tsx

export function AnalysisViewPremium({ analysis, onSelectDirections }: AnalysisViewPremiumProps) {
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  
  const toggleDirection = (id: string) => {
    setSelectedDirections(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Analysis Summary */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
            Analysis Complete
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-warm-mocha mb-1">Intent</div>
              <div className="font-semibold text-warm-espresso">{analysis.intent}</div>
            </div>
            
            <div>
              <div className="text-sm text-warm-mocha mb-1">Target Audience</div>
              <div className="font-semibold text-warm-espresso">{analysis.audience}</div>
            </div>
            
            <div>
              <div className="text-sm text-warm-mocha mb-1">Mood</div>
              <div className="font-semibold text-warm-espresso">{analysis.mood}</div>
            </div>
          </div>
        </div>
        
        {/* Creative Directions */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-warm-espresso">
            Creative Directions ({analysis.directions.length} variants)
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.directions.map(direction => (
              <DirectionCard
                key={direction.id}
                direction={direction}
                selected={selectedDirections.includes(direction.id)}
                onToggle={() => toggleDirection(direction.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="sticky bottom-0 bg-warm-cream/80 backdrop-blur-xl border-t border-warm-terracotta/20 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="text-sm text-warm-mocha">
              {selectedDirections.length} direction{selectedDirections.length > 1 ? 's' : ''} selected
            </div>
            
            <button
              onClick={() => onSelectDirections(selectedDirections)}
              disabled={selectedDirections.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-warm-coral to-warm-terracotta text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              Generate Images ({selectedDirections.length * 15} credits)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 9.6 Generation Progress (Phase 4)

```tsx
// components/coconut-v14/GenerationViewPremium.tsx

export function GenerationViewPremium({ onComplete }: GenerationViewPremiumProps) {
  const [progress, setProgress] = useState<GenerationProgress[]>([]);
  
  useEffect(() => {
    // Subscribe to progress updates via SSE or polling
    const eventSource = new EventSource(`/api/coconut-v14/generation-progress?projectId=${projectId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      
      if (data.status === 'completed') {
        eventSource.close();
        onComplete(data.results);
        playSound('success');
      }
    };
    
    return () => eventSource.close();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
            Generating Your Images
          </h2>
          <p className="text-warm-mocha">
            Our AI is crafting {progress.length} professional visuals...
          </p>
        </div>
        
        <div className="space-y-4">
          {progress.map(item => (
            <div
              key={item.id}
              className="bg-warm-cream/40 backdrop-blur-xl rounded-2xl p-6 border border-warm-terracotta/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-warm-espresso">
                  {item.directionName}
                </div>
                <div className="text-sm text-warm-mocha">
                  {item.status === 'completed' ? '✓ Complete' : `${item.progress}%`}
                </div>
              </div>
              
              <div className="h-2 bg-warm-sand rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-warm-coral to-warm-terracotta"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.directionName}
                  className="mt-4 w-full rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 9.7 CocoBoard (Phase 5)

```tsx
// components/coconut-v14/CocoBoardPremium.tsx

export function CocoBoardPremium({ project, results, onIterate }: CocoBoardPremiumProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  
  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Sidebar */}
      <CocoBoardSidebarPremium
        project={project}
        results={results}
        onExport={() => exportCocoBoard(results)}
      />
      
      {/* Main Canvas */}
      <div className="ml-80 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
            CocoBoard
          </h2>
          
          <div className="flex gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg transition-all ${
                compareMode
                  ? 'bg-warm-coral text-white'
                  : 'bg-white/60 text-warm-espresso hover:bg-warm-coral/20'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Compare Mode
            </button>
            
            <button
              onClick={() => exportCocoBoard(results)}
              className="px-4 py-2 bg-gradient-to-r from-warm-coral to-warm-terracotta text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export All
            </button>
          </div>
        </div>
        
        {/* Results Grid */}
        {compareMode ? (
          <div className="grid grid-cols-2 gap-6">
            {results.map(result => (
              <ImageCard
                key={result.id}
                result={result}
                onSelect={() => setSelectedImage(result.id)}
                onIterate={() => onIterate(result)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {results.map(result => (
              <ImageCard
                key={result.id}
                result={result}
                onSelect={() => setSelectedImage(result.id)}
                onIterate={() => onIterate(result)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          imageUrl={results.find(r => r.id === selectedImage)?.imageUrl}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
```

---

## 10. MODULE CREATOR SYSTEM

### 10.1 Architecture Creator System

**Concept :** Programme de récompenses permettant aux créateurs actifs de débloquer Coconut V14 et gagner des commissions

**Critères Top Creator (mensuels) :**
- ✅ 60 créations générées (images/vidéos/avatars)
- ✅ 5 posts publiés dans le feed
- ✅ 5+ likes moyens par post

**Récompenses :**
- 🥥 Accès Coconut V14 (tant que status actif)
- 💰 10% commission lifetime sur achats crédits de filleuls
- 🎁 Origins tokens (futur système de compensation)

### 10.2 Creator Dashboard

```tsx
// components/CreatorDashboard.tsx

export function CreatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isTopCreator, setIsTopCreator] = useState(false);
  
  useEffect(() => {
    fetchCreatorStats();
  }, []);
  
  async function fetchCreatorStats() {
    const response = await fetch(`/api/creator/stats/${user.id}`);
    const data = await response.json();
    setStats(data.stats);
    setIsTopCreator(data.isTopCreator);
  }
  
  const progress = {
    creations: (stats?.creationsThisMonth || 0) / 60,
    posts: (stats?.postsThisMonth || 0) / 5,
    avgLikes: Math.min((stats?.avgLikesPerPost || 0) / 5, 1)
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Status Badge */}
        <div className={`p-8 rounded-3xl border-2 ${
          isTopCreator
            ? 'bg-gradient-to-br from-warm-coral/20 to-warm-peach/20 border-warm-coral'
            : 'bg-warm-cream/40 border-warm-terracotta/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
                Creator Status
              </h1>
              <p className="text-warm-mocha">
                {isTopCreator ? (
                  '🎉 You are a Top Creator! Coconut V14 is unlocked.'
                ) : (
                  'Keep creating to unlock Top Creator benefits'
                )}
              </p>
            </div>
            
            {isTopCreator && (
              <div className="flex items-center gap-2 px-6 py-3 bg-warm-coral text-white rounded-full font-semibold">
                <Crown className="w-5 h-5" />
                Top Creator
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Creations"
            current={stats?.creationsThisMonth || 0}
            target={60}
            progress={progress.creations}
            icon={<Sparkles />}
          />
          
          <ProgressCard
            title="Posts Published"
            current={stats?.postsThisMonth || 0}
            target={5}
            progress={progress.posts}
            icon={<Upload />}
          />
          
          <ProgressCard
            title="Avg. Likes/Post"
            current={stats?.avgLikesPerPost || 0}
            target={5}
            progress={progress.avgLikes}
            icon={<Heart />}
          />
        </div>
        
        {/* Benefits */}
        {isTopCreator && (
          <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20">
            <h3 className="text-xl font-semibold mb-6 text-warm-espresso">
              Your Benefits
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BenefitCard
                icon={<Crown />}
                title="Coconut V14 Access"
                description="Full access to professional AI orchestration"
                action={
                  <button
                    onClick={() => navigate('/coconut-v14')}
                    className="mt-4 px-4 py-2 bg-warm-coral text-white rounded-lg hover:bg-warm-coral/90 transition-all"
                  >
                    Open Coconut
                  </button>
                }
              />
              
              <BenefitCard
                icon={<DollarSign />}
                title="Referral Commissions"
                description="Earn 10% lifetime on referrals"
                action={
                  <div className="mt-4 text-2xl font-bold text-warm-coral">
                    ${stats?.referralEarnings || 0}
                  </div>
                }
              />
              
              <BenefitCard
                icon={<Gift />}
                title="Origins Tokens"
                description="Future compensation system"
                action={
                  <div className="mt-4 text-sm text-warm-mocha">
                    Coming soon
                  </div>
                }
              />
            </div>
          </div>
        )}
        
        {/* Referral Link */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20">
          <h3 className="text-xl font-semibold mb-4 text-warm-espresso">
            Your Referral Link
          </h3>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={`https://cortexia.app/?ref=${stats?.referralCode}`}
              readOnly
              className="flex-1 px-4 py-3 bg-white/60 border border-warm-terracotta/20 rounded-xl"
            />
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://cortexia.app/?ref=${stats?.referralCode}`);
                toast.success('Link copied!');
              }}
              className="px-6 py-3 bg-warm-coral text-white rounded-xl hover:bg-warm-coral/90 transition-all"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4 text-sm text-warm-mocha">
            Share this link to earn 10% commission on all credit purchases from your referrals
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 10.3 Backend Creator Stats

```typescript
// supabase/functions/server/creator-routes.ts

app.get('/creator/stats/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  // Get creator stats
  const stats = await kv.get(`creator:stats:${userId}`);
  
  if (!stats) {
    // Initialize empty stats
    const newStats = {
      creationsThisMonth: 0,
      postsThisMonth: 0,
      totalLikes: 0,
      avgLikesPerPost: 0,
      referralEarnings: 0,
      referralCode: generateReferralCode()
    };
    
    await kv.set(`creator:stats:${userId}`, newStats);
    
    return c.json({
      success: true,
      stats: newStats,
      isTopCreator: false
    });
  }
  
  // Check if Top Creator
  const isTopCreator =
    stats.creationsThisMonth >= 60 &&
    stats.postsThisMonth >= 5 &&
    stats.avgLikesPerPost >= 5;
  
  return c.json({
    success: true,
    stats,
    isTopCreator
  });
});
```

---

## 11. MODULE ENTERPRISE

### 11.1 Enterprise Subscription System

**Plan :** $999/mois (Stripe Subscriptions récurrent)

**Crédits :**
- 10,000 crédits mensuels inclus (reset tous les 30 jours)
- Add-on credits: $0.09/crédit (minimum 1,000 = $90)
- Usage: Monthly credits first, puis add-on credits
- **Sécurité critique :** Add-on credits utilisables SEULEMENT si subscription active

### 11.2 Subscription Manager UI

```tsx
// components/enterprise/EnterpriseSubscriptionManager.tsx

export function EnterpriseSubscriptionManager() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<EnterpriseSubscription | null>(null);
  const [addOnAmount, setAddOnAmount] = useState(1000);
  
  useEffect(() => {
    fetchSubscription();
  }, []);
  
  async function fetchSubscription() {
    const response = await fetch(`/api/enterprise/subscription/${user.id}`);
    const data = await response.json();
    setSubscription(data.subscription);
  }
  
  async function handleSubscribe() {
    // Redirect to Stripe Checkout
    const response = await fetch('/api/stripe/create-subscription-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    
    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  }
  
  async function handlePurchaseAddOn() {
    // Redirect to Stripe Checkout for add-on
    const response = await fetch('/api/stripe/create-addon-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        credits: addOnAmount
      })
    });
    
    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  }
  
  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-12 border border-warm-terracotta/20 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
              Coconut V14 Enterprise
            </h1>
            
            <p className="text-lg text-warm-mocha mb-8">
              Professional AI orchestration for your team
            </p>
            
            <div className="mb-8">
              <div className="text-6xl font-bold text-warm-espresso mb-2">
                $999
              </div>
              <div className="text-warm-mocha">per month</div>
            </div>
            
            <ul className="text-left space-y-3 mb-8">
              {[
                '10,000 credits per month (resets every 30 days)',
                'Coconut V14 full access',
                'Add-on credits at $0.09/credit (Enterprise discount)',
                'Team collaboration (coming soon)',
                'Priority support'
              ].map(feature => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-warm-coral flex-shrink-0 mt-0.5" />
                  <span className="text-warm-espresso">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={handleSubscribe}
              className="w-full py-4 bg-gradient-to-r from-warm-coral to-warm-terracotta text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Subscription Status */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-warm-espresso">
              Enterprise Subscription
            </h2>
            
            <div className={`px-4 py-2 rounded-full font-semibold ${
              subscription.subscriptionStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {subscription.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          {/* Credits Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-warm-mocha mb-2">Monthly Credits</div>
              <div className="text-3xl font-bold text-warm-espresso">
                {subscription.subscriptionCreditsRemaining.toLocaleString()}
              </div>
              <div className="text-sm text-warm-mocha">
                of {subscription.monthlyCredits.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-warm-mocha">
                Resets in {daysUntilReset(subscription.nextResetDate)} days
              </div>
            </div>
            
            <div>
              <div className="text-sm text-warm-mocha mb-2">Add-on Credits</div>
              <div className="text-3xl font-bold text-warm-coral">
                {subscription.addOnCredits.toLocaleString()}
              </div>
              <div className="text-sm text-warm-mocha">
                Never expire
              </div>
              <div className="mt-2 text-xs text-warm-mocha">
                $0.09 per credit
              </div>
            </div>
            
            <div>
              <div className="text-sm text-warm-mocha mb-2">Total Available</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-warm-coral to-warm-terracotta text-transparent bg-clip-text">
                {subscription.totalCredits.toLocaleString()}
              </div>
              <div className="text-sm text-warm-mocha">
                Ready to use
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-warm-peach/20 rounded-xl">
            <div className="text-sm text-warm-mocha">
              Your monthly credits reset on {new Date(subscription.nextResetDate).toLocaleDateString()}
            </div>
            <div className="text-xs text-warm-mocha mt-1">
              Credits are used in this order: monthly credits first, then add-on credits
            </div>
          </div>
        </div>
        
        {/* Purchase Add-on Credits */}
        <div className="bg-warm-cream/40 backdrop-blur-xl rounded-3xl p-8 border border-warm-terracotta/20">
          <h3 className="text-xl font-semibold mb-6 text-warm-espresso">
            Purchase Add-on Credits
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm text-warm-mocha mb-3">
              Number of credits
            </label>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAddOnAmount(Math.max(1000, addOnAmount - 1000))}
                className="p-3 bg-white/60 rounded-lg hover:bg-warm-coral/20 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <input
                type="number"
                value={addOnAmount}
                onChange={(e) => setAddOnAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                step="1000"
                min="1000"
                className="flex-1 px-4 py-3 bg-white/60 border border-warm-terracotta/20 rounded-xl text-center text-2xl font-bold"
              />
              
              <button
                onClick={() => setAddOnAmount(addOnAmount + 1000)}
                className="p-3 bg-white/60 rounded-lg hover:bg-warm-coral/20 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-xs text-warm-mocha mt-2">
              Minimum purchase: 1,000 credits ($90)
            </div>
          </div>
          
          <div className="bg-warm-sand/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-warm-mocha">Credits</span>
              <span className="font-semibold text-warm-espresso">
                {addOnAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-warm-mocha">Price per credit</span>
              <span className="font-semibold text-warm-espresso">$0.09</span>
            </div>
            
            <div className="h-px bg-warm-terracotta/20 my-3" />
            
            <div className="flex items-center justify-between">
              <span className="font-semibold text-warm-espresso">Total</span>
              <span className="text-2xl font-bold text-warm-coral">
                ${(addOnAmount * 0.09).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-warm-mocha mb-6">
            These credits never expire and can be used even after your subscription ends (if subscription is active)
          </div>
          
          <button
            onClick={handlePurchaseAddOn}
            className="w-full py-4 bg-gradient-to-r from-warm-coral to-warm-terracotta text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Purchase Add-on Credits
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 11.3 Backend Enterprise Subscription

```typescript
// supabase/functions/server/enterprise-subscription.ts

export async function getEnterpriseSubscription(
  userId: string
): Promise<EnterpriseSubscription | null> {
  const key = `enterprise:subscription:${userId}`;
  const sub = await kv.get<EnterpriseSubscription>(key);
  
  if (!sub) return null;
  
  // Read add-on credits with fallback
  let addOnCredits = 0;
  
  // Try new format
  const kvPaidCreditsNew = await kv.get(`credits:${userId}:paid`);
  if (kvPaidCreditsNew !== null) {
    addOnCredits = Number(kvPaidCreditsNew);
  } else {
    // Fallback to admin KV format
    const userCredits = await kv.get(`user:${userId}:credits`) as any;
    if (userCredits?.paid) {
      addOnCredits = Number(userCredits.paid);
      // Migrate to new format
      await kv.set(`credits:${userId}:paid`, addOnCredits);
    }
  }
  
  sub.addOnCredits = addOnCredits;
  
  // Check if monthly reset needed
  await checkAndResetMonthlyCredits(userId, sub);
  
  // Recalculate totals
  sub.subscriptionCreditsRemaining = 10000 - sub.subscriptionCreditsUsed;
  sub.totalCredits = sub.subscriptionCreditsRemaining + sub.addOnCredits;
  
  return sub;
}

export async function deductEnterpriseCredits(
  userId: string,
  amount: number,
  reason?: string
): Promise<void> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) throw new Error('No enterprise subscription');
  
  // Security check
  if (sub.subscriptionStatus !== 'active') {
    throw new Error('Subscription not active');
  }
  
  if (sub.totalCredits < amount) {
    throw new Error(`Insufficient credits. Required: ${amount}, Available: ${sub.totalCredits}`);
  }
  
  let remaining = amount;
  
  // 1. Use monthly credits first
  if (sub.subscriptionCreditsRemaining > 0) {
    const takeFromSub = Math.min(remaining, sub.subscriptionCreditsRemaining);
    sub.subscriptionCreditsUsed += takeFromSub;
    sub.subscriptionCreditsRemaining -= takeFromSub;
    remaining -= takeFromSub;
  }
  
  // 2. Use add-on credits
  if (remaining > 0) {
    const currentPaid = await kv.get(`credits:${userId}:paid`) || 0;
    const newPaid = Number(currentPaid) - remaining;
    await kv.set(`credits:${userId}:paid`, newPaid);
    sub.addOnCredits = newPaid;
  }
  
  // Update subscription
  sub.totalCredits = sub.subscriptionCreditsRemaining + sub.addOnCredits;
  sub.updatedAt = new Date().toISOString();
  
  await kv.set(`enterprise:subscription:${userId}`, sub);
  
  // Log transaction
  await logEnterpriseTransaction({
    userId,
    amount: -amount,
    type: 'usage',
    reason: reason || 'Coconut V14 generation',
    timestamp: new Date().toISOString()
  });
}
```

---

## 12. MODULE API DASHBOARD

*(Section simplified - Developer Dashboard avec API keys, usage analytics, documentation)*

---

## 13. BACKEND ARCHITECTURE

### 13.1 Server Structure

**Main File :** `supabase/functions/server/index.tsx`

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

const app = new Hono();

// Middleware
app.use('*', cors({ origin: '*', credentials: true }));
app.use('*', logger(console.log));

// Routes
import authRoutes from './auth-routes.tsx';
import creditsRoutes from './coconut-v14-credits-routes.ts';
import coconutRoutes from './coconut-v14-routes.ts';
import feedRoutes from './feed-routes.ts';
import stripeRoutes from './stripe-checkout-routes.ts';
import creatorRoutes from './creator-routes.ts';
import enterpriseRoutes from './enterprise-routes.ts';

// Mount routes
app.route('/make-server-e55aa214/auth', authRoutes);
app.route('/make-server-e55aa214/credits', creditsRoutes);
app.route('/make-server-e55aa214/coconut-v14', coconutRoutes);
app.route('/make-server-e55aa214/feed', feedRoutes);
app.route('/make-server-e55aa214/stripe', stripeRoutes);
app.route('/make-server-e55aa214/creator', creatorRoutes);
app.route('/make-server-e55aa214/enterprise', enterpriseRoutes);

// Health check
app.get('/make-server-e55aa214/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
```

### 13.2 KV Store (PROTECTED FILE)

**File :** `supabase/functions/server/kv_store.tsx` - **DO NOT MODIFY**

```typescript
export async function get<T>(key: string): Promise<T | null>;
export async function set(key: string, value: any): Promise<void>;
export async function del(key: string): Promise<void>;
export async function mget<T>(keys: string[]): Promise<(T | null)[]>;
export async function mset(entries: [string, any][]): Promise<void>;
export async function mdel(keys: string[]): Promise<void>;
export async function getByPrefix<T>(prefix: string): Promise<T[]>;
```

---

## 14. INTÉGRATIONS EXTERNES

### 14.1 Stripe (Payments)

**Secrets required :**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Products :**
- Enterprise Subscription: $999/mois (recurring)
- Add-on Credits Enterprise: $0.09/crédit (one-time)
- Credits Individual: $0.10/crédit (one-time)

### 14.2 Kie AI (Generation APIs)

**Secret required :**
```
KIE_AI_API_KEY=kie_...
```

**Services utilisés :**
- Flux 2 Pro (images)
- Veo 3.1 Fast (vidéos)
- MeiGen-AI (avatars InfiniteTalk)

### 14.3 Replicate (Gemini Analysis)

**Secret required :**
```
REPLICATE_API_TOKEN=r8_...
```

**Model :** `google-gemini/gemini-2.5-flash-thinking` (Coconut V14 analysis)

---

## 15. DÉPLOIEMENT & PRODUCTION

### 15.1 Environment Setup

**Supabase Secrets (via CLI or Dashboard) :**
```bash
supabase secrets set VITE_AUTH0_DOMAIN=<domain>
supabase secrets set VITE_AUTH0_CLIENT_ID=<client_id>
supabase secrets set KIE_AI_API_KEY=<key>
supabase secrets set REPLICATE_API_TOKEN=<token>
supabase secrets set STRIPE_SECRET_KEY=<key>
supabase secrets set STRIPE_WEBHOOK_SECRET=<secret>
```

### 15.2 Deployment Checklist

- [ ] Vérifier tous les secrets Supabase
- [ ] Configurer Auth0 (Allowed Callback URLs, Logout URLs)
- [ ] Créer Stripe Products & Prices
- [ ] Tester Stripe Webhooks (local avec CLI, puis prod)
- [ ] Initialiser buckets Supabase Storage
- [ ] Déployer Edge Function
- [ ] Vérifier CORS headers
- [ ] Tester flows complets (signup → onboarding → generation)

---

## 🎯 INSTRUCTIONS FINALES POUR L'IA

**Tu dois créer Cortexia Creation Hub V3 en respectant :**

1. **Architecture Complète :** Tous les modules décrits ci-dessus
2. **Beauty Design System :** Palette Coconut Warm, liquid glass, gradient texts, animations Motion
3. **Types d'Utilisateurs :** Individual, Enterprise, Developer avec leurs accès respectifs
4. **Système de Crédits :** Individual (paid only), Enterprise (monthly + add-on), deduction logic
5. **Authentification :** Auth0 primary, sync backend, user types, onboarding
6. **Feed :** TikTok-style vertical scroll, interactions, remix chains
7. **CreateHub :** Image/Video/Avatar generation simple pour Individual
8. **Coconut V14 :** Orchestration premium 5-phase pour Enterprise (Intent → Analysis → Generation → CocoBoard)
9. **Creator System :** Top Creator status, Coconut unlock, referral commissions
10. **Enterprise :** Subscription $999/mois, add-on credits $0.09, usage order strict
11. **Backend :** Hono + KV Store, routes CRUD, credits manager, Stripe webhooks
12. **Intégrations :** Auth0, Stripe, Kie AI, Replicate (Gemini)

**Contraintes strictes :**
- ❌ Ne JAMAIS modifier `/supabase/functions/server/kv_store.tsx`
- ✅ Toujours utiliser Beauty Design System (Coconut Warm palette)
- ✅ Respecter l'architecture adaptive (routing selon userType)
- ✅ Sécurité Enterprise : add-on credits utilisables SEULEMENT si subscription active
- ✅ Animations fluides avec Motion (Framer Motion)
- ✅ Sons UI avec `playSound()` sur actions importantes
- ✅ Responsive mobile-first
- ✅ Accessibilité ARIA

**Priorité d'implémentation :**
1. Auth + User Types + Onboarding
2. Credits System (backend + frontend context)
3. CreateHub (Individual)
4. Feed (lecture + interactions)
5. Coconut V14 (Enterprise)
6. Creator System
7. Stripe Integration
8. Polish UI/UX

---

**VERSION :** 3.1  
**DATE :** Janvier 2026  
**STATUT :** Production-Ready Specification

