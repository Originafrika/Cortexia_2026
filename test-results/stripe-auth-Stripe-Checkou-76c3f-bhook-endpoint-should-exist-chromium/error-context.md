# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stripe-auth.spec.ts >> Stripe Checkout Flow >> Stripe webhook endpoint should exist
- Location: tests\stripe-auth.spec.ts:47:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 404
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - region "Notifications alt+T"
    - generic [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img [ref=e8]
          - generic [ref=e10]: Cortexia
        - generic [ref=e11]:
          - link "Preview Coconut V14" [ref=e12] [cursor=pointer]:
            - /url: /coconut-v14
            - img [ref=e13]
            - generic [ref=e15]: Preview Coconut V14
          - generic [ref=e16]:
            - button "Switch to English" [ref=e18]: EN
            - button "Switch to French" [ref=e19]: FR
          - button "Sign In" [ref=e20]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img [ref=e28]
          - generic [ref=e30]: The Fluid State
        - heading "Stop Creating. Start Conducting." [level=1] [ref=e31]:
          - generic [ref=e32]: Stop Creating.
          - generic [ref=e33]: Start Conducting.
        - paragraph [ref=e34]:
          - text: What if you could think a campaign into existence?
          - text: Cortexia orchestrates AI into flowing symphonies of creativity.
        - button "Enter the Fluid State" [ref=e36]:
          - generic [ref=e38]:
            - text: Enter the Fluid State
            - img [ref=e39]
        - paragraph [ref=e41]: Trusted by creative teams worldwide • 25 free credits every month
      - generic [ref=e48]:
        - generic [ref=e49]:
          - img [ref=e53]
          - generic [ref=e58]:
            - generic [ref=e59]: 0+
            - paragraph [ref=e60]: Créateurs Actifs
        - generic [ref=e61]:
          - img [ref=e65]
          - generic [ref=e69]:
            - generic [ref=e70]: 0.0M+
            - paragraph [ref=e71]: Images Générées
        - generic [ref=e72]:
          - img [ref=e76]
          - generic [ref=e78]:
            - generic [ref=e79]: 0K
            - paragraph [ref=e80]: Crédits Distribués
        - generic [ref=e81]:
          - img [ref=e85]
          - generic [ref=e88]:
            - generic [ref=e89]: 0%
            - paragraph [ref=e90]: Taux de Satisfaction
      - generic [ref=e92]:
        - heading "You're drowning in subscriptions. Midjourney. Runway. ElevenLabs. ChatGPT." [level=2] [ref=e93]:
          - text: You're drowning in subscriptions.
          - text: Midjourney. Runway. ElevenLabs. ChatGPT.
        - paragraph [ref=e94]:
          - text: Five tabs open. Three logins. One exhausted creative.
          - text: There has to be a better way.
        - generic [ref=e95]:
          - generic [ref=e96]: Midjourney
          - generic [ref=e97]: RunwayML
          - generic [ref=e98]: ElevenLabs
          - generic [ref=e99]: ChatGPT
          - generic [ref=e100]: Figma
          - generic [ref=e101]: Canva
          - generic [ref=e102]: CapCut
          - generic [ref=e103]: Photoshop
      - generic [ref=e105]:
        - heading "Imagine this instead." [level=2] [ref=e107]
        - generic [ref=e108]:
          - generic [ref=e110]:
            - generic [ref=e111]: Before Cortexia
            - generic [ref=e112]:
              - generic [ref=e115]: 3 hours switching between tools
              - generic [ref=e118]: Inconsistent brand visuals
              - generic [ref=e121]: $400/month in subscriptions
              - generic [ref=e124]: Creative burnout by Friday
          - generic [ref=e126]:
            - generic [ref=e127]: With Cortexia
            - generic [ref=e128]:
              - generic [ref=e131]: One brief. One platform. One flow.
              - generic [ref=e134]: Brand-perfect consistency
              - generic [ref=e137]: Pay only for what you create
              - generic [ref=e140]: Creative energy restored
      - generic [ref=e142]:
        - 'heading "✨ Three paths. One destination: Creative freedom." [level=2] [ref=e144]':
          - text: "✨ Three paths. One destination:"
          - text: Creative freedom.
        - generic [ref=e145]:
          - generic [ref=e148]:
            - img [ref=e150]
            - generic [ref=e154]: For Teams & Brands
            - heading "Launch campaigns that look like they cost $500k." [level=3] [ref=e155]
            - paragraph [ref=e156]: In 6 minutes.
            - paragraph [ref=e157]: Imagine briefing your team at 9am—and watching a complete 6-week campaign materialize by lunch. Instagram stories. TikTok ads. YouTube thumbnails. Email headers. All brand-perfect. All ready to launch.
            - generic [ref=e158]:
              - generic [ref=e159]:
                - img [ref=e160]
                - generic [ref=e162]: From one brief to 50 assets across every channel
              - generic [ref=e163]:
                - img [ref=e164]
                - generic [ref=e166]: Brand consistency that feels effortless
              - generic [ref=e167]:
                - img [ref=e168]
                - generic [ref=e170]: Your creative team restored, not replaced
            - generic [ref=e172]: → This is Coconut V14. Enterprise orchestration.
            - button "See Enterprise Power" [ref=e173]:
              - generic [ref=e174]:
                - text: See Enterprise Power
                - img [ref=e175]
          - generic [ref=e179]:
            - img [ref=e181]
            - generic [ref=e183]: For Solo Creators
            - heading "Turn 'I wish I could...' into 'Look what I made.'" [level=3] [ref=e184]
            - paragraph [ref=e185]: Your ideas deserve to look this good.
            - paragraph [ref=e186]: That campaign idea you sketched at 2am? The product photoshoot you can't afford? The avatar that brings your brand to life? Create it. Share it. Get discovered. Become a Top Creator and unlock the same tools the brands use.
            - generic [ref=e187]:
              - generic [ref=e188]:
                - img [ref=e189]
                - generic [ref=e191]: Generate stunning images, videos, avatars
              - generic [ref=e192]:
                - img [ref=e193]
                - generic [ref=e195]: Share with a community that gets it
              - generic [ref=e196]:
                - img [ref=e197]
                - generic [ref=e199]: Earn rewards for creativity, not just followers
            - generic [ref=e201]: → 25 free credits every month. Forever.
            - button "Start Creating Free" [ref=e202]:
              - generic [ref=e203]:
                - text: Start Creating Free
                - img [ref=e204]
          - generic [ref=e208]:
            - img [ref=e210]
            - generic [ref=e212]: For Developers
            - heading "Stop building AI from scratch." [level=3] [ref=e213]
            - paragraph [ref=e214]: Ship product features, not infrastructure.
            - paragraph [ref=e215]: Your users want AI image generation. AI video. AI avatars. You want to ship next week—not spend 3 months wrangling APIs, handling rate limits, and debugging prompt engineering. Plug in Cortexia. Ship today.
            - generic [ref=e216]:
              - generic [ref=e217]:
                - img [ref=e218]
                - generic [ref=e220]: REST API with webhooks and real-time updates
              - generic [ref=e221]:
                - img [ref=e222]
                - generic [ref=e224]: Multi-model orchestration out of the box
              - generic [ref=e225]:
                - img [ref=e226]
                - generic [ref=e228]: 100 requests/min. No surprise rate limits.
            - generic [ref=e230]: → Full docs. Multi-language SDKs. Live support.
            - button "Explore API Docs" [ref=e231]:
              - generic [ref=e232]:
                - text: Explore API Docs
                - img [ref=e233]
        - paragraph [ref=e236]: All paths start free • Choose yours in 60 seconds
      - generic [ref=e240]:
        - heading "Loved by creators. Trusted by teams. Built for developers." [level=2] [ref=e242]:
          - text: Loved by creators.
          - text: Trusted by teams. Built for developers.
        - generic [ref=e243]:
          - generic [ref=e244]:
            - generic [ref=e245]: "\""
            - paragraph [ref=e246]: I used to spend 40 hours a week managing our social content pipeline. Now I spend 4. Cortexia doesn't just save time—it gave me my creativity back.
            - generic [ref=e247]:
              - generic [ref=e248]: SC
              - generic [ref=e249]:
                - generic [ref=e250]: Sarah Chen
                - generic [ref=e251]: Creative Director, NovaTech
          - generic [ref=e252]:
            - generic [ref=e253]: "\""
            - paragraph [ref=e254]: The first time I saw my sketches turn into professional product shots, I actually teared up. Now I'm a Top Creator earning from my art.
            - generic [ref=e255]:
              - generic [ref=e256]: JM
              - generic [ref=e257]:
                - generic [ref=e258]: Jordan Martinez
                - generic [ref=e259]: Product Designer & Creator
          - generic [ref=e260]:
            - generic [ref=e261]: "\""
            - paragraph [ref=e262]: We shipped AI avatars in our app in 3 days. Our users think we built it from scratch. The API is that good.
            - generic [ref=e263]:
              - generic [ref=e264]: DP
              - generic [ref=e265]:
                - generic [ref=e266]: Dev Patel
                - generic [ref=e267]: CTO, Streamline Apps
      - generic [ref=e272]:
        - heading "Ready to conduct your masterpiece? Choose your profile. Enter the fluid state." [level=2] [ref=e273]:
          - text: Ready to conduct your masterpiece?
          - text: Choose your profile. Enter the fluid state.
        - paragraph [ref=e274]:
          - text: Start free.
          - generic [ref=e275]: Scale forever.
        - button "Enter the Fluid State" [ref=e276]:
          - generic [ref=e278]:
            - text: Enter the Fluid State
            - img [ref=e279]
        - paragraph [ref=e281]: No credit card required • 25 free credits every month • Choose your profile in 60 seconds
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Stripe Checkout Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:3000/');
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should navigate to credits purchase page', async ({ page }) => {
  10 |     await page.goto('http://localhost:3000/coconut-v14');
  11 |     await page.waitForLoadState('networkidle');
  12 |     
  13 |     // Look for credits/wallet section
  14 |     const creditsSection = page.getByText(/credits?|wallet|acheter/i).first();
  15 |     const hasCredits = await creditsSection.isVisible({ timeout: 5000 }).catch(() => false);
  16 |     
  17 |     if (hasCredits) {
  18 |       // Click on credits purchase
  19 |       const buyButton = page.getByRole('button', { name: /acheter|buy|purchase/i }).first();
  20 |       if (await buyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  21 |         await buyButton.click();
  22 |         await page.waitForTimeout(2000);
  23 |         
  24 |         // Should show pricing options
  25 |         const pricing = page.getByText(/enterprise|1000|5000|10000/i);
  26 |         const hasPricing = await pricing.isVisible({ timeout: 5000 }).catch(() => false);
  27 |         expect(hasPricing).toBe(true);
  28 |       }
  29 |     }
  30 |   });
  31 | 
  32 |   test('should display Stripe checkout session creation', async ({ page }) => {
  33 |     // Test the API endpoint directly
  34 |     const response = await page.request.post('http://localhost:3000/api/stripe/checkout', {
  35 |       data: {
  36 |         type: 'credits_1000',
  37 |         successUrl: 'http://localhost:3000/success',
  38 |         cancelUrl: 'http://localhost:3000/cancel'
  39 |       }
  40 |     });
  41 | 
  42 |     // Should return 401 (unauthorized) because no auth, not 500 (server error)
  43 |     expect(response.status()).toBeGreaterThanOrEqual(400);
  44 |     expect(response.status()).toBeLessThan(500);
  45 |   });
  46 | 
  47 |   test('Stripe webhook endpoint should exist', async ({ page }) => {
  48 |     // Test webhook endpoint exists (will fail signature but endpoint should exist)
  49 |     const response = await page.request.post('http://localhost:3000/api/stripe/webhook', {
  50 |       data: { type: 'test' }
  51 |     });
  52 | 
  53 |     // Should return 400 (signature missing) not 404 (endpoint not found)
> 54 |     expect(response.status()).toBe(400);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  55 |   });
  56 | });
  57 | 
  58 | test.describe('Auth API Endpoints', () => {
  59 |   test('signup endpoint should work', async ({ page }) => {
  60 |     const response = await page.request.post('http://localhost:3000/api/auth/signup', {
  61 |       data: {
  62 |         email: 'test@example.com',
  63 |         password: 'testpassword123',
  64 |         name: 'Test User'
  65 |       }
  66 |     });
  67 | 
  68 |     // Should work (200 or 400 for duplicate)
  69 |     expect(response.status()).toBeLessThan(500);
  70 |   });
  71 | 
  72 |   test('signin endpoint should work', async ({ page }) => {
  73 |     const response = await page.request.post('http://localhost:3000/api/auth/signin', {
  74 |       data: {
  75 |         email: 'test@example.com',
  76 |         password: 'testpassword123'
  77 |       }
  78 |     });
  79 | 
  80 |     expect(response.status()).toBeLessThan(500);
  81 |   });
  82 | });
```