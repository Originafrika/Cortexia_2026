# 🥥 **Coconut – Spécification Finale & Architecture Globale (v7)**

### *La première intelligence de composition multimodale conçue pour orchestrer automatiquement images, vidéos et campagnes complètes.*

---

# 🔥 1. **Rôle Fondamental de Coconut**

**Coconut transforme une idée exprimée en langage naturel**
➡️ en **une campagne complète**,
ou **une vidéo**,
ou **une image professionnelle**,
**décomposée, orchestrée, séquencée et promptée parfaitement**.

Coconut agit comme :

* un **réalisateur**
* un **directeur photo (DoP)**
* un **storyboard artist**
* un **prompt engineer SOTA**
* un **motion designer**
* un **superviseur VFX**
* un **chef de projet de contenu**

…tous fusionnés en un **agent unique**.

---

# 🌐 2. **Les 3 Types d'Outputs de Coconut**

Coconut génère 3 grandes familles de produits :

---

### **1️⃣ — IMAGES (affiches, posters, artworks, assets, mockups)**

Cas d'usage :

* affiches publicitaires
* couvertures
* posters
* miniatures YouTube
* assets pour vidéos
* personnages
* produits

Coconut :

* identifie les sous-images nécessaires
* crée des placeholders pour chaque élément
* génère les assets intermédiaires
* orchestre les références (jusqu'à 10 images/ref)
* assemble (dans CocoBlend) si nécessaire

---

### **2️⃣ — VIDÉOS (clips promotionnels, courts-métrages, cinématiques)**

Basées sur **Veo 3.1 Fast** (Replicate), Flux 2 pro et gemini

Coconut :

* décompose les vidéos en *shots*
* génère la structure cinématographique
* génère une ou deux  images clé si nécessaire pour chaque shot image(starting frame) last_frame(last frame)
* génère les prompts text→image et image→image pour les dependences text→video ou image→video
* gère automatiquement :

  * *last_frame* pour continuité
  * transitions naturelles
  * timestamps
  * styles
  * ambiance
  * références
  * négatifs

---

### **3️⃣ — CAMPAGNES (série cohérente de vidéos + images)**

Coconut :

* Analyse le besoin marketing
* Identifie les contenus nécessaires

  * version 9:16 TikTok
  * version 16:9 YouTube
  * version carré pour Instagram
  * 1 image hero
  * 1 poster
  * 1 cinématique de lancement
  * 1 mini teaser
* Crée le Cocoboard complet en arborescence
* Orchestrations des dépendances
* Génération automatisée ou semi-automatisée ou manuelle

---

# 🧠 3. **Les Moteurs que Coconut Orchestre**

### **VIA REPLICATE :**

* **Veo 3.1 Fast** → génération vidéo SOTA
* **Flux 2 Pro** → génération image photoréaliste SOTA
* **google/gemini-2.5-flash**
  → modèle de raisonnement pour l'analyse, découpage, structuration, prompts améliorés, vision..

* Génération d'assets basés sur **jusqu'à 10 images de références each up to 7MB**
* Parfait pour :

  * cohérence visuelle
  * stylisation uniforme
  * assets personnages

---

# 🌳 4. **Le Cœur du Système : Le CocoBoard**

Le **CocoBoard** est l'output stratégique de Coconut. C'est le moodboard ou le blueprint. La cle le coeur de tout.

C'est une **arborescence multimodale** contenant :

### **Chaque étape**

### Chaque shot (si vidéo)

### Chaque image (si poster)

### Chaque contenu (si campagne)

### Chaque asset dépendant

### Chaque prompt

### Chaque placeholder d'asset

### Chaque description exacte

### Chaque lien de dépendance

Structure universelle :

```
[Contenu global]
    ↳ [Shot 1 / Image 1 / Contenu 1]
         ↳ Description
         ↳ Prompt final
         ↳ Assets nécessaires
               ↳ Asset A
                   ↳ Description
                   ↳ Prompt
                   ↳ Sous-assets...
               ↳ Asset B...
    ↳ [Shot 2]
         ↳ ...
```

Chaque carte contient :

* **Description précise du résultat visuel**
* **Super Enhanced Prompt**
* **Placeholders d'assets**
* **Références de l'utilisateur**
* **Prompts pour générer les assets manquants**

---

# 🎥 5. **Système Vidéo : Coconut Video Orchestrator**

Coconut doit automatiquement :

### ✔️ 1️⃣ Maîtriser les blocs fondamentaux

* Cinematography
* Subject
* Action
* Context
* Style
* Anchors
* Negatives

### ✔️ 2️⃣ Découper la vidéo en shots

Coconut décide automatiquement :

* nombre de shots
* durée
* angle
* mouvement
* transition
* plan clé pour générer image→video
* besoin ou non de last_frame

### ✔️ 3️⃣ Gérer les Prompts Cinématiques

Inclut :

* dolly in/out
* camera pan/tilt
* crane
* orbit
* wide/closeup
* handheld pour énergie / chaos

### ✔️ 4️⃣ Timestamps prompting 

Format :

```
[0:00 - 0:02] Wide establishing city shot
[0:02 - 0:04] Close-up on product
```

### ✔️ 5️⃣ Cutscene Prompts

* Cut to
* Fade to
* Hard cut
* Smooth transition

### ✔️ 6️⃣ Anchor Prompts

🔒 Maintient la cohérence entre shots
(obligatoire pour campagnes vidéo)

### ✔️ 7️⃣ Gestion des références

Si utilisateur fournit image → Coconut :

* extrait palette
* composition
* lumière
* texture
* sujet
* style

### ✔️ 8️⃣ Normalisation du prompt Veo 3.1 Fast

Coconut génère toujours :

```
prompt:
negative_prompt:
aspect_ratio:
duration:
resolution:
generate_audio:
image:
last_frame:
```

---

# 🖼️ 6. **Système Image : Coconut Image Orchestrator**

Pour les images (posters, covers, vitrines) Coconut :

* décompose chaque partie (sujet, fond, texte, effets)
* crée des placeholders
* génère assets (via Flux 2 Pro)
* assemble si nécessaire (en usant de l'image ou des images precedentes comme reference..)
* ajoute le texte en dernier
* vérifie via observateur (vision model)

---

# 🚀 7. **Système Campagne : Coconut Campaign Architect**

Pour une campagne Coconut :

### 1️⃣ Analyse l'intention

### 2️⃣ Décide du type de campagne nécessaire

### 3️⃣ Définit les contenus obligatoires

### 4️⃣ Décompose chaque contenu

### 5️⃣ Crée les prompts et assets

### 6️⃣ Génère le Cocoboard complet

### 7️⃣ Orchestre l'exécution

---

# 🧩 8. **Modes OPERATIONNELS**

### **AUTO**

L'IA valide chaque étape et enchaîne.

### **SEMI-AUTO**

L'IA propose → utilisateur valide à chaque étape.

### **MANUEL**

L'utilisateur clique card par card pour déclencher les générations.

---

# 👀 9. **OBSERVATION & VALIDATION**

À chaque étape Coconut :

* vérifie l'image ou la video générée (gemini flash)
* l'analyse avec modèle vision
* valide (ou corrige)
* passe à l'étape suivante

---

# 🌍 10. **Rôle Marketing : Coconut comme Arme de Vente**

Coconut devient un outil pour :

### ✔️ agences marketing

### ✔️ entreprises

### ✔️ créateurs

### ✔️ cinéastes

### ✔️ studios

### ✔️ influenceurs

Il leur permet de produire sans le syndrome de la feuille blanche:

* publicités complètes
* lancements cinématiques
* campagnes multi-formats
* assets cohérents
* storyboards
* trailers
* clips produits

---

# ⭐ **RÉSUMÉ FINAL – CE QUE COCONUT EST VRAIMENT**

Coconut est :

**Le premier système d'orchestration multimodale
capable de transformer une idée →
un plan →
une arborescence →
des prompts →
des assets →
des images →
des vidéos →
des campagnes complètes.**

Avec :

* hiérarchie
* dépendances
* prompts optimisés
* cohérence de style
* génération auto/semi-auto/manuelle
* validation IA
* références
* multi-modèles
* gestion shots
* gestion timestamps
* gestion last_frame
* campagnes multi-contenus

Pour l'affichage on a celui avec les nodes pour les utilisateurs plus technique et l'affichage selon ce model:
Structure universelle :

```
[Contenu global]
    ↳ [Shot 1 / Image 1 / Contenu 1]
         ↳ Description
         ↳ Prompt final
         ↳ Assets nécessaires
               ↳ Asset A
                   ↳ Description
                   ↳ Prompt
                   ↳ Sous-assets...
               ↳ Asset B...
    ↳ [Shot 2]
         ↳ ...
```
...

✨ **Coconut = Final Cut Pro + Midjourney + Sora + Trello + Notion + Prompt Engineer**
fusionnés dans un seul agent.
