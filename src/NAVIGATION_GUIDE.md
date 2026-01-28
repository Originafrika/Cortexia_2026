# 🧭 GUIDE DE NAVIGATION - Cortexia Enterprise

## 📱 Comment accéder aux différentes sections

### 🎯 VIA LA SIDEBAR (Menu principal)

La **sidebar de gauche** est toujours visible et contient tous les liens principaux :

```
┌─────────────────────┐
│  Coconut V14        │
│  Enterprise         │
├─────────────────────┤
│ 📊 Dashboard        │ ← Page d'accueil
│ ➕ New Generation   │ ← Créer une nouvelle génération
│ 👥 Team             │ ← Gestion d'équipe (Enterprise only)
│ 🕐 History          │ ← Historique des générations
│ ⚡ Credits          │ ← Gestion des crédits
│ ⚙️  Settings        │ ← Paramètres
├─────────────────────┤
│ 👤 User Profile     │ ← Profil utilisateur
│    XXX credits      │
└─────────────────────┘
```

### 🔹 DASHBOARD (Page d'accueil)

**Comment y accéder** :
- Cliquer sur "Dashboard" dans la sidebar
- Cliquer sur le logo en haut à gauche

**Contenu** :
- 📊 Statistiques (générations cette semaine, crédits, etc.)
- 📈 Graphiques d'activité
- 🎬 Activités récentes
- ⚡ Quick Actions (raccourcis)

**Actions rapides disponibles** :
1. **Start Creating** → Démarre une nouvelle génération
2. **Invite Team Members** → Ouvre la page Team
3. **Create Campaign** → Ouvre le workflow Campaign
4. **View Analytics** → Ouvre l'historique

---

### 🔹 NEW GENERATION (Créer)

**Comment y accéder** :
- Cliquer sur "New Generation" dans la sidebar
- Cliquer sur "Start Creating" dans le Dashboard
- Utiliser le raccourci clavier (si configuré)

**Flow complet** :
1. **Type Select** → Choisir Image/Video/Campaign
2. **Intent Input** → Décrire le projet + upload références
3. **Analyzing** → Analyse Gemini en cours
4. **Direction Select** → Choisir parmi 5 directions créatives
5. **Analysis View** → Voir l'analyse complète (concept, couleurs, etc.)
6. **CocoBoard** → Valider/ajuster les prompts
7. **Generation** → Génération en cours avec progress
8. **Result** → Download/Share

---

### 🔹 TEAM (Équipe) - 👥 Enterprise Only

**Comment y accéder** :
- Cliquer sur "Team" dans la sidebar
- Cliquer sur "Invite Team Members" dans Dashboard
- **Badge rouge** affiche le nombre d'approbations en attente

**Contenu** :
- 👥 Liste des membres de l'équipe
- 📊 Rôles et permissions
- ⏳ Approbations en attente
- ➕ Inviter de nouveaux membres
- 💬 Collaboration en temps réel

**Fonctionnalités** :
- Inviter des membres par email
- Définir les rôles (Admin, Member, Viewer)
- Gérer les permissions
- Voir l'activité de l'équipe
- Approuver/rejeter les générations

---

### 🔹 HISTORY (Historique) - 🕐

**Comment y accéder** :
- Cliquer sur "History" dans la sidebar
- Cliquer sur "View Analytics" dans Dashboard

**Contenu** :
- 📋 Liste de toutes vos générations
- 🔍 Recherche par titre
- 🏷️ Filtrage par type (All, Image, Video, Campaign)
- 📥 Download de chaque génération
- 🗑️ Suppression avec confirmation

**Actions disponibles** :
- **Click sur une génération** → Voir les détails
- **Download** → Télécharger le fichier
- **Delete** → Supprimer (avec confirmation)
- **Search** → Chercher par titre
- **Filter** → Filtrer par type

---

### 🔹 CREDITS (Crédits) - ⚡

**Comment y accéder** :
- Cliquer sur "Credits" dans la sidebar

**Contenu** :
- 💳 Solde actuel de crédits
- 📊 Utilisation mensuelle (graphique)
- 📦 Packages disponibles à l'achat
- 📜 Historique des transactions

**Actions** :
- Acheter des crédits (packs de 500 à 10,000)
- Voir l'historique d'utilisation
- Télécharger les factures

---

### 🔹 SETTINGS (Paramètres) - ⚙️

**Comment y accéder** :
- Cliquer sur "Settings" dans la sidebar

**Contenu** :
- 🔔 Notifications (activer/désactiver)
- 🔊 Sons (activer/désactiver)
- 💾 Auto-save (activer/désactiver)
- 🎨 Préférences de génération
- 🔐 Sécurité et confidentialité

**Actions** :
- Modifier les préférences
- Sauvegarder les changements
- Réinitialiser aux valeurs par défaut

---

## 🎮 NAVIGATION AVANCÉE

### Breadcrumbs (Fil d'Ariane)

En haut de chaque page, vous voyez le chemin actuel :

```
Dashboard > New Generation > Type Select
```

**Cliquer sur n'importe quelle étape** pour y retourner directement.

---

### Raccourcis Clavier (À venir)

```
Cmd/Ctrl + K     → Palette de commandes
Cmd/Ctrl + N     → Nouvelle génération
Cmd/Ctrl + H     → Historique
Cmd/Ctrl + ,     → Settings
```

---

### Boutons de retour

Chaque écran a un bouton **"Retour"** ou **"Back"** pour revenir à l'étape précédente.

---

## 🚨 CAS SPÉCIAUX

### 1. Si vous êtes sur un écran de génération en cours

**Options** :
- **Annuler** → Retourne au Dashboard
- **Attendre** → La génération continue en arrière-plan

### 2. Si vous fermez la page pendant une génération

La génération continue côté serveur. Allez dans **History** pour voir le statut.

### 3. Si vous n'êtes pas Enterprise

Certaines sections ne sont **pas visibles** :
- ❌ Team (masqué dans la sidebar)
- ❌ Collaboration features
- ❌ Approval workflows

---

## 📋 CHECKLIST DE NAVIGATION

Pour tester toutes les sections :

- [ ] Dashboard → Voir les stats
- [ ] New Generation → Créer une image
- [ ] Team → Inviter un membre (Enterprise)
- [ ] History → Voir vos générations
- [ ] History → Download une génération
- [ ] History → Rechercher
- [ ] Credits → Voir le solde
- [ ] Settings → Modifier les préférences
- [ ] Breadcrumbs → Naviguer en arrière
- [ ] Sidebar → Cliquer sur chaque lien

---

## 🎯 RÉSUMÉ VISUEL

```
┌──────────────────────────────────────────┐
│  SIDEBAR              TOP BAR            │
│  ┌────────┐     ┌──────────────────┐    │
│  │Dashboard│────►│Dashboard > ...   │    │
│  │Create   │     │  [Breadcrumbs]   │    │
│  │Team     │     └──────────────────┘    │
│  │History  │                              │
│  │Credits  │     MAIN CONTENT             │
│  │Settings │     ┌──────────────────┐    │
│  └────────┘     │                  │    │
│                  │  [Current Screen]│    │
│                  │                  │    │
│                  └──────────────────┘    │
└──────────────────────────────────────────┘
```

---

## ✅ TOUT EST ACCESSIBLE !

Toutes les sections sont maintenant accessibles via :
1. **Sidebar** (menu principal)
2. **Dashboard Quick Actions** (raccourcis)
3. **Breadcrumbs** (navigation contextuelle)
4. **Boutons internes** (flows)

**Profitez de votre expérience Cortexia Enterprise !** 🚀
