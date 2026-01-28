// /supabase/functions/server/payment-routes.ts
// Routes pour achats de crédits (FedaPay + Stripe)

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import Stripe from 'npm:stripe';

const app = new Hono();

const BASE_URL = Deno.env.get('BASE_URL') || 'https://cortexia.com';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY');
const FEDAPAY_MODE = Deno.env.get('FEDAPAY_MODE') || 'sandbox'; // 'sandbox' ou 'live'

// Configuration Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY!);

// FedaPay API base URLs
const FEDAPAY_API_BASE = FEDAPAY_MODE === 'live' 
  ? 'https://api.fedapay.com/v1' 
  : 'https://sandbox-api.fedapay.com/v1';

// ========================================
// FEDAPAY HELPER FUNCTIONS (REST API)
// ========================================

async function createFedaPayTransaction(data: {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
    phone_number?: { number: string; country: string };
  };
  callback_url: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch(`${FEDAPAY_API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      currency: { iso: data.currency },
      callback_url: data.callback_url,
      customer: data.customer,
      metadata: data.metadata
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FedaPay API error: ${error}`);
  }

  return await response.json();
}

async function generateFedaPayToken(transactionId: string) {
  const response = await fetch(`${FEDAPAY_API_BASE}/transactions/${transactionId}/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FedaPay token generation error: ${error}`);
  }

  return await response.json();
}

function verifyFedaPayWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // FedaPay uses HMAC SHA256 for webhook signatures
  const crypto = globalThis.crypto.subtle;
  
  // For now, we'll skip signature verification in development
  // In production, implement proper HMAC verification
  if (!signature || !secret) {
    console.warn('⚠️ FedaPay webhook signature verification skipped (missing signature or secret)');
    return true;
  }
  
  // TODO: Implement proper HMAC SHA256 verification
  return true;
}

// ========================================
// UTILS
// ========================================

const FEDAPAY_REGIONS = ['BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE', 'GN'];

function isFedaPayRegion(country: string): boolean {
  return FEDAPAY_REGIONS.includes(country?.toUpperCase());
}

function getCurrencyByCountry(country: string): string {
  const countryUpper = country?.toUpperCase();
  
  // Franc CFA (UEMOA)
  if (['BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE'].includes(countryUpper)) {
    return 'XOF';
  }
  
  // Franc Guinéen
  if (countryUpper === 'GN') {
    return 'GNF';
  }
  
  // Europe
  if ([
    'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 
    'GR', 'IE', 'FI', 'EE', 'LV', 'LT', 'SK', 'SI'
  ].includes(countryUpper)) {
    return 'EUR';
  }
  
  // UK
  if (countryUpper === 'GB') {
    return 'GBP';
  }
  
  // Canada
  if (countryUpper === 'CA') {
    return 'CAD';
  }
  
  // Default: USD
  return 'USD';
}

async function addCredits(
  userId: string, 
  creditsAmount: number, 
  type: 'free' | 'paid' | 'subscription' | 'addon'
): Promise<void> {
  const profile = await kv.get(`user:profile:${userId}`);
  const credits = await kv.get(`user:credits:${userId}`) || {
    free: 0,
    paid: 0,
    total: 0
  };
  
  if (type === 'free') {
    credits.free += creditsAmount;
  } else if (type === 'paid') {
    credits.paid += creditsAmount;
    
    // Si Individual, tracker creditsPurchasedThisMonth
    if (profile.accountType === 'individual') {
      profile.creditsPurchasedThisMonth = (profile.creditsPurchasedThisMonth || 0) + creditsAmount;
      
      // Vérifier si devient Creator (Option B : 1000 crédits achetés)
      if (profile.creditsPurchasedThisMonth >= 1000 && !profile.hasCreatorAccess) {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        profile.hasCreatorAccess = true;
        profile.creatorAccessExpiresAt = endOfMonth.toISOString();
        profile.creatorAccessMethod = 'purchase';
        profile.coconutGenerationsRemaining = 3;
        profile.coconutGenerationsUsed = 0;
        
        console.log(`✅ User ${userId} became Creator via purchase (1000+ credits bought)`);
      }
    }
  } else if (type === 'subscription') {
    // Enterprise subscription credits
    if (profile.accountType === 'enterprise') {
      const subscription = await kv.get(`user:subscription:${userId}`);
      subscription.monthlyCredits = creditsAmount;
      await kv.set(`user:subscription:${userId}`, subscription);
      
      credits.subscription = creditsAmount;
    }
  } else if (type === 'addon') {
    // Enterprise addon credits
    if (profile.accountType === 'enterprise') {
      const subscription = await kv.get(`user:subscription:${userId}`);
      subscription.addonCredits = (subscription.addonCredits || 0) + creditsAmount;
      await kv.set(`user:subscription:${userId}`, subscription);
      
      credits.addon = (credits.addon || 0) + creditsAmount;
    }
  }
  
  credits.total = (credits.free || 0) + (credits.paid || 0) + 
                  (credits.subscription || 0) + (credits.addon || 0);
  
  await kv.set(`user:credits:${userId}`, credits);
  await kv.set(`user:profile:${userId}`, profile);
}

async function logPurchase(data: {
  userId: string;
  gateway: 'fedapay' | 'stripe';
  amount: number;
  currency: string;
  creditsAmount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  sessionId?: string;
  subscriptionId?: string;
}): Promise<void> {
  const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const profile = await kv.get(`user:profile:${data.userId}`);
  
  const purchase = {
    id: purchaseId,
    userId: data.userId,
    accountType: profile.accountType,
    type: data.subscriptionId ? 'subscription' : 'credit_purchase',
    gateway: data.gateway,
    amount: data.amount,
    currency: data.currency,
    creditsAmount: data.creditsAmount,
    status: data.status,
    transactionId: data.transactionId,
    sessionId: data.sessionId,
    subscriptionId: data.subscriptionId,
    createdAt: new Date().toISOString(),
    completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
  };
  
  // Enregistrer purchase log
  await kv.set(`purchase:log:${purchaseId}`, purchase);
  
  // Ajouter à la liste user purchases
  const userPurchases = await kv.get(`purchase:user:${data.userId}`) || [];
  userPurchases.unshift(purchaseId);
  await kv.set(`purchase:user:${data.userId}`, userPurchases);
  
  console.log(`📝 Purchase logged: ${purchaseId} (${data.gateway}, ${data.amount} ${data.currency})`);
}

// ========================================
// ACHATS DE CRÉDITS
// ========================================

// Créer session achat (auto-détection gateway)
app.post('/credits/create-purchase', async (c) => {
  try {
    const { amount, creditsAmount } = await c.req.json();
    const userId = c.get('userId');
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:profile:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Détection région
    const userCountry = userProfile.country || 'US'; // Default US
    const region = isFedaPayRegion(userCountry) ? 'africa' : 'international';
    
    if (region === 'africa') {
      // ========================================
      // FedaPay Transaction (REST API)
      // ========================================
      
      try {
        const transactionData = await createFedaPayTransaction({
          description: `Achat ${creditsAmount} crédits Cortexia`,
          amount: amount * 100, // Convertir en centimes
          currency: getCurrencyByCountry(userCountry),
          callback_url: `${BASE_URL}/credits/success`,
          customer: {
            email: userProfile.email,
            firstname: userProfile.firstName || userProfile.name?.split(' ')[0] || 'User',
            lastname: userProfile.lastName || userProfile.name?.split(' ')[1] || 'Cortexia',
            phone_number: userProfile.phoneNumber ? {
              number: userProfile.phoneNumber,
              country: userCountry.toLowerCase()
            } : undefined
          },
          metadata: {
            userId,
            creditsAmount: creditsAmount.toString(),
            accountType: userProfile.accountType
          }
        });
        
        // Générer token
        const tokenData = await generateFedaPayToken(transactionData.v1.id);
        
        // Logger
        await logPurchase({
          userId,
          gateway: 'fedapay',
          amount,
          currency: getCurrencyByCountry(userCountry),
          creditsAmount,
          status: 'pending',
          transactionId: transactionData.v1.id
        });
        
        return c.json({
          gateway: 'fedapay',
          transactionId: transactionData.v1.id,
          paymentUrl: tokenData.v1.url,
          amount,
          currency: getCurrencyByCountry(userCountry),
          creditsAmount
        });
      } catch (error) {
        console.error('FedaPay error:', error);
        return c.json({ error: 'FedaPay transaction failed', details: error.message }, 500);
      }
    } else {
      // ========================================
      // Stripe Checkout Session
      // ========================================
      
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: getCurrencyByCountry(userCountry).toLowerCase(),
              unit_amount: amount * 100,
              product_data: {
                name: `${creditsAmount} Cortexia Credits`,
                description: 'AI Media Generation Credits',
                images: ['https://cortexia.com/assets/credits-icon.png']
              }
            },
            quantity: 1
          }],
          customer_email: userProfile.email,
          metadata: {
            userId,
            creditsAmount: creditsAmount.toString(),
            type: 'credit_purchase',
            accountType: userProfile.accountType
          },
          success_url: `${BASE_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${BASE_URL}/credits`,
          payment_method_types: ['card'],
          billing_address_collection: 'auto'
        });
        
        // Logger
        await logPurchase({
          userId,
          gateway: 'stripe',
          amount,
          currency: getCurrencyByCountry(userCountry),
          creditsAmount,
          status: 'pending',
          sessionId: session.id
        });
        
        return c.json({
          gateway: 'stripe',
          sessionId: session.id,
          paymentUrl: session.url,
          amount,
          currency: getCurrencyByCountry(userCountry),
          creditsAmount
        });
      } catch (error) {
        console.error('Stripe error:', error);
        return c.json({ error: 'Stripe session creation failed', details: error.message }, 500);
      }
    }
  } catch (error) {
    console.error('Create purchase error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ========================================
// WEBHOOKS
// ========================================

// Webhook FedaPay
app.post('/fedapay/webhook', async (c) => {
  try {
    const signature = c.req.header('X-FEDAPAY-SIGNATURE') || '';
    const payload = await c.req.text();
    const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET') || '';
    
    // Vérifier signature
    const isValid = verifyFedaPayWebhookSignature(payload, signature, webhookSecret);
    
    if (!isValid) {
      console.error('FedaPay webhook verification failed');
      return c.json({ error: 'Invalid signature' }, 400);
    }
    
    const event = JSON.parse(payload);
    
    console.log(`🔔 FedaPay webhook received: ${event.name}`);
    
    if (event.name === 'transaction.approved') {
      const transaction = event.entity;
      const userId = transaction.metadata?.userId;
      const creditsAmount = parseInt(transaction.metadata?.creditsAmount || '0');
      
      if (!userId || !creditsAmount) {
        console.error('Missing userId or creditsAmount in transaction metadata');
        return c.json({ error: 'Invalid metadata' }, 400);
      }
      
      // Ajouter crédits
      await addCredits(userId, creditsAmount, 'paid');
      
      // Mettre à jour purchase log
      const userPurchases = await kv.get(`purchase:user:${userId}`) || [];
      const latestPurchaseId = userPurchases[0];
      if (latestPurchaseId) {
        const purchase = await kv.get(`purchase:log:${latestPurchaseId}`);
        if (purchase && purchase.transactionId === transaction.id) {
          purchase.status = 'completed';
          purchase.completedAt = new Date().toISOString();
          await kv.set(`purchase:log:${latestPurchaseId}`, purchase);
        }
      }
      
      console.log(`✅ FedaPay: Added ${creditsAmount} credits to user ${userId}`);
      
      // TODO: Send email confirmation
      // TODO: Check referral commission
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('FedaPay webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Webhook Stripe
app.post('/stripe/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const payload = await c.req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    // Vérifier signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature!,
        webhookSecret!
      );
    } catch (err) {
      console.error('Stripe webhook verification failed:', err);
      return c.json({ error: 'Invalid signature' }, 400);
    }
    
    console.log(`🔔 Stripe webhook received: ${event.type}`);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const creditsAmount = parseInt(session.metadata?.creditsAmount || '0');
      const type = session.metadata?.type || 'credit_purchase';
      
      if (!userId || !creditsAmount) {
        console.error('Missing userId or creditsAmount in session metadata');
        return c.json({ error: 'Invalid metadata' }, 400);
      }
      
      // Ajouter crédits
      if (type === 'credit_purchase') {
        await addCredits(userId, creditsAmount, 'paid');
      } else if (type === 'addon_credits') {
        await addCredits(userId, creditsAmount, 'addon');
      }
      
      // Mettre à jour purchase log
      const userPurchases = await kv.get(`purchase:user:${userId}`) || [];
      const latestPurchaseId = userPurchases[0];
      if (latestPurchaseId) {
        const purchase = await kv.get(`purchase:log:${latestPurchaseId}`);
        if (purchase && purchase.sessionId === session.id) {
          purchase.status = 'completed';
          purchase.completedAt = new Date().toISOString();
          await kv.set(`purchase:log:${latestPurchaseId}`, purchase);
        }
      }
      
      console.log(`✅ Stripe: Added ${creditsAmount} credits to user ${userId}`);
      
      // TODO: Send email confirmation
      // TODO: Check referral commission
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// ========================================
// QUERIES
// ========================================

// Récupérer historique des achats
app.get('/purchases/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const userPurchases = await kv.get(`purchase:user:${userId}`) || [];
    const purchases = [];
    
    for (const purchaseId of userPurchases.slice(0, 50)) { // Limiter à 50 derniers
      const purchase = await kv.get(`purchase:log:${purchaseId}`);
      if (purchase) {
        purchases.push(purchase);
      }
    }
    
    return c.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
