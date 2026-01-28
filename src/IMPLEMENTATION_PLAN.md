# 🚀 PLAN D'IMPLÉMENTATION - CORRECTION DES INCONSISTANCES UI

**Date :** 27 janvier 2026  
**Projet :** Cortexia Creation Hub V3  
**Objectif :** Atteindre 100% de couverture UI/Documentation  
**Estimation totale :** 10-15 jours de développement

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble](#vue-densemble)
2. [Stratégie d'Implémentation](#stratégie-dimplémentation)
3. [Phase 1 : Features Critiques](#phase-1-features-critiques-5-6-jours)
4. [Phase 2 : Features Moyennes](#phase-2-features-moyennes-3-4-jours)
5. [Phase 3 : Features Mineures](#phase-3-features-mineures-2-3-jours)
6. [Phase 4 : Testing & Polish](#phase-4-testing--polish-1-2-jours)
7. [Timeline Détaillée](#timeline-détaillée)
8. [Checklist de Validation](#checklist-de-validation)

---

## VUE D'ENSEMBLE

### **État Actuel**
- ✅ Backend : 95% complet
- ⚠️ Frontend : 40% complet
- 🔴 Gap à combler : 18 inconsistances majeures

### **Objectif**
- 🎯 Backend : 100% (maintenir)
- 🎯 Frontend : 100% (passer de 40% → 100%)
- 🎯 Documentation : 100% (déjà atteint)

### **Approche**
1. **Prioriser les features critiques** (blockers production)
2. **Réutiliser le backend existant** (déjà complet)
3. **Design cohérent** (suivre BDS + Hybrid Theme)
4. **Validation progressive** (feature par feature)

---

## STRATÉGIE D'IMPLÉMENTATION

### **Principes**

#### **1. Backend-First (Déjà fait ✅)**
- Ne PAS recréer de routes backend
- Connecter les composants UI aux routes existantes
- Vérifier que les routes fonctionnent avec `curl` avant d'implémenter l'UI

#### **2. Component-Driven**
- Créer des composants réutilisables
- Suivre l'architecture `/components/[feature]/`
- Max 250 lignes par composant

#### **3. Design System Compliance**
- **Enterprise** : Light theme + warm cream palette
- **Individual** : Dark theme + purple accents
- Respecter BDS (7 Arts de Perfection Divine)
- Liquid glass effects pour premium features

#### **4. TypeScript Strict**
- Types explicites partout
- Interfaces pour props
- Pas de `any`

#### **5. Testing Progressif**
- Tester chaque feature après implémentation
- Validation user flow complet
- Logs console pour debugging

---

## PHASE 1 : FEATURES CRITIQUES (5-6 jours)

### **🎯 Objectif Phase 1**
Implémenter les 3 features blockers production qui justifient l'abonnement Enterprise et rendent les comptes utilisables.

---

### **1.1 TEAM COLLABORATION (Enterprise) - 3-4 jours**

#### **📝 Spécifications**

**Backend déjà disponible :**
- ✅ `/supabase/functions/server/team-collaboration.tsx`
- ✅ Routes :
  - `POST /teams/create`
  - `POST /teams/:teamId/invite`
  - `GET /teams/:teamId/members`
  - `DELETE /teams/:teamId/remove-member`
  - `PATCH /teams/:teamId/update-role`
  - `POST /teams/:teamId/comments`
  - `POST /teams/:teamId/approvals/request`
  - `POST /teams/:teamId/approvals/approve`
  - `GET /teams/:teamId/activity`

**UI à créer :**

#### **Jour 1-2 : Core Team Management**

**A. TeamManagementPage.tsx**
```
Location: /components/enterprise/team/TeamManagementPage.tsx

Structure:
┌─────────────────────────────────────────┐
│  SIDEBAR (Enterprise)   │  TEAM PAGE    │
├─────────────────────────┼───────────────┤
│  Dashboard              │  🎯 HEADER    │
│  New Generation         │  - Team name  │
│  👥 Team (active)       │  - Settings   │
│  History                │               │
│  Credits                │  📊 STATS     │
│  Settings               │  - 5 members  │
└─────────────────────────┤  - 3 pending  │
                          │               │
                          │  👥 MEMBERS   │
                          │  [List view]  │
                          │               │
                          │  ➕ INVITE    │
                          └───────────────┘

Sections:
1. Header
   - Team name
   - Settings button
   - Badge "3 pending approvals" (red dot)

2. Stats Cards
   - Total members
   - Pending invitations
   - Activity this week

3. Members List
   - Avatar + Name + Email
   - Role badge (Admin/Editor/Viewer/Client)
   - Actions dropdown (Change role, Remove)
   - Status indicator (Active/Invited/Inactive)

4. Invite Button (floating action)
   - Opens InviteMemberModal
```

**Composants à créer :**
```typescript
// /components/enterprise/team/TeamManagementPage.tsx
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'client';
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  lastActive: string;
  avatar?: string;
}

// States:
- members: TeamMember[]
- pendingInvites: number
- isLoading: boolean
- teamId: string

// API Calls:
- useEffect: GET /teams/:teamId/members
- handleRemoveMember: DELETE /teams/:teamId/remove-member
- handleUpdateRole: PATCH /teams/:teamId/update-role
```

**B. InviteMemberModal.tsx**
```
Location: /components/enterprise/team/InviteMemberModal.tsx

UI:
┌────────────────────────────┐
│  Invite Team Member        │
├────────────────────────────┤
│  📧 Email                  │
│  [input]                   │
│                            │
│  👤 Role                   │
│  [Dropdown]                │
│  - Admin                   │
│  - Editor (default)        │
│  - Viewer                  │
│  - Client                  │
│                            │
│  💬 Personal message       │
│  [textarea - optional]     │
│                            │
│  [Cancel]  [Send Invite]   │
└────────────────────────────┘

API:
- POST /teams/:teamId/invite
  Body: { email, role, message? }
```

**C. MemberCard.tsx**
```
Location: /components/enterprise/team/MemberCard.tsx

UI:
┌──────────────────────────────────────┐
│  👤 [Avatar]  John Doe               │
│              john@company.com        │
│              🟢 Active • Admin       │
│                                  [...│
└──────────────────────────────────────┘

Props:
- member: TeamMember
- onRemove: (id: string) => void
- onUpdateRole: (id: string, role: Role) => void

Dropdown actions:
- Change role → Opens RoleSelector
- Remove member → Confirmation modal
- View activity
```

#### **Jour 3 : Approval Workflows**

**D. ApprovalsPanel.tsx**
```
Location: /components/enterprise/team/ApprovalsPanel.tsx

UI (dans TeamManagementPage, onglet "Approvals"):
┌────────────────────────────────────────┐
│  Pending Approvals (3)                 │
├────────────────────────────────────────┤
│  📸 Image Generation                   │
│  Requested by: Sarah                   │
│  "Luxury perfume ad campaign"          │
│  💰 Cost: 115 credits                  │
│  [Preview] [Reject] [Approve]          │
├────────────────────────────────────────┤
│  🎬 Video Generation                   │
│  Requested by: Mike                    │
│  "Product demo video"                  │
│  💰 Cost: 250 credits                  │
│  [Preview] [Reject] [Approve]          │
└────────────────────────────────────────┘

States:
- pendingApprovals: Approval[]
- isApproving: boolean

API:
- GET /teams/:teamId/approvals
- POST /teams/:teamId/approvals/approve { approvalId }
- POST /teams/:teamId/approvals/reject { approvalId, reason? }
```

**E. ApprovalCard.tsx**
```
Component: Single approval request card

Props:
- approval: {
    id: string
    type: 'image' | 'video' | 'campaign'
    requestedBy: { name, avatar }
    description: string
    cost: number
    createdAt: string
    preview?: string
  }
- onApprove: (id: string) => void
- onReject: (id: string, reason?: string) => void
```

#### **Jour 4 : Real-time Comments & Activity**

**F. CommentsSection.tsx**
```
Location: /components/enterprise/team/CommentsSection.tsx

UI (dans CocoBoard Enterprise):
┌────────────────────────────────────────┐
│  💬 Comments (5)                       │
├────────────────────────────────────────┤
│  👤 Sarah • 2h ago                     │
│  "Love the color palette! @john what   │
│   do you think about the typography?"  │
│  [Reply] [Delete]                      │
├────────────────────────────────────────┤
│  👤 John • 1h ago                      │
│  "@sarah Looks great! Maybe increase   │
│   font size?"                          │
│  [Reply] [Delete]                      │
├────────────────────────────────────────┤
│  [Type a comment... @mention]          │
│  [Send]                                │
└────────────────────────────────────────┘

Features:
- @mentions avec autocomplete
- Real-time updates (polling ou websockets)
- Notifications quand @mentioned
- Delete (si admin ou author)

API:
- GET /teams/:teamId/comments
- POST /teams/:teamId/comments { text, mentions: string[] }
- DELETE /teams/:teamId/comments/:commentId
```

**G. ActivityFeed.tsx**
```
Location: /components/enterprise/team/ActivityFeed.tsx

UI (onglet "Activity" dans TeamManagementPage):
┌────────────────────────────────────────┐
│  Recent Activity                       │
├────────────────────────────────────────┤
│  🔔 Sarah mentioned you in a comment   │
│  2 hours ago                           │
├────────────────────────────────────────┤
│  ✅ Mike approved "Luxury ad"          │
│  4 hours ago                           │
├────────────────────────────────────────┤
│  👤 New member joined: Alex            │
│  Yesterday                             │
├────────────────────────────────────────┤
│  🎬 Video generated: "Product demo"    │
│  2 days ago                            │
└────────────────────────────────────────┘

API:
- GET /teams/:teamId/activity
  Returns: Activity[] with types:
    - comment_mention
    - approval_request
    - approval_approved
    - approval_rejected
    - member_joined
    - member_left
    - generation_complete
```

#### **Intégration**

**H. Ajouter Team link dans Sidebar Enterprise**
```typescript
// /components/coconut-v14-enterprise/CoconutV14AppEnterprise.tsx

// Dans la sidebar, ajouter:
<button
  onClick={() => setActiveView('team')}
  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-cream-100"
>
  <Users size={20} />
  <span>Team</span>
  {pendingApprovals > 0 && (
    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {pendingApprovals}
    </span>
  )}
</button>

// Dans le routing:
if (activeView === 'team') {
  return <TeamManagementPage teamId={user.teamId} />;
}
```

#### **Checklist Jour 1-4**
- [ ] TeamManagementPage.tsx créé
- [ ] InviteMemberModal.tsx créé
- [ ] MemberCard.tsx créé
- [ ] ApprovalsPanel.tsx créé
- [ ] ApprovalCard.tsx créé
- [ ] CommentsSection.tsx créé (avec @mentions)
- [ ] ActivityFeed.tsx créé
- [ ] Sidebar Team link ajouté
- [ ] Badge "pending approvals" affiché
- [ ] Routes backend testées
- [ ] Flow complet testé : Invite → Accept → Approve generation

---

### **1.2 DEVELOPER DASHBOARD - 2-3 jours**

#### **📝 Spécifications**

**Backend déjà disponible :**
- ✅ API keys générés lors du signup (`auth-routes.tsx`)
- ✅ Stockage KV : `user:api-keys:{userId}`
- ✅ Mapping : `apikeys:{apiKey}` → userId

**Routes backend à créer (manquantes) :**
```typescript
// /supabase/functions/server/developer-routes.ts

// GET /developer/api-keys/:userId
// POST /developer/api-keys/:userId/create { name, permissions }
// DELETE /developer/api-keys/:userId/revoke { keyId }
// GET /developer/usage/:userId { startDate, endDate }
```

#### **Jour 1 : Core Dashboard**

**A. DeveloperDashboard.tsx**
```
Location: /components/developer/DeveloperDashboard.tsx

Structure:
┌─────────────────────────────────────────┐
│  Developer Dashboard                    │
├─────────────────────────────────────────┤
│  📊 USAGE STATS                         │
│  ┌──────────┬──────────┬──────────┐    │
│  │ Requests │  Credits │  Uptime  │    │
│  │  12,450  │   8,234  │  99.9%   │    │
│  └──────────┴──────────┴──────────┘    │
│                                         │
│  🔑 API KEYS                            │
│  ┌───────────────────────────────────┐ │
│  │ Production Key                    │ │
│  │ ctx_abc123...                     │ │
│  │ Created: Jan 15, 2026             │ │
│  │ Last used: 2 hours ago            │ │
│  │ [Copy] [Revoke]                   │ │
│  └───────────────────────────────────┘ │
│  [+ Create New Key]                     │
│                                         │
│  📈 USAGE GRAPH                         │
│  [Chart: Requests per day]              │
│                                         │
│  📚 DOCUMENTATION                       │
│  [Quick Start] [API Reference] [SDKs]   │
└─────────────────────────────────────────┘

Sections:
1. Usage Stats
   - Total requests this month
   - Credits consumed
   - API uptime

2. API Keys Management
   - List of keys
   - Copy to clipboard
   - Revoke with confirmation
   - Create new key

3. Usage Graph (Recharts)
   - Requests per day (last 30 days)
   - Credits consumed per day

4. Documentation Links
   - Quick Start guide
   - API Reference (Swagger/OpenAPI)
   - SDK downloads (Python, Node, etc.)
```

**Composants à créer :**

```typescript
// /components/developer/DeveloperDashboard.tsx
interface ApiKey {
  id: string;
  key: string; // Partial: "ctx_abc123...xyz" (masqué)
  name: string;
  createdAt: string;
  lastUsed: string;
  permissions: string[];
  requestCount: number;
}

interface UsageStats {
  totalRequests: number;
  creditsConsumed: number;
  uptime: number;
  requestsPerDay: { date: string; count: number }[];
}

// States:
- apiKeys: ApiKey[]
- stats: UsageStats
- isLoading: boolean

// API Calls:
- useEffect: GET /developer/api-keys/:userId
- useEffect: GET /developer/usage/:userId
- handleCreateKey: POST /developer/api-keys/:userId/create
- handleRevokeKey: DELETE /developer/api-keys/:userId/revoke
```

**B. ApiKeyCard.tsx**
```
Location: /components/developer/ApiKeyCard.tsx

UI:
┌────────────────────────────────────────┐
│  🔑 Production Key                     │
│  ctx_abc123...xyz                      │
│  Created: Jan 15, 2026                 │
│  Last used: 2 hours ago                │
│  📊 1,234 requests                     │
│  [📋 Copy] [🗑️ Revoke]                 │
└────────────────────────────────────────┘

Props:
- apiKey: ApiKey
- onCopy: (key: string) => void
- onRevoke: (keyId: string) => void
```

**C. CreateApiKeyModal.tsx**
```
Location: /components/developer/CreateApiKeyModal.tsx

UI:
┌────────────────────────────┐
│  Create New API Key        │
├────────────────────────────┤
│  📝 Name                   │
│  [input] (e.g., "Prod")    │
│                            │
│  🔐 Permissions            │
│  [x] Read                  │
│  [x] Write                 │
│  [ ] Delete                │
│                            │
│  ⚠️  This key will only be │
│      shown once. Copy it   │
│      now!                  │
│                            │
│  [Cancel]  [Create Key]    │
└────────────────────────────┘

On success:
┌────────────────────────────┐
│  ✅ Key Created            │
├────────────────────────────┤
│  ctx_abc123xyz456def789    │
│  [Copy to Clipboard]       │
│                            │
│  ⚠️  Save this now! You    │
│      won't see it again.   │
│                            │
│  [Done]                    │
└────────────────────────────┘
```

#### **Jour 2 : Documentation & Usage**

**D. ApiDocumentation.tsx**
```
Location: /components/developer/ApiDocumentation.tsx

UI:
┌─────────────────────────────────────────┐
│  API Documentation                      │
├─────────────────────────────────────────┤
│  🚀 Quick Start                         │
│  ┌─────────────────────────────────┐   │
│  │ curl -X POST \                  │   │
│  │ https://api.cortexia.app/v1/... │   │
│  │ -H "Authorization: Bearer $KEY" │   │
│  │ -d '{"prompt": "..."}'          │   │
│  └─────────────────────────────────┘   │
│  [Copy Code]                            │
│                                         │
│  📚 Endpoints                           │
│  • POST /v1/generate/image              │
│  • POST /v1/generate/video              │
│  • GET /v1/generations/:id              │
│  • GET /v1/credits                      │
│                                         │
│  🔗 SDKs                                │
│  [Python] [Node.js] [Go] [Ruby]         │
│                                         │
│  📖 Full Documentation                  │
│  [View on docs.cortexia.app]            │
└─────────────────────────────────────────┘

Sections:
1. Quick Start
   - cURL example
   - Copy button

2. Endpoints List
   - POST /v1/generate/image
   - POST /v1/generate/video
   - GET /v1/generations/:id
   - GET /v1/credits

3. SDKs
   - Python pip install cortexia
   - Node npm install @cortexia/sdk
   - Go go get github.com/cortexia/go-sdk
   - Ruby gem install cortexia

4. Rate Limits
   - 100 requests/minute
   - 10,000 requests/day

5. Full Docs Link
   - External: docs.cortexia.app
```

**E. UsageChart.tsx**
```
Location: /components/developer/UsageChart.tsx

Using Recharts:
- Line chart: Requests per day (last 30 days)
- Bar chart: Credits consumed per day
- Tooltip with details

Props:
- data: { date: string; requests: number; credits: number }[]
```

#### **Jour 3 : Intégration**

**F. Router & Navigation**
```typescript
// /App.tsx

// Ajouter route
<Route path="/developer-dashboard" element={<DeveloperDashboard />} />

// Dans AppContent, routing pour Developer
if (userType === 'developer') {
  if (currentScreen === 'coconut-v14') {
    // Rediriger vers Developer Dashboard
    return <DeveloperDashboard />;
  }
}
```

**G. Backend Routes (créer fichier manquant)**
```typescript
// /supabase/functions/server/developer-routes.ts

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// GET /developer/api-keys/:userId
app.get('/api-keys/:userId', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'developer') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  const apiKeys = profile.apiKeys || [];
  
  // Mask keys (show only first 10 and last 4 chars)
  const maskedKeys = apiKeys.map(key => ({
    ...key,
    key: `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 4)}`
  }));
  
  return c.json({ apiKeys: maskedKeys });
});

// POST /developer/api-keys/:userId/create
app.post('/api-keys/:userId/create', async (c) => {
  const userId = c.req.param('userId');
  const { name, permissions } = await c.req.json();
  
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'developer') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  // Generate new key
  const newKey = `ctx_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  const apiKeyObj = {
    id: `key_${Date.now()}`,
    key: newKey,
    name,
    permissions: permissions || ['read', 'write'],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    requestCount: 0
  };
  
  profile.apiKeys.push(apiKeyObj);
  await kv.set(`user:profile:${userId}`, profile);
  
  // Store key mapping
  await kv.set(`apikeys:${newKey}`, {
    userId,
    createdAt: new Date().toISOString()
  });
  
  return c.json({ apiKey: apiKeyObj });
});

// DELETE /developer/api-keys/:userId/revoke
app.delete('/api-keys/:userId/revoke', async (c) => {
  const userId = c.req.param('userId');
  const { keyId } = await c.req.json();
  
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'developer') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  // Remove key
  const keyToRemove = profile.apiKeys.find(k => k.id === keyId);
  profile.apiKeys = profile.apiKeys.filter(k => k.id !== keyId);
  await kv.set(`user:profile:${userId}`, profile);
  
  // Remove key mapping
  if (keyToRemove) {
    await kv.del(`apikeys:${keyToRemove.key}`);
  }
  
  return c.json({ success: true });
});

// GET /developer/usage/:userId
app.get('/usage/:userId', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'developer') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  // Get usage data (from KV or calculate)
  const totalRequests = profile.apiKeys.reduce((sum, key) => sum + (key.requestCount || 0), 0);
  const credits = await kv.get(`user:credits:${userId}`);
  
  // Mock data for requests per day (in production, store in KV)
  const requestsPerDay = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 500)
  }));
  
  return c.json({
    totalRequests,
    creditsConsumed: credits.total - credits.free,
    uptime: 99.9,
    requestsPerDay
  });
});

export default app;
```

**H. Intégrer dans index.tsx**
```typescript
// /supabase/functions/server/index.tsx

import developerRoutes from './developer-routes.ts';

// ...
app.route('/developer', developerRoutes);
```

#### **Checklist Jour 1-3**
- [ ] DeveloperDashboard.tsx créé
- [ ] ApiKeyCard.tsx créé
- [ ] CreateApiKeyModal.tsx créé
- [ ] ApiDocumentation.tsx créé
- [ ] UsageChart.tsx créé (Recharts)
- [ ] developer-routes.ts créé (backend)
- [ ] Routes intégrées dans index.tsx
- [ ] Routing App.tsx mis à jour
- [ ] Flow complet testé : Create key → Copy → Use → Revoke

---

### **1.3 CREATOR SYSTEM - WATERMARK & TRACKING - 1-2 jours**

#### **📝 Spécifications**

**Backend déjà disponible :**
- ✅ Tracking stats : `user:profile:{userId}` (creationsThisMonth, postsThisMonth, etc.)
- ✅ Creator routes : `/creators/:userId/coconut-access`

**A créer :**
- Watermark logic
- Progress tracking UI
- Expiration countdown

#### **Jour 1 : Watermark System**

**A. Implémenter watermark pour non-Creators**
```typescript
// /utils/watermarkHelpers.ts (METTRE À JOUR)

/**
 * Télécharge une image avec watermark si user n'est pas Creator
 */
export async function downloadImageWithWatermark(
  imageUrl: string,
  filename: string,
  userHasCreatorAccess: boolean // ✅ NOUVEAU PARAM
): Promise<void> {
  if (userHasCreatorAccess) {
    // ✅ Creator → Download sans watermark
    console.log('✨ Creator download: No watermark');
    
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    window.URL.revokeObjectURL(url);
    return;
  }
  
  // ❌ Non-Creator → Ajouter watermark
  console.log('💧 Non-Creator download: Adding watermark');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Dessiner l'image
    ctx.drawImage(img, 0, 0);
    
    // Ajouter watermark "Cortexia" en bas à droite
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('Cortexia', canvas.width - 20, canvas.height - 20);
    
    // Télécharger
    canvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    }, 'image/png');
  };
  
  img.src = imageUrl;
}
```

**B. Mettre à jour ForYouFeed.tsx**
```typescript
// /components/ForYouFeed.tsx

// Dans handleDownload:
const handleDownload = async () => {
  try {
    const imageUrl = currentPost.remixVariants 
      ? currentPost.remixVariants[remixIndex]?.url 
      : currentPost.mediaUrl;
    
    const filename = `cortexia-${currentPost.id}.png`;
    
    // ✅ NOUVEAU: Vérifier statut Creator
    const hasCreatorAccess = user?.hasCreatorAccess || false;
    
    await downloadImageWithWatermark(imageUrl, filename, hasCreatorAccess);
    
    if (hasCreatorAccess) {
      toast.success('✨ Downloaded without watermark (Creator benefit)');
    } else {
      toast.success('Downloaded with watermark', {
        description: 'Become a Creator to download without watermark'
      });
    }
    
    playSuccessSound();
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download image');
  }
};
```

**C. Mettre à jour CreateHubGlass.tsx**
```typescript
// /components/create/CreateHubGlass.tsx

// Dans handleDownload (similaire):
const hasCreatorAccess = user?.hasCreatorAccess || false;
await downloadImageWithWatermark(imageUrl, filename, hasCreatorAccess);

if (hasCreatorAccess) {
  toast.success('✨ Downloaded without watermark (Creator benefit)');
} else {
  toast.success('Downloaded with watermark', {
    description: 'Become a Creator to remove watermarks'
  });
}
```

#### **Jour 2 : Progress Tracking UI**

**D. CreatorProgressPanel.tsx**
```
Location: /components/creator/CreatorProgressPanel.tsx

UI (dans CreatorDashboard):
┌─────────────────────────────────────────┐
│  🎯 Creator Requirements                │
├─────────────────────────────────────────┤
│  Option A: Organic (Free)               │
│  ┌─────────────────────────────────┐   │
│  │ 📊 Créations: 37/60             │   │
│  │ [████████░░░░░░░░░░] 62%        │   │
│  │                                 │   │
│  │ 📝 Posts publiés: 3/5           │   │
│  │ [████████████░░░░░░] 60%        │   │
│  │                                 │   │
│  │ ❤️  Posts avec 5+ likes: 2/5    │   │
│  │ [████████░░░░░░░░░░] 40%        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─── OR ───                             │
│                                         │
│  Option B: Purchase (Fast)              │
│  ┌─────────────────────────────────┐   │
│  │ 💰 Crédits achetés: 500/1000    │   │
│  │ [██████████░░░░░░░░] 50%        │   │
│  │                                 │   │
│  │ [Buy 500 More Credits]          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⏰ Status expire: Jan 31, 23:59       │
│  (3 days remaining)                     │
└─────────────────────────────────────────┘

Features:
- Progress bars pour chaque métrique
- Countdown expiration statut
- CTA "Buy credits" si proche de 1000
- Badge "✅ Completed" quand critère atteint
```

**Composant :**
```typescript
// /components/creator/CreatorProgressPanel.tsx
interface CreatorProgress {
  // Option A
  creationsThisMonth: number;
  creationsTarget: number; // 60
  postsThisMonth: number;
  postsTarget: number; // 5
  postsWithEnoughLikes: number;
  postsWithLikesTarget: number; // 5
  
  // Option B
  creditsPurchasedThisMonth: number;
  creditsTarget: number; // 1000
  
  // Status
  hasCreatorAccess: boolean;
  creatorAccessExpiresAt: string;
  creatorAccessMethod: 'organic' | 'purchase' | null;
}

// API:
- GET /creators/:userId/progress
  Returns: CreatorProgress
```

**E. CreatorExpirationBanner.tsx**
```
Location: /components/creator/CreatorExpirationBanner.tsx

UI (top banner dans Creator Dashboard si expire bientôt):
┌─────────────────────────────────────────┐
│  ⚠️  Your Creator status expires in 3   │
│      days (Jan 31). Complete the        │
│      requirements to keep access!       │
│  [View Progress]                        │
└─────────────────────────────────────────┘

Conditions:
- Show si creatorAccessExpiresAt - now < 7 days
- Hide si déjà renouvelé pour mois prochain
```

**F. Backend route (créer si manquante)**
```typescript
// /supabase/functions/server/creator-routes.ts

// GET /creators/:userId/progress
app.get('/:userId/progress', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'individual') {
    return c.json({ error: 'Not an Individual account' }, 400);
  }
  
  const progress = {
    // Option A
    creationsThisMonth: profile.creationsThisMonth || 0,
    creationsTarget: 60,
    postsThisMonth: profile.postsThisMonth || 0,
    postsTarget: 5,
    postsWithEnoughLikes: profile.postsWithEnoughLikes || 0,
    postsWithLikesTarget: 5,
    
    // Option B
    creditsPurchasedThisMonth: profile.creditsPurchasedThisMonth || 0,
    creditsTarget: 1000,
    
    // Status
    hasCreatorAccess: profile.hasCreatorAccess || false,
    creatorAccessExpiresAt: profile.creatorAccessExpiresAt || null,
    creatorAccessMethod: profile.creatorAccessMethod || null
  };
  
  return c.json(progress);
});
```

#### **Checklist Jour 1-2**
- [ ] watermarkHelpers.ts mis à jour (vérification Creator)
- [ ] ForYouFeed.tsx mis à jour (watermark conditionnel)
- [ ] CreateHubGlass.tsx mis à jour (watermark conditionnel)
- [ ] CreatorProgressPanel.tsx créé
- [ ] CreatorExpirationBanner.tsx créé
- [ ] Backend route `/creators/:userId/progress` créée
- [ ] Test : Non-Creator download → watermark visible
- [ ] Test : Creator download → pas de watermark
- [ ] Test : Progress bars affichées correctement

---

## PHASE 2 : FEATURES MOYENNES (3-4 jours)

### **🎯 Objectif Phase 2**
Améliorer l'expérience utilisateur avec les features moyennement critiques qui enrichissent les fonctionnalités existantes.

---

### **2.1 PARRAINAGE DASHBOARD - 1-2 jours**

#### **Jour 1 : Core Parrainage UI**

**A. ReferralDashboard.tsx**
```
Location: /components/referral/ReferralDashboard.tsx

UI:
┌─────────────────────────────────────────┐
│  🎁 Referral Program                    │
├─────────────────────────────────────────┤
│  📊 YOUR STATS                          │
│  ┌──────────┬──────────┬──────────┐    │
│  │ Referrals│ Earnings │  Streak  │    │
│  │    12    │  $1,450  │ Day 18   │    │
│  │          │          │ (×1.2)   │    │
│  └──────────┴──────────┴──────────┘    │
│                                         │
│  🔗 YOUR REFERRAL LINK                  │
│  ┌─────────────────────────────────┐   │
│  │ cortexia.app/signup?ref=JOHN123 │   │
│  │ [Copy Link] [Share]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  👥 YOUR REFERRALS (12)                 │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Sarah Johnson                │   │
│  │    Individual • Jan 15, 2026    │   │
│  │    💰 $150 earned               │   │
│  ├─────────────────────────────────┤   │
│  │ 👤 TechCorp Inc.                │   │
│  │    Enterprise • Jan 18, 2026    │   │
│  │    💰 $1,200 earned             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📈 EARNINGS HISTORY                    │
│  [Chart: Earnings per month]            │
└─────────────────────────────────────────┘

Sections:
1. Stats Cards
   - Total referrals
   - Total earnings
   - Current streak (with multiplier)

2. Referral Link
   - Auto-generated link
   - Copy button
   - Share button (Twitter, LinkedIn, Email)

3. Referrals List
   - Avatar + Name
   - Account type badge
   - Signup date
   - Total earnings from this referral
   - Status (active/inactive)

4. Earnings History
   - Chart (last 12 months)
   - Breakdown by referral
```

**Composants :**
```typescript
// /components/referral/ReferralDashboard.tsx
interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  currentStreak: number;
  streakMultiplier: number;
  referralCode: string;
  referralLink: string;
}

interface Referral {
  userId: string;
  name: string;
  email: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  signupDate: string;
  status: 'active' | 'inactive';
  totalEarned: number;
  avatar?: string;
}

// API:
- GET /referrals/:userId/stats
- GET /referrals/:userId/list
- GET /referrals/:userId/earnings-history
```

**B. ReferralCard.tsx**
```
Location: /components/referral/ReferralCard.tsx

UI:
┌────────────────────────────────────────┐
│  👤 Sarah Johnson                      │
│  🟢 Active • Individual                │
│  📅 Joined: Jan 15, 2026               │
│  💰 Earned: $150                       │
│                                        │
│  Recent purchases:                     │
│  • Jan 20: $100 → $12 commission       │
│  • Jan 25: $50 → $6 commission         │
└────────────────────────────────────────┘

Props:
- referral: Referral
- onViewDetails: (userId: string) => void
```

**C. ShareReferralModal.tsx**
```
Location: /components/referral/ShareReferralModal.tsx

UI:
┌────────────────────────────┐
│  Share Your Referral Link  │
├────────────────────────────┤
│  cortexia.app/?ref=JOHN123 │
│  [Copy Link]               │
│                            │
│  Share on:                 │
│  [Twitter] [LinkedIn]      │
│  [Email]   [WhatsApp]      │
│                            │
│  💡 Tip: Earn 10%-15%      │
│     commission on all      │
│     purchases!             │
│                            │
│  [Close]                   │
└────────────────────────────┘

Actions:
- Copy link to clipboard
- Open Twitter with pre-filled text
- Open LinkedIn share
- Open email template
- Generate WhatsApp message
```

#### **Jour 2 : Earnings & Streak**

**D. EarningsHistory.tsx**
```
Location: /components/referral/EarningsHistory.tsx

UI:
┌─────────────────────────────────────────┐
│  📈 Earnings History                    │
├─────────────────────────────────────────┤
│  [Chart: Bar chart per month]           │
│                                         │
│  Breakdown:                             │
│  ┌─────────────────────────────────┐   │
│  │ Jan 2026                        │   │
│  │ ├─ Sarah: $150                  │   │
│  │ ├─ TechCorp: $1,200             │   │
│  │ └─ Total: $1,350                │   │
│  ├─────────────────────────────────┤   │
│  │ Dec 2025                        │   │
│  │ └─ Mike: $100                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

Using Recharts:
- Bar chart: Earnings per month
- Tooltip with breakdown by referral
```

**E. StreakTracker.tsx**
```
Location: /components/referral/StreakTracker.tsx

UI:
┌────────────────────────────┐
│  🔥 Streak Multiplier      │
├────────────────────────────┤
│  Current: Day 18           │
│  Multiplier: ×1.2          │
│                            │
│  Progress to next level:   │
│  [████░░░░░░] 18/21        │
│  (3 days to ×1.3)          │
│                            │
│  Multiplier Tiers:         │
│  Day 1-6:   ×1.0           │
│  Day 7-13:  ×1.1 ✅        │
│  Day 14-20: ×1.2 ✅ (you)  │
│  Day 21-29: ×1.3           │
│  Day 30+:   ×1.5           │
└────────────────────────────┘

Props:
- currentStreak: number
- multiplier: number
```

**F. Backend routes (créer si manquantes)**
```typescript
// /supabase/functions/server/referral-routes.ts

// GET /referrals/:userId/stats
app.get('/:userId/stats', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kv.get(`user:profile:${userId}`);
  
  if (profile.accountType !== 'individual') {
    return c.json({ error: 'Only Individual accounts can refer' }, 400);
  }
  
  const stats = {
    totalReferrals: profile.referralCount || 0,
    totalEarnings: profile.referralEarnings || 0,
    currentStreak: profile.streak || 0,
    streakMultiplier: profile.streakMultiplier || 1.0,
    referralCode: profile.referralCode,
    referralLink: `https://cortexia.app/signup?ref=${profile.referralCode}`
  };
  
  return c.json(stats);
});

// GET /referrals/:userId/list
app.get('/:userId/list', async (c) => {
  const userId = c.req.param('userId');
  const referrals = await kv.get(`user:referrals:${userId}`) || [];
  
  // Enrich with profile data
  const enrichedReferrals = await Promise.all(
    referrals.map(async (ref) => {
      const refProfile = await kv.get(`user:profile:${ref.userId}`);
      return {
        ...ref,
        name: refProfile.name,
        email: refProfile.email,
        avatar: refProfile.picture,
        status: refProfile.lastActiveAt ? 'active' : 'inactive'
      };
    })
  );
  
  return c.json({ referrals: enrichedReferrals });
});

// GET /referrals/:userId/earnings-history
app.get('/:userId/earnings-history', async (c) => {
  const userId = c.req.param('userId');
  
  // Get earnings history (stored in KV or calculate)
  // For now, mock data
  const history = [
    { month: 'Jan 2026', total: 1350, breakdown: [
      { name: 'Sarah', amount: 150 },
      { name: 'TechCorp', amount: 1200 }
    ]},
    { month: 'Dec 2025', total: 100, breakdown: [
      { name: 'Mike', amount: 100 }
    ]}
  ];
  
  return c.json({ history });
});
```

#### **Checklist Jour 1-2**
- [ ] ReferralDashboard.tsx créé
- [ ] ReferralCard.tsx créé
- [ ] ShareReferralModal.tsx créé
- [ ] EarningsHistory.tsx créé
- [ ] StreakTracker.tsx créé
- [ ] Backend routes créées (stats, list, history)
- [ ] Intégration dans Creator Dashboard (onglet "Referrals")
- [ ] Test : Copy link → Signup avec ref → Commission calculée

---

### **2.2 BATCH GENERATION UI - 1 jour**

**A. BatchConfigPanel.tsx**
```
Location: /components/coconut-v14-enterprise/BatchConfigPanel.tsx

UI (dans Campaign workflow):
┌─────────────────────────────────────────┐
│  ⚙️  Batch Configuration                │
├─────────────────────────────────────────┤
│  📊 Variants                            │
│  [Slider: 1-10] (5 selected)           │
│                                         │
│  ⚡ Generation Mode                     │
│  ( ) Sequential (slower, cheaper)       │
│  (•) Parallel (faster, more credits)    │
│                                         │
│  🎨 Quality Settings                    │
│  [x] High resolution (+50 credits/img)  │
│  [ ] Upscale 2x (+100 credits/img)      │
│  [x] Enhanced colors                    │
│                                         │
│  💰 Estimated Cost                      │
│  Base: 575 credits                      │
│  Variants (×5): +500 credits            │
│  High-res: +250 credits                 │
│  ──────────────────────────            │
│  Total: 1,325 credits                   │
│                                         │
│  [Cancel] [Generate Batch]              │
└─────────────────────────────────────────┘

Props:
- onSubmit: (config: BatchConfig) => void
- estimatedCost: number
```

**B. BatchHistoryPanel.tsx**
```
Location: /components/coconut-v14-enterprise/BatchHistoryPanel.tsx

UI:
┌─────────────────────────────────────────┐
│  📜 Batch History                       │
├─────────────────────────────────────────┤
│  ✅ Luxury Perfume Campaign             │
│  5 variants • Jan 25, 2026              │
│  [View] [Re-run] [Download All]         │
├─────────────────────────────────────────┤
│  ⏳ Product Launch (In Progress)        │
│  3/10 variants completed                │
│  [View Progress] [Cancel]               │
├─────────────────────────────────────────┤
│  ❌ Summer Collection (Failed)          │
│  Error: Insufficient credits            │
│  [Retry]                                │
└─────────────────────────────────────────┘

Features:
- List of all batches
- Status badges (Completed, In Progress, Failed)
- Actions: View, Re-run, Download all, Cancel
```

**C. Intégrer dans CampaignWorkflow.tsx**
```typescript
// Ajouter step "Batch Config" avant "Generating"
const [batchConfig, setBatchConfig] = useState<BatchConfig | null>(null);

// Flow:
1. Type Select
2. Intent Input
3. Analyzing
4. Direction Select
5. CocoBoard
6. 🆕 Batch Config ← NOUVEAU
7. Generating
8. Results
```

#### **Checklist Jour 1**
- [ ] BatchConfigPanel.tsx créé
- [ ] BatchHistoryPanel.tsx créé
- [ ] Intégration dans CampaignWorkflow.tsx
- [ ] Test : Config 5 variants → Generate → Voir progress
- [ ] Test : Re-run batch précédent

---

### **2.3 WALLET - DUAL DISPLAY - 1 jour**

**A. WalletEnhanced.tsx (mise à jour)**
```
Location: /components/Wallet.tsx (mettre à jour)

UI AVANT:
┌────────────────────────────┐
│  Total: 1,225 credits      │
└────────────────────────────┘

UI APRÈS (Individual):
┌────────────────────────────┐
│  💳 Free Credits           │
│  25 credits                │
│  (Resets Feb 1)            │
│                            │
│  💰 Paid Credits           │
│  1,200 credits             │
│  (Never expires)           │
│  ──────────────────────    │
│  Total: 1,225 credits      │
└────────────────────────────┘

UI APRÈS (Enterprise):
┌────────────────────────────┐
│  📅 Subscription Credits   │
│  10,000 credits            │
│  (Resets Feb 1)            │
│                            │
│  ➕ Add-on Credits         │
│  5,000 credits             │
│  (Persistent)              │
│  ──────────────────────    │
│  Total: 15,000 credits     │
└────────────────────────────┘

Mise à jour:
- Distinguer free vs paid (Individual)
- Distinguer subscription vs addon (Enterprise)
- Afficher prochaine date reset
- Countdown "Resets in 5 days"
```

**B. CreditBreakdownCard.tsx**
```
Location: /components/credits/CreditBreakdownCard.tsx

Props:
- type: 'individual' | 'enterprise'
- credits: {
    free?: number
    paid?: number
    subscription?: number
    addon?: number
    total: number
  }
- nextResetDate: string
```

#### **Checklist Jour 1**
- [ ] Wallet.tsx mis à jour (dual display)
- [ ] CreditBreakdownCard.tsx créé
- [ ] Test Individual : Voir free vs paid
- [ ] Test Enterprise : Voir subscription vs addon
- [ ] Reset countdown affiché

---

### **2.4 FEED - MISSING FEATURES - 1 jour**

**A. Creator Badge (dans ForYouFeed.tsx)**
```typescript
// Ajouter badge Creator à côté du username
<div className="flex items-center gap-2">
  <span className="font-semibold">{post.author.username}</span>
  {post.author.hasCreatorAccess && (
    <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
      ✨ Creator
    </span>
  )}
</div>
```

**B. RemixChainViewer.tsx**
```
Location: /components/feed/RemixChainViewer.tsx

UI:
┌────────────────────────────────────────┐
│  🔗 Remix Chain                        │
├────────────────────────────────────────┤
│  1️⃣ [Original] by @john               │
│     "Sunset landscape"                 │
│     ↓                                  │
│  2️⃣ [Remix] by @sarah                 │
│     "Sunset with mountains"            │
│     ↓                                  │
│  3️⃣ [Remix] by @mike                  │
│     "Sunset mountains purple sky" ← YOU│
└────────────────────────────────────────┘

Features:
- Show all remixes in chain
- Click to view each version
- Highlight current post
```

**C. MentionAutocomplete.tsx**
```
Location: /components/feed/MentionAutocomplete.tsx

UI (dans input comment):
┌────────────────────────────┐
│  Type a comment... @       │
│  ┌──────────────────────┐  │
│  │ @john                │  │
│  │ @sarah               │  │
│  │ @mike                │  │
│  └──────────────────────┘  │
└────────────────────────────┘

Logic:
- Detect "@" typed
- Fetch users from team/followers
- Show autocomplete dropdown
- Insert @username on select
```

#### **Checklist Jour 1**
- [ ] Creator badge ajouté (ForYouFeed.tsx)
- [ ] RemixChainViewer.tsx créé
- [ ] MentionAutocomplete.tsx créé
- [ ] Intégré dans comments section
- [ ] Test : @mention → Notification

---

## PHASE 3 : FEATURES MINEURES (2-3 jours)

### **🎯 Objectif Phase 3**
Polir l'expérience et ajouter les features moins critiques mais qui améliorent l'UX global.

---

### **3.1 COCONUT V14 - CREATOR QUOTA DISPLAY - 0.5 jour**

**A. CoconutQuotaBanner.tsx**
```
Location: /components/coconut-v14/CoconutQuotaBanner.tsx

UI (top banner dans CoconutV14App):
┌─────────────────────────────────────────┐
│  ✨ Creator Access                      │
│  2 generations remaining this month     │
│  (Resets Feb 1)                         │
│  [Upgrade to Enterprise] →              │
└─────────────────────────────────────────┘

Conditions:
- Show si user.accountType === 'individual' && user.hasCreatorAccess
- Hide si Enterprise (unlimited)
- Red si remaining === 0
```

**B. Bloquer Campaign Mode visuellement**
```typescript
// Dans TypeSelectorEnterprise.tsx
{!canUseCampaign && (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
    <div className="text-center p-4">
      <Lock size={32} className="mx-auto mb-2 text-white/60" />
      <p className="text-white/80 text-sm">
        Campaign Mode
      </p>
      <p className="text-white/60 text-xs mt-1">
        Enterprise only
      </p>
    </div>
  </div>
)}
```

#### **Checklist 0.5 jour**
- [ ] CoconutQuotaBanner.tsx créé
- [ ] Campaign Mode masqué pour Creator
- [ ] Message quota épuisé si remaining === 0

---

### **3.2 NAVIGATION SIDEBAR ENTERPRISE - 1 jour**

**A. EnterpriseSidebar.tsx**
```
Location: /components/coconut-v14-enterprise/EnterpriseSidebar.tsx

UI:
┌─────────────────────────┐
│  Coconut V14            │
│  Enterprise             │
├─────────────────────────┤
│  📊 Dashboard           │
│  ➕ New Generation      │
│  👥 Team (3)            │ ← Badge pending
│  🕐 History             │
│  ⚡ Credits             │
│  ⚙️  Settings           │
├─────────────────────────┤
│  👤 John Doe            │
│     15,234 credits      │
│  [Logout]               │
└─────────────────────────┘

Features:
- Persistante (toujours visible)
- Active state highlighting
- Badge pending approvals sur "Team"
- User profile + credits en bas
```

**B. Intégrer dans CoconutV14AppEnterprise.tsx**
```typescript
return (
  <div className="flex h-screen">
    <EnterpriseSidebar
      activeView={activeView}
      onNavigate={setActiveView}
      pendingApprovals={pendingApprovals}
      userCredits={credits.total}
      userName={user.name}
    />
    
    <div className="flex-1">
      {renderView()}
    </div>
  </div>
);
```

#### **Checklist 1 jour**
- [ ] EnterpriseSidebar.tsx créé
- [ ] Intégré dans CoconutV14AppEnterprise.tsx
- [ ] Navigation fonctionnelle
- [ ] Badge pending approvals

---

### **3.3 SETTINGS - ENHANCED - 1 jour**

**A. NotificationsSettings.tsx**
```
Location: /pages/settings/NotificationsSettings.tsx

UI:
┌─────────────────────────────────────────┐
│  🔔 Notifications                       │
├─────────────────────────────────────────┤
│  Email Notifications                    │
│  [x] New comments                       │
│  [x] New likes                          │
│  [ ] Weekly digest                      │
│                                         │
│  Push Notifications                     │
│  [x] Generation complete                │
│  [x] @mentions                          │
│  [x] Approval requests (Enterprise)     │
│                                         │
│  Sound                                  │
│  [x] Play sound on notifications        │
│  [Volume slider]                        │
│                                         │
│  [Save Changes]                         │
└─────────────────────────────────────────┘

Store in:
- KV: user:settings:{userId}
```

**B. AppearanceSettings.tsx**
```
Location: /pages/settings/AppearanceSettings.tsx

UI:
┌─────────────────────────────────────────┐
│  🎨 Appearance                          │
├─────────────────────────────────────────┤
│  Theme                                  │
│  (•) Dark (default)                     │
│  ( ) Light                              │
│  ( ) Auto (system)                      │
│                                         │
│  Accent Color                           │
│  [Purple] [Blue] [Green] [Pink]         │
│                                         │
│  Auto-save                              │
│  [x] Auto-save CocoBoards               │
│  [x] Auto-save generations to History   │
│                                         │
│  [Save Changes]                         │
└─────────────────────────────────────────┘
```

**C. Intégrer dans SettingsPage.tsx**
```typescript
<Tabs>
  <Tab label="Notifications">
    <NotificationsSettings />
  </Tab>
  <Tab label="Appearance">
    <AppearanceSettings />
  </Tab>
  <Tab label="Account">
    <AccountSettings />
  </Tab>
</Tabs>
```

#### **Checklist 1 jour**
- [ ] NotificationsSettings.tsx créé
- [ ] AppearanceSettings.tsx créé
- [ ] Intégré dans SettingsPage.tsx
- [ ] Backend route `/settings/:userId` (GET/PATCH)
- [ ] Settings persistés dans KV

---

### **3.4 PRICING PAGE - 0.5 jour**

**A. PricingPage.tsx**
```
Location: /components/landing/PricingPage.tsx

UI:
┌───────────────────────────────────────────────────────────┐
│                      Pricing Plans                         │
├───────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Individual │  │ Enterprise │  │  Developer │         │
│  │            │  │            │  │            │         │
│  │   Free     │  │  $999/mo   │  │ Custom     │         │
│  │            │  │            │  │            │         │
│  │ Features:  │  │ Features:  │  │ Features:  │         │
│  │ • 25 free  │  │ • 10,000   │  │ • API      │         │
│  │   credits  │  │   credits  │  │   access   │         │
│  │ • Feed     │  │ • Coconut  │  │ • Custom   │         │
│  │ • CreateHub│  │   unlimited│  │   limits   │         │
│  │            │  │ • Team     │  │            │         │
│  │ [Sign Up]  │  │ [Contact]  │  │ [Contact]  │         │
│  └────────────┘  └────────────┘  └────────────┘         │
├───────────────────────────────────────────────────────────┤
│                    Credit Packs                           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                │
│  │ 500  │  │ 1000 │  │ 5000 │  │10000 │                │
│  │ $50  │  │ $90  │  │ $400 │  │ $750 │                │
│  └──────┘  └──────┘  └──────┘  └──────┘                │
└───────────────────────────────────────────────────────────┘

Sections:
1. Plans comparison
2. Credit packs
3. FAQ
```

#### **Checklist 0.5 jour**
- [ ] PricingPage.tsx créé
- [ ] Route `/pricing` ajoutée
- [ ] Link "Pricing" dans landing
- [ ] CTA vers signup/contact

---

### **3.5 ONBOARDING - CORRECTION TEXTE - 0.5 jour**

**A. Corriger Individual features**
```typescript
// /components/onboarding/OnboardingFlow.tsx

// Remplacer ligne 321:
'Share & download without watermark', // ❌ FAUX

// Par:
'Download with watermark (remove as Creator)', // ✅ CORRECT
```

#### **Checklist 0.5 jour**
- [ ] Texte onboarding corrigé
- [ ] Test : Vérifier que le texte est exact

---

## PHASE 4 : TESTING & POLISH (1-2 jours)

### **🎯 Objectif Phase 4**
Tester tous les flows end-to-end et polir les détails.

---

### **4.1 TESTING COMPLET - 1 jour**

#### **A. Individual Flows**
```
Test 1: Signup avec referral
- [ ] Signup avec code ref
- [ ] Parrain voit nouveau filleul dans dashboard
- [ ] Filleul achète crédits
- [ ] Parrain reçoit commission

Test 2: Creator status (Option A)
- [ ] Générer 60 créations dans mois
- [ ] Publier 5 posts dans Feed
- [ ] Chaque post obtient 5+ likes
- [ ] Creator status activé automatiquement
- [ ] Badge "Creator" affiché dans Feed
- [ ] Download sans watermark

Test 3: Creator status (Option B)
- [ ] Acheter 1000 crédits dans mois
- [ ] Creator status activé automatiquement
- [ ] Badge "Creator" affiché
- [ ] Download sans watermark

Test 4: Coconut access (Creator)
- [ ] Accéder à Coconut V14
- [ ] Générer 1 image (quota 3→2)
- [ ] Générer 1 video (quota 2→1)
- [ ] Voir quota banner "1 remaining"
- [ ] Épuiser quota (1→0)
- [ ] Message "Upgrade to Enterprise"
- [ ] Campaign Mode bloqué

Test 5: Watermark
- [ ] Non-Creator télécharge → watermark visible
- [ ] Creator télécharge → pas de watermark
- [ ] Toast correct affiché

Test 6: Feed features
- [ ] Liker post
- [ ] Commenter post
- [ ] @mention user → notification
- [ ] Remix post
- [ ] Voir remix chain
```

#### **B. Enterprise Flows**
```
Test 7: Team management
- [ ] Créer team
- [ ] Inviter membre (email)
- [ ] Membre accepte invitation
- [ ] Liste membres affichée
- [ ] Changer role membre
- [ ] Supprimer membre

Test 8: Approval workflows
- [ ] Editor demande approbation generation
- [ ] Admin voit pending approval
- [ ] Badge rouge sur sidebar "Team"
- [ ] Admin approve
- [ ] Generation démarre
- [ ] Activity feed mis à jour

Test 9: Real-time comments
- [ ] Ajouter comment sur CocoBoard
- [ ] @mention team member
- [ ] Notification reçue
- [ ] Voir comment en temps réel

Test 10: Batch generation
- [ ] Configurer batch (5 variants)
- [ ] Parallel mode
- [ ] Voir progress
- [ ] Batch complete
- [ ] Download all
- [ ] Re-run batch

Test 11: Wallet Enterprise
- [ ] Voir subscription credits (10,000)
- [ ] Voir addon credits (5,000)
- [ ] Total correct (15,000)
- [ ] Reset countdown affiché
- [ ] Acheter addon credits
- [ ] Subscription credits reset le 1er
- [ ] Addon credits persistent
```

#### **C. Developer Flows**
```
Test 12: Developer Dashboard
- [ ] Voir API keys
- [ ] Créer nouvelle key
- [ ] Copy key to clipboard
- [ ] Key montrée UNE SEULE FOIS
- [ ] Révoquer key
- [ ] Voir usage stats
- [ ] Graph requests per day

Test 13: API Usage
- [ ] Utiliser key pour API call
- [ ] Stats updated (requestCount++)
- [ ] Last used updated
- [ ] Credits décomptés
```

#### **D. Cross-User Flows**
```
Test 14: Referral cross-type
- [ ] Individual parraine Enterprise
- [ ] Enterprise souscrit $999/mois
- [ ] Individual reçoit commission $99 (10% × streak)
- [ ] Commission visible dans Referral Dashboard

Test 15: Storage cleanup
- [ ] Individual génère image
- [ ] Attendre 25h
- [ ] Fichier supprimé (pas publié dans Feed)
- [ ] Publier image dans Feed
- [ ] Attendre 48h
- [ ] Fichier conservé (protected)

Test 16: Credits reset
- [ ] Individual utilise 20/25 free credits
- [ ] Attendre 1er du mois (ou simuler)
- [ ] Free credits reset à 25
- [ ] Paid credits conservés

Test 17: Creator expiration
- [ ] Creator status actif
- [ ] Attendre 31 du mois (ou simuler)
- [ ] Status expire
- [ ] Banner "Renew Creator status"
- [ ] Progress reset (0/60 creations)
```

---

### **4.2 POLISH & BDS COMPLIANCE - 1 jour**

#### **A. Design Consistency**
```
Vérifier:
- [ ] Toutes les pages Enterprise utilisent light theme
- [ ] Toutes les pages Individual utilisent dark theme
- [ ] Palette cream cohérente (cream-500/600/700)
- [ ] Amber/orange accents présents
- [ ] Liquid glass effects sur premium features
- [ ] Animations Motion/React fluides
- [ ] Spacing cohérent (4/8/16 grid)
```

#### **B. Typography**
```
Vérifier:
- [ ] Font sizes cohérents
- [ ] Line heights corrects
- [ ] Font weights appropriés
- [ ] Titles vs body text distinguables
```

#### **C. Interactions**
```
Vérifier:
- [ ] Hovers states présents
- [ ] Active states corrects
- [ ] Loading states cohérents
- [ ] Error states clairs
- [ ] Success feedback visible
- [ ] Sounds optionnels (click, success, error)
```

#### **D. Responsive**
```
Vérifier:
- [ ] Mobile (320px-768px)
- [ ] Tablet (768px-1024px)
- [ ] Desktop (1024px+)
- [ ] Sidebar collapse sur mobile
- [ ] Modals responsives
```

#### **E. Accessibility**
```
Vérifier:
- [ ] Keyboard navigation
- [ ] Focus states visibles
- [ ] Alt text sur images
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
```

---

## TIMELINE DÉTAILLÉE

### **Semaine 1 (Jours 1-5)**
```
Jour 1: Team Collaboration - Core UI
  - TeamManagementPage.tsx
  - InviteMemberModal.tsx
  - MemberCard.tsx

Jour 2: Team Collaboration - Approvals
  - ApprovalsPanel.tsx
  - ApprovalCard.tsx

Jour 3: Team Collaboration - Comments & Activity
  - CommentsSection.tsx
  - ActivityFeed.tsx
  - Intégration sidebar

Jour 4: Developer Dashboard - Core
  - DeveloperDashboard.tsx
  - ApiKeyCard.tsx
  - CreateApiKeyModal.tsx
  - Backend routes

Jour 5: Developer Dashboard - Docs & Usage
  - ApiDocumentation.tsx
  - UsageChart.tsx
  - Intégration routing
```

### **Semaine 2 (Jours 6-10)**
```
Jour 6: Creator System - Watermark
  - watermarkHelpers.ts update
  - ForYouFeed.tsx update
  - CreateHubGlass.tsx update

Jour 7: Creator System - Progress Tracking
  - CreatorProgressPanel.tsx
  - CreatorExpirationBanner.tsx
  - Backend route /progress

Jour 8: Parrainage Dashboard
  - ReferralDashboard.tsx
  - ReferralCard.tsx
  - ShareReferralModal.tsx
  - EarningsHistory.tsx
  - StreakTracker.tsx
  - Backend routes

Jour 9: Batch Generation + Wallet
  - BatchConfigPanel.tsx
  - BatchHistoryPanel.tsx
  - WalletEnhanced.tsx
  - CreditBreakdownCard.tsx

Jour 10: Feed Features + Coconut Quota
  - Creator badge
  - RemixChainViewer.tsx
  - MentionAutocomplete.tsx
  - CoconutQuotaBanner.tsx
  - Campaign Mode masqué
```

### **Semaine 3 (Jours 11-13)**
```
Jour 11: Navigation + Settings
  - EnterpriseSidebar.tsx
  - NotificationsSettings.tsx
  - AppearanceSettings.tsx

Jour 12: Testing Complet
  - Individual flows (6 tests)
  - Enterprise flows (5 tests)
  - Developer flows (2 tests)
  - Cross-user flows (4 tests)

Jour 13: Polish & BDS Compliance
  - Design consistency
  - Typography
  - Interactions
  - Responsive
  - Accessibility
```

**TOTAL : 13 jours de développement**

---

## CHECKLIST DE VALIDATION

### **Phase 1 : Features Critiques ✅**
- [ ] Team Collaboration fonctionnel (invite, roles, approvals, comments)
- [ ] Developer Dashboard fonctionnel (API keys, usage, docs)
- [ ] Creator Watermark implémenté (vérification hasCreatorAccess)
- [ ] Creator Progress tracking affiché (Option A & B)

### **Phase 2 : Features Moyennes ✅**
- [ ] Parrainage Dashboard complet (stats, list, earnings, streak)
- [ ] Batch Generation configurable (variants, parallel, quality)
- [ ] Wallet dual display (free vs paid, subscription vs addon)
- [ ] Feed features (Creator badge, remix chain, @mentions)
- [ ] Coconut quota display (banner, Campaign Mode masqué)

### **Phase 3 : Features Mineures ✅**
- [ ] Navigation sidebar Enterprise persistante
- [ ] Settings enhanced (notifications, appearance, auto-save)
- [ ] Pricing page publique
- [ ] Onboarding text corrigé

### **Phase 4 : Testing & Polish ✅**
- [ ] 17 tests end-to-end passés
- [ ] Design BDS compliant (light/dark theme cohérent)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessibility (keyboard, focus, contrast)

### **Documentation ✅**
- [ ] README.md à jour (si besoin)
- [ ] CORTEXIA_SYSTEM_REFERENCE.md à jour
- [ ] NAVIGATION_GUIDE.md à jour
- [ ] UI_INCONSISTENCIES_REPORT.md archivé

---

## 🎯 RÉSULTAT FINAL

**Après implémentation complète :**

| Feature | Backend | Frontend | Documentation |
|---------|---------|----------|---------------|
| Team Collaboration | ✅ 100% | ✅ 100% | ✅ 100% |
| Batch Generation | ✅ 100% | ✅ 100% | ✅ 100% |
| Developer Dashboard | ✅ 100% | ✅ 100% | ✅ 100% |
| Creator System | ✅ 100% | ✅ 100% | ✅ 100% |
| Parrainage | ✅ 100% | ✅ 100% | ✅ 100% |
| Coconut V14 | ✅ 100% | ✅ 100% | ✅ 100% |
| Feed | ✅ 100% | ✅ 100% | ✅ 100% |
| Credits | ✅ 100% | ✅ 100% | ✅ 100% |

**COVERAGE TOTALE : 100% ✅**

---

## 🚀 PRÊT À COMMENCER ?

**Pour démarrer l'implémentation :**

1. **Créer une branche feature :**
```bash
git checkout -b feature/ui-consistency-fixes
```

2. **Suivre le plan jour par jour**
3. **Commit après chaque feature complétée**
4. **Tester progressivement**
5. **Créer PR après chaque phase**

**Première tâche : Phase 1 - Jour 1 - Team Collaboration Core UI**

Tu veux que je commence maintenant ? 🎯
