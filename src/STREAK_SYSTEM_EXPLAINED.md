# 🔥 SYSTÈME DE STREAK - EXPLICATION COMPLÈTE

**Date:** 21 Janvier 2026  
**Version:** V3.1 - Streak Rétrospectif avec Multipliers Progressifs

---

## 🎯 **PRINCIPE FONDAMENTAL**

Le streak est **calculé rétrospectivement** le 1er de chaque mois en regardant si l'utilisateur a été Creator **au moins une fois** pendant le mois **précédent**.

---

## 📊 **STRUCTURE DE DONNÉES**

```typescript
interface CreatorStatus {
  userId: string;
  isCreator: boolean;  // Statut actuel
  
  // ✅ NOUVEAU - Tracking des mois
  creatorMonths: string[];  // ["2026-01", "2026-02", ...]
  
  // Streak
  creatorStreakMonths: number;
  streakMultiplier: number;  // 1.0 → 1.5 (progressive)
  lastStreakUpdate: string;
}
```

---

## 🔄 **FONCTIONNEMENT**

### **Quand un utilisateur devient Creator**

```typescript
// 15 janvier : Alice devient Creator
const currentMonth = "2026-01";

creatorStatus.creatorMonths.push("2026-01");
creatorStatus.isCreator = true;

// creatorMonths = ["2026-01"]
// streak = 0 (pas encore calculé)
```

### **1er février : Reset Mensuel**

```typescript
// 1. Reset stats
generationsThisMonth = 0;
publishedThisMonth = 0;

// 2. Vérifier streak pour JANVIER
const lastMonth = "2026-01";
const wasCreatorLastMonth = creatorMonths.includes("2026-01");

if (wasCreatorLastMonth) {
  // ✅ Alice était Creator en janvier
  creatorStreakMonths += 1;  // 0 → 1
  streakMultiplier = 1.0;    // 1 mois = x1.0
}

// creatorMonths = ["2026-01"]
// streak = 1 mois
```

### **Pendant février : Alice perd puis reprend son statut**

```typescript
// 1er février : Alice n'a plus les conditions
isCreator = false;

// 28 février : Alice re-remplit les conditions
const currentMonth = "2026-02";
creatorMonths.push("2026-02");
isCreator = true;

// creatorMonths = ["2026-01", "2026-02"]
// streak = 1 mois (pas encore recalculé)
```

### **1er mars : Vérification Rétrospective**

```typescript
// Vérifier streak pour FÉVRIER
const lastMonth = "2026-02";
const wasCreatorLastMonth = creatorMonths.includes("2026-02");

if (wasCreatorLastMonth) {
  // ✅ Alice était Creator en février (même si seulement le 28!)
  creatorStreakMonths += 1;  // 1 → 2
  streakMultiplier = 1.2;    // 2 mois = x1.2
}

// creatorMonths = ["2026-01", "2026-02"]
// streak = 2 mois
// multiplier = x1.2 (12%)
```

---

## 🎬 **SCÉNARIO COMPLET**

### **Timeline d'Alice**

| Date | Action | creatorMonths | isCreator | Streak | Multiplier |
|------|--------|---------------|-----------|--------|------------|
| **15 jan** | Devient Creator | `["2026-01"]` | ✅ true | 0 | x1.0 |
| **1er fév** | Reset + Check "2026-01" ✅ | `["2026-01"]` | ✅ true | **1** | **x1.0** |
| **10 fév** | Perd conditions | `["2026-01"]` | ❌ false | 1 | x1.0 |
| **28 fév** | Re-remplit conditions | `["2026-01", "2026-02"]` | ✅ true | 1 | x1.0 |
| **1er mar** | Reset + Check "2026-02" ✅ | `["2026-01", "2026-02"]` | ✅ true | **2** | **x1.1** |
| **1er avr** | Reset + Check "2026-03" ✅ | `["...", "2026-03"]` | ✅ true | **3** | **x1.2** |

### **Mars : Alice ne devient jamais Creator**

| Date | Action | creatorMonths | isCreator | Streak | Multiplier |
|------|--------|---------------|-----------|--------|------------|
| **1-31 mars** | Jamais Creator | `["2026-01", "2026-02"]` | ❌ false | 2 | x1.1 |
| **1er avr** | Reset + Check "2026-03" ❌ | `["2026-01", "2026-02"]` | ❌ false | **0** | **x1.0** |

**Explication :** Mars ("2026-03") **n'est PAS** dans `creatorMonths` → Streak RESET !

---

## 💡 **AVANTAGES DE CE SYSTÈME**

### **1. Flexibilité**

```
Alice devient Creator le 28 du mois
→ Le mois compte quand même!
→ Pas besoin d'être Creator tout le mois
```

### **2. Grâce Naturelle**

```
Alice perd son statut le 1er février
→ Streak conservé jusqu'au 1er mars
→ Si elle redevient Creator en février → Streak continue
→ Si elle ne redevient pas → Streak reset en mars
```

### **3. Simple à Comprendre**

```
Question: "As-tu été Creator au moins 1 jour ce mois?"
→ Oui: Streak +1
→ Non: Streak = 0
```

---

## 🔧 **IMPLÉMENTATION**

### **Ajouter un Mois**

```typescript
// Quand user devient Creator
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

if (!creatorStatus.creatorMonths.includes(currentMonth)) {
  creatorStatus.creatorMonths.push(currentMonth);
}
```

### **Vérifier Streak (1er du mois)**

```typescript
// Calculer mois précédent
const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

// Vérifier présence
const wasCreatorLastMonth = creatorStatus.creatorMonths.includes(lastMonth);

if (wasCreatorLastMonth) {
  // ✅ Incrémenter streak
  creatorStatus.creatorStreakMonths += 1;
  creatorStatus.streakMultiplier = calculateStreakMultiplier(creatorStatus.creatorStreakMonths);
} else {
  // ❌ Reset streak
  creatorStatus.creatorStreakMonths = 0;
  creatorStatus.streakMultiplier = 1.0;
}
```

### **Multipliers**

```typescript
function calculateStreakMultiplier(streakMonths: number): number {
  if (streakMonths >= 6) return 1.5;  // 15%
  if (streakMonths >= 5) return 1.4;  // 14%
  if (streakMonths >= 4) return 1.3;  // 13%
  if (streakMonths >= 3) return 1.2;  // 12%
  if (streakMonths >= 2) return 1.1;  // 11%
  return 1.0;  // 10%
}
```

---

## ⚠️ **PIÈGES À ÉVITER**

### ❌ **NE PAS vérifier le statut actuel**

```typescript
// FAUX
if (creatorStatus.isCreator) {
  streakMonths += 1;
}

// JUSTE
if (creatorMonths.includes(lastMonth)) {
  streakMonths += 1;
}
```

**Pourquoi ?** Le statut actuel peut être `false` mais le mois peut quand même compter si l'utilisateur a été Creator ne serait-ce qu'un jour.

### ❌ **NE PAS reset le streak immédiatement**

```typescript
// FAUX - Reset immédiat si perd statut
if (!isCreator) {
  streakMonths = 0;
}

// JUSTE - Attendre le reset mensuel
// Le streak n'est recalculé QUE le 1er du mois
```

---

## 📈 **IMPACT SUR LES COMMISSIONS**

### **Scénario : Alice parraine Bob**

**Janvier (Streak 1 mois, x1.0) :**
```
Bob achète $999
→ Commission Alice: $999 × 10% = $99.90
```

**Mars (Streak 2 mois, x1.1) :**
```
Bob achète $999
→ Commission Alice: $999 × 11% = $109.89  (+10%)
```

**Juin (Streak 5 mois, x1.5) :**
```
Bob achète $999
→ Commission Alice: $999 × 15% = $149.85  (+50%)
```

**Juillet (Alice n'était pas Creator en juin, Streak reset à 0, x1.0) :**
```
Bob achète $999
→ Commission Alice: $999 × 10% = $99.90  (base rate)
```

---

## 🎯 **RÉSUMÉ**

| Aspect | Détail |
|--------|--------|
| **Tracking** | `creatorMonths[]` = Liste des mois où user a été Creator |
| **Vérification** | Le 1er du mois, check si mois **précédent** dans la liste |
| **Incrément** | Si présent → `streak++`, sinon → `streak = 0` |
| **Multiplier** | Progressif: 1→1.1→1.2→1.3→1.4→1.5 (mois 1-6) |
| **Grâce** | 1 mois naturel (vérifié le mois d'après) |
| **Flexibilité** | 1 jour Creator dans le mois = mois compte |

---

**Le système est maintenant 100% implémenté avec vérification rétrospective !** ✅

**Dernière mise à jour:** 21 Janvier 2026, 23:00 UTC