# 🔧 API DASHBOARD - Spécifications Techniques

**Priorité** : 🔴 CRITIQUE  
**Effort** : 3-5 jours  
**Target** : Developer tier users

---

## 🎯 **OBJECTIF**

Créer un dashboard dédié pour les développeurs permettant de :
1. Gérer leurs API keys
2. Voir leurs stats d'usage
3. Accéder à la documentation
4. Tester l'API
5. Gérer les webhooks

---

## 📐 **ARCHITECTURE**

### **Frontend**
```
/components/developer/
  ├── ApiDashboard.tsx           # Main dashboard
  ├── ApiKeysManager.tsx         # Manage API keys
  ├── UsageStatsCard.tsx         # Stats display
  ├── ApiDocumentation.tsx       # Interactive docs
  ├── ApiPlayground.tsx          # Test API calls
  ├── WebhooksConfig.tsx         # Webhooks setup
  └── RateLimitsDisplay.tsx      # Show rate limits
```

### **Backend**
```
/supabase/functions/server/
  ├── api-keys-routes.ts         # CRUD API keys
  ├── api-usage-routes.ts        # Usage tracking
  ├── api-webhooks-routes.ts     # Webhooks management
  └── api-docs-routes.ts         # Serve docs
```

---

## 🔑 **1. API KEYS MANAGEMENT**

### **Database Schema (KV Store)**

```typescript
// Key: `api:key:{keyId}`
interface ApiKey {
  id: string;                    // "ak_1234567890abcdef"
  userId: string;
  name: string;                  // "Production Key"
  key: string;                   // "ck_live_abc123..." (hashed)
  prefix: string;                // "ck_live_" (visible)
  lastChars: string;             // "...xyz" (last 4)
  environment: 'test' | 'live';
  status: 'active' | 'revoked';
  permissions: string[];         // ["generate", "analyze", "cocoboard"]
  rateLimit: {
    requestsPerHour: number;     // 1000
    requestsPerDay: number;      // 10000
  };
  usage: {
    totalRequests: number;
    lastUsed: string;            // ISO date
  };
  createdAt: string;
  revokedAt?: string;
}

// Key: `api:user:${userId}:keys`
interface UserApiKeys {
  userId: string;
  keys: string[];                // Array of key IDs
  activeCount: number;
  totalCount: number;
}
```

### **Routes Backend**

```typescript
// GET /api/keys
// Get all API keys for user
app.get('/api/keys', async (c) => {
  const userId = getUserFromAuth(c);
  const userKeys = await kv.get(`api:user:${userId}:keys`);
  
  const keys = await Promise.all(
    userKeys.keys.map(keyId => kv.get(`api:key:${keyId}`))
  );
  
  // Return sanitized (no full key)
  return c.json({
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      lastChars: k.lastChars,
      environment: k.environment,
      status: k.status,
      permissions: k.permissions,
      usage: k.usage,
      createdAt: k.createdAt
    }))
  });
});

// POST /api/keys
// Create new API key
app.post('/api/keys', async (c) => {
  const { name, environment, permissions } = await c.req.json();
  const userId = getUserFromAuth(c);
  
  // Generate key
  const keyId = `ak_${Date.now()}_${randomString(16)}`;
  const fullKey = `ck_${environment}_${randomString(32)}`;
  const hashedKey = await hashKey(fullKey); // Use bcrypt
  
  const apiKey: ApiKey = {
    id: keyId,
    userId,
    name,
    key: hashedKey,
    prefix: `ck_${environment}_`,
    lastChars: fullKey.slice(-4),
    environment,
    status: 'active',
    permissions,
    rateLimit: {
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    usage: {
      totalRequests: 0,
      lastUsed: null
    },
    createdAt: new Date().toISOString()
  };
  
  await kv.set(`api:key:${keyId}`, apiKey);
  
  // Update user keys list
  const userKeys = await kv.get(`api:user:${userId}:keys`) || { keys: [] };
  userKeys.keys.push(keyId);
  userKeys.activeCount = (userKeys.activeCount || 0) + 1;
  userKeys.totalCount = (userKeys.totalCount || 0) + 1;
  await kv.set(`api:user:${userId}:keys`, userKeys);
  
  // Return full key ONLY ONCE (never stored plain)
  return c.json({
    success: true,
    key: fullKey,  // ⚠️ Show only once!
    apiKey: {
      id: keyId,
      name,
      prefix: apiKey.prefix,
      lastChars: apiKey.lastChars
    }
  });
});

// DELETE /api/keys/:keyId
// Revoke API key
app.delete('/api/keys/:keyId', async (c) => {
  const keyId = c.req.param('keyId');
  const userId = getUserFromAuth(c);
  
  const apiKey = await kv.get(`api:key:${keyId}`);
  
  if (!apiKey || apiKey.userId !== userId) {
    return c.json({ error: 'Key not found' }, 404);
  }
  
  apiKey.status = 'revoked';
  apiKey.revokedAt = new Date().toISOString();
  await kv.set(`api:key:${keyId}`, apiKey);
  
  return c.json({ success: true });
});
```

### **UI Component**

```tsx
// /components/developer/ApiKeysManager.tsx
export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const createKey = async (name: string, env: 'test' | 'live') => {
    const response = await fetch('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name, environment: env })
    });
    const data = await response.json();
    
    // Show key ONCE
    setNewKey(data.key);
    loadKeys();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Keys</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create New Key
        </Button>
      </div>

      {/* Keys list */}
      <div className="space-y-4">
        {keys.map(key => (
          <Card key={key.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{key.name}</h3>
                <code className="text-sm text-muted">
                  {key.prefix}•••{key.lastChars}
                </code>
                <div className="mt-2 space-x-2">
                  <Badge>{key.environment}</Badge>
                  <Badge variant={key.status === 'active' ? 'success' : 'error'}>
                    {key.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm">
                <div>Requests: {key.usage.totalRequests}</div>
                <div>Last used: {formatDate(key.usage.lastUsed)}</div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => revokeKey(key.id)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Show new key ONCE */}
      {newKey && (
        <AlertDialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>🔑 Your API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Save this key now. It won't be shown again!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 bg-muted rounded font-mono text-sm">
              {newKey}
            </div>
            <Button onClick={() => copyToClipboard(newKey)}>
              Copy to Clipboard
            </Button>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
```

---

## 📊 **2. USAGE STATISTICS**

### **Tracking**

```typescript
// Key: `api:usage:${userId}:${date}` (date = YYYY-MM-DD)
interface DailyUsage {
  userId: string;
  date: string;
  requests: {
    total: number;
    byEndpoint: Record<string, number>;  // "/generate": 50
    byStatus: Record<string, number>;    // "200": 45, "400": 5
  };
  credits: {
    used: number;
    byModel: Record<string, number>;     // "flux-2-pro": 10
  };
  errors: {
    total: number;
    byCode: Record<string, number>;      // "rate_limit": 2
  };
}

// Middleware pour tracker chaque request API
async function trackApiUsage(userId: string, endpoint: string, status: number) {
  const date = new Date().toISOString().split('T')[0];
  const key = `api:usage:${userId}:${date}`;
  
  const usage = await kv.get(key) || {
    userId,
    date,
    requests: { total: 0, byEndpoint: {}, byStatus: {} },
    credits: { used: 0, byModel: {} },
    errors: { total: 0, byCode: {} }
  };
  
  usage.requests.total++;
  usage.requests.byEndpoint[endpoint] = (usage.requests.byEndpoint[endpoint] || 0) + 1;
  usage.requests.byStatus[status] = (usage.requests.byStatus[status] || 0) + 1;
  
  await kv.set(key, usage);
}
```

### **UI Dashboard**

```tsx
// /components/developer/UsageStatsCard.tsx
export function UsageStatsCard() {
  const [stats, setStats] = useState<DailyUsage[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard
            label="Total Requests"
            value={sumRequests(stats)}
            trend="+12%"
          />
          <StatsCard
            label="Credits Used"
            value={sumCredits(stats)}
            trend="-5%"
          />
          <StatsCard
            label="Success Rate"
            value="98.5%"
            trend="+2%"
          />
        </div>

        {/* Chart */}
        <LineChart data={stats} />

        {/* Top endpoints */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Top Endpoints</h4>
          <div className="space-y-2">
            {getTopEndpoints(stats).map(({ endpoint, count }) => (
              <div key={endpoint} className="flex justify-between">
                <code className="text-sm">{endpoint}</code>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📚 **3. DOCUMENTATION INTERACTIVE**

### **Spec OpenAPI**

```yaml
# /public/api-spec.yaml
openapi: 3.0.0
info:
  title: Cortexia API
  version: 1.0.0
  description: AI Generation API

servers:
  - url: https://{projectId}.supabase.co/functions/v1/make-server-e55aa214
    variables:
      projectId:
        default: your-project-id

security:
  - ApiKeyAuth: []

paths:
  /generate:
    post:
      summary: Generate image
      parameters:
        - name: Authorization
          in: header
          required: true
          schema:
            type: string
            example: "Bearer ck_live_abc123..."
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                  example: "A beautiful sunset"
                options:
                  type: object
                  properties:
                    model:
                      type: string
                      enum: [zimage, flux-2-pro]
                    width:
                      type: number
                      example: 1024
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  url:
                    type: string
```

### **UI Interactive Docs**

```tsx
// /components/developer/ApiDocumentation.tsx
export function ApiDocumentation() {
  return (
    <div className="grid grid-cols-[300px_1fr] gap-6">
      {/* Sidebar navigation */}
      <nav className="space-y-2">
        <NavItem href="#authentication">Authentication</NavItem>
        <NavItem href="#generate">Generate Image</NavItem>
        <NavItem href="#analyze">Analyze Intent</NavItem>
        <NavItem href="#webhooks">Webhooks</NavItem>
      </nav>

      {/* Content */}
      <div className="space-y-8">
        <Section id="authentication">
          <h2>Authentication</h2>
          <p>Use your API key in the Authorization header:</p>
          <CodeBlock language="bash">
            {`curl -X POST \\
  -H "Authorization: Bearer ck_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A sunset"}' \\
  https://api.cortexia.com/generate`}
          </CodeBlock>
        </Section>

        <Section id="generate">
          <h2>Generate Image</h2>
          <EndpointCard
            method="POST"
            path="/generate"
            description="Generate an image from a prompt"
          />
          
          {/* Try it now */}
          <ApiPlayground endpoint="/generate" />
        </Section>
      </div>
    </div>
  );
}
```

---

## 🧪 **4. API PLAYGROUND**

```tsx
// /components/developer/ApiPlayground.tsx
export function ApiPlayground({ endpoint }: { endpoint: string }) {
  const [request, setRequest] = useState({
    prompt: "A beautiful sunset over mountains",
    options: { model: "zimage", width: 1024, height: 1024 }
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${selectedApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Try it now</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Request editor */}
          <div>
            <h4 className="mb-2">Request</h4>
            <CodeEditor
              value={JSON.stringify(request, null, 2)}
              onChange={setRequest}
              language="json"
            />
            <Button onClick={sendRequest} disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>

          {/* Response display */}
          <div>
            <h4 className="mb-2">Response</h4>
            {response && (
              <div>
                <Badge>{response.status}</Badge>
                <CodeBlock language="json">
                  {JSON.stringify(response.data, null, 2)}
                </CodeBlock>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 **DESIGN SYSTEM**

Utiliser le **Coconut Warm** pour cohérence :

```css
/* API Dashboard colors */
.api-dashboard {
  --api-primary: var(--coconut-secondary);     /* #D4A574 */
  --api-background: var(--coconut-bg);
  --api-card: var(--coconut-card);
  --api-success: #10b981;
  --api-error: #ef4444;
  --api-warning: #f59e0b;
}
```

---

## ✅ **CHECKLIST IMPLÉMENTATION**

### **Backend (2 jours)**
- [ ] `api-keys-routes.ts` - CRUD keys
- [ ] `api-usage-routes.ts` - Tracking
- [ ] Middleware pour tracker requests
- [ ] Rate limiting par key
- [ ] Tests Postman

### **Frontend (2 jours)**
- [ ] ApiDashboard.tsx - Layout principal
- [ ] ApiKeysManager.tsx - Manage keys
- [ ] UsageStatsCard.tsx - Stats
- [ ] ApiDocumentation.tsx - Docs interactives
- [ ] ApiPlayground.tsx - Test API

### **Integration (1 jour)**
- [ ] Routing dans App.tsx
- [ ] Auth guard (developer only)
- [ ] Navigation depuis onboarding
- [ ] Tests E2E

---

## 🚀 **NEXT STEPS**

1. **Créer les routes backend** (1j)
2. **Créer le layout dashboard** (0.5j)
3. **Implémenter ApiKeysManager** (1j)
4. **Implémenter UsageStats** (0.5j)
5. **Créer documentation** (1j)
6. **Tests + polish** (1j)

**TOTAL** : **5 jours**

---

**Prêt pour implémentation** ✅
