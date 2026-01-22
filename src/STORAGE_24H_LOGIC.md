# ⏰ STORAGE CLEANUP - Logique des 24 heures

## 🎯 **QUESTION CLEF**

**"Si j'upload un fichier à 23h, quand sera-t-il supprimé ?"**

**Réponse:** Le fichier sera supprimé **AU MINIMUM 24h après sa création**, lors du prochain cron job (minuit UTC).

---

## 📅 **TIMELINE EXEMPLES**

### **Exemple 1: Upload à 23h**

```
📤 Upload: Jour 1 à 23:00 UTC
   ↓
⏰ Cron run 1: Jour 2 à 00:00 UTC (1h plus tard)
   ❌ PAS SUPPRIMÉ (seulement 1h, pas 24h)
   ↓
⏰ Cron run 2: Jour 3 à 00:00 UTC (25h plus tard)
   ✅ SUPPRIMÉ (>24h)

Résultat: Fichier conservé 25 heures
```

### **Exemple 2: Upload à 01h**

```
📤 Upload: Jour 1 à 01:00 UTC
   ↓
⏰ Cron run 1: Jour 2 à 00:00 UTC (23h plus tard)
   ❌ PAS SUPPRIMÉ (seulement 23h, pas 24h)
   ↓
⏰ Cron run 2: Jour 3 à 00:00 UTC (47h plus tard)
   ✅ SUPPRIMÉ (>24h)

Résultat: Fichier conservé 47 heures
```

### **Exemple 3: Upload à 00:01 (juste après le cron)**

```
📤 Upload: Jour 1 à 00:01 UTC
   ↓
⏰ Cron run 1: Jour 2 à 00:00 UTC (23h59 plus tard)
   ❌ PAS SUPPRIMÉ (presque 24h, mais pas encore)
   ↓
⏰ Cron run 2: Jour 3 à 00:00 UTC (47h59 plus tard)
   ✅ SUPPRIMÉ (>24h)

Résultat: Fichier conservé ~48 heures (maximum)
```

---

## 🔍 **CODE LOGIC**

### **Comment ça marche:**

```typescript
// 1. Le cron run à minuit UTC
const now = new Date(); // 2026-01-17 00:00:00

// 2. Calculer 24h avant maintenant
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
// oneDayAgo = 2026-01-16 00:00:00

// 3. Pour chaque fichier:
const fileCreatedAt = new Date(file.created_at);

// 4. Vérifier si le fichier a plus de 24h
if (fileCreatedAt > oneDayAgo) {
  // Fichier créé APRÈS 2026-01-16 00:00:00
  // → PAS SUPPRIMÉ (trop récent)
  continue;
}

// Fichier créé AVANT ou À 2026-01-16 00:00:00
// → SUPPRIMÉ (≥24h)
delete(file);
```

### **Exemples concrets:**

```typescript
// Cron run à: 2026-01-17 00:00:00
// oneDayAgo = 2026-01-16 00:00:00

// Fichier 1: créé à 2026-01-16 23:00:00
fileCreatedAt > oneDayAgo ? ❌ (23:00 > 00:00) → PAS SUPPRIMÉ (1h seulement)

// Fichier 2: créé à 2026-01-15 23:00:00
fileCreatedAt > oneDayAgo ? ✅ (23:00 < 00:00) → SUPPRIMÉ (25h)

// Fichier 3: créé à 2026-01-16 00:00:00
fileCreatedAt > oneDayAgo ? ✅ (égal) → SUPPRIMÉ (24h exactement)
```

---

## 📊 **RÉTENTION RÉELLE**

### **Tableau de rétention:**

| Heure d'upload | Prochain cron | Temps avant suppression | Cron de suppression |
|----------------|---------------|-------------------------|---------------------|
| 00:01 | +23h59 | ~48h | 2 jours plus tard |
| 01:00 | +23h | ~47h | 2 jours plus tard |
| 12:00 | +12h | ~36h | 2 jours plus tard |
| 23:00 | +1h | ~25h | 2 jours plus tard |
| 23:59 | +1min | ~24h01 | 2 jours plus tard |

### **Résumé:**
```
Rétention MINIMUM: 24 heures
Rétention MAXIMUM: ~48 heures
Rétention MOYENNE: ~36 heures
```

---

## ⚙️ **CONFIGURATION ACTUELLE**

### **Cron job:**
```sql
SELECT cron.schedule(
  'storage-cleanup-daily',
  '0 0 * * *', -- Tous les jours à 00:00 UTC
  $$ ... $$
);
```

### **Protection check:**
```typescript
// Fichier doit avoir >24h ET être non-protégé
const shouldDelete = (
  createdAt <= oneDayAgo &&        // >24h
  !isEnterpriseUser(userId) &&     // Pas enterprise
  !isFileInFeed(fileUrl)           // Pas dans feed
);
```

---

## 💡 **POURQUOI CETTE LOGIQUE ?**

### **Avantages:**

1. **Sécurité:** Fichiers conservés AU MINIMUM 24h
2. **Simplicité:** Un seul cron job (pas de scheduling complexe)
3. **Prévisibilité:** Cleanup toujours à la même heure
4. **Économie:** Fichiers non-utilisés supprimés chaque jour

### **Alternative (non retenue):**

❌ **Cron toutes les heures:**
```
- Plus complexe
- Plus de charge serveur
- Gain marginal (1-2h de stockage)
- Pas justifié pour le use case
```

---

## 🔧 **MODIFIER LA RÉTENTION**

### **Pour 48h de rétention:**

```typescript
// Dans storage-cleanup-service.ts
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
```

### **Pour 12h de rétention:**

```typescript
// Dans storage-cleanup-service.ts
const halfDayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
```

### **Pour cleanup toutes les 6h:**

```sql
-- Nouvelle schedule
SELECT cron.schedule(
  'storage-cleanup-6h',
  '0 */6 * * *', -- Toutes les 6 heures
  $$ ... $$
);
```

---

## 📈 **IMPACT BUSINESS**

### **Scénario réaliste:**

```
Users: 1000 actifs/jour
Uploads: 5 images/user/jour = 5000 images/jour
Taille moyenne: 1 MB/image

SANS cleanup:
└─ 5000 images × 30 jours = 150,000 images
└─ 150,000 MB = 150 GB
└─ Cost: 150 GB × $0.021 = $3.15/mois

AVEC cleanup 24h (10% posté dans feed):
└─ Feed permanent: 500 images/jour × 30 = 15,000 images
└─ Temp (24-48h): 5000 images (max 2 jours)
└─ Total: 20,000 images = 20 GB
└─ Cost: 20 GB × $0.021 = $0.42/mois

ÉCONOMIE: $2.73/mois (87%)
```

### **Si rétention = 48h au lieu de 24h:**

```
Temp (48-96h): 10,000 images
Total: 25 GB
Cost: $0.525/mois

Différence vs 24h: +$0.105/mois (+25%)
```

**Conclusion:** 24h est optimal (équilibre cost/UX).

---

## 🎯 **TESTING**

### **Test 1: Vérifier la logique (Dry Run)**

```bash
# Voir quels fichiers seraient supprimés
curl -X POST .../storage-cleanup/dry-run

# Output devrait montrer:
# - Files >24h: WOULD DELETE
# - Files <24h: SKIP (too recent)
```

### **Test 2: Upload et attendre 25h**

```
1. Upload un fichier à 23:00
2. Attendre le cron du lendemain (00:00) → PAS SUPPRIMÉ
3. Attendre le cron du surlendemain (00:00) → SUPPRIMÉ
```

### **Test 3: Vérifier les logs**

```
🧹 [CLEANUP] Starting storage cleanup...
⏰ [CLEANUP] Current time: 2026-01-17T00:00:00.000Z
📅 [CLEANUP] Deleting files older than: 2026-01-16T00:00:00.000Z

⏭️  [CLEANUP] File too recent: user123/file1.png (created: 2026-01-16T23:00:00.000Z)
✅ [CLEANUP] Deleted: user456/file2.png (created: 2026-01-15T23:00:00.000Z)
```

---

## ✅ **RÉSUMÉ**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⏰ LOGIQUE DES 24 HEURES                              │
│                                                         │
│  1. Cron run à minuit UTC (00:00)                      │
│  2. Calcul: oneDayAgo = now - 24h                      │
│  3. Supprime: fichiers créés AVANT oneDayAgo          │
│  4. Garde: fichiers créés APRÈS oneDayAgo             │
│                                                         │
│  📅 Upload à 23h:                                      │
│     → Supprimé 25h plus tard (J+2 à 00:00)           │
│                                                         │
│  📅 Upload à 01h:                                      │
│     → Supprimé 47h plus tard (J+3 à 00:00)           │
│                                                         │
│  ✅ Rétention: 24h minimum, 48h maximum               │
│  ✅ Protection: Enterprise + Feed toujours gardés     │
│  ✅ Économie: 87% des coûts de stockage               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Date:** 16 janvier 2026  
**Statut:** ✅ Production Ready  
**Rétention:** 24-48h (moyenne 36h)  
**Cron:** Daily at 00:00 UTC
