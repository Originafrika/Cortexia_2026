# 💰 SYSTÈME CREATOR COMPENSATION V2 - Cortexia Creation Hub

## 🎯 **VUE D'ENSEMBLE**

Le système Creator Compensation V2 est exclusivement pour les **utilisateurs Individual** et récompense les créateurs les plus actifs avec :

- 🥥 **Accès gratuit à Coconut V14** (valeur : 115 crédits/génération)
- 💸 **Commissions de parrainage** : 10% de base avec streak multipliers
- 🔥 **Bonus Origins** : Monnaie exclusive pour withdrawal via Stripe Connect

---

## 👥 **ÉLIGIBILITÉ**

### **QUI PEUT PARTICIPER ?**

✅ **Individual users UNIQUEMENT**  
❌ Enterprise users : accès Coconut direct (pas de Creator System)  
❌ Developer users : accès Coconut + API (pas de Creator System)

### **CONDITIONS TOP CREATOR**

Pour devenir **Top Creator** ce mois-ci :

| Critère | Minimum requis |
|---------|----------------|
| **Générations créées** | 60+ dans le mois |
| **Posts publiés sur feed** | 5+ dans le mois |
| **Posts avec 5+ likes** | 5+ dans le mois |

**Statut vérifié le :** 1er jour du mois suivant

---

## 🥥 **BONUS TOP CREATOR**

### **ACCÈS COCONUT V14 GRATUIT**

Dès que tu atteins le statut Top Creator :

✅ **Accès illimité à Coconut V14** (pendant tout le mois)  
✅ **Pas de déduction de crédits** (génération gratuite)  
✅ **Toutes les fonctionnalités** : Intent → AI Analysis → CocoBoard → Generation

**Clé dans la DB :** `user:profile:{userId}` → `hasCoconutAccess: true`

```json
{
  "userId": "google-oauth2|110247234719945760338",
  "hasCoconutAccess": true,      // ✅ Accès Coconut activé
  "topCreatorMonth": "2026-01",  // ✅ Mois d'obtention
  "topCreatorSince": "2026-01-01T00:00:00.000Z"
}
```

---

## 💸 **COMMISSIONS DE PARRAINAGE**

### **SYSTÈME DE BASE : 10%**

Quand un de tes **filleuls** achète des crédits :

**Formule :**
```
Commission = Montant d'achat × 10% × Streak Multiplier
```

**Exemple :**
- Filleul achète 100$ de crédits
- Parrain reçoit : `100$ × 10% × 1.0 = 10$` (en Origins)

---

## 🔥 **STREAK MULTIPLIERS (NOUVEAU)**

### **COMMENT ÇA FONCTIONNE**

À chaque **mois consécutif** où tu restes Top Creator :

| Streak | Multiplier | Commission effective |
|--------|-----------|---------------------|
| **Mois 1** | ×1.0 | 10.0% |
| **Mois 2** | ×1.1 | 11.0% |
| **Mois 3** | ×1.2 | 12.0% |
| **Mois 4** | ×1.3 | 13.0% |
| **Mois 5+** | ×1.5 | **15.0%** (MAX) |

**Important :**
- ✅ Streak augmente **uniquement si Top Creator 2 mois de suite**
- ❌ Si tu perds le statut 1 mois → **Retour à ×1.0**
- ✅ Le multiplier est **permanent** tant que tu restes Top Creator

---

### **EXEMPLES CONCRETS**

#### **Exemple 1 : Streak de 5 mois**

| Mois | Statut | Multiplier | Filleul achète | Commission |
|------|--------|-----------|----------------|------------|
| Jan 2026 | ✅ Top Creator | ×1.0 | 100$ | 10.00$ |
| Fev 2026 | ✅ Top Creator | ×1.1 | 50$ | 5.50$ |
| Mar 2026 | ✅ Top Creator | ×1.2 | 200$ | 24.00$ |
| Avr 2026 | ✅ Top Creator | ×1.3 | 100$ | 13.00$ |
| Mai 2026 | ✅ Top Creator | ×1.5 | 100$ | 15.00$ |

**Total gagné :** 67.50$ en Origins

---

#### **Exemple 2 : Perte du streak**

| Mois | Statut | Multiplier | Filleul achète | Commission |
|------|--------|-----------|----------------|------------|
| Jan 2026 | ✅ Top Creator | ×1.0 | 100$ | 10.00$ |
| Fev 2026 | ✅ Top Creator | ×1.1 | 100$ | 11.00$ |
| Mar 2026 | ❌ Pas Top Creator | – | 100$ | **0$** (pas de commission) |
| Avr 2026 | ✅ Top Creator | ×1.0 (reset) | 100$ | 10.00$ (retour à base) |

**Important :** Perte du statut = pas de commission + reset du multiplier

---

## 🪙 **MONNAIE ORIGINS**

### **QU'EST-CE QUE C'EST ?**

Origins = **Monnaie interne** gagnée via commissions de parrainage

**Conversion :**
```
1 Origin = 1 USD
```

### **COMMENT GAGNER DES ORIGINS ?**

✅ **Commissions de parrainage** (10% + streak multiplier)  
❌ Pas d'achat direct d'Origins (uniquement via parrainage)

### **STOCKAGE DANS LA DB**

**Clé :** `user:profile:{userId}` → `referralEarnings`

```json
{
  "userId": "google-oauth2|110247234719945760338",
  "referralEarnings": 67.50,  // ✅ Total Origins accumulés (en $)
  "referralCount": 12,         // ✅ Nombre de filleuls
  "referredBy": null,          // ✅ Qui t'a parrainé (ou null)
  "referralCode": "LILUAN023"  // ✅ Ton code de parrainage
}
```

---

## 💳 **WITHDRAWAL SYSTEM (Stripe Connect)**

### **COMMENT RETIRER TES ORIGINS ?**

1. **Minimum requis :** 50 Origins (50$)
2. **Méthode :** Stripe Connect (paiement bancaire)
3. **Délai :** 3-5 jours ouvrés
4. **Frais :** 2.9% + 0.30$ (frais Stripe)

### **PROCESS TECHNIQUE**

**Frontend → Backend → Stripe**

```
1. User clique "Withdraw"
   ↓
2. POST /creators/withdraw
   {
     userId: "google-oauth2|110247234719945760338",
     amount: 67.50
   }
   ↓
3. Backend vérifie :
   - isTopCreator = true ?
   - referralEarnings >= 50 ?
   ↓
4. Stripe Connect Payout
   ↓
5. Update DB :
   referralEarnings -= 67.50
   ↓
6. Email confirmation
```

---

## 📊 **TRACKING DES STATS CREATOR**

### **CLÉ KV STORE**

`creator:stats:{userId}:{month}`

**Exemple :** `creator:stats:google-oauth2|110247234719945760338:2026-01`

### **STRUCTURE**

```json
{
  "userId": "google-oauth2|110247234719945760338",
  "month": "2026-01",
  "creationsCount": 65,          // ✅ Total générations ce mois
  "postsPublished": 12,          // ✅ Posts publiés sur feed
  "postsWithEnoughLikes": 7,     // ✅ Posts avec 5+ likes
  "totalLikes": 342,
  "totalComments": 89,
  "totalShares": 23,
  "totalDownloads": 156,
  "lastUpdated": "2026-01-15T14:25:00.000Z"
}
```

---

## 🔄 **CALCUL DU STREAK**

### **STOCKAGE**

**Clé :** `creator:streak:{userId}`

```json
{
  "userId": "google-oauth2|110247234719945760338",
  "currentStreak": 3,        // ✅ Mois consécutifs actuels
  "longestStreak": 5,        // ✅ Record personnel
  "multiplier": 1.2,         // ✅ Multiplier actuel (basé sur streak)
  "lastTopCreatorMonth": "2026-03",
  "streakHistory": [
    { "month": "2026-01", "isTopCreator": true },
    { "month": "2026-02", "isTopCreator": true },
    { "month": "2026-03", "isTopCreator": true }
  ]
}
```

### **LOGIQUE DE CALCUL**

```typescript
function calculateStreakMultiplier(streak: number): number {
  if (streak === 0) return 1.0;      // Pas Top Creator
  if (streak === 1) return 1.0;      // 1er mois
  if (streak === 2) return 1.1;      // 2e mois consécutif
  if (streak === 3) return 1.2;      // 3e mois consécutif
  if (streak === 4) return 1.3;      // 4e mois consécutif
  if (streak >= 5) return 1.5;       // 5+ mois consécutifs (MAX)
  return 1.0;
}
```

---

## 🎯 **ENDPOINTS BACKEND**

### **1. Vérifier statut Top Creator**

```
GET /creators/check-status/{userId}
```

**Response :**
```json
{
  "success": true,
  "isTopCreator": true,
  "stats": {
    "creationsCount": 65,
    "postsPublished": 12,
    "postsWithEnoughLikes": 7
  },
  "streak": {
    "current": 3,
    "multiplier": 1.2
  },
  "hasCoconutAccess": true
}
```

---

### **2. Calculer commission de parrainage**

```
POST /creators/calculate-commission
```

**Body :**
```json
{
  "referrerId": "google-oauth2|110247234719945760338",
  "purchaseAmount": 100.00
}
```

**Response :**
```json
{
  "success": true,
  "commission": 12.00,
  "baseRate": 0.10,
  "streakMultiplier": 1.2,
  "newEarnings": 79.50
}
```

---

### **3. Withdraw Origins**

```
POST /creators/withdraw
```

**Body :**
```json
{
  "userId": "google-oauth2|110247234719945760338",
  "amount": 67.50,
  "stripeAccountId": "acct_abc123xyz"
}
```

**Response :**
```json
{
  "success": true,
  "payoutId": "po_1234567890",
  "amount": 67.50,
  "fee": 2.26,
  "netAmount": 65.24,
  "estimatedArrival": "2026-01-20"
}
```

---

## 📋 **REQUÊTES SQL UTILES**

### **1. Tous les Top Creators ce mois**

```sql
SELECT 
  value->>'userId' as user_id,
  value->>'email' as email,
  value->>'displayName' as name,
  (value->>'creationsCount')::int as generations,
  (value->>'postsPublished')::int as posts,
  (value->>'postsWithEnoughLikes')::int as viral_posts
FROM kv_store_e55aa214 
WHERE key LIKE 'creator:stats:%:2026-01'
  AND (value->>'creationsCount')::int >= 60
  AND (value->>'postsPublished')::int >= 5
  AND (value->>'postsWithEnoughLikes')::int >= 5
ORDER BY (value->>'creationsCount')::int DESC;
```

---

### **2. Earnings de parrainage par utilisateur**

```sql
SELECT 
  value->>'email' as email,
  value->>'displayName' as name,
  (value->>'referralCount')::int as filleuls,
  (value->>'referralEarnings')::decimal as total_origins,
  value->>'hasCoconutAccess' as coconut_access
FROM kv_store_e55aa214 
WHERE key LIKE 'user:profile:%'
  AND (value->>'referralEarnings')::decimal > 0
ORDER BY (value->>'referralEarnings')::decimal DESC
LIMIT 10;
```

---

### **3. Historique des streaks**

```sql
SELECT 
  value->>'userId' as user_id,
  (value->>'currentStreak')::int as streak_actuel,
  (value->>'longestStreak')::int as meilleur_streak,
  (value->>'multiplier')::decimal as multiplier,
  value->>'lastTopCreatorMonth' as dernier_mois
FROM kv_store_e55aa214 
WHERE key LIKE 'creator:streak:%'
ORDER BY (value->>'currentStreak')::int DESC;
```

---

## 🎨 **UI/UX POUR CREATOR DASHBOARD**

### **WIDGETS RECOMMANDÉS**

1. **📊 Stats du Mois**
   - Générations : 65/60 ✅
   - Posts publiés : 12/5 ✅
   - Posts viraux : 7/5 ✅
   - Statut : 🏆 Top Creator

2. **🔥 Streak Counter**
   - Streak actuel : 3 mois 🔥
   - Multiplier : ×1.2 (12%)
   - Prochain niveau : 4 mois → ×1.3

3. **💰 Earnings Dashboard**
   - Origins disponibles : 67.50$
   - Filleuls actifs : 12
   - Commission ce mois : 24.00$
   - Bouton "Withdraw" (min 50$)

4. **📈 Progression Chart**
   - Graphique des générations (60 jours)
   - Posts publiés vs likes
   - Historique du streak

---

## ⚙️ **CONFIGURATION STRIPE**

### **WEBHOOK À CONFIGURER**

Pour que les commissions de parrainage fonctionnent automatiquement lors des achats de crédits :

**URL Webhook :** 
```
https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/stripe-webhook
```

**Events à écouter :**
- ✅ `checkout.session.completed` → Achat de crédits validé
- ✅ `payment_intent.succeeded` → Paiement réussi

**Logique :**
```typescript
// Quand un achat est complété
1. Récupérer le userId de l'acheteur
2. Vérifier s'il a été parrainé (referredBy)
3. Si oui, calculer commission pour le parrain
4. Ajouter Origins au parrain
5. Envoyer notification au parrain
```

---

## 🔐 **SÉCURITÉ**

### **PRÉVENTION FRAUDE**

✅ **Vérification statut Top Creator** avant commission  
✅ **Minimum 50$ pour withdrawal**  
✅ **Stripe Connect KYC** requis  
✅ **Tracking des transactions** dans la DB  
✅ **Limite 1 withdrawal par semaine**

---

## 🎯 **RÉSUMÉ**

| Feature | Détails |
|---------|---------|
| **Éligibilité** | Individual users uniquement |
| **Critères Top Creator** | 60+ générations, 5+ posts, 5+ posts viraux |
| **Bonus** | Accès gratuit Coconut V14 |
| **Commission base** | 10% des achats filleuls |
| **Streak multipliers** | ×1.0 → ×1.1 → ×1.2 → ×1.3 → ×1.5 (max) |
| **Reset streak** | Si pas Top Creator 1 mois → retour ×1.0 |
| **Monnaie** | Origins (1 Origin = 1 USD) |
| **Withdrawal** | Min 50$, via Stripe Connect, frais 2.9% + 0.30$ |

---

**📅 Dernière mise à jour :** 2026-01-07  
**🔧 Status :** ✅ DOCUMENTÉ
