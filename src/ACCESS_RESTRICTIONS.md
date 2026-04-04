# 🔐 ACCESS RESTRICTIONS - Production Ready

## Vue d'ensemble

Le système a 3 types de comptes avec des accès différents :

| Feature | Individual | Enterprise | Developer |
|---------|-----------|------------|-----------|
| **Feed** | ✅ | ❌ | ❌ |
| **Create Hub** | ✅ | ❌ | ❌ |
| **Creator System** | ✅ (si qualifié) | ❌ | ❌ |
| **Coconut V14** | ✅ (si Creator, 3/mois) | ✅ (Unlimited) | ❌ |
| **Dashboard Dev** | ❌ | ❌ | ✅ |
| **API Docs** | ❌ | ❌ | ✅ |

---

## 🎯 COCONUT V14 ACCESS

### **Qui peut accéder**

✅ **Enterprise** : Accès illimité
- Toutes les fonctionnalités (Image, Video, Campaign)
- Pas de quota
- Payé via abonnement 10,000 crédits/mois

✅ **Individual Creators** : Accès limité
- Image & Video uniquement (PAS Campaign)
- 3 générations max par mois calendaire
- Obtenu via :
  - Option A : Qualifications (60 créations + 5 posts + 5 likes)
  - Option B : Achat 1000 crédits

❌ **Individual Non-Creators** : PAS d'accès
- Doivent devenir Creator ou passer en Enterprise

❌ **Developers** : PAS d'accès
- Accès uniquement via API

### **Backend Check**

```typescript
// Dans Coconut V14 routes
const canAccessCoconut = async (userId: string) => {
  const userProfile = await kv.get(`user:profile:${userId}`);
  
  // Enterprise: unlimited access
  if (userProfile.accountType === 'enterprise') {
    return { hasAccess: true, isEnterprise: true, remaining: -1 };
  }
  
  // Individual: check Creator status
  if (userProfile.accountType === 'individual') {
    const creatorAccess = await fetch(`/creators/${userId}/coconut-access`);
    const data = await creatorAccess.json();
    
    if (data.hasCoconutAccess && data.coconutGenerationsRemaining > 0) {
      return { 
        hasAccess: true, 
        isEnterprise: false, 
        remaining: data.coconutGenerationsRemaining,
        canUseCampaign: false // ❌ Campaign blocked for Creators
      };
    }
  }
  
  return { hasAccess: false };
};
```

### **Frontend Check**

```typescript
import { useAuth } from './contexts/AuthContext';

// In Coconut V14 Page
const { user } = useAuth();

// Check access before rendering
useEffect(() => {
  const checkAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.accountType === 'developer') {
      toast.error('Developers cannot access Coconut. Use API instead.');
      navigate('/dashboard-dev');
      return;
    }
    
    if (user.accountType === 'enterprise') {
      setHasAccess(true);
      setIsUnlimited(true);
      return;
    }
    
    // Individual: check Creator status
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${user.id}/coconut-access`,
      { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
    );
    
    const data = await res.json();
    
    if (data.hasCoconutAccess && data.coconutGenerationsRemaining > 0) {
      setHasAccess(true);
      setRemaining(data.coconutGenerationsRemaining);
      setCanUseCampaign(false); // Block Campaign mode
    } else {
      toast.error('You need Creator status to access Coconut');
      navigate('/creator-dashboard');
    }
  };
  
  checkAccess();
}, [user]);
```

---

## 📱 FEED ACCESS

### **Qui peut accéder**

✅ **Individual** : Accès complet
- Voir posts
- Publier posts
- Liker/commenter
- Télécharger créations (avec watermark si non-Creator)

❌ **Enterprise** : PAS d'accès
- Le Feed est pour la communauté, pas pour les entreprises

❌ **Developer** : PAS d'accès
- Les développeurs ont accès uniquement à l'API

### **Backend Check**

```typescript
// Dans feed-routes.ts
app.use('*', async (c, next) => {
  const userId = c.req.header('X-User-ID');
  const user Profile = await kv.get(`user:profile:${userId}`);
  
  if (userProfile.accountType !== 'individual') {
    return c.json({
      success: false,
      error: 'Feed access is only available for Individual accounts'
    }, 403);
  }
  
  await next();
});
```

### **Frontend Check**

```typescript
// In Feed Page
const { user } = useAuth();

useEffect(() => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  if (user.accountType !== 'individual') {
    toast.error('Feed is only available for Individual accounts');
    navigate('/');
  }
}, [user]);
```

---

## 🎨 CREATE HUB ACCESS

### **Qui peut accéder**

✅ **Individual** : Accès complet
- Tous les outils de génération (sauf Coconut si pas Creator)
- Free tier : 25 crédits/mois
- Can buy more credits

❌ **Enterprise** : PAS d'accès
- Utilisent uniquement Coconut V14

❌ **Developer** : PAS d'accès
- Accès uniquement via API

### **Backend Check**

Même logique que le Feed.

### **Frontend Check**

```typescript
// In CreateHub Page
const { user } = useAuth();

useEffect(() => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  if (user.accountType !== 'individual') {
    toast.error('Create Hub is only available for Individual accounts');
    navigate('/');
  }
}, [user]);
```

---

## 👑 CREATOR SYSTEM ACCESS

### **Qui peut accéder**

✅ **Individual** : Oui
- Tout Individual peut devenir Creator en remplissant les conditions
- Affichage de la progression
- Tracking automatique

❌ **Enterprise** : Non
- N'ont pas besoin du système Creator (ont déjà Coconut illimité)

❌ **Developer** : Non

### **Frontend Check**

```typescript
// In Creator Dashboard
const { user } = useAuth();

useEffect(() => {
  if (user?.accountType !== 'individual') {
    navigate('/');
  }
}, [user]);
```

---

## 💻 DASHBOARD DEV & API DOCS ACCESS

### **Qui peut accéder**

✅ **Developer** : Accès complet
- Dashboard Dev avec API keys
- Documentation API
- Analytics d'usage
- Gestion des crédits API

❌ **Individual** : Non

❌ **Enterprise** : Non

### **Backend Check**

```typescript
// Dans API routes
app.use('/dev/*', async (c, next) => {
  const userId = c.req.header('X-User-ID');
  const userProfile = await kv.get(`user:profile:${userId}`);
  
  if (userProfile.accountType !== 'developer') {
    return c.json({
      success: false,
      error: 'Developer Dashboard access is only available for Developer accounts'
    }, 403);
  }
  
  await next();
});
```

### **Frontend Check**

```typescript
// In Dashboard Dev Page
const { user } = useAuth();

useEffect(() => {
  if (!user) {
    navigate('/login');
    return;
  }
  
  if (user.accountType !== 'developer') {
    toast.error('Developer Dashboard is only for Developer accounts');
    navigate('/');
  }
}, [user]);
```

---

## 🏠 LANDING PAGE

La Landing Page est accessible à TOUS (logged in ou non).

Selon le type de compte, elle affiche différents CTAs :

- **Visiteur non-connecté** : "Get Started" → Onboarding
- **Individual** : "Go to Create Hub" ou "Go to Feed"
- **Enterprise** : "Go to Coconut V14"
- **Developer** : "Go to Dashboard Dev"

---

## 📊 ROUTING GUIDE

### **Account Type Redirections**

```typescript
const getDefaultRoute = (accountType: string) => {
  switch (accountType) {
    case 'individual':
      return '/create-hub'; // or /feed
    case 'enterprise':
      return '/coconut-v14';
    case 'developer':
      return '/dashboard-dev';
    default:
      return '/';
  }
};
```

### **Protected Routes**

```typescript
// In Router
const ProtectedRoute = ({ 
  component: Component, 
  allowedAccountTypes 
}: { 
  component: React.ComponentType, 
  allowedAccountTypes: string[] 
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedAccountTypes.includes(user.accountType)) {
    toast.error('You do not have access to this page');
    return <Navigate to={getDefaultRoute(user.accountType)} />;
  }
  
  return <Component />;
};

// Usage
<Route path="/feed" element={
  <ProtectedRoute 
    component={FeedPage} 
    allowedAccountTypes={['individual']} 
  />
} />

<Route path="/coconut-v14" element={
  <ProtectedRoute 
    component={CoconutV14Page} 
    allowedAccountTypes={['individual', 'enterprise']} // Individual needs Creator check
  />
} />

<Route path="/dashboard-dev" element={
  <ProtectedRoute 
    component={DashboardDevPage} 
    allowedAccountTypes={['developer']} 
  />
} />
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Backend**
- [ ] Add access checks in Coconut V14 routes
- [ ] Add access checks in Feed routes
- [ ] Add access checks in Create Hub routes
- [ ] Add access checks in Creator routes
- [ ] Add access checks in Dashboard Dev routes

### **Frontend**
- [ ] Add ProtectedRoute component
- [ ] Add access checks in Coconut V14 Page
- [ ] Add access checks in Feed Page
- [ ] Add access checks in Create Hub Page
- [ ] Add access checks in Creator Dashboard
- [ ] Add access checks in Dashboard Dev Page
- [ ] Update Landing Page CTAs based on account type
- [ ] Add redirect logic after login based on account type

### **UX**
- [ ] Show appropriate error messages for unauthorized access
- [ ] Hide navigation links for unauthorized pages
- [ ] Show "Upgrade to Enterprise" CTA for Individuals in Coconut
- [ ] Show "Become Creator" CTA for non-Creators in Coconut

---

**Production-ready access control system** ✅
