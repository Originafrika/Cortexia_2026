# 📘 Agent Playbook – Implémentation & Validation

## 🎯 Objectif
Guider un agent de code autonome dans l'implémentation et la validation de pages ou fonctionnalités.
👉 La base de données est traitée *en dernière étape* pour prioriser l'UI, les fonctionnalités et la logique.

---

## ✅ Pipeline d'implémentation

### Étape 1 – Clarification du scope
- [ ] Décrire la fonctionnalité ou page (objectif, rôle, intégration).
- [ ] Produire une spécification fonctionnelle concise.

### Étape 2 – Exigences UI/UX
- [ ] Définir style : épuré, immersif, bento raffiné, minimaliste.
- [ ] Lister composants, états, transitions, micro-interactions.

### Étape 3 – Architecture & structure
- [ ] Proposer arborescence et conventions.
- [ ] Définir gestion d'état, theming, i18n.

### Étape 3.5 – Modularité & Maintenabilité ⭐
- [ ] **Limite stricte**: Maximum 250 lignes par fichier/composant
- [ ] **Single Responsibility**: Chaque composant = 1 responsabilité claire
- [ ] **Separation of Concerns**: Séparer orchestration (state) et présentation (UI)
- [ ] **Architecture modulaire**: Si composant > 200 lignes → créer `/sections/` ou `/parts/`
  ```
  Orchestrateur principal (state, handlers, data) → Max 250 lignes
  ├── /sections/HeroSection.tsx
  ├── /sections/ContentSection.tsx
  ├── /sections/FooterSection.tsx
  └── Chaque section → Max 250 lignes
  ```
- [ ] **DRY Principle**: Centraliser configs (cards, features, options) en constantes
- [ ] **Composition**: Privilégier composition de petits composants vs monolithes
- [ ] **Reusability**: Concevoir sections réutilisables dans d'autres contextes
- [ ] **Testability**: Chaque section testable indépendamment avec props clairement typées
- [ ] **Extract utilities**: Si logique > 50 lignes → extraire dans `/lib/utils/` ou hooks
- [ ] **Split constants**: Configs volumineuses → fichiers séparés `/lib/constants/`

**Exemple de refactoring**:
```typescript
// ❌ AVANT : Monolithe 600+ lignes
CreatePage.tsx (635 lignes) → Difficile à maintenir

// ✅ APRÈS : Architecture modulaire
CreatePage.tsx (207 lignes)               // Orchestrateur
├── /sections/HeroSection.tsx (75 lignes)
├── /sections/QuickCreateSection.tsx (58 lignes)
├── /sections/TrendingSection.tsx (62 lignes)
└── /sections/LibrarySection.tsx (112 lignes)
```

**Checklist modularité**:
- [ ] Aucun fichier ne dépasse 250 lignes
- [ ] Chaque section a une interface Props claire
- [ ] Composants réutilisables extraits dans `/components/`
- [ ] Logique métier extraite dans `/lib/` ou hooks custom
- [ ] Constantes volumineuses dans fichiers séparés

### Étape 4 – Prototype fonctionnel
- [ ] Créer maquette UI interactive sans backend/DB.
- [ ] Utiliser mock data et placeholders.

### Étape 5 – Implémentation UI prioritaire
- [ ] Coder la page avec responsivité et pixel-perfect.
- [ ] Intégrer interactions et logique client.
- [ ] **Respecter limite 250 lignes** : refactoriser si dépassement

### Étape 6 – Accessibilité
- [ ] Vérifier WCAG 2.2 AA.
- [ ] Ajouter ARIA, focus visible, navigation clavier.

### Étape 7 – Performance
- [ ] Optimiser lazy-loading, memoization, animations.
- [ ] Respecter budgets : TTI < 3s, CLS < 0.1, LCP < 2.5s.

### Étape 8 – Bugs (hors DB)
- [ ] Identifier problèmes UI/UX/logique/perf.
- [ ] Corriger tous sauf DB.

### Étape 9 – Suivi & complétude
- [ ] Vérifier manquements et cohérence visuelle.
- [ ] Confirmer complétude et qualité.
- [ ] **Vérifier respect 250 lignes max** dans tous les fichiers

### Étape 10 – Validation spécifique
- [ ] Vérifier fonctionnement complet avec UI.
- [ ] Contrôler fluidité et cohérence design/performance.

### Étape 11 – Analyse par domaine
- [ ] Catégoriser problèmes : UI, UX, backend, database.
- [ ] Focus sur design, responsivité, transitions.

### Étape 12 – Standards & sécurité
- [ ] Appliquer lint, format, types stricts.
- [ ] Ajouter validation inputs, gestion erreurs, protection XSS/CSRF.

### Étape 13 – Tests
- [ ] Écrire tests unitaires, intégration, E2E.
- [ ] Vérifier accessibilité et performance.

### Étape 14 – Documentation
- [ ] Rédiger README, guides, décisions techniques.
- [ ] Documenter architecture modulaire (orchestrateur + sections).
- [ ] Préparer checklist d'acceptation et notes de déploiement.

### Étape 15 – Backend & DB (finalisation)
- [ ] Connecter API réelle et schémas DB.
- [ ] Implémenter migrations et contrats.
- [ ] Synchroniser UI/logique et valider par tests.

---

## 🎨 Critères de qualité
- **Design**: Pixel-perfect, épuré, immersif, bento minimaliste.
- **UX**: Fluide, feedback immédiat, cohérence émotionnelle.
- **Responsivité**: XS → XL.
- **Accessibilité**: AA.
- **Performance**: Optimisée (LCP/CLS/TTI).
- **Sécurité**: Validation et protection des données.
- **Modularité**: Max 250 lignes par fichier, architecture sections.

---

## 🧪 Tests & Validation
- **Unitaires**: Composants, hooks, sections isolées.
- **Intégration**: Navigation, état global, interactions entre sections.
- **E2E**: Scénarios clés (création, erreurs réseau).
- **Accessibilité**: Clavier, ARIA, contrastes.
- **Performance**: LCP/CLS/TTI.

---

## 🔖 Prompts universels

### Implémentation
« Analyse la fonctionnalité, spécifie son rôle et intègre-la au flux. Implémente d'abord l'UI pixel-perfect et les interactions, sans backend ni DB. **Respecte strictement la limite de 250 lignes par fichier** : si dépassement, refactorise en architecture modulaire avec orchestrateur + sections dans `/sections/`. »

### Modularité & Refactoring
« Vérifie que tous les composants respectent la limite de 250 lignes. Si dépassement, refactorise en architecture modulaire : orchestrateur principal (state + handlers) + sections séparées dans `/sections/` ou `/parts/`. Applique Single Responsibility, DRY, Composition. Chaque section doit avoir props typées et être réutilisable/testable indépendamment. Extrais configs volumineuses dans `/lib/constants/`. »

### Bugs (hors DB)
« Identifie tous les problèmes UI/UX/logique/perf et corrige-les, en repoussant la DB à la dernière étape. Vérifie que tous les fichiers respectent 250 lignes max. »

### Complétude
« Vérifie manquements et cohérence selon les critères : épuré, immersif, bento minimaliste, fluidité, **architecture modulaire (250 lignes max)**. Confirme la complétude. »

### Validation
« Confirme que la page est pleinement fonctionnelle avec son UI, en ciblant fluidité et performance. Valide que chaque fichier respecte la limite de 250 lignes. »

### Analyse domaine
« Dresse une liste des problèmes par UI, UX, backend, database, **architecture (fichiers trop longs)**. Focus sur design, responsivité, transitions, modularité. »

### Tests & perf
« Ajoute tests unitaires/intégration/E2E pour chaque section modulaire. Audit A11y AA, optimise Perf pour LCP/CLS/TTI, et fournis le rapport. »

### Handoff
« Documente architecture modulaire (orchestrateur + sections), décisions, guides, checklist d'acceptation et plan de déploiement/rollback. Inclus diagramme de l'arborescence des sections. »

### Final DB
« Intègre API et DB en dernier, assure migrations et contrats, synchronise UI/logique, et valide par tests. Vérifie que toute l'architecture reste modulaire (250 lignes max). »

---

## 📐 Architecture Modulaire - Règles

### Quand refactoriser ?
```
🔴 CRITIQUE (> 250 lignes)  : Refactoring OBLIGATOIRE
🟡 WARNING (200-250 lignes) : Préparer refactoring
🟢 OK (< 200 lignes)        : Architecture saine
```

### Stratégies de découpe

**1. Par sections visuelles**
```
HomePage.tsx → HomeHeroSection.tsx + HomeFeaturesSection.tsx + HomeTestimonialsSection.tsx
```

**2. Par responsabilité**
```
Dashboard.tsx → DashboardLayout.tsx + DashboardStats.tsx + DashboardChart.tsx
```

**3. Par logique métier**
```
CheckoutPage.tsx → CheckoutForm.tsx + CheckoutSummary.tsx + CheckoutPayment.tsx
```

**4. Par état/données**
```
ProductPage.tsx (orchestrateur avec state)
├── ProductInfo.tsx (présentation pure)
├── ProductGallery.tsx (présentation pure)
└── ProductReviews.tsx (présentation pure)
```

### Pattern Orchestrateur/Sections
```typescript
// ✅ Orchestrateur (state + handlers + data fetching)
export function MainPage() {
  const [data, setData] = useState();
  const handleAction = () => { /* ... */ };
  
  return (
    <>
      <HeroSection onAction={handleAction} />
      <ContentSection data={data} />
      <FooterSection />
    </>
  );
}

// ✅ Section (présentation pure, props typées)
interface HeroSectionProps {
  onAction: () => void;
}

export function HeroSection({ onAction }: HeroSectionProps) {
  return <div>...</div>;
}
```

---

## 🚨 Règles Critiques

### ⛔ INTERDICTIONS
```
❌ Ne JAMAIS dépasser 250 lignes sans refactoriser
❌ Ne JAMAIS créer de monolithes (responsabilité unique)
❌ Ne JAMAIS dupliquer du code (DRY principle)
```

### ✅ OBLIGATIONS
```
✅ TOUJOURS refactoriser si > 250 lignes
✅ TOUJOURS extraire sections dans fichiers séparés
✅ TOUJOURS typer les props des sections
✅ TOUJOURS documenter l'architecture modulaire
✅ TOUJOURS tester chaque section indépendamment
```

---

**📚 Playbook Agent - Code Modulaire & Maintenable**
*Max 250 lignes | Architecture Sections | Single Responsibility | DRY | Testabilité*
