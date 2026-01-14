# 🔧 **GUIDE ADMIN KV STORE**

**Date :** 2026-01-07  
**Version :** 1.0

---

## 📍 **ACCÈS À L'ADMIN PANEL**

### **URL**
```
https://cortexia.figma.site/admin
```

Ou localement :
```
http://localhost:3000/admin
```

---

## 🎨 **INTERFACE ADMIN**

### **Dashboard**
- **Total Users** : Nombre total d'utilisateurs dans le KV store
- **Individuals** : Utilisateurs de type "individual"
- **Enterprises** : Utilisateurs de type "enterprise"  
- **Developers** : Utilisateurs de type "developer"

### **Tableau des Users**

| Colonne | Description |
|---------|------------|
| **User ID** | ID unique (Auth0 ou UUID) |
| **Email** | Email + username |
| **Type** | individual / enterprise / developer |
| **Onboarding** | Complete / Pending |
| **Credits** | Total (free + paid) |
| **Created** | Date de création |
| **Actions** | Bouton Delete |

---

## 🔧 **ACTIONS DISPONIBLES**

### **1. Refresh (⟳)**
Rafraîchit la liste des users depuis le KV store.

```typescript
GET /users/admin/list-all
```

### **2. Delete User (🗑️)**
Supprime **complètement** un user du KV store.

```typescript
DELETE /users/admin/hard-delete/:userId
```

**Ce qui est supprimé :**
- ✅ `user:profile:${userId}`
- ✅ `user:${userId}:credits`
- ✅ `user:referrals:${userId}`
- ✅ `referral:code:${referralCode}`
- ✅ `referral:transactions:${userId}`
- ✅ `auth0:${auth0Id}` (si Auth0 user)
- ✅ Suppression de la liste des referrals du parrain

### **3. Clear All (⚠️)**
Supprime **TOUS** les users du KV store.

```typescript
DELETE /users/admin/clear-all
```

⚠️ **DANGEREUX** - Nécessite double confirmation.

---

## 📡 **ENDPOINTS BACKEND**

### **Liste tous les users**
```bash
GET https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/list-all
Authorization: Bearer ${publicAnonKey}
```

**Response :**
```json
{
  "success": true,
  "users": [
    {
      "userId": "google-oauth2|110247234719945760338",
      "email": "user@example.com",
      "username": "username",
      "displayName": "Display Name",
      "accountType": "individual",
      "onboardingComplete": true,
      "referralCode": "USERID123",
      "freeCredits": 25,
      "paidCredits": 0,
      "createdAt": "2026-01-07T10:00:00.000Z",
      "lastLoginAt": "2026-01-07T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### **Hard Delete un user**
```bash
DELETE https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/hard-delete/:userId
Authorization: Bearer ${publicAnonKey}
```

**Response :**
```json
{
  "success": true,
  "deletedKeys": [
    "user:profile:google-oauth2|110247234719945760338",
    "user:google-oauth2|110247234719945760338:credits",
    "user:referrals:google-oauth2|110247234719945760338",
    "referral:code:USERID123",
    "referral:transactions:google-oauth2|110247234719945760338",
    "auth0:google-oauth2|110247234719945760338"
  ],
  "message": "User google-oauth2|110247234719945760338 completely removed from KV store"
}
```

### **Clear All Users**
```bash
DELETE https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/clear-all
Authorization: Bearer ${publicAnonKey}
```

**Response :**
```json
{
  "success": true,
  "deletedCount": 3,
  "message": "Cleared 3 users from KV store"
}
```

---

## 🧪 **USAGE EN DEV**

### **Tester un nouveau signup**

1. **Clear le user existant**
   ```
   /admin → Delete user google-oauth2|110247234719945760338
   ```

2. **Supprimer de Auth0**
   - Auth0 Dashboard → User Management → Users
   - Chercher l'email
   - Actions → Delete

3. **Nouveau signup**
   - Landing → Rejoindre → Particulier → Google
   - ✅ Devrait créer nouveau profil dans KV

### **Nettoyer complètement pour fresh start**

```
/admin → Clear All → Confirmer 2x
```

⚠️ **Attention :** Cela supprime **TOUS** les users du KV store !

---

## 🐛 **DEBUGGING**

### **Problème : User existe dans Auth0 mais pas KV**

**Cause :** Le user a été supprimé du KV mais pas d'Auth0.

**Solution :**
1. Supprimer le user d'Auth0
2. Se reconnecter → Nouveau profil créé dans KV

### **Problème : User existe dans KV mais pas Auth0**

**Cause :** Le user a été supprimé d'Auth0 mais pas du KV.

**Solution :**
```
/admin → Delete user {userId}
```

### **Problème : onboardingComplete reste false**

**Cause :** Bug dans le flow d'onboarding.

**Solution temporaire :**
1. `/admin` → Noter le userId
2. Modifier manuellement via backend :
   ```bash
   POST /users/:userId/complete-onboarding
   Body: {}
   ```

---

## 🔐 **SÉCURITÉ**

⚠️ **L'admin panel est accessible à TOUS en dev.**

Pour production, ajouter :
```typescript
// /components/AdminPanel.tsx
const { user } = useAuth();

// Check si user est admin
if (!user || user.email !== 'admin@cortexia.app') {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-red-400">Access Denied</div>
    </div>
  );
}
```

---

## 📊 **LOGS BACKEND**

Tous les appels admin loguent :

```javascript
// List all
📋 Listed 3 users from KV store

// Delete user
🗑️ Hard deleting user: google-oauth2|110247234719945760338
✅ User completely deleted: google-oauth2|110247234719945760338
🗑️ Deleted keys: [...]

// Clear all
⚠️ CLEARING ALL USERS FROM KV STORE
✅ Cleared 3 users from KV store
```

---

## 🎯 **RÉSUMÉ RAPIDE**

| Action | URL | Méthode |
|--------|-----|---------|
| **Accéder à l'admin** | `/admin` | Navigate |
| **Lister users** | `/users/admin/list-all` | GET |
| **Supprimer 1 user** | `/users/admin/hard-delete/:userId` | DELETE |
| **Supprimer tous** | `/users/admin/clear-all` | DELETE |

---

**Voilà ! Tu as maintenant un Admin Panel complet pour gérer le KV store ! 🚀**
