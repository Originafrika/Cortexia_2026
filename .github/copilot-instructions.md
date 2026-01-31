## Cortexia (Cortexia PWA UI/UX Design) — Copilot instructions

**Project type**: React 18 + TypeScript PWA built with Vite. Single-page app serving multiple user types (Individual, Enterprise, Developer).
**Entry point**: `src/main.tsx` → `src/App.tsx`.
**Dev server**: `npm run dev` (Vite, port 3000 by default). **Build**: `npm run build` (output: `build/`).

---

## Architecture overview

**Three-tier user model** with fundamentally different UX paths:
- **Individual**: Text-to-image creation (CreateHub), community feed, 25 free credits/month + purchase paid credits, creator promotions.
- **Enterprise**: Coconut V14 (orchestrated AI design tool), $999/month subscription → 10,000 monthly credits + optional add-on credits.
- **Developer**: API-only access with dashboard; no UI features.

**Critical routing pattern** (see `src/App.tsx` routes block):
- Route order matters: `/generation/:generationId`, `/payment-*`, `/admin/*` must appear **before** the catch-all `/*`.
- Route protection via `useAuth()` helpers: `requiresAuth()`, `canAccessRoute()`, and enforced onboarding check (`user.onboardingComplete`).
- Screen state is dual: both React state + URL-based navigation. Use `handleNavigate()` in `AppContent` to sync them.

**Provider stack** (in `App.tsx`):
1. `AuthProvider` — manages user identity, types, onboarding flag, multiple auth methods (Supabase email/password + Auth0 social).
2. `ThemeProvider` — centralized theme (defaultTheme="purple").
3. `CreditsProviderWrapper` — wraps `CreditsProvider` with stable userId (critical: prevents flickering between `demo-user` and real userId during auth transitions).
4. `GenerationQueueProvider` — manages generation queue state and lifecycle.
5. `I18nProvider` — localization (wraps entire app).

**Key contexts** live in `src/lib/contexts/`:
- `AuthContext`: User state, auth methods, onboarding, provider metadata (Auth0 vs Supabase).
- `CreditsContext`: Dual-model credits (free + paid for Individual; monthly subscription + add-ons for Enterprise). Backend-sourced; read via `getUserCredits()` API.
- `GenerationQueueContext`: Queue state for image/video generation batches.
- `ProvidersContext`, `ThemeContext`: Theme + AI provider configuration.

**Data flows**:
- User profile & auth state: Supabase Auth or Auth0 callback (stored in localStorage with persistence).
- Credits: Backend API only (`src/lib/api/credits.ts` → `getUserCredits(userId)`). No local storage.
- Generations: Queued via `GenerationQueueProvider`; persisted in Supabase Storage.
- UI state: React local state + URL params (e.g., `/generation/:generationId`).

---

## Critical patterns & conventions

**Module alias**: `@` → `./src` (configured in `vite.config.ts`). Always use `import X from '@/components/...'`.

**Versioned import mappings** in `vite.config.ts` (e.g., `'sonner@2.0.3': 'sonner'`):
- These are alias mappings, not canonical imports. When **adding new dependencies**, use canonical names (e.g., `import { Toaster } from 'sonner'`) and let Vite resolve via the alias if needed.
- **DO NOT rename versioned keys** in `vite.config.ts` without verifying all usages.

**Stable userId pattern** (crucial):
- `CreditsProviderWrapper` in `App.tsx` maintains `stableUserId` state that only updates when auth truly changes, not during loading transitions.
- Prevents re-renders and flickering of credits UI.
- Demo fallback: unauthenticated users get `'demo-user'` userId; real users get their Supabase/Auth0 ID.
- **Preserve this pattern** when modifying auth or credits flows.

**Route protection** (see `AuthContext`):
- `requiresAuth(route)`: Returns true if route needs authentication.
- `canAccessRoute(route)`: Checks user type (Individual, Enterprise, Developer) and route access rules.
- Onboarding is enforced: any authenticated user without `user.onboardingComplete === true` is redirected to `/onboarding`.

**Auth methods**:
- Primary: Supabase Auth (email/password) via `signIn()`, `signUp()`.
- Secondary: Auth0 (social login) handled via `Auth0CallbackPage`; callback URL updates user metadata in Auth0 then syncs to app state.
- User object includes `provider` field ('supabase' or 'auth0') for tracking which auth method was used.

**Onboarding compliance**:
- All users (Individual, Enterprise, Developer) must complete onboarding before accessing main features.
- Onboarding endpoint: `completeOnboarding(onboardingData?)` in AuthContext.
- Enterprise onboarding includes branding setup (company logo, colors, name).

**i18n localization**:
- Provider: `I18nProvider` wraps the entire app (see `src/lib/i18n`).
- Use `useTranslation()` hook in components for locale-aware text.

**Generation pipeline**:
- Queue managed by `GenerationQueueContext`.
- View component: `GenerationView` (route: `/generation/:generationId`).
- AI providers: Gemini 2.5 Flash (via Replicate), Flux 2 Pro, Veo 3.1 Fast (via Kie AI).
- Services: `generationService`, `generationServiceV4.ts` orchestrate API calls.

---

## Build, dev, and test workflows

**Install**: `npm i`
**Dev**: `npm run dev` — starts Vite on port 3000, auto-opens browser, hot-reloads on file changes.
**Build**: `npm run build` — outputs optimized build to `build/` (target: esnext).
**Tests**: `vitest` is a dependency but no npm script defined. Run with `npx vitest` if you add test files. Consider adding `"test": "vitest"` to `package.json` for CI.

**Debugging**:
- Dev server console + browser DevTools are primary debugging tools.
- `src/App.tsx` contains informative `console.log()` statements (e.g., when setting stableUserId, checking onboarding, routing changes).
- Enable these logs by searching for `console.log` near auth/credits logic.

---

## Key services & integrations

**Auth0 integration** (`src/lib/services/auth0-service.ts`):
- `handleAuth0Callback()`: Processes Auth0 redirect, extracts tokens, updates user metadata.
- `signOutAuth0()`: Clears Auth0 session.
- `getAuth0Session()`: Retrieves current Auth0 token.
- `onAuth0StateChange()`: Listens to Auth0 state changes.

**Stripe** (`src/lib/services/` and `/src/components/payments/`):
- Components: `PaymentSuccess`, `PaymentCancel` (routes: `/payment-success`, `/payment-cancel`).
- Enterprise subscription success route: `/enterprise-subscription-success`.
- API integration for credit purchases and subscription billing.

**Supabase** (`src/lib/services/` and `src/supabase/`):
- Auth: Email/password via Supabase Auth.
- Storage: File buckets for generations, uploads.
- Database: User profiles, credits, generation history (via edge functions and APIs).

**Credits API** (`src/lib/api/credits.ts`):
- `getUserCredits(userId)`: Fetches user credits from backend. Returns `{ credits: UserCredits, error?: string, daysUntilReset?: number }`.
- Backend endpoint: `https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/{userId}`.
- No local storage; all credit state sourced from backend.

**Generation APIs** (`src/lib/api/generation.ts`):
- Queues and tracks image/video generations.
- Persists generation metadata and results to Supabase.

---

## Project-specific conventions

**Component organization**:
- `src/components/` — reusable UI components (shared, auth, coconut-v14, generation, etc.).
- `src/pages/` — route-level screens (admin pages, payment success handlers).
- `src/lib/hooks/` — custom React hooks (40+ utility hooks for animations, keyboard shortcuts, user data, etc.).
- `src/lib/contexts/` — React context providers (auth, credits, queue, theme).
- `src/lib/services/` — API wrappers and business logic (Auth0, generation, analytics, etc.).
- `src/services/` — miscellaneous services (e.g., `job-queue.ts`).

**State management**:
- React Context for global state (auth, credits, theme, queue).
- Local `useState()` for component-level UI state.
- Zustand may be used in some service layers (check imports).

**Styling**:
- Tailwind CSS with component library (Radix UI primitives).
- `src/styles/` — global CSS and Tailwind extensions.
- Design system: "Beauty Design System (BDS)" + Coconut Premium design system (see `src/DESIGN_SYSTEM.md`).

**Error handling**:
- `toast` notifications (from `sonner@2.0.3`) for user-facing errors.
- Error boundary component: `src/components/error-boundary/`.
- Backend errors logged to console and optionally to analytics.

**Async patterns**:
- React hooks with `useEffect()` + cleanup functions to prevent race conditions (see `CreditsContext` for example).
- Cancellation tokens/flags when fetching data that may be superseded.

---

## Integration points & where to look

| Feature | Key Files | Notes |
|---------|-----------|-------|
| **Auth** | `AuthContext.tsx`, `src/components/auth/`, `auth0-service.ts` | Supports Supabase email/password + Auth0 social |
| **Credits** | `CreditsContext.tsx`, `src/lib/api/credits.ts`, `creditManager.ts` | Backend-sourced; supports free + paid + Enterprise monthly/add-ons |
| **Coconut V14** | `src/components/coconut-v14/`, `CoconutV14App.tsx` | Premium AI orchestration tool for Enterprise/Creator users |
| **Generation Queue** | `GenerationQueueContext.tsx`, `src/components/generation/` | Manages image/video generation batch processing |
| **Feed** | `src/components/feed/`, `ForYouFeed.tsx` | Community feed; Individual users only |
| **Creator System** | `src/components/creator/`, `CreatorDashboard.tsx` | Limited Coconut access for active creators |
| **Developer Dashboard** | `src/components/developer/` | API keys, usage analytics; Developer users only |
| **Payments** | `src/components/payments/`, `PaymentSuccess.tsx`, `PaymentCancel.tsx` | Stripe integration for Individual credit purchases and Enterprise subscriptions |
| **Admin Pages** | `src/pages/admin/`, `AdminPanel.tsx` | Migration, storage cleanup (dev/admin only) |
| **Referral System** | `src/components/referral/`, `ReferralDashboard.tsx` | Parrainage with streak multipliers for Individuals |

---

## Editing & contribution checklist

1. **Use `@` imports**: `import { Component } from '@/components/...'` not relative paths.
2. **Run `npm run dev` after changes** to verify hot-reload and client-side errors.
3. **Preserve auth patterns**: Do not bypass `requiresAuth()`, `canAccessRoute()`, or onboarding checks.
4. **Preserve stable userId**: When modifying `AuthContext` or `CreditsProviderWrapper`, ensure userId updates are stable (no rapid changes during auth transitions).
5. **No local credit storage**: Credits only come from backend API; do not cache to localStorage.
6. **Test routing**: If adding routes, ensure they appear in correct order in `Routes` block (specific before catch-all).
7. **Check alias mappings**: Before updating package versions, verify the alias in `vite.config.ts` is correct.
8. **Add test scripts**: If committing unit tests, ensure `"test": "vitest"` exists in `package.json`.
9. **Respect user types**: Check route protection rules for Individual/Enterprise/Developer access.

---

## Documentation & resources

- **System Reference**: `src/CORTEXIA_SYSTEM_REFERENCE.md` — Account types, credits, Creator system, parrainage, Coconut access, KV store, storage cleanup.
- **Architecture**: `src/ARCHITECTURE.md` — Detailed tech stack, module breakdown, data flows.
- **Quick Start**: `src/QUICK_START.md` — 5-minute onboarding for new developers.
- **Design System**: `src/DESIGN_SYSTEM.md` (BDS) + `src/guidelines/Guidelines.md` (design framework R→T→C→R→O→S).
- **Storage Architecture**: `src/STORAGE_ARCHITECTURE.md` — Supabase Storage buckets, cleanup jobs.
- **Deployment**: `src/DEPLOYMENT_GUIDE.md` — Production setup for Supabase, Stripe, Auth0.
- **README**: `src/README.md` — Overview, feature list, documentation index.

---

## Common pitfalls & gotchas

- **Auth flickering**: Do not update stableUserId during auth loading; let `CreditsProviderWrapper` handle it.
- **Missing onboarding check**: Always verify `user.onboardingComplete` before showing authenticated screens.
- **Credits out of sync**: If credits don't update, check backend API response shape (`getUserCredits` return format).
- **Route order**: Specific routes (e.g., `/generation/:generationId`) must come **before** catch-all `/*` in `Routes`.
- **Import aliases**: Versioned keys like `'sonner@2.0.3'` are aliases; don't use them in new code.
- **i18n missing**: Ensure components using locale-aware text import `useTranslation()` from `i18n` context.
- **Theme not applying**: Check that `ThemeProvider` wraps the entire app and defaultTheme is set.
- **Enterprise branding ignored**: Verify `user.companyLogo`, `brandColors`, `companyName` are loaded from `completeOnboarding()`.
