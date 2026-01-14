# 🎁 SYSTÈME DE PARRAINAGE UNIVERSEL - Cortexia

## 🎯 **RÈGLES DU SYSTÈME**

### **QUI PEUT PARRAINER ?**
✅ **Individual users UNIQUEMENT**  
❌ Enterprise users : Ne peuvent PAS parrainer  
❌ Developer users : Ne peuvent PAS parrainer

### **QUI PEUT ÊTRE PARRAINÉ ?**
✅ **TOUS les types d'users peuvent être parrainés !**
- ✅ Individual users
- ✅ Enterprise users
- ✅ Developer users

### **COMMISSIONS**
Le parrain (Individual) gagne des commissions sur **TOUS les achats** de ses filleuls, **quel que soit leur type**.

---

## 💰 **CALCUL DES COMMISSIONS**

### **Formule de base**
```
Commission = Montant d'achat × 10% × Streak Multiplier
```

### **Exemples**

#### **Exemple 1 : Filleul Individual**
- Filleul (Individual) achète 100$ de crédits
- Parrain reçoit : `100$ × 10% × 1.2 = 12$` (si streak × 1.2)

#### **Exemple 2 : Filleul Enterprise**
- Filleul (Enterprise) achète 500$ de crédits
- Parrain reçoit : `500$ × 10% × 1.0 = 50$` (si streak × 1.0)

#### **Exemple 3 : Filleul Developer**
- Filleul (Developer) achète 1000$ d'API credits
- Parrain reçoit : `1000$ × 10% × 1.5 = 150$` (si streak × 1.5)

**Important :** Les **Enterprise** et **Developer** users font souvent de **gros achats**, donc parrainer un Enterprise peut être **très lucratif** ! 💰

---

## 🔗 **FLOW DE PARRAINAGE OAUTH**

### **PROBLÈME RÉSOLU**

Avant, lors du signup via Google/Apple/GitHub OAuth, il n'y avait **pas de possibilité** de saisir un code de parrainage.

### **SOLUTION IMPLÉMENTÉE**

1. **Champ de parrainage optionnel** dans le formulaire OAuth
2. **Stockage en sessionStorage** avant redirection Auth0
3. **Récupération après callback** et envoi au backend
4. **Enregistrement dans la DB** avec lien parrain → filleul

---

## 🎨 **UI/UX : FORMULAIRE OAUTH AVEC REFERRAL**

### **Composant : Auth0SocialButtons.tsx**

**Visuel :**

```
┌──────────────────────────────────────┐
│                                      │
│  Ou continuez avec                   │
│  ────────────────────────────────    │
│                                      │
│  🎟️ J'ai un code de parrainage       │  ← Bouton collapsible
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Ex: JOHN123                    │  │  ← Input (si cliqué)
│  └────────────────────────────────┘  │
│  ✨ Vous et votre parrain recevrez   │
│     des bonus !                      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🔵  Continuer avec Google     │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🍎  Continuer avec Apple      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🐙  Continuer avec GitHub     │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### **Code React**

```tsx
const [referralCode, setReferralCode] = useState('');
const [showReferralInput, setShowReferralInput] = useState(false);

// Bouton pour afficher/masquer
<button onClick={() => setShowReferralInput(!showReferralInput)}>
  <Ticket size={16} />
  <span>{showReferralInput ? 'Masquer' : 'J\'ai un code de parrainage'}</span>
</button>

// Input collapsible
{showReferralInput && (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
    <input
      value={referralCode}
      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
      placeholder="Ex: JOHN123"
      maxLength={20}
    />
    {referralCode && (
      <p className="text-[#D4B896]">
        ✨ Vous et votre parrain recevrez des bonus !
      </p>
    )}
  </motion.div>
)}

// Bouton OAuth avec referral code
<button onClick={() => handleSocialLogin('google-oauth2')}>
  Continuer avec Google
</button>

// Fonction qui passe le code
const handleSocialLogin = async (provider) => {
  const finalReferralCode = referralCode.trim() || undefined;
  
  await loginWithAuth0SDK(provider, userType, {
    referralCode: finalReferralCode
  });
};
```

---

## 🔄 **FLOW TECHNIQUE COMPLET**

### **1. Frontend : Saisie du code**

```
User clique "J'ai un code de parrainage"
  ↓
Input apparaît (animation)
  ↓
User tape "JOHN123"
  ↓
User clique "Continuer avec Google"
  ↓
Code stocké dans sessionStorage
```

**Code :**
```typescript
sessionStorage.setItem('cortexia_pending_referral_code', 'JOHN123');
```

---

### **2. Redirection Auth0**

```
Frontend → Auth0 Google OAuth
  ↓
User accepte permissions Google
  ↓
Redirect vers /callback?code=...
```

**sessionStorage conservé** : ✅ (même domaine)

---

### **3. Callback : Récupération du code**

```typescript
// Après callback Auth0
const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');

const user: User = {
  id: 'google-oauth2|110247234719945760338',
  email: 'newuser@example.com',
  name: 'New User',
  type: 'enterprise', // ✅ Peut être n'importe quel type !
  referralCode: 'JOHN123', // ✅ Code récupéré
  // ...
};
```

---

### **4. Backend : Enregistrement du parrainage**

**Endpoint :** `POST /users/create-or-update-auth0`

```typescript
app.post('/create-or-update-auth0', async (c) => {
  const { userId, email, userType, referralCode } = await c.req.json();
  
  // ✅ Vérifier si le code existe
  const referrerId = await kv.get(`referral:code:${referralCode}`);
  
  if (referrerId) {
    // ✅ Vérifier que le parrain est Individual
    const referrerProfile = await kv.get(`user:profile:${referrerId}`);
    
    if (referrerProfile.accountType === 'individual') {
      // ✅ VALIDE : Individual peut parrainer n'importe quel type
      
      // Créer le lien parrain → filleul
      referredBy = referrerId;
      
      // Ajouter à la liste des filleuls du parrain
      const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
      referrerReferrals.push(userId);
      await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
      
      // Incrémenter le compteur de filleuls
      referrerProfile.referralCount += 1;
      await kv.set(`user:profile:${referrerId}`, referrerProfile);
      
      console.log(`✅ ${userType} user ${email} parrainé par ${referrerId}`);
    } else {
      console.warn(`❌ Referrer ${referrerId} n'est pas Individual - parrainage invalide`);
    }
  }
  
  // Créer le profil du nouveau user
  const profile = {
    userId,
    email,
    accountType: userType,  // ✅ individual / enterprise / developer
    referredBy,             // ✅ Lien vers le parrain
    referralCode: generateReferralCode(email),
    // ...
  };
  
  await kv.set(`user:profile:${userId}`, profile);
});
```

---

## 📊 **STRUCTURE DE LA BASE DE DONNÉES**

### **1. Profil du PARRAIN (Individual)**

**Clé :** `user:profile:google-oauth2|123456789` (Individual)

```json
{
  "userId": "google-oauth2|123456789",
  "email": "john@example.com",
  "accountType": "individual",
  
  "referralCode": "JOHN123",      // ✅ Son code
  "referralCount": 3,              // ✅ 3 filleuls
  "referralEarnings": 212.00,      // ✅ Total Origins gagné
  
  "hasCoconutAccess": true,
  "topCreatorMonth": "2026-01",
  "streakMultiplier": 1.2
}
```

---

### **2. Liste des FILLEULS du parrain**

**Clé :** `user:referrals:google-oauth2|123456789`

```json
[
  "google-oauth2|987654321",   // ✅ Individual
  "google-oauth2|111222333",   // ✅ Enterprise
  "google-oauth2|444555666"    // ✅ Developer
]
```

---

### **3. Profil d'un FILLEUL (Enterprise)**

**Clé :** `user:profile:google-oauth2|111222333` (Enterprise)

```json
{
  "userId": "google-oauth2|111222333",
  "email": "startup@example.com",
  "accountType": "enterprise",     // ✅ Type enterprise
  
  "referredBy": "google-oauth2|123456789",  // ✅ Lien vers le parrain
  "referredAt": "2026-01-07T14:30:00.000Z",
  
  "referralCode": "STARTU456",     // ✅ Ce filleul a aussi un code (mais ne peut pas parrainer)
  "referralCount": 0,               // ✅ 0 car Enterprise ne peut pas parrainer
  
  "companyName": "StartupCo",
  "companyLogo": "https://..."
}
```

---

### **4. Mapping du code de parrainage**

**Clé :** `referral:code:JOHN123`

```json
"google-oauth2|123456789"  // ✅ UserId du parrain
```

---

## 💳 **COMMISSION SUR ACHAT**

### **Webhook Stripe : checkout.session.completed**

```typescript
// Quand un achat est validé
app.post('/stripe-webhook', async (c) => {
  const event = await c.req.json();
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Récupérer le userId de l'acheteur
    const buyerId = session.metadata.userId;
    const amount = session.amount_total / 100; // En $
    
    // Récupérer le profil de l'acheteur
    const buyerProfile = await kv.get(`user:profile:${buyerId}`);
    
    // ✅ Vérifier s'il a été parrainé
    if (buyerProfile.referredBy) {
      const referrerId = buyerProfile.referredBy;
      
      // Récupérer le profil du parrain
      const referrerProfile = await kv.get(`user:profile:${referrerId}`);
      
      // ✅ Vérifier que le parrain est Individual
      if (referrerProfile.accountType === 'individual') {
        // ✅ Calculer la commission
        const baseRate = 0.10; // 10%
        const streakMultiplier = referrerProfile.streakMultiplier || 1.0;
        const commission = amount * baseRate * streakMultiplier;
        
        // ✅ Ajouter Origins au parrain
        referrerProfile.referralEarnings += commission;
        await kv.set(`user:profile:${referrerId}`, referrerProfile);
        
        console.log(`💰 Commission de ${commission}$ payée au parrain ${referrerId}`);
        console.log(`   → Achat de ${amount}$ par ${buyerProfile.accountType} user ${buyerProfile.email}`);
        
        // ✅ Notifier le parrain
        await sendEmail(referrerProfile.email, {
          subject: '💰 Vous avez gagné une commission !',
          body: `Votre filleul ${buyerProfile.email} a acheté pour ${amount}$. Vous recevez ${commission}$ !`
        });
      }
    }
  }
});
```

---

## 📈 **EXEMPLES DE GAINS**

### **Scénario 1 : Parrain avec 3 filleuls Individual**

| Filleul | Type | Achat | Multiplier | Commission |
|---------|------|-------|-----------|------------|
| Alice | Individual | 50$ | ×1.0 | 5.00$ |
| Bob | Individual | 100$ | ×1.1 | 11.00$ |
| Charlie | Individual | 200$ | ×1.2 | 24.00$ |
| **Total** | | **350$** | | **40.00$** |

---

### **Scénario 2 : Parrain avec 1 filleul Enterprise (lucratif !)**

| Filleul | Type | Achat | Multiplier | Commission |
|---------|------|-------|-----------|------------|
| StartupCo | Enterprise | 5000$ | ×1.5 | **750.00$** |

**💰 Un seul filleul Enterprise = potentiel énorme !**

---

### **Scénario 3 : Mix de filleuls**

| Filleul | Type | Achat | Multiplier | Commission |
|---------|------|-------|-----------|------------|
| Alice | Individual | 100$ | ×1.2 | 12.00$ |
| StartupCo | Enterprise | 2000$ | ×1.2 | 240.00$ |
| DevTeam | Developer | 1000$ | ×1.2 | 120.00$ |
| **Total** | | **3100$** | | **372.00$** |

**🎯 Stratégie : Parrainer des Enterprise et Developer users !**

---

## 🎯 **RÉSUMÉ**

| Question | Réponse |
|----------|---------|
| **Qui peut parrainer ?** | ✅ Individual users uniquement |
| **Qui peut être parrainé ?** | ✅ TOUS les types (Individual, Enterprise, Developer) |
| **Commission sur quel type d'achat ?** | ✅ TOUS les achats de tous les filleuls |
| **Commission de base** | 10% |
| **Streak multipliers** | ×1.0 → ×1.1 → ×1.2 → ×1.3 → ×1.5 |
| **Referral code dans OAuth ?** | ✅ OUI, champ optionnel avant redirection |
| **Stockage du code** | sessionStorage → récupéré après callback |
| **Enterprise users = lucratif ?** | ✅ OUI ! Gros achats = grosses commissions |

---

## 🚀 **STRATÉGIE DE PARRAINAGE RECOMMANDÉE**

### **Pour les Individual users :**

1. **Cibler les startups** : Elles achètent souvent des gros packages Enterprise
2. **Parrainer des développeurs** : API usage peut générer des commissions récurrentes
3. **Maintenir le Top Creator status** : Streak ×1.5 = 50% de commission en plus
4. **Partager son code** : Sur LinkedIn, Twitter, forums de design, etc.

### **Exemple de pitch :**

> "Hey, je suis Top Creator sur Cortexia et j'ai un code parrainage qui te donne 10 crédits bonus ! Si tu es une startup/dev team et que tu utilises notre plateforme, utilise mon code **JOHN123** pour commencer. C'est gagnant-gagnant ! 🚀"

---

**📅 Dernière mise à jour :** 2026-01-07  
**🔧 Status :** ✅ IMPLÉMENTÉ & DOCUMENTÉ
