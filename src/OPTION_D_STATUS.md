# 🚀 OPTION D - TOUT FIXER : STATUS

**Date:** 22 Janvier 2026, 05:00 UTC  
**Durée:** 45 minutes  
**Progression:** 40% complété

---

## ✅ CE QUI A ÉTÉ FAIT (40%)

### **1. BACKEND PARRAINAGE (15min) ✅ TERMINÉ**

**Endpoint créé:** `GET /users/:userId/referral-details`

**Fichier:** `/supabase/functions/server/user-routes.ts`

**Retour JSON:**
```json
{
  "success": true,
  "referralCode": "JOHN2024",
  "referralCount": 3,
  "referralEarnings": 45.50,
  "referrals": [
    {
      "userId": "user123",
      "userName": "Alice Smith",
      "avatar": "https://...",
      "signupDate": "2026-01-15",
      "commissionEarned": 15.50,
      "totalCreditsSpent": 155,
      "status": "active"
    }
  ]
}
```

**Calcul commissions:**
- 10% des dépenses du filleul
- Individual: crédits à $0.10/crédit
- Formule: `(totalCreditsUsed * 0.10 * 0.10)`

---

### **2. FRONTEND WALLET - DATA LOADING (10min) ✅ TERMINÉ**

**Fichier:** `/components/Wallet.tsx`

**Ajouts:**
- ✅ States pour referral data (code, count, earnings, referrals)
- ✅ State pour `copied` (bouton copy code)
- ✅ Fetch endpoint `/users/{userId}/referral-details` dans `loadWalletData()`
- ✅ Gestion erreurs + fallback valeurs par défaut

**Code ajouté:**
```tsx
// States
const [referralCode, setReferralCode] = useState<string>('');
const [referralCount, setReferralCount] = useState<number>(0);
const [referralEarnings, setReferralEarnings] = useState<number>(0);
const [referrals, setReferrals] = useState<any[]>([]);
const [copied, setCopied] = useState(false);

// Fetch
const referralRes = await fetch(`${apiUrl}/users/${userId}/referral-details`, {
  headers: { 'Authorization': `Bearer ${publicAnonKey}` }
});
if (referralRes.ok) {
  const data = await referralRes.json();
  setReferralCode(data.referralCode || '');
  setReferralCount(data.referralCount || 0);
  setReferralEarnings(data.referralEarnings || 0);
  setReferrals(data.referrals || []);
}
```

---

## ⏳ CE QUI RESTE À FAIRE (60%)

### **3. FRONTEND WALLET - UI PARRAINAGE (35min) ❌ NON COMMENCÉ**

**Tâches:**
1. Ajouter icône `Gift` pour parrainage
2. Créer section "Parrainage" dans tab Origins
3. Afficher code de parrainage + bouton copier
4. Liste des filleuls avec détails
5. Total commissions gagnées

**UI à créer:**
```tsx
{/* ✅ NOUVEAU: Section Parrainage */}
<div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Gift className="text-green-400" size={20} />
      <h3 className="text-white">Parrainage</h3>
    </div>
    <div className="text-right">
      <p className="text-white/60 text-xs">Commission lifetime</p>
      <p className="text-green-400 text-lg">10%</p>
    </div>
  </div>
  
  {/* Mon Code */}
  <div className="mb-4">
    <label className="text-white/60 text-sm mb-2 block">Mon code de parrainage</label>
    <div className="flex gap-2">
      <input
        value={referralCode || 'LOADING...'}
        readOnly
        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-center text-lg font-mono"
      />
      <button
        onClick={copyReferralCode}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white"
      >
        {copied ? '✓ Copié' : 'Copier'}
      </button>
    </div>
    <p className="text-white/40 text-xs mt-2">
      Partagez ce code avec vos amis pour gagner 10% de leurs dépenses à vie
    </p>
  </div>
  
  {/* Mes Filleuls */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-white/80">Mes filleuls</p>
      <span className="bg-white/10 px-2 py-1 rounded text-white text-sm">
        {referralCount}
      </span>
    </div>
    
    {referrals.length > 0 ? (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {referrals.map((ref, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm">{ref.userName}</p>
              <p className="text-white/40 text-xs">
                Inscrit le {new Date(ref.signupDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm font-semibold">
                +${ref.commissionEarned.toFixed(2)}
              </p>
              <p className="text-white/40 text-xs">{ref.totalCreditsSpent} crédits</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 bg-white/5 rounded-lg">
        <p className="text-white/60 text-sm">Aucun filleul pour le moment</p>
        <p className="text-white/40 text-xs mt-1">
          Partagez votre code pour commencer à gagner
        </p>
      </div>
    )}
  </div>
  
  {/* Total Earnings */}
  <div className="mt-4 pt-4 border-t border-white/10">
    <div className="flex items-center justify-between">
      <p className="text-white/80">Total commissions gagnées</p>
      <p className="text-green-400 text-xl font-semibold">
        ${referralEarnings.toFixed(2)}
      </p>
    </div>
    <p className="text-white/40 text-xs mt-1">
      Converti automatiquement en Origins chaque mois
    </p>
  </div>
</div>
```

**Handler `copyReferralCode`:**
```tsx
const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
```

---

### **4. WALLET - SÉPARER FREE/PAID CREDITS (15min) ❌ NON COMMENCÉ**

**Tâche:** Modifier l'affichage du balance card Credits

**Actuel:**
```tsx
<div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-4">
  <h2 className="text-white text-3xl">{totalCredits}</h2>
</div>
```

**Nouveau:**
```tsx
<div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-4">
  {/* Total en grand */}
  <h2 className="text-white text-3xl mb-2">{totalCredits}</h2>
  
  {/* Détail free vs paid */}
  <div className="flex items-center gap-3 text-xs">
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
      <span className="text-white/60">{credits.free || 0} gratuits</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
      <span className="text-white/60">{credits.paid || 0} payants</span>
    </div>
  </div>
  
  {creditsExpiresAt && (
    <p className="text-white/60 text-xs mt-2">
      ⏰ Expire: {formatDate(creditsExpiresAt)}
    </p>
  )}
</div>
```

---

### **5. COCONUTV14 - ENTERPRISE CREDITS SÉPARÉS (10min) ❌ NON COMMENCÉ**

**Fichier:** `/components/coconut-v14/CoconutV14App.tsx`

**Tâche:** Ajouter affichage crédits subscription vs addon dans header

**À ajouter:**
```tsx
{/* ✅ ENTERPRISE: Afficher subscription vs addon credits */}
{user.type === 'enterprise' && credits.isEnterprise && (
  <div className="grid grid-cols-2 gap-2 mb-3">
    {/* Monthly Credits */}
    <div className="bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 rounded-lg p-2 border border-[#F5EBE0]/30">
      <p className="text-[#F5EBE0]/60 text-xs mb-1">Mensuels</p>
      <p className="text-white text-lg font-semibold">
        {credits.monthlyCreditsRemaining || 0}
      </p>
      <p className="text-white/40 text-xs">
        Reset {credits.nextResetDate}
      </p>
    </div>
    
    {/* Add-on Credits */}
    <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg p-2 border border-purple-500/30">
      <p className="text-purple-400 text-xs mb-1">Add-on</p>
      <p className="text-white text-lg font-semibold">
        {credits.addOnCredits || 0}
      </p>
      <p className="text-white/40 text-xs">Jamais expirés</p>
    </div>
  </div>
)}
```

---

## 📊 RÉCAPITULATIF TECHNIQUE

### **Endpoints Backend**

| Endpoint | Méthode | Status | Description |
|----------|---------|--------|-------------|
| `/users/:userId/referral-details` | GET | ✅ Créé | Détails parrainage complets |

### **Frontend Components**

| Component | Modification | Status | Lignes |
|-----------|--------------|--------|--------|
| Wallet.tsx | Data loading | ✅ Fait | +30 |
| Wallet.tsx | UI Parrainage | ❌ À faire | +120 |
| Wallet.tsx | Credits split | ❌ À faire | +20 |
| CoconutV14App.tsx | Enterprise credits | ❌ À faire | +30 |

---

## ⏱️ TEMPS RESTANT

**Total prévu:** 2h  
**Dépensé:** 45min  
**Restant:** 1h15min

**Distribution restante:**
- ✅ Backend parrainage: 0min (terminé)
- ✅ Wallet data loading: 0min (terminé)
- ⏳ Wallet UI parrainage: 35min
- ⏳ Wallet credits split: 15min
- ⏳ CoconutV14 enterprise: 10min
- ⏳ Tests + fixes: 15min

---

## 🎯 PROCHAINES ÉTAPES

### **IMMÉDIAT (à continuer maintenant):**

1. **Ajouter icône Gift à Wallet.tsx**
   - Import lucide-react Gift icon
   - Ajouter inline SVG

2. **Créer section Parrainage dans tab Origins**
   - Après "Origins Info"
   - Avant "Origins Transactions"

3. **Impl handler copyReferralCode**
   - navigator.clipboard.writeText()
   - Toast notification optionnel

4. **Séparer free/paid dans balance card**
   - 2 petites badges avec couleurs
   - Garder total en grand

5. **Tester avec utilisateur test**
   - Vérifier fetch endpoint
   - Vérifier affichage données

---

## 📝 NOTES IMPORTANTES

### **Commission Calculation**
```typescript
// Backend calcul (user-routes.ts ligne ~641)
const commissionEarned = (referralProfile.totalCreditsUsed || 0) * 0.10 * 0.10;
// 10% de ($0.10/crédit)
```

### **Prix crédits Individual**
- Free: $0 (25 initiaux, +10 si parrainé)
- Paid: $0.10/crédit
- Commission: 10% lifetime (donc $0.01/crédit dépensé par filleul)

### **Conversion Origins**
- Commissions parrainage → Origins (monthly)
- 1 Origin = $1 USD
- Withdrawal: 2x/mois max via Stripe

---

## 🔗 FICHIERS MODIFIÉS

```
✅ /supabase/functions/server/user-routes.ts (+70 lignes)
✅ /components/Wallet.tsx (+30 lignes)
⏳ /components/Wallet.tsx (+140 lignes à ajouter)
⏳ /components/coconut-v14/CoconutV14App.tsx (+30 lignes à ajouter)
```

---

**Dernière mise à jour:** 22 Janvier 2026, 05:00 UTC  
**Status:** ⏳ **EN COURS** - 40% complété  
**Prochaine session:** Continuer UI Parrainage Wallet
