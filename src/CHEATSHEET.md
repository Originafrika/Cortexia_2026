# ⚡ CHEATSHEET - SYSTÈME CREATOR

**Version:** V3.1 Final - Progressive | **Date:** 21 Janvier 2026

---

## 🎯 **MULTIPLIERS PROGRESSIFS**

| Streak | Rate | Example ($999) |
|--------|------|----------------|
| 1 mois | 10% | $99.90 |
| 2 mois | 11% | $109.89 |
| 3 mois | 12% | $119.88 |
| 4 mois | 13% | $129.87 |
| 5 mois | 14% | $139.86 |
| 6+ mois | 15% | $149.85 (MAX) |

```typescript
// Code
function calculateStreakMultiplier(streakMonths: number): number {
  if (streakMonths >= 6) return 1.5;  // 15%
  if (streakMonths >= 5) return 1.4;  // 14%
  if (streakMonths >= 4) return 1.3;  // 13%
  if (streakMonths >= 3) return 1.2;  // 12%
  if (streakMonths >= 2) return 1.1;  // 11%
  return 1.0;  // 10%
}
```

**Simple:** +1% par mois, max 15% à 6 mois

---

## 📅 **STREAK LOGIC**

```
1er du mois → Check if user was Creator LAST month
✅ Yes → streak++, multiplier++
❌ No  → streak = 0, multiplier = 1.0
```

**Grace Period:** 1 month (verified next month)

**Example:**
```
15 Jan: Become Creator → ["2026-01"], streak=0
1 Feb:  Check "2026-01" ✅ → streak=1, x1.0
1 Mar:  Check "2026-02" ✅ → streak=2, x1.1
1 Apr:  Check "2026-03" ✅ → streak=3, x1.2
1 May:  Check "2026-04" ✅ → streak=4, x1.3
1 Jun:  Check "2026-05" ✅ → streak=5, x1.4
1 Jul:  Check "2026-06" ✅ → streak=6, x1.5 🎉 MAX
```

---

## ✅ **CONDITIONS**

### **Paid (1000 credits)**
- Duration: Until end of calendar month
- Instant activation
- Cost: $79 (Individual package)

### **Organic (Free)**
- 60 V14 generations this month
- 5 posts with ≥5 likes each
- Auto-promotion when conditions met

---

## 🔄 **MONTHLY RESET (1st of month)**

1. Reset stats (gens, posts → 0)
2. **Check streak retrospectively for LAST month**
3. Increment streak if was Creator last month
4. Update multiplier based on new streak
5. Demote if expired/conditions lost
6. **Streak only resets if NOT Creator last month**

---

## 💰 **COMMISSION APPLICATION**

```typescript
// Only if Creator at purchase time
if (referrer.isCreator) {
  commission = amount × 0.10 × referrer.streakMultiplier;
} else {
  commission = amount × 0.10; // base rate
}
```

---

## 🚀 **QUICK REFERENCE**

| Action | Endpoint |
|--------|----------|
| Get status | `GET /creator-system/:userId/status` |
| Activate paid | `POST /creator-system/:userId/activate-paid` |
| Check organic | `POST /creator-system/:userId/check-conditions` |
| Increment stat | `POST /creator-system/:userId/increment-stat` |
| Monthly reset | `POST /creator-system/monthly-reset` |

---

## 📊 **TRACKING**

```typescript
interface CreatorStatus {
  isCreator: boolean;
  creatorMonths: string[];     // ["2026-01", "2026-02", ...]
  creatorStreakMonths: number; // 0, 1, 2, 3, 4, 5, 6+
  streakMultiplier: number;    // 1.0 → 1.5 (progressive)
}
```

---

## 💡 **PROGRESSION**

```
Month 1: 10% (x1.0) - Base
Month 2: 11% (x1.1) - +10%
Month 3: 12% (x1.2) - +20%
Month 4: 13% (x1.3) - +30%
Month 5: 14% (x1.4) - +40%
Month 6: 15% (x1.5) - +50% MAX 🎉
```

**Linear growth:** +1% per month for 6 months

---

**That's it! 🎉**
