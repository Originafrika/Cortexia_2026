# 🎨 AUTH0 BRANDING - FIX RAPIDE (1 MINUTE)

## ❌ PROBLÈME

Users voient :
```
Hi ,
Cortexia is requesting access to your dev-3ipjnnnncplwcx0t account.
```

👉 **"dev-3ipjnnnncplwcx0t" = Nom technique pas professionnel !**

---

## ✅ SOLUTION (1 MINUTE)

### Option 1 : Changer le nom de l'application (RAPIDE)

1. **Auth0 Dashboard** : https://manage.auth0.com
2. **Applications → Applications**
3. **Cliquez sur votre app**
4. **Settings**
5. **Name** : Changez en :
   ```
   Cortexia Creation Hub
   ```
6. **Save Changes**

✅ **C'est tout !**

---

### Option 2 : Changer le Friendly Name du Tenant (RECOMMANDÉ)

1. **Auth0 Dashboard** : https://manage.auth0.com
2. **Settings** (roue dentée en bas à gauche)
3. **General**
4. **Friendly Name** : Changez en :
   ```
   Cortexia
   ```
5. **Save**

✅ **Les users verront maintenant "Cortexia account" au lieu de "dev-3ipjnnnncplwcx0t account"**

---

## 🎯 RÉSULTAT ATTENDU

### ✅ AVANT
```
Hi ,
Cortexia is requesting access to your dev-3ipjnnnncplwcx0t account.

profile: access to your profile and email
Allow offline access
```

### ✅ APRÈS
```
Hi [User Name],
Cortexia is requesting access to your Cortexia account.

profile: access to your profile and email
Allow offline access
```

---

## 🎨 BONUS : AJOUTER LE LOGO (OPTIONNEL)

1. **Branding → Universal Login**
2. **Logo** : Upload votre logo Cortexia
3. **Primary Color** : `#FF6B35` (couleur Coconut Warm)
4. **Save**

---

## 🐛 SI LE NOM NE CHANGE PAS

### Cache navigateur
```
❌ Cause : Le navigateur cache l'ancien nom
✅ Solution : 
   - Ctrl + Shift + R (hard refresh)
   - OU Navigation privée
   - OU Videz le cache
```

### Propagation
```
❌ Cause : Auth0 met à jour les serveurs
✅ Solution : Attendez 30 secondes et réessayez
```

---

## 📝 CHECKLIST

- [ ] Auth0 Dashboard ouvert
- [ ] Settings → General
- [ ] Friendly Name = "Cortexia"
- [ ] Save Changes
- [ ] Test en navigation privée
- [ ] ✅ "Cortexia account" visible

---

**Temps : 1 minute**  
**Résultat : Interface professionnelle !** ✅
