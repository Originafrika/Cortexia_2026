# 🚀 COCONUT V14 - MODE CAMPAGNE (Spécifications Complètes)

## 🎯 VISION GLOBALE

Le **Mode Campagne** de Coconut V14 remplace un **directeur marketing senior** en générant des campagnes marketing complètes et cohérentes combinant images et vidéos pour un objectif commercial sur plusieurs semaines.

**Différence clé avec les modes Image/Vidéo :**
- **Mode Image** : 1 image isolée (ex: pub produit)
- **Mode Vidéo** : 1 vidéo isolée (ex: spot 30s)
- **Mode Campagne** : 15-30 assets (images + vidéos) orchestrés sur 2-12 semaines avec cohérence stratégique complète

---

## 📋 WORKFLOW COMPLET

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: CAMPAIGN BRIEFING                          │
│ User Input (CampaignBriefing.tsx)                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2: CAMPAIGN ANALYSIS                          │
│ Gemini Strategic Planning (coconut-v14-campaign-    │
│ analyzer.ts)                                         │
│ → Génère plan marketing complet + timeline          │
│ Coût: 100 crédits                                    │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: CAMPAIGN COCOBOARD                          │
│ Review & Edit (CampaignCocoBoardPremium.tsx)         │
│ → Vue calendrier par semaines                        │
│ → Ajuster assets, dates, specs                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 4: BATCH GENERATION                            │
│ Orchestration (CampaignGenerationView.tsx)           │
│ → Loop sur chaque asset:                             │
│   • Images: Coconut Image pipeline                   │
│   • Vidéos: Coconut Video pipeline                   │
│ → Progression tracking                               │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 5: DELIVERY                                    │
│ → Grid view tous les assets                          │
│ → Download all (ZIP)                                 │
│ → Publish selected to feed                           │
│ → Export calendar (CSV/PDF)                          │
└─────────────────────────────────────────────────────┘
```

---

## 📝 PHASE 1: CAMPAIGN BRIEFING

### **Fichier Frontend**
`/components/coconut-v14/CampaignBriefing.tsx` ❌ **À CRÉER**

### **Interface utilisateur**

```typescript
interface CampaignBriefingInput {
  // 1. OBJECTIF CAMPAGNE
  objective: 'product-launch' | 'brand-repositioning' | 'seasonal-promotion' | 'awareness' | 'conversion';
  
  // 2. DURÉE
  duration: 2 | 4 | 6 | 8 | 12; // en semaines
  
  // 3. BUDGET CRÉDITS
  budgetCredits: number; // ex: 5000
  
  // 4. CANAUX DE DIFFUSION
  channels: Array<'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'print' | 'tv' | 'web' | 'email'>;
  
  // 5. AUDIENCE CIBLE
  targetAudience: {
    demographics: {
      ageRange: string; // ex: "25-45 ans"
      gender: 'all' | 'female' | 'male';
      location: string; // ex: "France, Belgique"
    };
    psychographics: string; // ex: "Sensibles à l'écologie, recherchent authenticité"
  };
  
  // 6. MIX CONTENUS SOUHAITÉ
  contentMix: {
    imagesCount: number; // ex: 16
    videosCount: number;  // ex: 8
    preferredFormats: {
      images: Array<'1:1' | '9:16' | '16:9' | '4:3'>; // formats prioritaires
      videos: Array<'9:16' | '16:9' | '1:1'>;
    };
  };
  
  // 7. ASSETS FOURNIS (Upload)
  providedAssets: {
    logo?: File;
    brandGuidelines?: File; // PDF charte graphique
    productPhotos: File[]; // 1-10 photos produits
    existingVideos?: File[]; // optionnel
  };
  
  // 8. BRIEF TEXTE LIBRE
  description: string; // 200-2000 caractères
  
  // 9. INFORMATIONS PRODUIT/MARQUE
  productInfo: {
    name: string; // ex: "Pure Essence"
    category: string; // ex: "Cosmétiques naturels"
    keyFeatures: string[]; // ex: ["Bio", "Vegan", "Made in France"]
    uniqueSellingPoints: string; // ex: "Formules 100% naturelles sans compromis sur l'efficacité"
  };
  
  // 10. CONTRAINTES SPÉCIFIQUES (optionnel)
  constraints?: {
    mustIncludeElements?: string[]; // ex: ["Logo visible", "Mention légale"]
    avoidElements?: string[]; // ex: ["Pas d'animaux", "Pas de rouge vif"]
    brandColors?: string[]; // Hex codes
  };
}
```

### **Exemple de formulaire UI**

```tsx
// CampaignBriefing.tsx
<div className="campaign-briefing-form">
  {/* Step 1: Objectif */}
  <FormSection title="1. Objectif de la campagne">
    <RadioGroup>
      <Radio value="product-launch">🚀 Lancement produit</Radio>
      <Radio value="brand-repositioning">🔄 Repositionnement marque</Radio>
      <Radio value="seasonal-promotion">🎁 Promotion saisonnière</Radio>
      <Radio value="awareness">📢 Notoriété</Radio>
      <Radio value="conversion">💰 Conversion/Ventes</Radio>
    </RadioGroup>
  </FormSection>
  
  {/* Step 2: Durée & Budget */}
  <FormSection title="2. Durée et budget">
    <Select label="Durée campagne">
      <Option value={2}>2 semaines (sprint)</Option>
      <Option value={4}>4 semaines (1 mois)</Option>
      <Option value={6}>6 semaines (recommandé)</Option>
      <Option value={8}>8 semaines (2 mois)</Option>
      <Option value={12}>12 semaines (trimestre)</Option>
    </Select>
    
    <Input 
      label="Budget crédits approximatif" 
      type="number" 
      min={1000} 
      max={50000}
      placeholder="5000"
    />
  </FormSection>
  
  {/* Step 3: Canaux */}
  <FormSection title="3. Canaux de diffusion">
    <CheckboxGroup>
      <Checkbox value="instagram">Instagram (Feed + Stories + Reels)</Checkbox>
      <Checkbox value="facebook">Facebook (Posts + Ads)</Checkbox>
      <Checkbox value="linkedin">LinkedIn (B2B)</Checkbox>
      <Checkbox value="tiktok">TikTok (Vidéos courtes)</Checkbox>
      <Checkbox value="youtube">YouTube (Vidéos longues)</Checkbox>
      <Checkbox value="print">Print (Affiches, magazines)</Checkbox>
      <Checkbox value="tv">TV (Spots publicitaires)</Checkbox>
      <Checkbox value="web">Web (Bannières, landing pages)</Checkbox>
      <Checkbox value="email">Email (Newsletters)</Checkbox>
    </CheckboxGroup>
  </FormSection>
  
  {/* Step 4: Audience */}
  <FormSection title="4. Audience cible">
    <Input label="Tranche d'âge" placeholder="25-45 ans" />
    <Select label="Genre">
      <Option value="all">Tous</Option>
      <Option value="female">Femmes</Option>
      <Option value="male">Hommes</Option>
    </Select>
    <Input label="Localisation" placeholder="France, Belgique, Suisse" />
    <Textarea 
      label="Psychographie & comportements" 
      placeholder="Ex: Sensibles à l'écologie, recherchent authenticité, actifs sur réseaux sociaux..."
      rows={4}
    />
  </FormSection>
  
  {/* Step 5: Mix contenus */}
  <FormSection title="5. Mix de contenus souhaité">
    <div className="grid grid-cols-2 gap-4">
      <Input label="Nombre d'images" type="number" min={5} max={50} value={16} />
      <Input label="Nombre de vidéos" type="number" min={2} max={20} value={8} />
    </div>
    
    <p className="text-sm text-warm-500">
      💡 Recommandation: 2/3 images, 1/3 vidéos pour optimiser budget et engagement
    </p>
  </FormSection>
  
  {/* Step 6: Assets fournis */}
  <FormSection title="6. Assets fournis (upload)">
    <FileUpload label="Logo" accept="image/*" maxSize="5MB" />
    <FileUpload label="Charte graphique (PDF)" accept=".pdf" maxSize="10MB" />
    <FileUpload 
      label="Photos produits" 
      accept="image/*" 
      multiple 
      maxFiles={10}
      maxSize="5MB"
    />
  </FormSection>
  
  {/* Step 7: Brief principal */}
  <FormSection title="7. Brief de campagne">
    <Textarea 
      label="Décrivez votre campagne en détail"
      placeholder="Exemple: Campagne de lancement Q1 2025 pour notre gamme de cosmétiques naturels 'Pure Essence'. Objectif: 10k conversions site web. Message clé: retour à l'essentiel, beauté naturelle sans compromis. Ton: authentique, éducatif, aspirationnel..."
      rows={8}
      minLength={200}
      maxLength={2000}
    />
  </FormSection>
  
  {/* Step 8: Informations produit */}
  <FormSection title="8. Informations produit/marque">
    <Input label="Nom produit/marque" placeholder="Pure Essence" />
    <Input label="Catégorie" placeholder="Cosmétiques naturels" />
    <TagInput 
      label="Caractéristiques clés" 
      placeholder="Bio, Vegan, Made in France..."
    />
    <Textarea 
      label="Points de différenciation uniques"
      placeholder="Ce qui rend votre produit unique..."
      rows={3}
    />
  </FormSection>
  
  {/* Step 9: Contraintes (optionnel) */}
  <FormSection title="9. Contraintes spécifiques (optionnel)" collapsible>
    <TagInput label="Éléments obligatoires" placeholder="Logo visible, Mention légale..." />
    <TagInput label="Éléments à éviter" placeholder="Pas d'animaux, Pas de rouge vif..." />
    <ColorPicker label="Couleurs de marque" multiple maxColors={5} />
  </FormSection>
  
  {/* CTA */}
  <div className="flex justify-end gap-4 mt-8">
    <Button variant="outline">Sauvegarder brouillon</Button>
    <Button variant="primary" size="large">
      Générer plan de campagne (100 crédits)
    </Button>
  </div>
</div>
```

---

## 🧠 PHASE 2: CAMPAIGN ANALYSIS (Gemini)

### **Fichier Backend**
`/supabase/functions/server/coconut-v14-campaign-analyzer.ts` ❌ **À CRÉER**

### **Route API**

```typescript
POST /make-server-e55aa214/coconut-v14/campaign/analyze

Body: {
  userId: string;
  projectId?: string;
  briefing: CampaignBriefingInput;
}

Response: {
  success: boolean;
  data: GeminiCampaignAnalysisResponse;
  cocoBoardId: string; // Saved in KV
}
```

### **Système Prompt Gemini**

```typescript
const systemPrompt = `
Tu es CocoBoard Campaign Generator, un expert en stratégie marketing multicanale, 
directeur de création senior et planneur stratégique avec 15+ ans d'expérience 
chez Ogilvy, BBDO et Wieden+Kennedy.

Tu dois créer un plan de campagne marketing COMPLET et EXÉCUTABLE qui orchestre 
des dizaines d'assets visuels cohérents sur plusieurs semaines.

RÈGLES OBLIGATOIRES:

1. COHÉRENCE VISUELLE ABSOLUE
   - Palette couleurs identique sur TOUS les assets (max 5 couleurs hex)
   - Style photographique uniforme (ex: "naturel épuré lumineux")
   - Typographie cohérente (1 serif + 1 sans-serif max)
   - Archetypes créatifs constants (ex: Creator + Caregiver)

2. PROGRESSION NARRATIVE
   - Semaine 1-2: Teasing/Awareness
   - Semaine 3-4: Engagement/Education
   - Semaine 5-6: Conversion/Action
   - Semaine 7+: Fidélisation/Advocacy

3. MIX STRATÉGIQUE
   - 60-70% images (rapide, économique, volume)
   - 30-40% vidéos (impact, storytelling, premium)
   - Formats adaptés aux canaux (9:16 pour Stories, 1:1 pour Feed, etc.)

4. BRIEF PAR ASSET
   - Chaque asset a un objectif marketing précis
   - Description visuelle détaillée (200+ mots)
   - Ciblage audience spécifique
   - Placement canal optimal
   - Date de publication suggérée

5. RESPECT DU BUDGET
   - Calculer coût précis par asset (115cr image, 140-250cr vidéo)
   - Budget total ≤ budget fourni
   - Garder 5% de marge pour ajustements

6. CALENDRIER RÉALISTE
   - 3-5 assets par semaine maximum
   - Jours de publication optimaux (ex: mardi/jeudi pour engagement)
   - Eviter surcharge cognitive audience

7. KPIs & TRACKING
   - Objectifs mesurables par semaine
   - Métriques clés par asset (impressions, engagement, conversions)
   - Recommandations A/B testing
`;

const userPrompt = `
Crée un plan de campagne marketing intégré pour :

OBJECTIF: ${briefing.objective}
DURÉE: ${briefing.duration} semaines
BUDGET: ${briefing.budgetCredits} crédits
CANAUX: ${briefing.channels.join(', ')}

AUDIENCE:
- Démographie: ${briefing.targetAudience.demographics.ageRange}, ${briefing.targetAudience.demographics.gender}
- Localisation: ${briefing.targetAudience.demographics.location}
- Psychographie: ${briefing.targetAudience.psychographics}

PRODUIT/MARQUE:
- Nom: ${briefing.productInfo.name}
- Catégorie: ${briefing.productInfo.category}
- Features: ${briefing.productInfo.keyFeatures.join(', ')}
- USP: ${briefing.productInfo.uniqueSellingPoints}

BRIEF COMPLET:
${briefing.description}

MIX SOUHAITÉ: ${briefing.contentMix.imagesCount} images + ${briefing.contentMix.videosCount} vidéos

Tu dois fournir un plan JSON structuré avec:
1. Stratégie créative globale
2. Timeline hebdomadaire détaillée
3. Brief créatif pour chaque asset (${briefing.contentMix.imagesCount + briefing.contentMix.videosCount} au total)
4. Identité visuelle cohérente
5. Recommandations ciblage par canal
6. KPIs suggérés
7. Estimation coût précise
`;
```

### **Response Schema**

```typescript
interface GeminiCampaignAnalysisResponse {
  // OVERVIEW
  campaignTitle: string; // ex: "Pure Essence - Retour à l'Essentiel"
  
  // STRATÉGIE GLOBALE
  strategy: {
    positioning: string; // Positionnement marque
    theme: string; // Thème créatif global
    messagingPillars: string[]; // 3-5 piliers de communication
    narrativeArc: string; // Arc narratif sur la durée
  };
  
  // IDENTITÉ VISUELLE
  visualIdentity: {
    theme: string; // ex: "Minimaliste épuré, nature authentique"
    palette: Array<{
      hex: string;
      name: string; // ex: "Vert sauge"
      usage: string; // ex: "Backgrounds, accents nature"
    }>; // Max 5 couleurs
    photographyStyle: string; // ex: "Naturel, lumineux, macro textures botaniques"
    typography: {
      headlines: string; // ex: "Serif élégant (Playfair Display)"
      body: string; // ex: "Sans-serif moderne (Inter)"
    };
    archetypes: string[]; // ex: ["Creator", "Caregiver", "Innocent"]
  };
  
  // TIMELINE
  timeline: {
    totalWeeks: number;
    startDate: string; // ISO date
    endDate: string;
    weeks: Week[];
  };
  
  // SEMAINES
  weeks: Week[];
  
  // TOUS LES ASSETS
  allAssets: CampaignAsset[];
  
  // COÛTS
  estimatedCost: {
    analysis: 100;
    images: number;
    videos: number;
    total: number;
  };
  
  // KPIS
  kpis: {
    primary: string; // ex: "10,000 conversions site web"
    secondary: string[]; // ex: ["Engagement rate >4%", "50k impressions/semaine"]
    trackingRecommendations: string;
  };
}

interface Week {
  weekNumber: number; // 1-12
  startDate: string; // ISO
  endDate: string;
  objective: string; // ex: "Phase Teasing - Créer anticipation"
  theme: string; // ex: "Mystère et découverte"
  channels: string[]; // Canaux actifs cette semaine
  assets: CampaignAsset[]; // 3-5 assets
  budgetWeek: number; // Crédits dépensés
  kpisWeek: {
    impressions: number;
    engagement: string;
    conversions: number;
  };
}

interface CampaignAsset {
  // IDENTITÉ
  id: string; // ex: "asset-w1-img-001"
  order: number; // Ordre global dans campagne
  weekNumber: number;
  
  // TYPE & FORMAT
  type: 'image' | 'video';
  format: '1:1' | '9:16' | '16:9' | '4:3' | '3:4' | '3:2' | '2:3';
  resolution: '1K' | '2K'; // Pour images
  videoDuration?: 6 | 8 | 15 | 20 | 30; // Pour vidéos (secondes)
  videoModel?: 'veo3_fast' | 'veo3'; // Pour vidéos
  
  // OBJECTIF MARKETING
  marketingObjective: string; // ex: "Générer buzz et anticipation"
  
  // CONCEPT CRÉATIF
  concept: string; // 1 phrase punchy
  visualDescription: string; // 200-500 mots, détails précis
  
  // COPY/TEXTE (si applicable)
  copy?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    bodyText?: string;
  };
  
  // CIBLAGE
  targetAudience: string; // Segment spécifique
  channels: string[]; // Canaux pour cet asset
  placementRecommendations: string; // ex: "Instagram Feed + Stories, Pin 24h"
  
  // TIMING
  scheduledDate: string; // ISO date
  scheduledTime: string; // ex: "18:00" (heure optimale)
  
  // BRIEF CRÉATIF (pour CocoBoard)
  creativeBrief: string; // Brief complet pour génération
  
  // COÛT
  estimatedCost: number; // 115 ou 140-250
  
  // KPIS ASSET
  expectedKpis: {
    impressions: number;
    engagementRate: string;
    conversions?: number;
  };
  
  // NOTES
  notes?: string; // ex: "Tester A/B avec variante CTA"
}
```

### **Exemple de réponse Gemini (extrait)**

```json
{
  "campaignTitle": "Pure Essence - Retour à l'Essentiel",
  
  "strategy": {
    "positioning": "Leader des cosmétiques naturels premium sans compromis",
    "theme": "Retour à l'Essentiel - Beauté Naturelle Authentique",
    "messagingPillars": [
      "Transparence radicale (formules 100% naturelles)",
      "Efficacité prouvée (résultats visibles)",
      "Engagement écologique (emballages responsables)",
      "Made in France (savoir-faire local)"
    ],
    "narrativeArc": "Du teasing mystérieux (semaines 1-2) à l'éducation transparente (semaines 3-4) jusqu'à la conversion émotionnelle (semaines 5-6)"
  },
  
  "visualIdentity": {
    "theme": "Minimalisme épuré rencontrant la nature authentique",
    "palette": [
      { "hex": "#9CAF88", "name": "Vert sauge", "usage": "Backgrounds nature, accents végétaux" },
      { "hex": "#E8DCC4", "name": "Beige naturel", "usage": "Backgrounds secondaires, douceur" },
      { "hex": "#D4A59A", "name": "Terracotta doux", "usage": "Warmth, humanité, produits" },
      { "hex": "#FAF9F6", "name": "Blanc cassé", "usage": "Textes, clarté, pureté" },
      { "hex": "#2D5016", "name": "Vert profond", "usage": "Textes foncés, crédibilité" }
    ],
    "photographyStyle": "Naturel lumineux avec macro textures botaniques, soft focus backgrounds, lumière douce naturelle, compositions épurées",
    "typography": {
      "headlines": "Serif élégant (Playfair Display) pour sophistication",
      "body": "Sans-serif moderne (Inter) pour lisibilité"
    },
    "archetypes": ["Creator (innovation formules)", "Caregiver (soin peau)", "Innocent (pureté nature)"]
  },
  
  "timeline": {
    "totalWeeks": 6,
    "startDate": "2025-01-06",
    "endDate": "2025-02-16"
  },
  
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2025-01-06",
      "endDate": "2025-01-12",
      "objective": "Phase Teasing - Créer mystère et anticipation",
      "theme": "Silhouettes et textures naturelles",
      "channels": ["instagram", "facebook"],
      "assets": [
        {
          "id": "asset-w1-img-001",
          "order": 1,
          "weekNumber": 1,
          "type": "image",
          "format": "1:1",
          "resolution": "2K",
          "marketingObjective": "Lancer teasing mystérieux, créer curiosité",
          "concept": "Silhouette produit dans brume naturelle",
          "visualDescription": "Image minimaliste et mystérieuse montrant la silhouette floue d'un flacon de sérum Pure Essence partiellement dissimulé dans une brume végétale naturelle, photographié en macro avec shallow depth of field créant un bokeh doux en arrière-plan. Le flacon est posé sur une surface en pierre naturelle (ardoise ou marbre beige) avec quelques gouttes d'eau condensée captant la lumière. Environnement: fond vert sauge (#9CAF88) avec texture aquarelle subtile suggérant la nature sans la montrer explicitement. Lumière: soft natural light venant de la gauche créant des ombres douces et romantiques. Atmosphère: mystérieuse, poétique, premium. Shot on Fujifilm X-T4 with 56mm f/1.2 lens. Overlay texte minimaliste en bas: 'Quelque chose de pur arrive bientôt...' en typographie serif élégante couleur blanc cassé (#FAF9F6). Pas de logo visible (mystère). Style: cinematic product photography meets zen aesthetics.",
          "copy": {
            "bodyText": "Quelque chose de pur arrive bientôt...",
            "cta": null
          },
          "targetAudience": "Early adopters sensibles beauté naturelle, 25-40 ans",
          "channels": ["instagram", "facebook"],
          "placementRecommendations": "Instagram Feed (post principal), Facebook Feed. Publier 18h (heure pic engagement). Ne pas booster immédiatement (organic reach test).",
          "scheduledDate": "2025-01-06",
          "scheduledTime": "18:00",
          "creativeBrief": "Créer teaser image mystérieux pour lancement cosmétique naturel. Silhouette produit floue dans brume, macro photography, lumière douce, palette vert sauge + beige naturel. Texte: 'Quelque chose de pur arrive bientôt...'. Style cinematic zen premium. Target: early adopters beauté naturelle 25-40 ans. Platforms: Instagram + Facebook feed.",
          "estimatedCost": 115,
          "expectedKpis": {
            "impressions": 5000,
            "engagementRate": "2.5-3.5%",
            "conversions": 0
          },
          "notes": "Premier contact - focus curiosité, pas de hard sell"
        }
        // ... 2 autres assets semaine 1
      ],
      "budgetWeek": 370,
      "kpisWeek": {
        "impressions": 15000,
        "engagement": "2.8%",
        "conversions": 0
      }
    }
    // ... weeks 2-6
  ],
  
  "allAssets": [
    /* Tous les 24 assets listés ici */
  ],
  
  "estimatedCost": {
    "analysis": 100,
    "images": 1840,
    "videos": 1260,
    "total": 3200
  },
  
  "kpis": {
    "primary": "10,000 conversions site web (achats)",
    "secondary": [
      "Engagement rate moyen >4%",
      "50,000+ impressions par semaine",
      "1,000+ nouveaux followers Instagram",
      "Email subscribers: +2,000"
    ],
    "trackingRecommendations": "Utiliser UTM parameters pour chaque asset. Tracker avec Google Analytics + Meta Pixel. A/B tester CTA sur assets semaine 4. Monitor sentiment comments pour ajuster messaging semaines 5-6."
  }
}
```

---

## 🎨 PHASE 3: CAMPAIGN COCOBOARD

### **Fichier Frontend**
`/components/coconut-v14/CampaignCocoBoardPremium.tsx` ❌ **À CRÉER**

### **Layout UI**

```tsx
// CampaignCocoBoardPremium.tsx
<div className="campaign-cocoboard">
  {/* HEADER - Overview */}
  <CampaignHeader>
    <h1>{campaignData.campaignTitle}</h1>
    <div className="stats-row">
      <Stat label="Durée" value={`${campaignData.timeline.totalWeeks} semaines`} />
      <Stat label="Assets" value={`${campaignData.allAssets.length} (${imagesCount} images + ${videosCount} vidéos)`} />
      <Stat label="Budget" value={`${campaignData.estimatedCost.total} / ${maxBudget} crédits`} />
      <Stat label="Canaux" value={uniqueChannels.join(', ')} />
    </div>
  </CampaignHeader>
  
  {/* VISUAL IDENTITY */}
  <VisualIdentityPanel>
    <h2>🎨 Identité Visuelle</h2>
    <div className="palette">
      {campaignData.visualIdentity.palette.map(color => (
        <ColorSwatch key={color.hex} color={color.hex} name={color.name} usage={color.usage} />
      ))}
    </div>
    <p className="style">{campaignData.visualIdentity.photographyStyle}</p>
    <p className="typography">
      Headlines: {campaignData.visualIdentity.typography.headlines}<br/>
      Body: {campaignData.visualIdentity.typography.body}
    </p>
  </VisualIdentityPanel>
  
  {/* TIMELINE - Week by Week */}
  <div className="timeline-view">
    {campaignData.weeks.map(week => (
      <WeekCard key={week.weekNumber} week={week}>
        <WeekHeader>
          <h3>Semaine {week.weekNumber}: {week.objective}</h3>
          <div className="dates">{formatDate(week.startDate)} - {formatDate(week.endDate)}</div>
          <div className="budget">{week.budgetWeek} crédits</div>
        </WeekHeader>
        
        <AssetGrid>
          {week.assets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset}
              onEdit={() => openAssetEditor(asset)}
              onDelete={() => confirmDeleteAsset(asset)}
            >
              {/* Thumbnail preview */}
              <AssetThumbnail type={asset.type} format={asset.format} />
              
              {/* Info */}
              <div className="asset-info">
                <Badge type={asset.type}>{asset.type.toUpperCase()}</Badge>
                <Badge>{asset.format}</Badge>
                {asset.type === 'video' && <Badge>{asset.videoDuration}s</Badge>}
                <span className="cost">{asset.estimatedCost}cr</span>
              </div>
              
              {/* Concept */}
              <p className="concept">{asset.concept}</p>
              
              {/* Channels */}
              <div className="channels">
                {asset.channels.map(ch => <ChannelIcon key={ch} channel={ch} />)}
              </div>
              
              {/* Date */}
              <div className="scheduled">
                📅 {formatDate(asset.scheduledDate)} à {asset.scheduledTime}
              </div>
            </AssetCard>
          ))}
          
          {/* Add asset button */}
          <AddAssetButton onClick={() => openAddAssetModal(week.weekNumber)} />
        </AssetGrid>
      </WeekCard>
    ))}
  </div>
  
  {/* STICKY FOOTER - Actions */}
  <StickyFooter>
    <Button variant="outline" onClick={saveDraft}>Sauvegarder brouillon</Button>
    <Button variant="outline" onClick={exportCalendar}>Exporter calendrier</Button>
    <Button variant="primary" size="large" onClick={startBatchGeneration}>
      Générer campagne complète ({campaignData.estimatedCost.total} crédits)
    </Button>
  </StickyFooter>
</div>
```

### **Fonctionnalités d'édition**

```typescript
// Edit Asset Modal
interface AssetEditorProps {
  asset: CampaignAsset;
  onSave: (updatedAsset: CampaignAsset) => void;
  onCancel: () => void;
}

function AssetEditor({ asset, onSave, onCancel }: AssetEditorProps) {
  return (
    <Modal size="large">
      <ModalHeader>Modifier {asset.type} - {asset.concept}</ModalHeader>
      <ModalBody>
        {/* Format & Specs */}
        <Section title="Format & Spécifications">
          <Select label="Format" value={asset.format} onChange={...}>
            <Option value="1:1">Carré 1:1</Option>
            <Option value="9:16">Vertical 9:16</Option>
            <Option value="16:9">Horizontal 16:9</Option>
          </Select>
          
          {asset.type === 'image' && (
            <Select label="Résolution" value={asset.resolution}>
              <Option value="1K">1K (économique)</Option>
              <Option value="2K">2K (premium)</Option>
            </Select>
          )}
          
          {asset.type === 'video' && (
            <>
              <Select label="Durée" value={asset.videoDuration}>
                <Option value={6}>6 secondes</Option>
                <Option value={8}>8 secondes</Option>
                <Option value={15}>15 secondes</Option>
                <Option value={20}>20 secondes</Option>
                <Option value={30}>30 secondes</Option>
              </Select>
              <Select label="Modèle" value={asset.videoModel}>
                <Option value="veo3_fast">Veo 3.1 Fast (rapide)</Option>
                <Option value="veo3">Veo 3.1 Premium (qualité)</Option>
              </Select>
            </>
          )}
        </Section>
        
        {/* Creative Brief */}
        <Section title="Brief créatif">
          <Input label="Concept (1 phrase)" value={asset.concept} />
          <Textarea 
            label="Description visuelle détaillée" 
            value={asset.visualDescription}
            rows={8}
          />
        </Section>
        
        {/* Copy */}
        {asset.copy && (
          <Section title="Textes">
            <Input label="Headline" value={asset.copy.headline} />
            <Input label="Subheadline" value={asset.copy.subheadline} />
            <Input label="CTA" value={asset.copy.cta} />
            <Textarea label="Body text" value={asset.copy.bodyText} rows={3} />
          </Section>
        )}
        
        {/* Targeting & Scheduling */}
        <Section title="Ciblage & Planning">
          <CheckboxGroup label="Canaux" value={asset.channels}>
            <Checkbox value="instagram">Instagram</Checkbox>
            <Checkbox value="facebook">Facebook</Checkbox>
            <Checkbox value="linkedin">LinkedIn</Checkbox>
            {/* ... */}
          </CheckboxGroup>
          
          <DatePicker label="Date de publication" value={asset.scheduledDate} />
          <TimePicker label="Heure" value={asset.scheduledTime} />
        </Section>
        
        {/* Cost preview */}
        <CostPreview>
          Coût estimé: {calculateAssetCost(asset)} crédits
        </CostPreview>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" onClick={() => onSave(updatedAsset)}>
          Sauvegarder
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

---

## ⚙️ PHASE 4: BATCH GENERATION

### **Fichier Frontend**
`/components/coconut-v14/CampaignGenerationView.tsx` ❌ **À CRÉER**

### **Backend Route**

```typescript
POST /make-server-e55aa214/coconut-v14/campaign/generate

Body: {
  userId: string;
  cocoBoardId: string; // Campaign CocoBoard ID
}

Response: {
  success: boolean;
  data: {
    campaignId: string;
    totalAssets: number;
    estimatedTime: number; // minutes
    queuePosition: number;
  };
}
```

### **Backend Logic**

```typescript
// coconut-v14-campaign-generator.ts

export async function generateCampaign(
  userId: string,
  cocoBoardId: string
): Promise<void> {
  // 1. Fetch Campaign CocoBoard from KV
  const cocoBoard = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
  const campaignData: GeminiCampaignAnalysisResponse = JSON.parse(cocoBoard);
  
  // 2. Create campaign record
  const campaignId = `campaign-${Date.now()}`;
  await kv.set(`campaign:${campaignId}`, JSON.stringify({
    id: campaignId,
    userId,
    cocoBoardId,
    status: 'generating',
    progress: {
      total: campaignData.allAssets.length,
      completed: 0,
      failed: 0,
      current: null
    },
    startedAt: new Date().toISOString(),
    results: []
  }));
  
  // 3. Loop through all assets
  for (const asset of campaignData.allAssets) {
    try {
      // Update progress
      await updateCampaignProgress(campaignId, { current: asset.id });
      
      if (asset.type === 'image') {
        // Call Coconut Image pipeline
        const imageResult = await generateCampaignImage({
          userId,
          campaignId,
          asset,
          visualIdentity: campaignData.visualIdentity
        });
        
        await saveCampaignAssetResult(campaignId, asset.id, imageResult);
        
      } else if (asset.type === 'video') {
        // Call Coconut Video pipeline
        const videoResult = await generateCampaignVideo({
          userId,
          campaignId,
          asset,
          visualIdentity: campaignData.visualIdentity
        });
        
        await saveCampaignAssetResult(campaignId, asset.id, videoResult);
      }
      
      // Increment completed count
      await incrementCampaignProgress(campaignId);
      
    } catch (error) {
      console.error(`Failed to generate asset ${asset.id}:`, error);
      await incrementCampaignFailures(campaignId, asset.id, error);
    }
    
    // Wait between assets to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 4. Mark campaign as complete
  await kv.set(`campaign:${campaignId}:status`, 'completed');
  
  // 5. Send notification to user
  // (email, push notification, etc.)
}

async function generateCampaignImage(params: {
  userId: string;
  campaignId: string;
  asset: CampaignAsset;
  visualIdentity: VisualIdentity;
}): Promise<ImageGenerationResult> {
  const { asset, visualIdentity } = params;
  
  // Build enhanced prompt with campaign visual identity
  const enhancedPrompt = `
    ${asset.visualDescription}
    
    CAMPAIGN VISUAL IDENTITY (MANDATORY):
    - Color palette: ${visualIdentity.palette.map(c => `${c.hex} (${c.name})`).join(', ')}
    - Photography style: ${visualIdentity.photographyStyle}
    - Typography: ${visualIdentity.typography.headlines} + ${visualIdentity.typography.body}
    - Archetypes: ${visualIdentity.archetypes.join(', ')}
    
    ${asset.copy ? `
    TEXT OVERLAYS:
    - Headline: "${asset.copy.headline}"
    - Subheadline: "${asset.copy.subheadline}"
    - CTA: "${asset.copy.cta}"
    ` : ''}
  `;
  
  // Call Flux 2 Pro
  const result = await generateImageFluxPro({
    prompt: enhancedPrompt,
    format: asset.format,
    resolution: asset.resolution,
    userId: params.userId,
    projectId: params.campaignId
  });
  
  return result;
}

async function generateCampaignVideo(params: {
  userId: string;
  campaignId: string;
  asset: CampaignAsset;
  visualIdentity: VisualIdentity;
}): Promise<VideoGenerationResult> {
  const { asset, visualIdentity } = params;
  
  // Build video prompt avec campaign identity
  const videoPrompt = `
    ${asset.visualDescription}
    
    CAMPAIGN VISUAL IDENTITY:
    - Color palette: ${visualIdentity.palette.map(c => c.hex).join(', ')}
    - Style: ${visualIdentity.photographyStyle}
    
    Duration: ${asset.videoDuration}s
    Audio: synchronized to action
  `;
  
  // Call Veo 3.1
  const result = await generateVideoVeo({
    prompt: videoPrompt,
    duration: asset.videoDuration,
    format: asset.format,
    model: asset.videoModel,
    userId: params.userId,
    projectId: params.campaignId
  });
  
  return result;
}
```

### **Frontend Progress View**

```tsx
// CampaignGenerationView.tsx
<div className="campaign-generation">
  <ProgressHeader>
    <h1>Génération en cours...</h1>
    <ProgressBar 
      current={campaignStatus.progress.completed} 
      total={campaignStatus.progress.total}
    />
    <p>
      {campaignStatus.progress.completed} / {campaignStatus.progress.total} assets générés
    </p>
  </ProgressHeader>
  
  {/* Current asset being generated */}
  {campaignStatus.progress.current && (
    <CurrentAssetCard>
      <Spinner />
      <p>Génération en cours: {getCurrentAssetName()}</p>
      <p className="eta">Temps restant estimé: {estimatedTimeRemaining} min</p>
    </CurrentAssetCard>
  )}
  
  {/* Grid of completed assets */}
  <CompletedAssetsGrid>
    {campaignStatus.results.map(result => (
      <GeneratedAssetCard key={result.assetId} result={result}>
        <img src={result.url} alt={result.concept} />
        <div className="overlay">
          <Button size="sm" onClick={() => downloadAsset(result)}>
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={() => publishToFeed(result)}>
            Publish
          </Button>
        </div>
      </GeneratedAssetCard>
    ))}
  </CompletedAssetsGrid>
  
  {/* Actions when complete */}
  {campaignStatus.status === 'completed' && (
    <CompletionActions>
      <h2>✅ Campagne générée avec succès !</h2>
      <div className="actions">
        <Button onClick={downloadAllAsZip}>
          📦 Télécharger tout (ZIP)
        </Button>
        <Button variant="outline" onClick={exportCalendar}>
          📅 Exporter calendrier
        </Button>
        <Button variant="outline" onClick={viewAnalytics}>
          📊 Voir analytics
        </Button>
      </div>
    </CompletionActions>
  )}
</div>
```

---

## 💾 STORAGE & DATA

### **KV Store Keys**

```typescript
// Campaign CocoBoard (après analyse)
`cocoboard:campaign:${cocoBoardId}` → GeminiCampaignAnalysisResponse

// Campaign Generation Status
`campaign:${campaignId}` → {
  id: string;
  userId: string;
  cocoBoardId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
    current: string | null;
  };
  startedAt: string;
  completedAt?: string;
  results: AssetGenerationResult[];
  errors: Array<{ assetId: string; error: string }>;
}

// Individual Asset Results
`campaign:${campaignId}:asset:${assetId}` → AssetGenerationResult

// User's Campaigns List
`user:${userId}:campaigns` → string[] // campaignIds
```

### **Supabase Storage**

```
coconut-v14-campaigns/
  ├─ {userId}/
  │   ├─ campaign-{campaignId}/
  │   │   ├─ assets/
  │   │   │   ├─ week-1/
  │   │   │   │   ├─ asset-w1-img-001.png
  │   │   │   │   ├─ asset-w1-vid-001.mp4
  │   │   │   ├─ week-2/
  │   │   │   ├─ ...
  │   │   ├─ calendar.pdf
  │   │   ├─ campaign-brief.json
  │   │   └─ campaign-results.zip
```

---

## 💰 COÛTS

### **Breakdown complet**

```typescript
const CAMPAIGN_COSTS = {
  // ANALYSIS
  analysis: 100, // Gemini campaign planning
  
  // ASSETS (par unité)
  image_1K: 10,
  image_2K: 30,
  video_6s_fast: 10,
  video_8s_fast: 15,
  video_15s_fast: 25,
  video_20s_fast: 35,
  video_30s_fast: 50,
  video_6s_premium: 30,
  video_8s_premium: 40,
  video_15s_premium: 60,
  video_20s_premium: 80,
  video_30s_premium: 100,
};

// Exemple: Campagne 6 semaines, 16 images 2K + 8 vidéos mix
const exampleCampaign = {
  analysis: 100,
  images: 16 * 30, // 480
  videos: 
    (4 * 15) + // 4 vidéos 8s fast = 60
    (2 * 35) + // 2 vidéos 20s fast = 70
    (2 * 60),  // 2 vidéos 15s premium = 120
  total: 100 + 480 + 250 = 830 crédits
};

// Campagne premium complète (24 assets)
const premiumCampaign = {
  analysis: 100,
  images: 16 * 30, // 480
  videos: 8 * 40,  // 320 (8s premium average)
  total: 100 + 480 + 320 = 900 crédits
};
```

### **Recommandations budgétaires**

| Durée | Assets | Budget min | Budget optimal | Budget premium |
|-------|--------|------------|----------------|----------------|
| 2 semaines | 8-10 | 500cr | 800cr | 1200cr |
| 4 semaines | 12-16 | 800cr | 1500cr | 2500cr |
| 6 semaines | 20-25 | 1500cr | 3000cr | 5000cr |
| 8 semaines | 28-32 | 2000cr | 4000cr | 6500cr |
| 12 semaines | 40-50 | 3000cr | 6000cr | 10000cr |

---

## 🎯 FICHIERS À CRÉER

### **Frontend**

1. ✅ `/components/coconut-v14/TypeSelectorPremium.tsx` - **EXISTE** (ajouter option Campagne)
2. ❌ `/components/coconut-v14/CampaignBriefing.tsx` - **À CRÉER**
3. ❌ `/components/coconut-v14/CampaignCocoBoardPremium.tsx` - **À CRÉER**
4. ❌ `/components/coconut-v14/CampaignGenerationView.tsx` - **À CRÉER**
5. ❌ `/components/coconut-v14/AssetEditor.tsx` - **À CRÉER** (modal édition asset)
6. ❌ `/components/coconut-v14/CampaignCalendarExport.tsx` - **À CRÉER**

### **Backend**

1. ❌ `/supabase/functions/server/coconut-v14-campaign-analyzer.ts` - **À CRÉER**
2. ❌ `/supabase/functions/server/coconut-v14-campaign-generator.ts` - **À CRÉER**
3. ❌ `/supabase/functions/server/coconut-v14-campaign-routes.ts` - **À CRÉER**

### **Types**

1. ❌ `/lib/types/coconut-v14-campaign.ts` - **À CRÉER**

---

## 🚀 ROUTES API COMPLÈTES

```typescript
// CAMPAIGN ANALYSIS
POST /make-server-e55aa214/coconut-v14/campaign/analyze
Body: { userId, projectId?, briefing: CampaignBriefingInput }
Response: { success, data: GeminiCampaignAnalysisResponse, cocoBoardId }

// SAVE CAMPAIGN COCOBOARD
POST /make-server-e55aa214/coconut-v14/campaign/cocoboard/save
Body: { userId, cocoBoardId, campaignData: GeminiCampaignAnalysisResponse }
Response: { success, cocoBoardId }

// BATCH GENERATION
POST /make-server-e55aa214/coconut-v14/campaign/generate
Body: { userId, cocoBoardId }
Response: { success, campaignId, totalAssets, estimatedTime }

// GENERATION STATUS
GET /make-server-e55aa214/coconut-v14/campaign/:campaignId/status
Response: { status, progress: { total, completed, failed, current } }

// GET GENERATED ASSETS
GET /make-server-e55aa214/coconut-v14/campaign/:campaignId/assets
Response: { assets: AssetGenerationResult[] }

// EXPORT CAMPAIGN (ZIP)
POST /make-server-e55aa214/coconut-v14/campaign/:campaignId/export
Response: { success, downloadUrl }

// EXPORT CALENDAR (PDF/CSV)
POST /make-server-e55aa214/coconut-v14/campaign/:campaignId/calendar/export
Body: { format: 'pdf' | 'csv' }
Response: { success, downloadUrl }

// DELETE CAMPAIGN
DELETE /make-server-e55aa214/coconut-v14/campaign/:campaignId
Response: { success }

// LIST USER CAMPAIGNS
GET /make-server-e55aa214/coconut-v14/campaigns?userId={userId}
Response: { campaigns: CampaignSummary[] }
```

---

## ✅ RÉSUMÉ - MODE CAMPAGNE

### **Ce que fait le Mode Campagne :**

1. **Collecte un brief marketing complet** (objectif, durée, budget, audience, canaux, assets fournis)
2. **Génère un plan stratégique avec Gemini** (100 crédits)
   - Timeline hebdomadaire
   - 15-50 assets (images + vidéos)
   - Identité visuelle cohérente (palette, style, typo)
   - Brief créatif détaillé par asset
   - KPIs et recommandations ciblage
3. **Affiche un CocoBoard campagne** avec vue calendrier
   - Cards assets par semaine
   - Édition individuelle possible
   - Budget tracker live
4. **Lance génération batch** (loop sur tous les assets)
   - Images: Coconut Image pipeline
   - Vidéos: Coconut Video pipeline
   - Progress tracking temps réel
5. **Livre campagne complète** prête à publier
   - ZIP téléchargeable
   - Calendrier exportable
   - Assets organisés par semaine

### **Différence avec Image/Vidéo isolés :**

| Feature | Mode Image | Mode Vidéo | Mode Campagne |
|---------|------------|------------|---------------|
| **Output** | 1 image | 1 vidéo | 15-50 assets (mix) |
| **Durée** | Instantané | Instantané | 2-12 semaines (planning) |
| **Cohérence** | N/A | N/A | ✅ Palette, style, typo unifiés |
| **Stratégie** | Brief simple | Brief simple | ✅ Plan marketing complet |
| **Timeline** | N/A | N/A | ✅ Calendrier éditorial |
| **Coût** | 10-115cr | 140-250cr | 500-10000cr |
| **Cible** | Besoin ponctuel | Besoin ponctuel | Campagne marketing complète |

### **Cas d'usage idéaux :**

- ✅ Lancement produit sur 6 semaines
- ✅ Campagne saisonnière (Noël, été, rentrée)
- ✅ Repositionnement marque sur 3 mois
- ✅ Événement marketing multicanal
- ✅ Stratégie contenu réseaux sociaux mensuelle

---

**Créé le** : 2025-01-11  
**Statut** : Spécifications complètes prêtes pour implémentation  
**Architecture alignée** : ✅ ARCHITECTURE.md + CAHIER_DES_CHARGES_CORTEXIA.md
