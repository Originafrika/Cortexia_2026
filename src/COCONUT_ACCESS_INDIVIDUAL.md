# 🥥 COCONUT ACCESS POUR INDIVIDUAL USERS

**Date:** 21 Janvier 2026  
**Version:** V3.1 Final  
**Système:** Quota Mensuel pour Creators

---

## 🎯 RÉSUMÉ RAPIDE

**Coconut V14 est réservé aux Enterprise... SAUF pour les Creators Individual !**

```
┌─────────────────────────────────────────────────────────────┐
│              ACCÈS COCONUT V14/V13 PRO                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Individual (Non-Creator):  ❌ Pas d'accès               │
│  ⭐ Individual (Creator):      ✅ 3 générations/mois        │
│  🏢 Enterprise:                ✅ Illimité                   │
│  💻 Developer:                 ✅ Playground uniquement      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 COMMENT ÇA MARCHE ?

### **1️⃣ Devenir Creator (Individual)**

Pour débloquer l'accès à Coconut V14, un Individual user doit devenir **Creator** via :

#### **Option A: Payer 1000 crédits**
```
✅ Coût: 1000 crédits ($79 si achat)
✅ Durée: Jusqu'à fin du mois calendaire
✅ Activation: Instantanée
✅ Bonus: Accès Coconut + Système de parrainage
```

#### **Option B: Gagner le statut (Organique)**
```
✅ Conditions:
   • 60 générations Coconut V14 ce mois
   • 5 posts dans le Feed avec ≥5 likes chacun
✅ Durée: Jusqu'à fin du mois
✅ Activation: Automatique quand conditions remplies
✅ Bonus: Gratuit + accès parrainage
```

---

### **2️⃣ Quota Mensuel de Coconut**

Une fois Creator, l'Individual user obtient :

```
┌─────────────────────────────────────────────────────────────┐
│           🥥 QUOTA COCONUT V14 (CREATOR)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 3 générations Coconut V14 par mois                       │
│  ✅ Reset automatique le 1er du mois                         │
│  ✅ Valable tant que statut Creator actif                    │
│                                                              │
│  Types de générations comptées:                             │
│  • Image (Coconut V14)                                       │
│  • Video (Coconut V14)                                       │
│  • Campaign (Coconut V14 Campaign Mode)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **3️⃣ Tracking du Quota**

Le système track automatiquement l'utilisation :

#### **KV Store Keys**
```typescript
creator:stats:${userId}:${month} = {
  userId: "sarah_123",
  month: "2026-03",
  coconutAccessActive: true,
  coconutGenerationsUsed: 2,      // ← Compteur
  coconutGenerationsRemaining: 1, // ← Reste
  creatorAccessExpiresAt: "2026-03-31T23:59:59Z",
  isTopCreator: false,
  boughtCreatorAccess: true
}
```

#### **API Endpoint**
```bash
GET /creators/:userId/coconut-access

Response:
{
  "success": true,
  "hasCoconutAccess": true,
  "isCreator": true,
  "isEnterprise": false,
  "accountType": "individual",
  "coconutGenerationsUsed": 2,
  "coconutGenerationsRemaining": 1,
  "expiresAt": "2026-03-31T23:59:59Z"
}
```

---

## 🎬 SCÉNARIO COMPLET: SARAH (INDIVIDUAL → CREATOR → COCONUT)

### **📱 Étape 1: Sarah devient Creator**

```
21 Mars 2026, 10:00

Sarah (Individual) achète 1000 crédits pour devenir Creator
→ POST /creator-system/sarah_123/activate-paid

✅ Déduction: 1000 crédits utilisés
✅ Status: Creator activé
✅ Expiry: 31 Mars 2026, 23:59:59
✅ Coconut Access: Activé (3/3 générations disponibles)

KV Store update:
creator:stats:sarah_123:2026-03 = {
  coconutAccessActive: true,
  coconutGenerationsUsed: 0,
  boughtCreatorAccess: true,
  creatorAccessExpiresAt: "2026-03-31T23:59:59Z"
}
```

---

### **🎨 Étape 2: Sarah accède au CreateHub**

```
21 Mars 2026, 10:05

Sarah ouvre CreateHub
→ GET /creators/sarah_123/coconut-access

Response:
{
  "hasCoconutAccess": true,
  "isCreator": true,
  "coconutGenerationsRemaining": 3
}

UI affiche:
┌──────────────────────────────────────────┐
│        🎨 CREATE HUB                      │
├──────────────────────────────────────────┤
│                                           │
│  [Text to Image]  [Image to Image]       │
│                                           │
│  [🥥 Coconut V14]  [🥥 Coconut V13 Pro]  │
│   ✅ UNLOCKED      ✅ UNLOCKED            │
│   (2/3 left)      (Premium)              │
│                                           │
└──────────────────────────────────────────┘
```

---

### **🚀 Étape 3: Sarah génère avec Coconut V14**

```
21 Mars 2026, 10:10

Sarah clique sur [Coconut V14]
→ CoconutV14App s'ouvre

Elle crée une campagne marketing:
→ POST /campaign/generate
→ 5 images générées (compte comme 1 génération Coconut)

Backend tracking:
→ POST /creators/sarah_123/coconut-track
   Body: { "generationType": "campaign" }

✅ Compteur incrémenté:
   coconutGenerationsUsed: 0 → 1
   coconutGenerationsRemaining: 3 → 2

Response:
{
  "success": true,
  "coconutGenerationsUsed": 1,
  "coconutGenerationsRemaining": 2
}
```

---

### **📊 Étape 4: Vérification du Quota**

```
21 Mars 2026, 15:30

Sarah retourne au CreateHub
→ useCoconutAccess() fetch automatique

UI Update:
┌──────────────────────────────────────────┐
│  [🥥 Coconut V14]                         │
│   ✅ UNLOCKED                             │
│   (1/3 left)  ⚠️                          │
└──────────────────────────────────────────┘

Tooltip:
"You have 1 Coconut generation left this month"
```

---

### **🎯 Étape 5: Sarah utilise son dernier quota**

```
22 Mars 2026, 09:00

Sarah génère une 2ème campagne:
→ POST /creators/sarah_123/coconut-track
→ coconutGenerationsUsed: 1 → 2

Sarah génère une 3ème image solo:
→ POST /creators/sarah_123/coconut-track
→ coconutGenerationsUsed: 2 → 3

Status:
{
  "coconutGenerationsUsed": 3,
  "coconutGenerationsRemaining": 0  ❌
}

UI Update:
┌──────────────────────────────────────────┐
│  [🥥 Coconut V14]                         │
│   🔒 QUOTA EXHAUSTED                      │
│   (0/3 left)                              │
│   Resets: Apr 1, 2026                     │
└──────────────────────────────────────────┘
```

---

### **❌ Étape 6: Sarah essaie de générer (quota épuisé)**

```
25 Mars 2026, 14:00

Sarah clique sur [Coconut V14]
→ Vérification: coconutGenerationsRemaining = 0

Modal d'erreur:
┌──────────────────────────────────────────┐
│  ⚠️ QUOTA EXHAUSTED                      │
├──────────────────────────────────────────┤
│                                           │
│  You've used all 3 Coconut generations   │
│  this month.                              │
│                                           │
│  Your quota will reset on:               │
│  📅 April 1, 2026                         │
│                                           │
│  [OK]                                     │
│                                           │
└──────────────────────────────────────────┘

Action bloquée ❌
```

---

### **🔄 Étape 7: Reset Mensuel (1er Avril)**

```
1er Avril 2026, 00:00 UTC

Cron job: POST /creators/monthly-reset

Pour Sarah:
✅ Reset compteur:
   coconutGenerationsUsed: 3 → 0
   coconutGenerationsRemaining: 0 → 3

✅ Vérification statut Creator:
   • Paid Creator expiré le 31 Mars ❌
   • Conditions organiques non remplies ❌
   
✅ Désactivation:
   coconutAccessActive: true → false
   isCreator: false

Nouveau status:
{
  "hasCoconutAccess": false,  ❌
  "isCreator": false,         ❌
  "coconutGenerationsUsed": 0,
  "coconutGenerationsRemaining": 0
}

Sarah perd l'accès à Coconut!
```

---

### **♻️ Étape 8: Sarah redevient Creator**

```
5 Avril 2026, 10:00

Sarah veut réaccéder à Coconut
→ Elle paie à nouveau 1000 crédits

POST /creator-system/sarah_123/activate-paid

✅ Réactivation:
   isCreator: true
   coconutAccessActive: true
   coconutGenerationsUsed: 0
   coconutGenerationsRemaining: 3
   creatorAccessExpiresAt: "2026-04-30T23:59:59Z"

Sarah peut à nouveau utiliser Coconut! 🎉
```

---

## 🔐 IMPLÉMENTATION TECHNIQUE

### **Frontend (CreateHubGlass.tsx)**

```typescript
import { useCoconutAccess } from '../../lib/hooks/useCoconutAccess';

// Dans le composant:
const { accessData } = useCoconutAccess(userId);

// Affichage conditionnel:
{accessData?.hasAccess && accessData?.isCreator && (
  <button onClick={() => onSelectTool('coconut-v14')}>
    🥥 Coconut V14
    <span>({accessData.remainingGenerations}/3 left)</span>
  </button>
)}

// Si quota épuisé:
{accessData?.hasAccess && accessData?.remainingGenerations === 0 && (
  <div className="quota-exhausted">
    🔒 Quota exhausted
    <span>Resets: {formatDate(accessData.resetDate)}</span>
  </div>
)}
```

---

### **Backend (creator-routes.ts)**

#### **Check Access**
```typescript
app.get('/:userId/coconut-access', async (c) => {
  const userId = c.req.param('userId');
  const month = getCurrentMonth();
  
  // Get creator stats
  const stats = await kv.get(`creator:stats:${userId}:${month}`);
  
  // Check if Creator
  const isCreator = stats.isTopCreator || 
                    user.isCreator || 
                    stats.boughtCreatorAccess;
  
  // Check if access active
  const hasAccess = stats.coconutAccessActive && isCreator;
  
  // Calculate remaining
  const remaining = hasAccess ? Math.max(0, 3 - stats.coconutGenerationsUsed) : 0;
  
  return c.json({
    hasCoconutAccess: hasAccess,
    isCreator: isCreator,
    coconutGenerationsUsed: stats.coconutGenerationsUsed,
    coconutGenerationsRemaining: remaining
  });
});
```

#### **Track Generation**
```typescript
app.post('/:userId/coconut-track', async (c) => {
  const userId = c.req.param('userId');
  const { generationType } = await c.req.json();
  
  const stats = await kv.get(`creator:stats:${userId}:${month}`);
  
  // Increment counter
  stats.coconutGenerationsUsed++;
  await kv.set(`creator:stats:${userId}:${month}`, stats);
  
  return c.json({
    coconutGenerationsUsed: stats.coconutGenerationsUsed,
    coconutGenerationsRemaining: Math.max(0, 3 - stats.coconutGenerationsUsed)
  });
});
```

#### **Monthly Reset**
```typescript
app.get('/monthly-reset', async (c) => {
  const currentMonth = getCurrentMonth();
  const allStats = await kv.getByPrefix('creator:stats:');
  
  for (const stats of allStats) {
    // Reset counter
    stats.coconutGenerationsUsed = 0;
    
    // Check if Creator status still valid
    const isStillCreator = checkCreatorStatus(stats);
    stats.coconutAccessActive = isStillCreator;
    
    await kv.set(`creator:stats:${stats.userId}:${currentMonth}`, stats);
  }
  
  return c.json({ success: true });
});
```

---

## 📊 COMPARAISON INDIVIDUAL vs ENTERPRISE

| Feature | Individual (Creator) | Enterprise |
|---------|---------------------|------------|
| **Accès Coconut V14** | ✅ Oui (limité) | ✅ Oui (illimité) |
| **Quota Mensuel** | 3 générations | ∞ Illimité |
| **Coût** | $79 (1000 crédits pour Creator) | $999/mois |
| **Durée** | Jusqu'à fin du mois | Tant que subscription active |
| **Reset** | 1er du mois calendaire | Rolling 30 jours |
| **Maintenance** | Doit redevenir Creator chaque mois | Automatique (subscription) |
| **Campaign Mode** | ✅ Oui (compte dans quota) | ✅ Oui (illimité) |
| **CocoBoard** | ✅ Oui | ✅ Oui |
| **API Access** | ❌ Non | ⚠️ Possible |
| **Team Features** | ❌ Non | ✅ Oui |

---

## 💡 CAS D'USAGE RÉELS

### **Scénario 1: Designer Freelance (Sarah)**
```
✅ Devient Creator: $79 (1000 crédits)
✅ Utilise 3 générations Coconut pour projets clients
✅ ROI: Projets clients à $500+ chacun = $1,500+
✅ Coût: $79 (profitable!)
```

### **Scénario 2: Petit Business (Marc)**
```
✅ Devient Creator: Organique (gratuit)
✅ Génère 60 créations pour tester
✅ Publie 5 posts dans Feed, reçoit likes
✅ Débloque Coconut gratuitement
✅ Crée 3 campagnes marketing/mois
✅ Coût: $0 (100% gratuit!)
```

### **Scénario 3: Agency (David) → Enterprise**
```
❌ Quota 3/mois insuffisant
✅ Upgrade vers Enterprise: $999/mois
✅ Coconut illimité pour toute l'équipe
✅ ROI: Clients multiples, génération intensive
```

---

## ⚠️ LIMITATIONS & RÈGLES

### **Limitations du Quota Creator**

1. **3 générations MAX par mois**
   - 1 campagne (5 images) = 1 génération
   - 1 image solo = 1 génération
   - 1 vidéo = 1 génération

2. **Pas de report**
   - Si tu utilises seulement 2/3 ce mois
   - Le mois suivant, c'est quand même 3/3 (pas 4)

3. **Reset calendaire**
   - Toujours le 1er du mois à 00:00 UTC
   - Pas de rolling period

4. **Statut Creator requis**
   - Si tu perds Creator → Accès immédiat perdu
   - Même si quota reste disponible

---

## 🎯 RÉSUMÉ SIMPLIFIÉ

```
┌─────────────────────────────────────────────────────────────┐
│              🥥 COCONUT ACCESS - RÈGLES                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. ⭐ DEVIENS CREATOR                                       │
│     → Paie 1000 crédits OU remplis conditions               │
│                                                              │
│  2. 🥥 ACCÈDE À COCONUT V14                                  │
│     → 3 générations disponibles                             │
│                                                              │
│  3. 🎨 CRÉE TES CAMPAGNES                                    │
│     → Chaque génération décrémente le compteur              │
│                                                              │
│  4. 🔒 QUOTA ÉPUISÉ?                                         │
│     → Attends le 1er du mois prochain                       │
│                                                              │
│  5. 🔄 RESET MENSUEL                                         │
│     → Quota revient à 3/3                                   │
│     → Mais vérifie ton statut Creator!                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 POUR ALLER PLUS LOIN

### **Option 1: Rester Individual Creator**
```
✅ Coût: $79/mois (si payé) ou gratuit (si organique)
✅ Quota: 3 générations Coconut/mois
✅ Parfait pour: Freelances, petits projets
```

### **Option 2: Upgrade vers Enterprise**
```
✅ Coût: $999/mois
✅ Quota: Illimité
✅ Parfait pour: Agencies, équipes, usage intensif
```

---

**Le système est flexible et permet aux Individual users de goûter à Coconut sans payer $999/mois ! 🎉**

**Dernière mise à jour:** 21 Janvier 2026, 23:59 UTC  
**Version:** V3.1 Final
