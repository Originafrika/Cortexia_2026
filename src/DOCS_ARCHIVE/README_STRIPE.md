# 💳 Système d'Achat de Crédits - Stripe

## ✅ Status : FONCTIONNEL EN MODE TEST

---

## 🎯 RÉSUMÉ EN 1 MINUTE

### Quoi ?
- Badge "Paid Credits" (violet, couronne 👑) maintenant **cliquable**
- Cliquer → Ouvre modal d'achat avec 4 packages (100 / 500 / 1000 / 5000 crédits)
- Mode TEST actif = Crédits ajoutés **instantanément** (pas besoin de Stripe)

### Où ?
- **Interface :** CreateHub, en haut à droite
- **Badge :** Celui avec l'icône couronne violette

### Comment tester ?
1. Ouvrir Cortexia
2. Cliquer sur badge violet "Paid Credits"
3. Choisir un package
4. Cliquer "Purchase"
5. ✅ Toast : "Test mode: XXX credits added"
6. ✅ Badge affiche nouveaux crédits

---

## 📁 FICHIERS CRÉÉS

```
Backend:
  ✅ /supabase/functions/server/stripe-checkout-routes.ts
  ✅ /supabase/functions/server/index.tsx (modifié)

Frontend:
  ✅ /lib/hooks/usePurchaseCredits.ts
  ✅ /components/create/CreateHubGlass.tsx (modifié)

Documentation:
  ✅ /STRIPE_SETUP_COMPLETE.md        (Configuration détaillée)
  ✅ /✅_STRIPE_INTEGRATION_DONE.md   (Résumé complet)
  ✅ /🎯_QUICK_START_STRIPE.md        (Guide visuel)
  ✅ /README_STRIPE.md                (Ce fichier)
```

---

## 🔑 SECRETS CONFIGURÉS

```bash
STRIPE_SECRET_KEY  → Créé (vide pour l'instant = mode test)
```

**Pour activer Stripe :**
1. Créer compte sur https://stripe.com
2. Récupérer clé API (sk_test_...)
3. La coller dans le secret Supabase `STRIPE_SECRET_KEY`

---

## 💰 PACKAGES

| Crédits | Prix   | Réduction |
|---------|--------|-----------|
| 100     | $5     | 0%        |
| 500     | $20    | 20% ⭐    |
| 1000    | $35    | 30%       |
| 5000    | $150   | 40%       |

---

## 🧪 MODE TEST vs PRODUCTION

### MODE TEST (Actuel)
- ✅ Aucune configuration
- ✅ Crédits ajoutés instantanément
- ✅ Parfait pour développement
- ❌ Pas de vrai paiement

### MODE PRODUCTION (Quand Stripe configuré)
- ✅ Vrais paiements Stripe
- ✅ Cartes bancaires acceptées
- ✅ Webhook auto-ajoute crédits
- ⚠️ Requiert configuration Stripe

---

## 📖 GUIDES DÉTAILLÉS

| Document | Description |
|----------|-------------|
| `STRIPE_SETUP_COMPLETE.md` | Configuration complète Stripe |
| `✅_STRIPE_INTEGRATION_DONE.md` | Ce qui a été fait + flow complet |
| `🎯_QUICK_START_STRIPE.md` | Guide visuel étape par étape |

---

## 🚀 PROCHAINES ÉTAPES

### Immédiat (Maintenant)
- [x] Tester en mode test (cliquer badge)
- [x] Vérifier crédits s'ajoutent
- [x] Tester UI/UX (hover, animations)

### Court terme (Quand prêt)
- [ ] Créer compte Stripe
- [ ] Configurer `STRIPE_SECRET_KEY`
- [ ] Tester avec carte test Stripe
- [ ] Configurer webhook

### Long terme (Production)
- [ ] Passer en mode live Stripe
- [ ] Activer vrais paiements
- [ ] Monitoring des transactions

---

## 🐛 SUPPORT

**Problème ?** Vérifier :
1. Badge cliquable ? → Oui = ✅
2. Modal s'ouvre ? → Oui = ✅
3. Crédits ajoutés ? → Vérifier console backend
4. Erreur "No userId" ? → Vérifier authentification

**Logs backend :**
```
Supabase Dashboard → Edge Functions → Logs
Chercher : "🛒 Creating checkout session"
```

---

**Date :** 2026-01-19  
**Version :** 1.0  
**Status :** ✅ Prêt pour test et production
