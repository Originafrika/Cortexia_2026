# Cahier des Charges - Cortexia

## 1. Vue d'ensemble du projet

### 1.1 Présentation
**Cortexia** est une plateforme d'intelligence artificielle générative démocratisant l'accès à la création de contenu visuel professionnel sans compétences techniques requises.

### 1.2 Plateformes cibles
- Application web responsive
- Application mobile iOS
- Application mobile Android

### 1.3 Objectifs principaux
- Rendre la génération d'images et vidéos IA accessible au grand public
- Fournir un outil professionnel (Coconut) aux entreprises pour automatiser leur création de contenu
- Créer une communauté de créateurs rémunérés
- Proposer une API robuste pour les développeurs

---

## 2. Architecture du système

### 2.1 Services d'IA intégrés

#### Génération d'images (via kie.ai)
- **Flux 2 Pro** (text-to-image et image-to-image)
  - Résolution : 1K ou 2K
  - Ratios : 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3, Auto
  - Support de 1-8 images de référence en mode image-to-image
  - Support des codes couleur HEX
  - Support des prompts structurés JSON

- **Flux 2 Flex** (text-to-image et image-to-image)
  - Mêmes spécifications que Pro
  - Version plus rapide et économique

#### Génération de vidéos (via kie.ai)
- **Veo 3.1 Fast** (text-to-video, image-to-video, material-to-video)
  - Résolutions : 720p, 1080p
  - Ratios : 16:9, 9:16, Auto
  - Durées : 4, 6, 8 secondes
  - Modes : TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO
  - Audio synchronisé généré automatiquement
  - Support de 1-3 images de référence selon le mode

#### Intelligence de planification
- **Gemini 2.5 Flash** (via Replicate)
  - Analyse et compréhension des demandes
  - Génération de plans de création (CocoBoard)
  - Structuration de prompts optimisés
  - Support multimodal (texte + images + vidéos)

### 2.2 APIs principales

```
Base URL: https://api.cortexia.ai

Endpoints kie.ai:
- POST /api/v1/jobs/createTask (Flux 2)
- GET /api/v1/jobs/recordInfo (Status Flux 2)
- POST /api/v1/veo/generate (Veo 3.1)
- POST /api/v1/veo/extend (Extension vidéo)
- GET /api/v1/veo/record-info (Status Veo 3.1)

Endpoints Replicate (Gemini):
- POST /v1/predictions (Création tâche)
- GET /v1/predictions/{id} (Récupération résultat)
```

---

## 3. Fonctionnalités Core

### 3.1 Génération d'images

#### Interface utilisateur
- **Champ prompt** : 3-5000 caractères
- **Upload d'images de référence** : 1-8 images, max 10MB chacune, formats JPEG/PNG/WebP
- **Sélecteurs** :
  - Modèle : Flux 2 Pro / Flex
  - Ratio d'aspect
  - Résolution : 1K / 2K
  - Graine aléatoire (optionnel)

#### Workflow
1. L'utilisateur entre son prompt et/ou upload des images
2. Validation des entrées (longueur, format, taille)
3. Création de la tâche via API kie.ai
4. Récupération du taskId
5. Polling du statut toutes les 3 secondes
6. Affichage du résultat ou du message d'erreur
7. Sauvegarde dans la galerie de l'utilisateur

#### Coûts en crédits
- Flux 2 Pro 1K : 5 crédits
- Flux 2 Pro 2K : 15 crédits
- Flux 2 Flex 1K : 3 crédits
- Flux 2 Flex 2K : 8 crédits

### 3.2 Génération de vidéos

#### Interface utilisateur
- **Champ prompt** : 3-5000 caractères
- **Upload d'images/vidéos de référence** : 
  - Mode FIRST_AND_LAST_FRAMES : 1-2 images
  - Mode REFERENCE : 1-3 images
  - Max 10MB par image, 45 min par vidéo
- **Sélecteurs** :
  - Modèle : Veo 3.1 Fast
  - Mode de génération
  - Ratio d'aspect
  - Durée : 4s / 6s / 8s
  - Graine aléatoire (optionnel)
  - Filigrane (optionnel)

#### Workflow
1. L'utilisateur configure sa génération
2. Validation des entrées
3. Traduction automatique du prompt en anglais (si activée)
4. Création de la tâche via API kie.ai
5. Récupération du taskId
6. Polling du statut toutes les 5 secondes
7. Affichage du résultat avec lecteur vidéo
8. Sauvegarde dans la galerie

#### Fonctionnalité d'extension
- Permet d'étendre une vidéo existante
- Nécessite le taskId de la vidéo originale
- Génère 4-8 secondes supplémentaires
- Transition naturelle avec la vidéo source

#### Coûts en crédits
- Veo 3.1 Fast 4s : 20 crédits
- Veo 3.1 Fast 6s : 30 crédits
- Veo 3.1 Fast 8s : 40 crédits
- Extension : 25 crédits

---

## 4. Coconut - Module Entreprise

### 4.1 Accès et permissions
- **Réservé aux** :
  - Comptes entreprise avec abonnement actif
  - Créateurs éligibles du mois en cours
- **Inclus dans** :
  - Plan entreprise (10 000 crédits/mois)
  - Statut créateur (si conditions remplies)

### 4.2 Mode Image

#### Processus de génération

**Étape 1 : Briefing**
```
Input utilisateur :
- Description textuelle de la demande
- Images de référence (optionnel) : produits, logos, style guides
- Spécifications : dimensions, format, usage prévu

Exemple :
"Créer une affiche publicitaire pour le lancement de notre nouveau smartphone X500. 
Format A3 pour impression. Style moderne et épuré. Mettre en avant l'écran OLED 
et la qualité photo. Photo du produit fournie en référence."
```

**Étape 2 : Analyse par Gemini 2.5 Flash**
```javascript
// Appel API Gemini
{
  "prompt": "Tu es un directeur artistique expert. Analyse cette demande et crée 
  un plan détaillé pour générer cette image : [briefing utilisateur]. 
  
  Tu dois fournir :
  1. Concept créatif et direction artistique
  2. Prompt Flux 2 optimal (structuré en JSON si nécessaire)
  3. Éléments de composition (placement, hiérarchie, couleurs HEX)
  4. Références manquantes à fournir ou à générer
  5. Spécifications techniques (ratio, résolution)
  
  Format de sortie JSON strict.",
  "images": [/* images de référence */],
  "system_instruction": "Tu es CocoBoard Generator, spécialisé dans la planification 
  de créations visuelles professionnelles via Flux 2.",
  "max_output_tokens": 8000,
  "thinking_budget": 8000
}
```

**Étape 3 : Génération du CocoBoard**

Affichage structuré pour validation :
```
📋 CocoBoard - Affiche Smartphone X500

🎨 CONCEPT
Direction artistique : Minimaliste premium avec focus produit
Ambiance : Futuriste et élégante
Message principal : "Redéfinissez la photographie mobile"

📐 COMPOSITION
- Ratio : 3:4 (A3 portrait)
- Résolution : 2K
- Zone principale : Produit (60% supérieur)
- Zone secondaire : Texte et specs (30% inférieur)
- Marges : 10% tout autour

🎨 PALETTE COLORIMÉTRIQUE
- Fond : Dégradé #0A0E27 → #1A1F3A (bleu nuit profond)
- Accent primaire : #00D9FF (cyan électrique)
- Accent secondaire : #FF006B (magenta)
- Texte : #FFFFFF, #E5E5E5

📝 PROMPT GÉNÉRÉ
{
  "scene": "Premium smartphone product photography on gradient background",
  "subjects": [
    {
      "description": "Smartphone X500 from provided reference, positioned vertically 
      at 15° angle, screen displaying vibrant photo gallery",
      "position": "upper center, occupying 60% of frame",
      "color_palette": ["device from reference", "screen glow #00D9FF"]
    },
    {
      "description": "Floating holographic UI elements around device showing camera specs",
      "position": "surrounding device in arc pattern",
      "style": "translucent, futuristic HUD design"
    },
    {
      "description": "Large headline text 'REDÉFINISSEZ LA PHOTOGRAPHIE MOBILE'",
      "position": "lower third center",
      "style": "bold sans-serif, color #FFFFFF, letter-spacing wide"
    },
    {
      "description": "Product specs in elegant grid: 'Capteur 200MP | OLED 6.8\" | IA Photo+'",
      "position": "bottom, above logo",
      "style": "light weight font, color #E5E5E5, size 14pt"
    },
    {
      "description": "Brand logo",
      "position": "bottom right corner, 5% margin"
    }
  ],
  "style": "Ultra-realistic commercial product photography, cinematic lighting",
  "color_palette": ["#0A0E27", "#1A1F3A", "#00D9FF", "#FF006B", "#FFFFFF"],
  "lighting": "Dramatic three-point setup, rim light creating edge glow, 
  soft key light on device face, subtle blue ambient fill",
  "background": "Gradient from deep navy #0A0E27 to lighter space blue #1A1F3A, 
  with subtle particle effects suggesting technology",
  "composition": "Rule of thirds with device at upper intersection point, 
  negative space in lower third for text hierarchy",
  "camera": {
    "angle": "eye level, slight upward tilt for heroic feel",
    "lens": "85mm equivalent for flattering product perspective",
    "depth_of_field": "f/5.6 for sharp focus throughout, subtle background blur"
  }
}

✅ RÉFÉRENCES
- Image fournie : Smartphone X500 (utilisée dans generation)
- À générer : Éléments holographiques UI (inclus dans prompt)

⚙️ PARAMÈTRES TECHNIQUES
- Modèle : Flux 2 Pro
- Mode : Image-to-image (1 référence)
- Ratio : 3:4
- Résolution : 2K
- Seed : Auto

💰 COÛT : 100 crédits (CocoBoard) + 15 crédits (génération 2K) = 115 crédits total
```

**Étape 4 : Validation et ajustements**
- L'utilisateur peut :
  - ✅ Approuver et lancer la génération
  - ✏️ Modifier le prompt ou les spécifications
  - 🔄 Demander une révision complète du CocoBoard
  - ➕ Ajouter/retirer des éléments

**Étape 5 : Génération finale**
- Appel API Flux 2 avec le prompt optimisé
- Monitoring du statut
- Livraison du résultat en haute résolution
- Sauvegarde dans projets Coconut

#### Cas d'usage supportés
- Affiches publicitaires
- Visuels réseaux sociaux
- Bannières web
- Packaging produits
- Présentations commerciales
- Infographies
- E-mailings
- Couvertures de rapports

### 4.3 Mode Vidéo

#### Processus de génération

**Étape 1 : Briefing**
```
Input utilisateur :
- Type de vidéo : Commercial TV, Trailer, Mini-film, Teaser réseaux sociaux, etc.
- Durée cible : 15s, 30s, 60s, etc.
- Message clé et call-to-action
- Références visuelles/vidéos (optionnel)
- Spécifications : format, plateforme de diffusion

Exemple :
"Commercial de 30 secondes pour notre café bio 'Terre & Grains'. Cibler Instagram et 
Facebook. Ambiance chaleureuse et authentique. Montrer le parcours du grain à la tasse. 
Format vertical 9:16. Photos de nos plantations et packaging fournies."
```

**Étape 2 : Analyse par Gemini 2.5 Flash**
```javascript
{
  "prompt": "Tu es un réalisateur et scénariste publicitaire expert. Crée un plan 
  de production vidéo complet pour : [briefing utilisateur].
  
  Tu dois fournir :
  1. Concept narratif et storytelling
  2. Découpage en shots (nombre et durée)
  3. Description détaillée de chaque shot
  4. Prompts Veo 3.1 optimisés pour chaque shot
  5. Transitions entre shots
  6. Spécifications audio/musique
  7. Références manquantes
  8. Timing précis
  
  Format de sortie JSON strict avec timeline.",
  "images": [/* références fournies */],
  "videos": [/* références vidéo si fournies */],
  "system_instruction": "Tu es CocoBoard Video Generator, expert en production 
  vidéo commerciale via Veo 3.1.",
  "max_output_tokens": 12000,
  "thinking_budget": 12000,
  "dynamic_thinking": true
}
```

**Étape 3 : Génération du CocoBoard Vidéo**

```
🎬 CocoBoard - Commercial Terre & Grains

📖 CONCEPT NARRATIF
Arc émotionnel : Connexion authentique de la nature à l'instant café
Storytelling : Voyage visuel du grain à la tasse en 5 actes
Ton : Chaleureux, authentique, premium naturel
CTA : "Terre & Grains - Le café qui raconte une histoire"

⏱️ STRUCTURE TEMPORELLE (30 secondes total)
1. Shot 1 : Lever de soleil sur plantation (0-6s)
2. Shot 2 : Mains récoltant grains (6-12s)
3. Shot 3 : Transformation / torréfaction (12-18s)
4. Shot 4 : Préparation café / tasse fumante (18-24s)
5. Shot 5 : Moment de dégustation + branding (24-30s)

🎥 DÉCOUPAGE DÉTAILLÉ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT 1 - L'Origine (6 secondes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Type : Establishing shot
🎨 Ambiance : Doré, aube, serein
📐 Ratio : 9:16 (vertical)
⏱️ Durée : 6 secondes
🎬 Transition sortante : Fondu progressif vers mains

🎯 PROMPT VEO 3.1
{
  "prompt": "[00:00-00:02] Aerial drone shot, golden hour sunrise over lush 
  green coffee plantation in Colombian highlands, rows of coffee plants stretching 
  to horizon, morning mist rolling between hills, warm amber sunlight filtering 
  through clouds. Cinematic, slow forward dolly movement.
  
  [00:02-00:04] Crane shot descending smoothly from aerial view toward coffee 
  plants, revealing rich green leaves with red coffee cherries, dewdrops catching 
  sunlight, natural and organic feel.
  
  [00:04-00:06] Close-up of ripe red coffee cherries on branch, gentle wind causing 
  subtle movement, soft focus background of more plants, warm golden lighting. 
  Camera slowly pushes in.
  
  SFX: Gentle morning ambience, distant birds chirping, soft wind rustling leaves.
  Ambient: Peaceful rural soundscape.
  
  Style: Cinematic documentary, National Geographic quality, rich color grading 
  with warm golden tones, shallow depth of field, premium commercial aesthetic.",
  
  "model": "veo3_fast",
  "generationType": "REFERENCE_2_VIDEO",
  "imageUrls": ["[référence plantation fournie]"],
  "aspectRatio": "9:16",
  "seeds": 15847,
  "enableTranslation": true
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT 2 - La Récolte (6 secondes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Type : Medium shot à close-up
🎨 Ambiance : Authentique, humain, terreux
📐 Ratio : 9:16
⏱️ Durée : 6 secondes
🎬 Transition sortante : Cut direct sur torréfaction

🎯 PROMPT VEO 3.1
{
  "prompt": "[00:00-00:03] Medium shot, weathered hands of experienced farmer 
  carefully selecting and picking ripe red coffee cherries from branch, hands 
  show care and expertise, natural skin tones, dirt under fingernails showing 
  authentic work, soft morning light creating warm skin tones, selective focus 
  on hands and cherries. POV slightly above, looking down at hands working.
  
  [00:03-00:06] Transition to close-up, handful of freshly picked coffee cherries 
  being gently placed in traditional woven basket visible in bottom frame, camera 
  follows the hand movement, cherries have rich red color with highlights from 
  sunlight, organic and tactile feel. Slow motion 50% for emphasis on gentle care.
  
  SFX: Subtle sounds of cherries being picked, rustle of leaves, soft basket sounds.
  Ambient: Quiet, focused work atmosphere.
  
  Emotion: Respect, tradition, human connection to nature.
  
  Style: Intimate documentary style, warm color palette with earth tones, 
  macro lens aesthetic for close details, shot as if on vintage Arri camera with 
  organic film grain.",
  
  "model": "veo3_fast",
  "generationType": "TEXT_2_VIDEO",
  "aspectRatio": "9:16",
  "seeds": 28493
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT 3 - La Transformation (6 secondes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Type : Dynamic close-ups avec mouvement
🎨 Ambiance : Artisanal, chaleur, transformation
📐 Ratio : 9:16
⏱️ Durée : 6 secondes
🎬 Transition sortante : Cross-dissolve vers préparation

🎯 PROMPT VEO 3.1
{
  "prompt": "[00:00-00:02] Extreme close-up, coffee beans tumbling in artisan 
  roasting drum, warm amber and brown tones, steam rising, beans going from 
  green to golden brown, macro lens showing bean texture detail, dramatic 
  back-lighting creating rim glow on beans. Shallow depth of field, rotating 
  movement following drum.
  
  [00:02-00:04] Rack focus shot, foreground freshly roasted coffee beans 
  cooling on traditional wooden tray, steam wisping up in soft curls, background 
  softly blurred showing roasting equipment and warm ambient lighting from 
  roaster fire glow. Camera slight tilt up revealing more beans.
  
  [00:04-00:06] Close tracking shot, following single perfect roasted bean being 
  picked up by hand, inspected against warm backlight, then placed with others, 
  showing quality control and care. Warm color temperature 3200K, golden hour feel 
  indoors.
  
  SFX: Gentle rumble of rotating roaster, crackling sounds of beans roasting, 
  subtle mechanical sounds of artisan equipment.
  Ambient: Warm workshop atmosphere, cozy and focused.
  
  Style: Artisanal commercial style, warm glowing color grade, 
  shot on Sony Venice with vintage Canon FD glass for soft bokeh, 
  rich browns and ambers, premium craft aesthetic.",
  
  "model": "veo3_fast",
  "generationType": "TEXT_2_VIDEO",
  "aspectRatio": "9:16",
  "seeds": 41256
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT 4 - La Préparation (6 secondes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Type : Lifestyle product shot
🎨 Ambiance : Moment cocooning, chaleur
📐 Ratio : 9:16
⏱️ Durée : 6 secondes
🎬 Transition sortante : Match cut vers moment dégustation

🎯 PROMPT VEO 3.1
{
  "prompt": "[00:00-00:03] Medium shot at kitchen counter, modern minimalist 
  ceramic coffee maker with Terre & Grains packaging visible in background, 
  hot water being poured over ground coffee in slow pour-over motion creating 
  blooming effect, steam rising elegantly, natural morning light from window 
  creating soft highlights, warm wood counter surface. Crane shot slowly 
  descending to coffee level.
  
  [00:03-00:06] Close-up transition, rich dark coffee streaming into elegant 
  ceramic cup below, creating satisfying pour pattern, steam wisping up, 
  product packaging subtly visible and in-focus in background showing Terre & 
  Grains branding, warm ambient lighting creating cozy atmosphere, 
  depth of field keeping cup sharp. Camera slow push-in.
  
  SFX: Soothing sound of water pouring, gentle bubble and drip sounds, 
  subtle clink of ceramic.
  Ambient: Quiet, peaceful morning kitchen atmosphere.
  
  Emotion: Anticipation, comfort, ritual.
  
  Style: Lifestyle commercial, hygge aesthetic, warm natural lighting with 
  golden undertones, shot on Fujifilm X-T5 for rich colors, 
  slightly soft and inviting feel, premium everyday luxury.",
  
  "model": "veo3_fast",
  "generationType": "FIRST_AND_LAST_FRAMES_2_VIDEO",
  "imageUrls": [
    "[référence packaging Terre & Grains]",
    "[frame généré : tasse avec café fumant]"
  ],
  "aspectRatio": "9:16",
  "seeds": 53789
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOT 5 - Le Moment & Branding (6 secondes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 Type : Product hero shot avec CTA
🎨 Ambiance : Satisfaction, branding fort
📐 Ratio : 9:16
⏱️ Durée : 6 secondes
🎬 Transition sortante : Fade to logo

🎯 PROMPT VEO 3.1
{
  "prompt": "[00:00-00:02] Close-up beauty shot, hands wrapping around warm 
  ceramic coffee cup, subtle smile visible in soft-focus background suggesting 
  contentment, steam rising from cup creating dreamy atmosphere, 
  Terre & Grains packaging artfully placed on table in perfect focus showing 
  logo and 'Bio' certification, morning light casting warm glow, 
  cozy blanket texture visible suggesting comfort. Camera static, intimate framing.
  
  [00:02-00:04] Slow zoom out revealing full scene, person in comfortable home 
  setting enjoying coffee moment by window with soft natural light, 
  product packaging prominently displayed, authentic and relatable lifestyle shot, 
  warm color palette with earth tones #8B4513 and forest green #2D5016.
  
  [00:04-00:06] Elegant transition, camera rack focus from person to product package 
  which now fills center frame, logo crisp and clear, tagline space ready for overlay: 
  'TERRE & GRAINS - Le café qui raconte une histoire', final frame holds on perfect 
  product shot with warm glow, premium and inviting.
  
  SFX: Quiet, peaceful ambient sound, perhaps soft breath of satisfaction, 
  gentle clink of cup being set down.
  Ambient: Calm, morning tranquility.
  
  Emotion: Satisfaction, joy, connection to quality and nature.
  
  Text overlay appears at [00:04]: 'TERRE & GRAINS' in elegant serif font, 
  color #2D5016 (brand green). Subtitle at [00:05]: 'Le café qui raconte une 
  histoire' in lighter font #8B4513.
  
  Style: Premium lifestyle commercial ending, warm and inviting color grade 
  with golden hour feel, shot on Canon R5 with 50mm f/1.2 for beautiful bokeh, 
  professional product photography aesthetic, high-end commercial quality.",
  
  "model": "veo3_fast",
  "generationType": "FIRST_AND_LAST_FRAMES_2_VIDEO",
  "imageUrls": [
    "[frame généré : personne avec tasse]",
    "[référence packaging + mock-up final avec logo]"
  ],
  "aspectRatio": "9:16",
  "seeds": 67234
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎵 AUDIO & MUSIQUE

Musique de fond :
- Style : Indie folk acoustique, chaleureux et organique
- Instruments : Guitare acoustique finger-picking, cordes douces
- Tempo : 85 BPM, tranquille et fluide
- Arc : Build progressif, climax subtil au shot 5
- Volume : -18dB pour ne pas couvrir les SFX naturels

Narration (optionnel) :
- Voix off calme et authentique
- Texte : "De la terre à votre tasse, chaque grain raconte l'histoire 
  d'une passion pour le café bio. Terre & Grains."
- Timing : Commence à 8s, termine à 28s

🎨 POST-PRODUCTION

Color grading :
- LUT : Warm Commercial (courbe S douce)
- Hautes lumières : +10%, légèrement désaturées pour look cinéma
- Tons moyens : Shift vers oranges/ambers chauds
- Ombres : Crush léger, ajout de teintes vertes subtiles
- Saturation : +15% sur verts et bruns, -5% sur autres couleurs
- Contraste : Moyenne-élevée pour look premium

Transitions :
1→2 : Fondu progressif 0.5s
2→3 : Cut franc (dynamique)
3→4 : Cross-dissolve 0.8s
4→5 : Match cut (tasse → packaging) 0.3s

Titrage :
- Titre principal : [00:25-00:30] "TERRE & GRAINS"
- Sous-titre : [00:26-00:30] "Le café qui raconte une histoire"
- CTA : [00:28-00:30] "Disponible en magasins bio"
- Typographie : Serif élégant pour marque, sans-serif light pour CTA

✅ RÉFÉRENCES & ASSETS

À générer dans les prompts :
- Moments de préparation café
- Frame final branding shot 5

Fournis par le client :
- Photo plantation (Shot 1)
- Photo packaging (Shots 4 et 5)

Musique :
- À sourcer : Piste acoustique folk, licence commerciale

⚙️ SPÉCIFICATIONS TECHNIQUES

- Format final : MP4 H.264
- Résolution : 1080p (1080x1920)
- Framerate : 24 fps (look cinématique)
- Bitrate : 10 Mbps
- Audio : AAC 192 kbps stéréo
- Ratio : 9:16 (vertical Instagram/Facebook)
- Durée totale : 30 secondes
- Sous-titres : Optionnels (français)

💰 COÛT TOTAL
- CocoBoard Vidéo : 100 crédits
- Shot 1 (6s Veo) : 30 crédits
- Shot 2 (6s Veo) : 30 crédits
- Shot 3 (6s Veo) : 30 crédits
- Shot 4 (6s Veo) : 30 crédits
- Shot 5 (6s Veo) : 30 crédits
- Post-production et assemblage : Inclus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL : 250 crédits (≈ 25$)
```

**Étape 4 : Validation et ajustements**

Interface de révision :
- 📺 Prévisualisation storyboard avec thumbnails
- ⏱️ Timeline interactive
- ✏️ Édition de chaque shot individuellement
- 🎬 Ajout/suppression de shots
- 🎨 Modification des specs techniques
- 🔄 Régénération du CocoBoard

**Étape 5 : Production**

Workflow automatisé :
1. Génération séquentielle des shots via Veo 3.1
2. Monitoring en temps réel de chaque shot
3. Téléchargement automatique des vidéos générées
4. Assemblage des clips dans l'ordre défini
5. Application des transitions
6. Ajout de l'audio/musique (si fourni)
7. Overlay des textes et branding
8. Export du montage final
9. Livraison en HD

Timeline estimée : 15-25 minutes pour l'ensemble du process

#### Cas d'usage supportés
- Commerciaux TV (15s, 30s, 60s)
- Publicités réseaux sociaux
- Teasers et trailers de produits
- Vidéos explicatives (explainer videos)
- Témoignages clients (avec script)
- Mini-films de marque
- Contenus éducatifs
- Vidéos événementielles

### 4.4 Mode Campagne

#### Vue d'ensemble
Génère des campagnes marketing complètes et cohérentes combinant images et vidéos pour un même objectif commercial.

#### Processus

**Étape 1 : Briefing de campagne**
```
Input utilisateur :
- Objectif de la campagne : Lancement produit, repositionnement marque, etc.
- Durée de la campagne : 2 semaines, 1 mois, 3 mois
- Canaux de diffusion : Instagram, Facebook, LinkedIn, Print, TV, etc.
- Audience cible : Démographie, psychographie
- Budget crédit approximatif
- Assets disponibles : Logos, chartes graphiques, photos produits, etc.

Exemple :
"Campagne de lancement Q1 2025 pour notre gamme de cosmétiques naturels 'Pure Essence'. 
Cible : Femmes 25-45 ans, sensibles à l'écologie. Canaux : Instagram, Facebook, 
Google Ads, magazines beauté. Durée : 6 semaines. Budget : 5000 crédits.
Objectif : 10k conversions site web. Assets fournis : logos, photos produits, 
charte graphique."
```

**Étape 2 : Analyse stratégique par Gemini**

Génération d'un plan marketing complet :
```javascript
{
  "prompt": "Tu es un directeur marketing et stratège de campagne expert. 
  Crée un plan de campagne marketing intégré pour : [briefing].
  
  Tu dois fournir :
  1. Stratégie créative globale et positionnement
  2. Calendrier éditorial détaillé (6 semaines)
  3. Mix de contenus (ratio images/vidéos, formats)
  4. Brief créatif pour chaque asset
  5. Cohérence visuelle (palette, style, ton)
  6. Recommandations de ciblage par canal
  7. KPIs suggérés
  8. Estimation du coût en crédits
  
  Format JSON structuré avec timeline hebdomadaire.",
  "images": [/* charte graphique, produits */],
  "system_instruction": "Tu es CocoBoard Campaign Generator, expert en 
  stratégie marketing multicanale.",
  "max_output_tokens": 20000,
  "thinking_budget": 16000,
  "dynamic_thinking": true
}
```

**Étape 3 : CocoBoard Campagne**

Rendu structuré par semaines :
```
🚀 CocoBoard Campagne - Pure Essence Launch

📊 VUE D'ENSEMBLE
Période : 6 semaines (6 jan - 16 fév 2025)
Objectif : 10 000 conversions site web
Contenus totaux : 24 assets (16 images + 8 vidéos)
Budget : 4 850 crédits (dans limite des 5000)

🎨 IDENTITÉ VISUELLE CAMPAGNE
Thème : "Retour à l'Essentiel"
Palette principale :
- Vert sauge #9CAF88
- Beige naturel #E8DCC4  
- Terracotta doux #D4A59A
- Blanc cassé #FAF9F6
Style : Minimaliste épuré, photographie naturelle, macro textures botaniques
Typographie : Serif élégant (titres) + Sans-serif moderne (corps)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 1 : TEASING (6-12 janvier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Créer l'anticipation et l'intrigue
Canaux : Instagram Stories, Feed Instagram, Facebook

📅 Lundi 6 Jan - Teaser Image 1
Format : Carré 1:1, 2K
Concept : Close-up macro d'une feuille d'aloe vera avec goutte de rosée
CTA : "Quelque chose de naturel arrive..."
Coût : 115 crédits (CocoBoard Image + génération)
Ciblage : Large, intérêts beauté naturelle

📅 Mercredi 8 Jan - Teaser Vidéo 1  
Format : Vertical 9:16, 8s
Concept : Slow-motion de mains cueillant des plantes dans jardin botanique
Audio : Musique ambient calme, sons nature
Texte : "Pure • Essence • Bientôt"
Coût : 140 crédits (CocoBoard Vidéo shot unique + génération)
Ciblage : Lookalike audience engagement précédent

📅 Vendredi 10 Jan - Teaser Image 2
Format : Story vertical 9:16, 2K
Concept : Composition flat-lay d'ingrédients naturels (argile, huiles, fleurs)
avec texte "76% d'ingrédients bio. 100% d'engagement."
Coût : 115 crédits
Ciblage : Femmes 25-45, intérêts bio/écologie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 2 : LANCEMENT (13-19 janvier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Révéler la gamme et générer du trafic
Canaux : Instagram, Facebook, Google Display, Magazines (digital)

📅 Lundi 13 Jan - Launch Hero Video
Format : Horizontal 16:9, 30s
Concept : Film de marque montrant le parcours de l'ingrédient à la création 
du produit (similaire à exemple café précédent)
Brief : 5 shots, narration voix-off, musique organique
CTA : "Découvrez Pure Essence. Lien en bio."
Coût : 250 crédits (CocoBoard + 5 shots Veo)
Ciblage : Multi-canal, audiences larges

📅 Mardi 14 Jan - Product Grid Image
Format : Carré 1:1, 2K
Concept : Les 4 produits de la gamme arrangés en grille épurée sur fond beige 
avec feuillages naturels, ombres douces, noms de produits en overlay
Coût : 115 crédits
Ciblage : Retargeting visiteurs site

📅 Jeudi 16 Jan - Benefit Carousel (3 images)
Format : Carré 1:1, 2K chacune
Concept : 3 visages en gros plan avant/après utilisation + texte bénéfices
Image 1 : "Hydratation 48h"
Image 2 : "Éclat naturel" 
Image 3 : "Certifié bio"
Coût : 3 × 115 = 345 crédits
Ciblage : Engagement post launch video

📅 Dimanche 19 Jan - Tutorial Video
Format : Vertical 9:16, 15s (2-3 shots)
Concept : Routine beauté matin avec les produits, POV miroir
Audio : Musique upbeat, pas de voix
Texte : "Votre routine en 3 étapes"
Coût : 160 crédits
Ciblage : Retargeting + intérêts tutoriels beauté

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 3 : ENGAGEMENT (20-26 janvier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Stimuler l'interaction et le contenu utilisateur
Canaux : Instagram, Facebook, Stories

📅 Mardi 21 Jan - UGC-Style Image
Format : Carré 1:1, 2K
Concept : Fausse photo utilisateur, produit sur table de chevet cozy 
avec livre et thé, lumière naturelle matin, authentique
Caption template : "Mon nouveau rituel beauté ✨ #PureEssence"
Coût : 115 crédits
Ciblage : Communauté engagée, incitation au partage

📅 Jeudi 23 Jan - Ingredient Story Video
Format : Vertical 9:16, 15s
Concept : Zoom sur un ingrédient star (ex: acide hyaluronique naturel), 
animation micro, texte éducatif
Coût : 160 crédits
Ciblage : Éducation produit, intérêts skincare science

📅 Samedi 25 Jan - Contest Announcement Image
Format : Carré 1:1, 2K
Concept : Design vibrant avec visuel produits, texte "CONCOURS : Gagnez 
votre routine Pure Essence complète (valeur 120€)"
Coût : 115 crédits
Ciblage : Boost de reach, audiences engagées

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 4 : CONVERSION (27 jan - 2 fév)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Pousser à l'achat avec offres limitées
Canaux : Tous + Email marketing + Google Ads

📅 Lundi 27 Jan - Flash Sale Video
Format : Carré 1:1, 8s
Concept : Animation dynamique avec produits, timer countdown, 
texte "48H ONLY : -20% sur toute la gamme"
Coût : 140 crédits
Ciblage : Retargeting fort, audiences chaudes

📅 Mercredi 29 Jan - Social Proof Image
Format : Horizontal 16:9, 2K (bannière site)
Concept : Collage de faux avis 5 étoiles avec photos produits
Texte : "4.8/5 ★ | +5000 clientes satisfaites"
Coût : 115 crédits
Ciblage : Bannière Google Display, retargeting

📅 Vendredi 31 Jan - Last Chance Video
Format : Vertical 9:16, 6s
Concept : Urgency message, chrono, produits avec badge "DERNIÈRES HEURES"
Coût : 130 crédits (shot unique)
Ciblage : Retargeting visiteurs panier abandonné

📅 Dimanche 2 Fév - Bundle Offer Image
Format : Carré 1:1, 2K
Concept : Pack complet des 4 produits avec badge "-30% en bundle"
Design : Clean product shot, prix barrés vs nouveaux prix
Coût : 115 crédits
Ciblage : Converters retargeting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 5 : FIDÉLISATION (3-9 février)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Retenir les nouveaux clients et encourager réachat
Canaux : Email, Instagram, Facebook communauté

📅 Mercredi 5 Fév - Customer Story Video
Format : Horizontal 16:9, 20s (3-4 shots)
Concept : Mini-documentary style, témoignage client satisfaite 
(actrice générée ou script), avant/après peau, ambiance testimonial
Coût : 220 crédits
Ciblage : Nouveaux clients, nurturing

📅 Vendredi 7 Fév - Tips & Tricks Image
Format : Carré 1:1, 2K
Concept : Infographie "5 conseils pour une peau éclatante" 
avec produits Pure Essence intégrés
Coût : 115 crédits
Ciblage : Éducation post-achat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMAINE 6 : RECONNAISSANCE & CONSOLIDATION (10-16 février)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : Construire la communauté, fidéliser long terme et préparer phase suivante
Canaux : Instagram, Facebook, Email, Blog, LinkedIn (B2B teasing)

📅 Lundi 10 Fév - Behind The Scenes Video
Format : Vertical 9:16, 15s (2-3 shots)
Concept : Coulisses de la création des produits, laboratoire artisanal 
avec équipe passionnée, processus d'extraction des ingrédients naturels
Brief détaillé :
  Shot 1 (0-5s) : Travelling latéral dans laboratoire moderne épuré,
  flacons en verre, plantes séchées accrochées, scientifique en blouse
  blanche examinant extrait végétal au microscope
  Shot 2 (5-10s) : Gros plan mains gantées versant précautionneusement
  extrait doré dans bécher, lumière naturelle mettant en valeur pureté
  du liquide, background soft-focus équipements de pointe
  Shot 3 (10-15s) : Plan large équipe (3-4 personnes) souriante autour
  d'une table avec échantillons de produits, échangeant, ambiance
  collaborative et humaine
Audio : Musique inspirante et optimiste, voix-off féminine chaleureuse
  "Notre engagement : la transparence. Chaque produit Pure Essence est 
  créé avec passion et rigueur scientifique."
Texte overlay : "Made with ❤️ & Science"
Style : Documentary commercial moderne, couleurs naturelles lumineuses
Coût : 160 crédits (CocoBoard Vidéo multi-shots + génération 15s)
Ciblage : 
  - Clients actuels (warm audience nurturing)
  - Brand lovers et early adopters
  - Intérêts : transparence marque, cosmétiques éthiques

📅 Mercredi 12 Fév - Community Highlight Image
Format : Carré 1:1, 2K
Concept : Collage mosaïque de photos "utilisateurs" diversifiées
  (génération IA de 8-12 portraits variés : différentes ethnies, âges 25-50,
  tous avec peau radieuse et sourire authentique)
Design : Grid layout dynamique avec superposition partielle des photos,
  fond vert sauge #9CAF88, chaque portrait encadré d'un fin liseré doré
Texte central : "10,000+ MEMBRES DE LA FAMILLE PURE ESSENCE"
Sous-texte : "Merci pour votre confiance et vos partages inspirants 💚"
Hashtag : #PureEssenceFamily #CommunautéNaturelle
Éléments décoratifs : Feuilles botaniques subtiles en arrière-plan,
  quelques emojis cœurs verts discrets
Style : Warm, inclusive, célébration communautaire
Coût : 115 crédits (CocoBoard Image + génération 2K)
Ciblage :
  - Toute la communauté (broad reach)
  - Post à "booster" pour maximiser engagement
  - Incitation aux commentaires et partages avec question :
    "Quel produit Pure Essence a changé votre routine ?"

📅 Vendredi 14 Fév - Valentine's Day Special Image
Format : Story vertical 9:16, 2K
Concept : Édition limitée Saint-Valentin, packaging spécial avec ruban rose
  Design romantique épuré : Produit phare (Sérum Éclat) avec packaging
  customisé cœur doré subtil, accompagné d'une carte message élégante
  "Pour celle/celui que vous aimez... ou pour vous ❤️"
Ambiance : Soft, romantique mais pas cucul, tons roses poudré #E8B4BC
  mélangés aux couleurs signature Pure Essence
Offre : "Duo Radiance + Carte personnalisée offerte"
  Prix spécial : 68€ au lieu de 89€
Call-to-action : "Offre valable 48h - Stocks limités"
Style : Product photography premium avec éclairage doux, pétales de rose
  organiques disposés artistiquement, background beige naturel
Coût : 115 crédits
Ciblage :
  - Femmes 25-45 ans + Hommes 25-50 (pour achat cadeau)
  - Retargeting clients + cold audience "cadeaux Saint-Valentin"
  - Boost jeudi 13 + vendredi 14 février

📅 Samedi 15 Fév - Sustainability Commitment Video
Format : Horizontal 16:9, 20s (3-4 shots)
Concept : Message écologique fort de la marque, engagement développement durable
Brief détaillé :
  Shot 1 (0-5s) : Drone shot aérien de forêt verdoyante, zoom progressif
  sur clairière où pousse plantation d'ingrédients bio Pure Essence,
  transition fluide vers...
  Shot 2 (5-10s) : Gros plan packaging Pure Essence 100% recyclable,
  matériaux naturels (verre, bambou, papier kraft), posé sur mousse
  forestière avec rayons de soleil filtrant à travers feuillages
  Shot 3 (10-15s) : Main plantant un jeune arbre dans terre riche,
  symbolisant programme "1 achat = 1 arbre planté"
  Shot 4 (15-20s) : Infographie animée élégante apparaissant sur fond
  nature : "76% ingrédients bio | 100% packaging recyclable | 
  Certifié B-Corp | 1000 arbres plantés en janvier 2025"
Audio : Musique inspirante crescendo, sons de nature (oiseaux, vent doux)
  Voix-off posée et convaincante : "Pure Essence, c'est un engagement.
  Pour votre peau et pour notre planète. Ensemble, cultivons le futur."
Texte final : "Join the Green Beauty Revolution 🌿"
Style : Cinéma documentaire nature, couleurs riches et organiques,
  message impactful sans être moralisateur
Coût : 220 crédits (CocoBoard multi-shots + génération 20s)
Ciblage :
  - Audiences sensibles écologie et développement durable
  - Millennials et Gen-Z éco-conscients
  - Partage LinkedIn pour portée B2B (marque employeur)
  - PR : envoi aux influenceurs green beauty pour partage organique

📅 Dimanche 16 Fév - Campaign Grand Finale Image
Format : Carré 1:1, 2K
Concept : Clôture élégante de la campagne de lancement, teasing suite
Design sophistiqué :
  - Fond : Dégradé doux du vert sauge au beige, texture aquarelle subtile
  - Centre : Les 4 produits disposés en diamant artistique, éclairage
    hero donnant effet de "produits-stars", ombres douces et portées élégantes
  - Overlay texte haut : "MERCI POUR CE LANCEMENT INCROYABLE !"
    Typographie : Serif élégant, couleur #2D5016
  - Texte central : "6 semaines. 10,247 nouvelles clientes. Une communauté engagée."
    Stats réelles ou projections optimistes, typo sans-serif moderne
  - Bas de l'image : Teaser mystérieux avec silhouette floue nouveau produit
    + texte "Restez connectées... Mars nous réserve une surprise 💚"
  - Call-to-action : "Suivez-nous pour ne rien manquer"
Badges discrets : "Certifié Bio" "Vegan" "Made in France"
Ambiance : Gratitude, célébration, anticipation, premium
Coût : 115 crédits
Ciblage :
  - Toute la communauté (broad reach maximum)
  - Post "de remerciement" authentique pour clôturer campagne
  - Pin en haut du feed Instagram pendant 1 semaine
  - Newsletter email envoyée en parallèle avec contenu étendu
  - Début teasing gamme printemps (continuité stratégique)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RÉCAPITULATIF SEMAINE 6

Assets créés : 5 (2 vidéos + 3 images)
Budget semaine : 725 crédits
Thématiques : Transparence, Communauté, Occasion (Saint-Valentin), 
               Écologie, Clôture/Teasing
Objectifs atteints :
  ✅ Renforcement lien émotionnel marque-client
  ✅ Mise en avant valeurs (transparence, écologie)
  ✅ Capitalisation sur événement commercial (Saint-Valentin)
  ✅ Clôture campagne en beauté avec teasing suite
  ✅ Contenus réutilisables long-terme (evergreen)

KPIs semaine 6 :
  - Engagement rate : Objectif >5% (vs 3% moyenne)
  - Shares/Saves : Objectif +40% vs semaines précédentes
  - Commentaires : Objectif 200+ sur post communauté
  - Conversions Saint-Valentin : Objectif 300 ventes duo
  - Newsletter subscribers : Objectif +500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BILAN COMPLET CAMPAGNE 6 SEMAINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STATISTIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Durée totale | 6 semaines (42 jours) |
| Assets créés | 25 (16 images + 9 vidéos) |
| Budget total dépensé | 4 975 crédits / 5 000 |
| Budget restant | 25 crédits (réserve ajustements) |
| Coût moyen par asset | ~199 crédits |
| CocoBoards générés | 25 (1 campagne + 24 assets) |

🎯 DISTRIBUTION PAR FORMAT

| Type | Quantité | % du total | Crédits |
|------|----------|------------|---------|
| Images carrées 1:1 | 12 | 48% | 1 380 |
| Images verticales 9:16 | 2 | 8% | 230 |
| Images horizontales 16:9 | 2 | 8% | 230 |
| Vidéos courtes (6-8s) | 6 | 24% | 840 |
| Vidéos moyennes (15-20s) | 3 | 12% | 540 |
| Vidéo longue (30s) | 1 | 4% | 250 |
| CocoBoard Campagne | 1 | - | 100 |

📈 RÉPARTITION HEBDOMADAIRE ACTUALISÉE

- Semaine 1 (Teasing) : 370 crédits - 3 assets
- Semaine 2 (Lancement) : 985 crédits - 6 assets
- Semaine 3 (Engagement) : 390 crédits - 3 assets
- Semaine 4 (Conversion) : 500 crédits - 4 assets
- Semaine 5 (Fidélisation) : 335 crédits - 2 assets
- Semaine 6 (Reconnaissance) : 725 crédits - 5 assets
- CocoBoard Campagne initial : 100 crédits

🎨 COHÉRENCE CRÉATIVE

Tous les 25 assets partagent :
- **Palette de couleurs identique** (#9CAF88, #E8DCC4, #D4A59A, #FAF9F6)
- **Style photographique cohérent** (naturel, épuré, lumineux)
- **Typographie uniforme** (Serif élégant + Sans-serif moderne)
- **Ton de communication aligné** (authentique, éducatif, aspirationnel)
- **Prompts contenant "anchor prompts"** pour continuité visuelle
- **Progression narrative** claire sur 6 semaines

💰 COÛTS DÉTAILLÉS FINAUX

```
CocoBoard Campagne (1 × 100) : 100 crédits
CocoBoards Assets (24 × 100) : 2 400 crédits
Générations images (16) : 1 840 crédits
Générations vidéos (9) : 1 635 crédits
────────────────────────────────────────
TOTAL DÉPENSÉ : 4 975 crédits
RÉSERVE : 25 crédits
BUDGET INITIAL : 5 000 crédits
OPTIMISATION : 99,5% du budget utilisé efficacement
```

📊 PROJECTION ROI CAMPAGNE

**Investissement**
```
Crédits dépensés : 4 975 × 0,10$ = 497,50$
Temps équipe interne : ~40h × 50$/h = 2 000$
Outils et licences : 200$
────────────────────────────────────────
Coût total campagne : 2 697,50$
```

**Revenus projetés (6 semaines)**
```
Objectif conversions : 10 000
Taux de conversion estimé : 3,5%
Visiteurs nécessaires : ~285 000
Panier moyen : 75€ (≈ 82$)

Scénario conservateur (70% de l'objectif) :
  7 000 conversions × 82$ = 574 000$
  
Scénario réaliste (objectif atteint) :
  10 000 conversions × 82$ = 820 000$

Scénario optimiste (120% de l'objectif) :
  12 000 conversions × 82$ = 984 000$
```

**ROI**
```
Conservateur : (574 000$ - 2 697,50$) / 2 697,50$ = 21 174% 
Réaliste : (820 000$ - 2 697,50$) / 2 697,50$ = 30 285%
Optimiste : (984 000$ - 2 697,50$) / 2 697,50$ = 36 368%

→ Même dans le pire scénario, le ROI est exceptionnel grâce à
  l'automatisation Coconut et l'efficacité de l'IA générative
```

🎯 LEARNINGS & RECOMMANDATIONS

**Ce qui a fonctionné ✅**
1. **Progression narrative** sur 6 semaines (teasing → conversion → fidélisation)
2. **Mix formats** équilibré (64% images, 36% vidéos)
3. **Cohérence visuelle** stricte via palette et style définis
4. **Capitalisation événements** (Saint-Valentin semaine 6)
5. **Transparence et valeurs** (écologie, communauté) = différenciation forte

**Axes d'amélioration 🔄**
1. **Plus de UGC-style content** en semaines 3-4 (authenticité)
2. **Tests A/B** sur 2-3 variations de visuels clés
3. **Retargeting plus agressif** semaines 4-5
4. **Influenceurs micro** intégrés dès semaine 2
5. **Contenu interactif** (sondages, quiz) pour booster engagement

**Prochaines étapes 📅**

**Immédiat (Semaines 7-8 post-campagne)**
- Analyse approfondie des performances par asset
- Identification des top performers pour réutilisation
- Collecte et intégration vrais UGC clients
- Préparation campagne printanière (teaser semaine 6)

**Court terme (Mois 2-3)**
- Lancement gamme printemps avec learnings appliqués
- Scaling budget ads sur assets performants
- Programme ambassadeurs/influenceurs structuré
- Expansion canaux (TikTok, Pinterest)

**Moyen terme (Trimestre 2)**
- Campagne internationale (UK, Allemagne, Espagne)
- Lancement marketplace Pure Essence (B2B)
- Partenariats retailers physiques (Sephora, etc.)
- Certification B-Corp et communication amplifiée

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIN DU COCOBOARD CAMPAGNE PURE ESSENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Étape 4 : Validation et ajustements**

Interface de révision détaillée :
- 📊 **Vue calendrier** : Timeline complète 6 semaines avec tous les assets
- 📈 **Prévisions KPIs** : Reach, engagement, conversions projetés par semaine
- 🎨 **Preview visuelle** : Moodboard des 25 assets pour vérifier cohérence
- ✏️ **Édition granulaire** : Modification individuelle de chaque asset
- 🔄 **Réorganisation** : Drag & drop pour ajuster timeline
- 💰 **Budget tracker** : Suivi en temps réel du budget crédits
- 📊 **Simulation ROI** : Calculs automatiques basés sur objectifs fournis
- 💬 **Notes collaboratives** : Commentaires par asset pour équipe

Actions possibles :
- ✅ Approuver l'ensemble de la campagne et lancer production
- ✏️ Modifier des assets spécifiques (prompts, formats, timing)
- 🔄 Demander variantes pour assets critiques (A/B testing)
- ➕ Ajouter des assets supplémentaires (si budget disponible)
- ➖ Retirer des assets moins prioritaires
- 🔀 Réajuster la répartition hebdomadaire
- 📅 Décaler les dates de publication
- 💡 Demander une révision stratégique complète par Gemini

**Étape 5 : Production de la campagne**

Workflow de production automatisé et orchestré :

1. **Initialisation** (Jour J)
   - Création du projet campagne dans Coconut Dashboard
   - Attribution d'un ID unique : `campaign_pure_essence_q1_2025`
   - Lock du budget : 4 975 crédits réservés
   - Génération du planning de production optimisé

2. **Génération par vagues** (Semaines -2 à Jour J)
   - Vague 1 (S-2) : Semaines 1-2 (9 assets) - Production anticipée
   - Vague 2 (S-1) : Semaines 3-4 (7 assets)
   - Vague 3 (S0) : Semaines 5-6 (7 assets)
   - Chaque vague suit le workflow : CocoBoard → Validation → Génération

3. **Génération séquentielle des assets**
   Pour chaque asset :
   - a. Génération CocoBoard individuel (si pas déjà fait)
   - b. Validation automatique ou manuelle selon settings
   - c. Génération via API appropriée (Flux 2 ou Veo 3.1)
   - d. Polling statut avec retry logic
   - e. Téléchargement et stockage S3
   - f. Post-processing si nécessaire (watermark, resize)
   - g. Mise à jour statut dans dashboard
   - h. Notification équipe si validation requise

4. **Assemblage vidéos multi-shots**
   - Téléchargement de tous les shots générés
   - Assemblage via FFmpeg selon timeline définie
   - Application des transitions (fondu, cut, dissolve)
   - Ajout audio si fourni ou généré
   - Overlay texte et branding
   - Compression optimale (H.264, qualité 85%)
   - Upload version finale

5. **Quality Assurance automatisée**
   - Vérification résolution et format
   - Scan anti-corruption de fichiers
   - Validation cohérence visuelle (color matching vs palette)
   - Détection de contenu inapproprié (safety check)
   - Génération de rapports QA par asset

6. **Préparation à la publication**
   - Organisation par semaine et canal
   - Génération des captions suggérées par Gemini
   - Recommandations hashtags optimisés SEO
   - Suggestions de meilleurs moments de publication (ML-based)
   - Export packages par plateforme (Instagram, Facebook, LinkedIn, etc.)

7. **Dashboard de suivi campagne**
   - Statut de production en temps réel (X/25 assets complétés)
   - Timeline de publication avec countdown
   - Liens de téléchargement de tous les assets
   - Prévisions de performance par asset
   - Intégration calendrier équipe (Google Calendar, Notion)

Timeline de production estimée :
```
Vague 1 (9 assets) : 2-4 heures
Vague 2 (7 assets) : 1,5-3 heures  
Vague 3 (7 assets) : 1,5-3 heures
QA et packaging final : 2 heures
────────────────────────────────
Total production : 7-12 heures sur 2 semaines

Comparaison traditionnel :
  Designer + Vidéaste : 80-120 heures
  Gain de temps : 87-90% 🚀
```

**Étape 6 : Livraison et handoff**

Package de livraison complet :
```
📦 DELIVERABLES CAMPAGNE PURE ESSENCE

📁 /assets
  📁 /semaine-1
    - teaser-image-1_1080x1080.png
    - teaser-image-1_1080x1080_watermarked.png (avec filigrane)
    - teaser-video-1_1080x1920.mp4
    - ...
  📁 /semaine-2
  📁 /semaine-3
  📁 /semaine-4
  📁 /semaine-5
  📁 /semaine-6

📁 /raw-files (optionnel, upgrade premium)
  - Fichiers sources sans compression
  - Versions PSD si éditions manuelles
  - Fichiers audio séparés

📁 /captions-hashtags
  - captions_semaine_1.txt
  - captions_semaine_2.txt
  - ...
  - hashtags_optimises.txt

📁 /calendrier
  - calendrier_publication.xlsx
  - calendrier_publication.ics (import Google Calendar)
  - planning_visuel.pdf

📁 /analytics
  - projections_kpis.pdf
  - benchmark_concurrence.pdf
  - recommandations_ciblage.pdf

📁 /cocoboards
  - cocoboard_campagne_master.json
  - cocoboard_asset_001.json
  - ...
  - cocoboard_asset_025.json

📄 README.txt
📄 GUIDE_UTILISATION.pdf
📄 BRAND_GUIDELINES_APPLIED.pdf
```

Support post-livraison :
- Email récap avec liens de téléchargement (valides 30 jours)
- Session de handoff vidéo (30 min, optionnel)
- Support prioritaire pendant durée campagne (6 semaines)
- Accès au dashboard temps réel de suivi
- Modifications mineures gratuites (ajustement captions, recrop)
- Option "réutilisation" : Dupliquer la campagne pour autre marché/période

---

### Récapitulatif Complet Mode Campagne

**📊 CAPACITÉS DU SYSTÈME**

Coconut Mode Campagne peut gérer :
- ✅ Campagnes de 2 semaines à 6 mois
- ✅ 10 à 100+ assets par campagne
- ✅ Mix de 20+ formats différents
- ✅ Multicanal (social, display, print, TV, email)
- ✅ Multi-langue (traduction des prompts)
- ✅ Personnalisation par segment d'audience
- ✅ Variations A/B pour tests

**🎯 DIFFÉRENCIATION VS CONCURRENCE**

| Feature | Coconut | Agence Tradi | Freelance | Canva | Adobe |
|---------|---------|--------------|-----------|-------|-------|
| **Durée planification** | 60-90 min | 2-4 sem | 1-2 sem | Manuel | Manuel |
| **Coût campagne 6 sem** | ~500$ | 15-50K$ | 5-15K$ | 200$+ | 300$+ |
| **Cohérence visuelle** | IA garantie | Variable | Bonne | Manuelle | Bonne |
| **Expertise requise** | Aucune | N/A | Moyenne | Faible | Élevée |
| **Délai production** | 7-12h | 4-8 sem | 2-4 sem | 20-40h | 30-60h |
| **Flexibilité ajustements** | Immédiate | Lente | Moyenne | Rapide | Rapide |
| **Scalabilité** | Infinie | Limitée | Limitée | Bonne | Bonne |

**💡 CAS D'USAGE CLIENTS**

1. **TPE/PME sans équipe marketing**
   - Budget : 500-2000$ total
   - Fréquence : 1 campagne/trimestre
   - Autonomie complète avec Coconut

2. **Startups en croissance**
   - Budget : 2000-5000$/mois
   - Fréquence : Campagnes multiples simultanées
   - Itération rapide basée sur data

3. **Entreprises établies (complémentaire)**
   - Budget : 10 000-50 000$/mois
   - Usage : Tests rapides, marchés secondaires
   - Augmente capacité équipe existante

4. **Agences (white-label)**
   - Proposent Coconut à leurs clients
   - Marge sur credits + consulting stratégique
   - Scalent leur offre sans recruter

---

## 5. Système de Crédits

### 5.1 Modèle économique

**1 crédit = 0,10 USD (0,09 EUR)**

[... le reste du document continue avec les mêmes sections que dans le cahier des charges original ...]
