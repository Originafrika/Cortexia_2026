# 🎨 ARCHITECTURE FEED & PUBLICATIONS - Cortexia Creation Hub V3

## 📊 **VUE D'ENSEMBLE**

Quand un utilisateur fait une génération et la publie sur le feed, voici le **flow complet** :

```
1. USER GÉNÈRE (Coconut V14)
   ↓
2. Stockage génération: generation:{generationId}
   ↓
3. USER CLIQUE "Publish to Feed"
   ↓
4. POST /feed/publish
   ↓
5. Stockage création: creation:{creationId}
   ↓
6. Ajout aux index feed
   ↓
7. Apparition dans le feed communautaire ✨
```

---

## 🔄 **FLOW COMPLET EN DÉTAIL**

### **ÉTAPE 1 : GÉNÉRATION (Coconut V14)** 🥥

**Endpoint :** `POST /coconut-v14/generate`

**Quand l'utilisateur clique "Generate" :**

1. **Déduction des crédits** (115 crédits)
2. **Création de l'objet génération**
3. **Stockage dans KV Store**

**Clé :** `generation:{generationId}`

**Exemple :**
```json
{
  "id": "gen_1736258845123_abc456",
  "userId": "google-oauth2|110247234719945760338",
  "cocoboardId": "coco_xyz789",
  "intent": "Create a summer beach scene",
  "model": "flux-2-pro",
  "promptForFlux": "A stunning summer beach scene with palm trees...",
  "status": "completed",
  "progress": 100,
  "resultUrl": "https://storage.kie-ai.com/result_abc123.png",
  "thumbnail": "https://storage.kie-ai.com/result_abc123.png",
  "creditsUsed": 115,
  "isFavorite": false,
  "createdAt": "2026-01-07T14:20:45.123Z",
  "updatedAt": "2026-01-07T14:21:30.456Z"
}
```

**Stockage :**
```typescript
// Génération elle-même
await kv.set(`generation:${generation.id}`, generation);

// Index des générations de l'user
const userGens = await kv.get(`user:${userId}:generations`) || [];
userGens.unshift(generation.id);
await kv.set(`user:${userId}:generations`, userGens);
```

**Requête SQL pour voir les générations :**
```sql
SELECT 
  key,
  value->>'userId' as user_id,
  value->>'intent' as intent,
  value->>'status' as status,
  value->>'resultUrl' as image,
  value->>'creditsUsed' as credits,
  value->>'createdAt' as created
FROM kv_store_e55aa214 
WHERE key LIKE 'generation:%'
  AND value->>'status' = 'completed'
ORDER BY value->>'createdAt' DESC
LIMIT 20;
```

---

### **ÉTAPE 2 : PUBLICATION SUR LE FEED** 📤

**Endpoint :** `POST /feed/publish`

**Quand l'utilisateur clique "Share to Community Feed" :**

#### **A) Frontend envoie la requête**

```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/publish`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      userId: user.id,
      username: user.name || 'Anonymous',
      userAvatar: user.picture || '',
      type: 'image', // ou 'video' ou 'avatar'
      assetUrl: generation.resultUrl,
      thumbnailUrl: generation.thumbnail,
      prompt: generation.promptForFlux,
      caption: 'Check out my creation!',
      model: generation.model, // 'flux-2-pro'
      tags: ['beach', 'summer', 'ai-art'],
      isPublic: true,
      metadata: {
        aspectRatio: '16:9',
        resolution: '1024x1024',
      }
    })
  }
);
```

---

#### **B) Backend traite la publication**

**Code du serveur** (`/supabase/functions/server/feed-routes.ts`) :

```typescript
app.post('/publish', async (c) => {
  // 1. Valider les données
  if (!userId || !type || !assetUrl || !prompt) {
    return c.json({ error: 'Missing fields' }, 400);
  }

  // 2. Générer ID de création
  const creationId = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 3. Upload asset to Supabase Storage (optionnel)
  const uploadResult = await uploadFeedAsset(userId, creationId, assetUrl, type);
  const finalAssetUrl = uploadResult.success ? uploadResult.url : assetUrl;

  // 4. Créer l'objet création
  const creation: Creation = {
    id: creationId,
    userId,
    username: username || `user_${userId.slice(0, 8)}`,
    userAvatar,
    type,
    assetUrl: finalAssetUrl,
    thumbnailUrl,
    prompt,
    caption: caption || prompt,
    model,
    tags,
    isPublic,
    likes: 0,
    comments: 0,
    shares: 0,
    downloads: 0,
    remixes: 0,
    metadata,
    createdAt: new Date().toISOString()
  };

  // 5. SAUVEGARDER LA CRÉATION
  await kv.set(`creation:${creationId}`, creation);

  // 6. AJOUTER À L'INDEX USER
  const userCreations = await kv.get(`user:creations:${userId}`) || [];
  userCreations.unshift(creationId); // Plus récent en premier
  await kv.set(`user:creations:${userId}`, userCreations);

  // 7. AJOUTER AU FEED GLOBAL
  const communityFeed = await kv.get('feed:community:latest') || [];
  communityFeed.unshift(creationId);
  
  // Garder seulement les 10000 derniers posts
  if (communityFeed.length > 10000) {
    communityFeed.splice(10000);
  }
  
  await kv.set('feed:community:latest', communityFeed);

  // 8. TRACKER STATS CREATOR (pour Top Creator Program)
  await trackCreatorPublish(userId);

  return c.json({
    success: true,
    creationId,
    creation
  });
});
```

---

### **ÉTAPE 3 : STOCKAGE DANS KV STORE** 🗄️

#### **A) Création complète**

**Clé :** `creation:{creationId}`

**Exemple :**
```json
{
  "id": "creation_1736258900456_xyz789",
  "userId": "google-oauth2|110247234719945760338",
  "username": "Li Luanlu",
  "userAvatar": "https://lh3.googleusercontent.com/...",
  "type": "image",
  "assetUrl": "https://storage.kie-ai.com/result_abc123.png",
  "thumbnailUrl": "https://storage.kie-ai.com/result_abc123.png",
  "prompt": "A stunning summer beach scene with palm trees...",
  "caption": "Check out my creation!",
  "model": "flux-2-pro",
  "tags": ["beach", "summer", "ai-art"],
  "isPublic": true,
  "likes": 42,
  "comments": 7,
  "shares": 3,
  "downloads": 12,
  "remixes": 2,
  "metadata": {
    "aspectRatio": "16:9",
    "resolution": "1024x1024"
  },
  "createdAt": "2026-01-07T14:21:40.456Z"
}
```

---

#### **B) Index des créations de l'utilisateur**

**Clé :** `user:creations:{userId}`

**Contenu :** Array de creationIds (ordre chronologique inverse)
```json
[
  "creation_1736258900456_xyz789",  // Plus récent
  "creation_1736258800123_abc456",
  "creation_1736258700789_def123",
  // ... jusqu'à 1000 posts max
]
```

**Requête SQL :**
```sql
-- Voir TOUTES les créations d'un user
SELECT 
  key,
  jsonb_array_length(value) as nombre_posts,
  value as liste_creation_ids
FROM kv_store_e55aa214 
WHERE key = 'user:creations:google-oauth2|110247234719945760338';
```

---

#### **C) Index du feed communautaire global**

**Clé :** `feed:community:latest`

**Contenu :** Array de creationIds (tous les users, ordre chronologique)
```json
[
  "creation_1736258900456_xyz789",  // Post le plus récent
  "creation_1736258890123_abc000",  // D'un autre user
  "creation_1736258880456_def111",
  "creation_1736258870789_ghi222",
  // ... jusqu'à 10000 posts max
]
```

**Requête SQL :**
```sql
-- Voir le feed global
SELECT 
  key,
  jsonb_array_length(value) as total_posts,
  value->0 as dernier_post_id,
  value->1 as avant_dernier_post_id
FROM kv_store_e55aa214 
WHERE key = 'feed:community:latest';
```

---

### **ÉTAPE 4 : AFFICHAGE DANS LE FEED** 📱

**Endpoint :** `GET /feed/community?offset=0&limit=20`

**Flow :**

1. **Frontend fait la requête**
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/community?offset=0&limit=20`,
  {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  }
);

const { creations, pagination } = await response.json();
```

2. **Backend récupère les posts**
```typescript
app.get('/community', async (c) => {
  const offset = parseInt(c.req.query('offset') || '0');
  const limit = parseInt(c.req.query('limit') || '20');

  // 1. Récupérer l'index global
  const creationIds = await kv.get('feed:community:latest') || [];

  // 2. Paginer
  const paginatedIds = creationIds.slice(offset, offset + limit);

  // 3. Charger chaque création
  const creations = [];
  for (const id of paginatedIds) {
    const creation = await kv.get(`creation:${id}`);
    if (creation && creation.isPublic) {
      creations.push(creation);
    }
  }

  // 4. Retourner résultats
  return c.json({
    success: true,
    creations,
    pagination: {
      offset,
      limit,
      total: creationIds.length,
      hasMore: offset + limit < creationIds.length
    }
  });
});
```

3. **Frontend affiche les posts**
```tsx
{creations.map((creation) => (
  <FeedCard
    key={creation.id}
    image={creation.assetUrl}
    username={creation.username}
    avatar={creation.userAvatar}
    caption={creation.caption}
    likes={creation.likes}
    comments={creation.comments}
    onLike={() => handleLike(creation.id)}
  />
))}
```

---

## ❤️ **INTERACTIONS SOCIALES**

### **1. LIKE / UNLIKE** ❤️

**Endpoint :** `POST /feed/:creationId/like`

**Stockage :**
- **Clé :** `like:{userId}:{creationId}`
- **Valeur :** `{ userId, creationId, createdAt }`

**Logique :**
```typescript
app.post('/:creationId/like', async (c) => {
  const { userId } = await c.req.json();
  const likeKey = `like:${userId}:${creationId}`;
  
  const existingLike = await kv.get(likeKey);
  const creation = await kv.get(`creation:${creationId}`);
  
  if (existingLike) {
    // UNLIKE
    await kv.del(likeKey);
    creation.likes -= 1;
  } else {
    // LIKE
    await kv.set(likeKey, {
      userId,
      creationId,
      createdAt: new Date().toISOString()
    });
    creation.likes += 1;
    
    // ✅ Top Creator Tracking: Si le post atteint 5 likes
    if (creation.likes === 5) {
      await trackCreatorPostLikes(creation.userId, creationId);
    }
  }
  
  await kv.set(`creation:${creationId}`, creation);
  
  return c.json({ success: true, isLiked: !existingLike, likes: creation.likes });
});
```

**Requête SQL - Voir qui a liké un post :**
```sql
SELECT 
  SPLIT_PART(key, ':', 2) as user_id,
  value->>'createdAt' as liked_at
FROM kv_store_e55aa214 
WHERE key LIKE 'like:%:creation_1736258900456_xyz789'
ORDER BY value->>'createdAt' DESC;
```

**Requête SQL - Voir tous les posts qu'un user a liké :**
```sql
SELECT 
  SPLIT_PART(key, ':', 3) as creation_id,
  value->>'createdAt' as liked_at
FROM kv_store_e55aa214 
WHERE key LIKE 'like:google-oauth2|110247234719945760338:%'
ORDER BY value->>'createdAt' DESC;
```

---

### **2. COMMENTAIRES** 💬

**Endpoint :** `POST /feed/:creationId/comment`

**Stockage :**
- **Clé :** `comment:{commentId}`
- **Index :** `creation:comments:{creationId}` → Array of commentIds

**Structure commentaire :**
```json
{
  "id": "comment_1736259000123_abc",
  "creationId": "creation_1736258900456_xyz789",
  "userId": "google-oauth2|987654321",
  "username": "John Doe",
  "userAvatar": "https://...",
  "text": "This is amazing! 🔥",
  "createdAt": "2026-01-07T14:23:20.123Z"
}
```

**Logique :**
```typescript
app.post('/:creationId/comment', async (c) => {
  const { userId, username, userAvatar, text } = await c.req.json();
  
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const comment = {
    id: commentId,
    creationId,
    userId,
    username,
    userAvatar,
    text,
    createdAt: new Date().toISOString()
  };
  
  // Sauvegarder commentaire
  await kv.set(`comment:${commentId}`, comment);
  
  // Ajouter à l'index
  const comments = await kv.get(`creation:comments:${creationId}`) || [];
  comments.push(commentId);
  await kv.set(`creation:comments:${creationId}`, comments);
  
  // Incrémenter compteur
  const creation = await kv.get(`creation:${creationId}`);
  creation.comments += 1;
  await kv.set(`creation:${creationId}`, creation);
  
  return c.json({ success: true, comment });
});
```

**Requête SQL - Voir les commentaires d'un post :**
```sql
SELECT 
  value->>'username' as user,
  value->>'text' as comment,
  value->>'createdAt' as posted_at
FROM kv_store_e55aa214 
WHERE key LIKE 'comment:%'
  AND value->>'creationId' = 'creation_1736258900456_xyz789'
ORDER BY value->>'createdAt' ASC;
```

---

### **3. FOLLOW / UNFOLLOW** 👥

**Endpoint :** `POST /feed/follow/:userId`

**Stockage :**
- **Clé :** `follow:{followerId}:{followedId}`
- **Index followers :** `user:followers:{userId}` → Array of followerIds
- **Index following :** `user:following:{userId}` → Array of followedIds

**Logique :**
```typescript
app.post('/follow/:targetUserId', async (c) => {
  const { userId } = await c.req.json(); // Qui suit
  const targetUserId = c.req.param('targetUserId'); // Qui est suivi
  
  const followKey = `follow:${userId}:${targetUserId}`;
  const existingFollow = await kv.get(followKey);
  
  if (existingFollow) {
    // UNFOLLOW
    await kv.del(followKey);
    
    // Remove from lists
    const followers = await kv.get(`user:followers:${targetUserId}`) || [];
    const following = await kv.get(`user:following:${userId}`) || [];
    
    await kv.set(`user:followers:${targetUserId}`, followers.filter(id => id !== userId));
    await kv.set(`user:following:${userId}`, following.filter(id => id !== targetUserId));
  } else {
    // FOLLOW
    await kv.set(followKey, {
      followerId: userId,
      followedId: targetUserId,
      createdAt: new Date().toISOString()
    });
    
    // Add to lists
    const followers = await kv.get(`user:followers:${targetUserId}`) || [];
    const following = await kv.get(`user:following:${userId}`) || [];
    
    followers.push(userId);
    following.push(targetUserId);
    
    await kv.set(`user:followers:${targetUserId}`, followers);
    await kv.set(`user:following:${userId}`, following);
  }
  
  return c.json({ success: true, isFollowing: !existingFollow });
});
```

---

## 📊 **REQUÊTES SQL UTILES**

### **1. Feed communautaire (20 derniers posts) :**

```sql
WITH feed_ids AS (
  SELECT 
    jsonb_array_elements_text(value) as creation_id
  FROM kv_store_e55aa214 
  WHERE key = 'feed:community:latest'
  LIMIT 20
)
SELECT 
  c.value->>'username' as user,
  c.value->>'caption' as caption,
  c.value->>'assetUrl' as image,
  (c.value->>'likes')::int as likes,
  (c.value->>'comments')::int as comments,
  c.value->>'createdAt' as posted_at
FROM feed_ids f
JOIN kv_store_e55aa214 c ON c.key = 'creation:' || f.creation_id
ORDER BY c.value->>'createdAt' DESC;
```

---

### **2. Posts les plus likés :**

```sql
SELECT 
  value->>'username' as user,
  value->>'caption' as caption,
  (value->>'likes')::int as likes,
  (value->>'comments')::int as comments,
  value->>'createdAt' as posted_at
FROM kv_store_e55aa214 
WHERE key LIKE 'creation:%'
  AND value->>'isPublic' = 'true'
ORDER BY (value->>'likes')::int DESC
LIMIT 10;
```

---

### **3. Utilisateurs les plus actifs :**

```sql
SELECT 
  SPLIT_PART(key, ':', 3) as user_id,
  jsonb_array_length(value) as nombre_posts
FROM kv_store_e55aa214 
WHERE key LIKE 'user:creations:%'
ORDER BY jsonb_array_length(value) DESC
LIMIT 10;
```

---

### **4. Stats d'un post spécifique :**

```sql
-- Post lui-même
SELECT * FROM kv_store_e55aa214 
WHERE key = 'creation:creation_1736258900456_xyz789';

-- Qui a liké
SELECT COUNT(*) as total_likes
FROM kv_store_e55aa214 
WHERE key LIKE 'like:%:creation_1736258900456_xyz789';

-- Commentaires
SELECT COUNT(*) as total_comments
FROM kv_store_e55aa214 
WHERE key LIKE 'comment:%'
  AND value->>'creationId' = 'creation_1736258900456_xyz789';
```

---

### **5. Voir TOUT le contenu d'un utilisateur :**

```sql
-- Ses posts
SELECT 
  value->>'caption' as caption,
  (value->>'likes')::int as likes,
  value->>'createdAt' as posted
FROM kv_store_e55aa214 
WHERE key LIKE 'creation:%'
  AND value->>'userId' = 'google-oauth2|110247234719945760338'
ORDER BY value->>'createdAt' DESC;

-- Ses générations (non publiées)
SELECT 
  value->>'intent' as intent,
  value->>'status' as status,
  value->>'resultUrl' as image
FROM kv_store_e55aa214 
WHERE key LIKE 'generation:%'
  AND value->>'userId' = 'google-oauth2|110247234719945760338'
ORDER BY value->>'createdAt' DESC;
```

---

## 🎯 **RÉSUMÉ DES CLÉS KV STORE**

| Type | Clé | Contenu |
|------|-----|---------|
| **Génération** | `generation:{genId}` | Objet génération complet |
| **Index générations user** | `user:{userId}:generations` | Array de generationIds |
| **Création (post feed)** | `creation:{creationId}` | Objet création complet |
| **Index posts user** | `user:creations:{userId}` | Array de creationIds |
| **Feed global** | `feed:community:latest` | Array de creationIds (tous users) |
| **Like** | `like:{userId}:{creationId}` | { userId, creationId, createdAt } |
| **Commentaire** | `comment:{commentId}` | Objet commentaire |
| **Index commentaires** | `creation:comments:{creationId}` | Array de commentIds |
| **Follow** | `follow:{followerId}:{followedId}` | { followerId, followedId, createdAt } |
| **Followers** | `user:followers:{userId}` | Array de followerIds |
| **Following** | `user:following:{userId}` | Array de followedIds |

---

## 🚀 **TOP CREATOR PROGRAM TRACKING**

Quand un post est publié, le système track automatiquement :

**Endpoint interne :** `trackCreatorPublish(userId)`

**Stats trackées :**
```json
{
  "userId": "google-oauth2|110247234719945760338",
  "month": "2026-01",
  "creationsCount": 65,       // Total générations ce mois
  "postsPublished": 12,       // Posts publiés sur feed
  "postsWithEnoughLikes": 7,  // Posts avec 5+ likes
  "totalLikes": 342,
  "totalComments": 89,
  "lastUpdated": "2026-01-07T14:25:00.000Z"
}
```

**Clé :** `creator:stats:{userId}:{month}`

**Conditions Top Creator :**
- ✅ 60+ générations dans le mois
- ✅ 5+ posts publiés sur le feed
- ✅ 5+ posts avec 5+ likes chacun

**Bonus Top Creator :**
- 🥥 Accès Coconut V14
- 💰 Commission parrainage augmentée (15% au lieu de 10%)

---

**📅 Dernière mise à jour :** 2026-01-07
**🔧 Status :** ✅ DOCUMENTÉ
