# 🚀 CORTEXIA V3 - PRODUCTION SETUP GUIDE

## ✅ CORRECTIONS APPLIQUÉES

Tous les blockers critiques ont été corrigés :

1. ✅ **Fix boucle infinie `/callback`** - Type d'utilisateur récupéré depuis localStorage/sessionStorage
2. ✅ **Remove password localStorage** - Supprimé pour sécurité (utilise Supabase Auth uniquement)
3. ✅ **Cron job reset mensuel crédits** - Système complet avec protection double-reset
4. ✅ **Crédits bonus parrainage** - +10 crédits filleul (35 total au signup)
5. ✅ **Webhook Stripe auto-track** - Commissions 10% lifetime automatiques
6. ✅ **Protection double-reset** - Vérifie last_reset_month avant de réinitialiser

---

## 🔧 CONFIGURATION REQUISE

### 1. Cron Job - Reset Mensuel des Crédits

**Endpoint:** `https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset`

**Schedule:** `0 0 1 * *` (1er de chaque mois à 00:00 UTC)

#### Option A: Supabase pg_cron (Recommandé)

```sql
-- Dans le SQL Editor de Supabase
SELECT cron.schedule(
  'monthly-credits-reset',
  '0 0 1 * *', -- 1er jour du mois à minuit UTC
  $$
  SELECT
    net.http_post(
        url:='https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer {YOUR_ANON_KEY}"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

#### Option B: Service externe (EasyCron, cron-job.org)

1. Créer un nouveau cron job
2. URL: `https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset`
3. Method: `POST`
4. Headers: `Authorization: Bearer {publicAnonKey}`
5. Schedule: `0 0 1 * *`

---

### 2. Stripe Webhook - Auto-track Purchases

**Setup dans Stripe Dashboard:**

1. Aller dans **Developers → Webhooks**
2. Cliquer **Add endpoint**
3. **URL:** `https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/stripe-webhook/webhook`
4. **Events à écouter:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copier le **Signing secret** (commence par `whsec_...`)
6. Ajouter dans Supabase Secrets:
   ```bash
   # Dans le terminal
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

**Metadata à inclure dans les Checkout Sessions:**

```javascript
// Dans votre code frontend/backend Stripe
const session = await stripe.checkout.sessions.create({
  metadata: {
    userId: user.id,         // ✅ OBLIGATOIRE
    credits: "100"           // ✅ OBLIGATOIRE
  },
  client_reference_id: user.id, // ✅ Fallback
  // ... autres paramètres
});
```

---

### 3. Variables d'environnement Supabase

Vérifier que toutes les variables sont configurées :

```bash
# Auth0 (déjà configuré)
VITE_AUTH0_DOMAIN=dev-3ipjnnnncplwcx0t.us.auth0.com
VITE_AUTH0_CLIENT_ID=uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr

# Supabase (auto-configuré)
SUPABASE_URL=auto
SUPABASE_ANON_KEY=auto
SUPABASE_SERVICE_ROLE_KEY=auto

# Stripe (à ajouter)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx  # ou sk_test_xxxxx pour test

# Autres APIs (déjà configurées)
POLLINATIONS_API_KEY=xxxxx
REPLICATE_API_KEY=xxxxx
TOGETHER_API_KEY=xxxxx
KIE_AI_API_KEY=xxxxx
```

---

## 📊 ENDPOINTS DISPONIBLES

### Auth & User Management

- `POST /auth/signup-individual` - Signup Individual
- `POST /auth/signup-enterprise` - Signup Enterprise
- `POST /auth/signup-developer` - Signup Developer
- `POST /auth/login` - Login
- `POST /users/create` - Create user profile
- `GET /users/:userId/profile` - Get user profile
- `PATCH /users/:userId/profile` - Update profile
- `GET /users/:userId/referrals` - Get referrals
- `GET /users/:userId/earnings` - Get referral earnings

### Referral System

- `POST /referral/validate-code` - Validate referral code
- `POST /referral/track-purchase` - Track purchase (manual)
- `GET /referral/stats/:userId` - Get referral stats

### Credits System

- `POST /credits-cron/monthly-reset` - Reset all users' free credits (cron)
- `GET /credits-cron/reset-status/:month` - Check reset status
- `POST /credits-cron/reset-user/:userId` - Manual reset for specific user

### Stripe Webhook

- `POST /stripe-webhook/webhook` - Stripe webhook endpoint
- `POST /stripe-webhook/test-purchase` - Test purchase (dev only)

---

## 🧪 TESTING

### 1. Test Cron Job

```bash
# Test manual reset
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits-cron/monthly-reset \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "message": "Monthly credits reset completed",
  "stats": {
    "month": "2026-01",
    "totalUsers": 42,
    "resetCount": 42,
    "skippedCount": 0
  }
}
```

### 2. Test Webhook Stripe (sans vraie transaction)

```bash
# Test purchase simulation
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/stripe-webhook/test-purchase \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "credits": 100,
    "amount": 7.99
  }'

# Expected response:
{
  "success": true,
  "message": "Test purchase processed",
  "userId": "test-user-id",
  "credits": 100,
  "amount": 7.99
}
```

### 3. Test Parrainage

```bash
# 1. Create referrer
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "referrer-123",
    "email": "referrer@test.com",
    "username": "referrer",
    "displayName": "The Referrer"
  }'

# Response contains: "referralCode": "REFERR001"

# 2. Create referred user with code
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "newuser-456",
    "email": "newuser@test.com",
    "username": "newuser",
    "displayName": "New User",
    "referralCode": "REFERR001"
  }'

# Expected:
# - Newuser has 35 free credits (25 + 10 bonus)
# - Referrer referralCount increased (no paid credits bonus)
```

---

## 📈 MONITORING

### Check Monthly Reset Status

```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/credits-cron/reset-status/2026-01 \
  -H "Authorization: Bearer {publicAnonKey}"
```

### Check User Credits

```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/users/{userId}/profile \
  -H "Authorization: Bearer {publicAnonKey}"

# Response includes:
{
  "profile": {
    "freeCredits": 25,
    "paidCredits": 105,
    "referralEarnings": 2.40,
    "referralCount": 3
  }
}
```

---

## ⚠️ IMPORTANT NOTES

### Sécurité

1. ❌ **Ne jamais exposer le `SUPABASE_SERVICE_ROLE_KEY` au frontend**
2. ✅ **Vérifier la signature Stripe** dans le webhook (production)
3. ✅ **Rate limiting** sur les endpoints publics (à implémenter)

### Performance

- Le cron reset mensuel peut prendre 10-30s si beaucoup d'utilisateurs
- Protection contre double-reset via `credits:reset:{userId}:last_month`
- Les webhooks Stripe peuvent avoir 1-2 min de délai

### Logs

Tous les événements importants sont loggés dans la console :
- `🔄 Monthly reset completed`
- `💳 Checkout completed`
- `🎁 Commission tracked`

---

## 🎉 READY FOR PRODUCTION

Votre application est maintenant prête pour la production avec :

✅ Système d'auth complet (Auth0 + Supabase)
✅ Onboarding personnalisé par type d'utilisateur
✅ Crédits mensuels avec reset automatique
✅ Système de parrainage avec bonus
✅ Commissions 10% lifetime automatiques
✅ Webhook Stripe intégré
✅ Gestion utilisateurs complète

**Prochaines étapes recommandées :**
1. Ajouter email verification (Auth0/Supabase)
2. Implémenter rate limiting
3. Ajouter email notifications (Resend/SendGrid)
4. Dashboard admin pour monitoring