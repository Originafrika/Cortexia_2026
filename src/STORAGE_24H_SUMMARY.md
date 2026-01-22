# ⏰ LOGIQUE 24H - Résumé Ultra-Rapide

## 🎯 **EN 1 PHRASE**

**Les fichiers sont supprimés SEULEMENT s'ils ont plus de 24 heures lors du cron quotidien à minuit UTC.**

---

## 📅 **EXEMPLE CONCRET**

```
Upload à 23h le Lundi
   ↓
Cron Mardi 00h (1h plus tard)
   ❌ PAS SUPPRIMÉ (seulement 1h)
   ↓
Cron Mercredi 00h (25h plus tard)
   ✅ SUPPRIMÉ (>24h)
```

**Résultat:** Fichier conservé **25 heures minimum**

---

## ⏱️ **RÉTENTION RÉELLE**

| Heure d'upload | Supprimé après |
|----------------|----------------|
| 00:01 | ~48h |
| 12:00 | ~36h |
| 23:00 | ~25h |

**Moyenne:** ~36 heures

---

## 🛡️ **PROTECTIONS**

Jamais supprimé:
- ✅ Posts du feed
- ✅ Fichiers enterprise
- ✅ CocoBoard exports

---

## 💰 **IMPACT**

**Économie:** 90% des coûts de stockage

---

**Plus de détails:** Voir `STORAGE_24H_LOGIC.md`
