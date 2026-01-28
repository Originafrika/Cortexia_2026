// /supabase/functions/server/payout-routes.ts
// Routes pour retraits (payouts) - Individual/Creator uniquement

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import Stripe from 'npm:stripe';

const app = new Hono();

const BASE_URL = Deno.env.get('BASE_URL') || 'https://cortexia.com';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const FEDAPAY_SECRET_KEY = Deno.env.get('FEDAPAY_SECRET_KEY');
const FEDAPAY_MODE = Deno.env.get('FEDAPAY_MODE') || 'sandbox';

// Configuration Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY!);

// FedaPay API base URLs
const FEDAPAY_API_BASE = FEDAPAY_MODE === 'live' 
  ? 'https://api.fedapay.com/v1' 
  : 'https://sandbox-api.fedapay.com/v1';

// ========================================
// FEDAPAY HELPER FUNCTIONS (REST API)
// ========================================

async function createFedaPayPayout(data: {
  amount: number;
  currency: string;
  mode: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
    phone_number: { number: string; country: string };
  };
}) {
  const response = await fetch(`${FEDAPAY_API_BASE}/payouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: data.amount,
      currency: { iso: data.currency },
      mode: data.mode,
      customer: data.customer
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FedaPay API error: ${error}`);
  }

  return await response.json();
}

async function startFedaPayPayout(payoutId: string) {
  const response = await fetch(`${FEDAPAY_API_BASE}/payouts/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payouts: [{ id: payoutId }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FedaPay payout start error: ${error}`);
  }

  return await response.json();
}

function verifyFedaPayWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // For now, skip signature verification in development
  if (!signature || !secret) {
    console.warn('⚠️ FedaPay webhook signature verification skipped');
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
  
  if (['BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE'].includes(countryUpper)) {
    return 'XOF';
  }
  if (countryUpper === 'GN') {
    return 'GNF';
  }
  if ([
    'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 
    'GR', 'IE', 'FI', 'EE', 'LV', 'LT', 'SK', 'SI'
  ].includes(countryUpper)) {
    return 'EUR';
  }
  if (countryUpper === 'GB') {
    return 'GBP';
  }
  if (countryUpper === 'CA') {
    return 'CAD';
  }
  
  return 'USD';
}

function detectPayoutGateway(country: string, method: any): 'fedapay' | 'stripe' {
  if (isFedaPayRegion(country) && method.type === 'mobile_money') {
    return 'fedapay';
  }
  return 'stripe';
}

async function logPayoutRequest(data: {
  userId: string;
  payoutId: string;
  transferId?: string;
  amount: number;
  gateway: 'fedapay' | 'stripe';
  method?: string;
  status: 'processing' | 'completed' | 'failed';
  estimatedArrival?: number;
}): Promise<void> {
  const profile = await kv.get(`user:profile:${data.userId}`);
  
  const payout = {
    id: data.payoutId,
    transferId: data.transferId,
    userId: data.userId,
    accountType: profile.accountType,
    amount: data.amount,
    gateway: data.gateway,
    method: data.method,
    status: data.status,
    createdAt: new Date().toISOString(),
    estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival * 1000).toISOString() : undefined,
    completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
  };
  
  // Enregistrer payout log
  await kv.set(`payout:log:${data.payoutId}`, payout);
  
  // Ajouter à la liste user payouts
  const userPayouts = await kv.get(`payout:user:${data.userId}`) || [];
  userPayouts.unshift(data.payoutId);
  await kv.set(`payout:user:${data.userId}`, userPayouts);
  
  console.log(`📝 Payout logged: ${data.payoutId} (${data.gateway}, ${data.amount})`);
}

async function sendPayoutNotification(
  userId: string, 
  status: 'processing' | 'completed' | 'failed', 
  amount: number
): Promise<void> {
  // TODO: Implement email notification
  console.log(`📧 Payout notification: ${userId} - ${status} - ${amount}`);
}

// ========================================
// PAYOUT CONFIG
// ========================================

// Récupérer configuration payout
app.get('/config/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const config = await kv.get(`payout:config:${userId}`) || {
      userId,
      region: 'international',
      preferredGateway: 'stripe'
    };
    
    return c.json({ config });
  } catch (error) {
    console.error('Get payout config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mettre à jour configuration payout
app.put('/config/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const config = await c.req.json();
    
    await kv.set(`payout:config:${userId}`, {
      userId,
      ...config,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, message: 'Payout config updated' });
  } catch (error) {
    console.error('Update payout config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ========================================
// BALANCE CREATOR
// ========================================

// Récupérer balance Creator
app.get('/creators/:userId/balance', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile || profile.accountType !== 'individual') {
      return c.json({ error: 'Not an individual account' }, 403);
    }
    
    const balance = await kv.get(`creator:balance:${userId}`) || {
      userId,
      totalEarned: 0,
      availableBalance: 0,
      pendingPayout: 0,
      totalWithdrawn: 0,
      lastPayoutDate: null,
      lastPayoutAmount: 0,
      payoutHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return c.json({ balance });
  } catch (error) {
    console.error('Get creator balance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ========================================
// DEMANDE DE RETRAIT
// ========================================

// Demander un retrait
app.post('/request', async (c) => {
  try {
    const { amount, method } = await c.req.json();
    const userId = c.get('userId');
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Vérifier éligibilité
    const profile = await kv.get(`user:profile:${userId}`);
    const balance = await kv.get(`creator:balance:${userId}`);
    
    // ❌ Seuls Individual/Creator peuvent retirer
    if (!profile || profile.accountType !== 'individual') {
      return c.json({ error: 'Only individual accounts can withdraw' }, 403);
    }
    
    // ❌ Vérifier statut Creator
    if (!profile.hasCreatorAccess && !profile.isCreator) {
      return c.json({ error: 'Creator status required to withdraw' }, 403);
    }
    
    // ❌ Vérifier balance suffisante
    if (!balance || balance.availableBalance < amount) {
      return c.json({ 
        error: 'Insufficient balance',
        available: balance?.availableBalance || 0,
        requested: amount
      }, 400);
    }
    
    // ❌ Vérifier montant minimum
    const userCountry = profile.country || 'US';
    const minAmount = isFedaPayRegion(userCountry) ? 1000 : 2500; // FCFA ou cents
    
    if (amount < minAmount) {
      return c.json({ 
        error: `Minimum withdrawal: ${minAmount}`,
        minAmount,
        requested: amount
      }, 400);
    }
    
    // Détection gateway
    const gateway = detectPayoutGateway(userCountry, method);
    
    // ========================================
    // FEDAPAY PAYOUT (REST API)
    // ========================================
    
    if (gateway === 'fedapay') {
      try {
        // 1. Créer FedaPay Payout
        const payoutData = await createFedaPayPayout({
          amount,
          currency: getCurrencyByCountry(userCountry),
          mode: method.provider, // 'mtn_open', 'moov', 'wave_sn', etc.
          customer: {
            email: profile.email,
            firstname: profile.firstName || profile.name?.split(' ')[0] || 'User',
            lastname: profile.lastName || profile.name?.split(' ')[1] || 'Cortexia',
            phone_number: {
              number: method.phoneNumber,
              country: userCountry.toLowerCase()
            }
          }
        });
        
        const payoutId = payoutData.v1.id;
        
        // 2. Démarrer payout
        await startFedaPayPayout(payoutId);
        
        // 3. Mettre à jour balance
        balance.availableBalance -= amount;
        balance.pendingPayout += amount;
        await kv.set(`creator:balance:${userId}`, balance);
        
        // 4. Logger
        await logPayoutRequest({
          userId,
          payoutId,
          amount,
          gateway: 'fedapay',
          method: method.provider,
          status: 'processing'
        });
        
        // 5. Notification
        await sendPayoutNotification(userId, 'processing', amount);
        
        return c.json({
          payoutId,
          gateway: 'fedapay',
          status: 'processing',
          amount,
          currency: getCurrencyByCountry(userCountry),
          estimatedArrival: 'instant', // Mobile money = instant
          message: 'Payout sent to mobile money'
        });
      } catch (error) {
        console.error('FedaPay payout error:', error);
        return c.json({ 
          error: 'FedaPay payout failed', 
          details: error.message 
        }, 500);
      }
    } 
    
    // ========================================
    // STRIPE CONNECT PAYOUT
    // ========================================
    
    else {
      try {
        // 1. Créer/Récupérer Stripe Connect Account
        let stripeAccountId = profile.stripeConnectAccountId;
        
        if (!stripeAccountId) {
          const account = await stripe.accounts.create({
            type: 'express',
            country: userCountry,
            email: profile.email,
            capabilities: {
              transfers: { requested: true }
            },
            business_type: 'individual',
            individual: {
              email: profile.email,
              first_name: profile.firstName || profile.name?.split(' ')[0],
              last_name: profile.lastName || profile.name?.split(' ')[1]
            }
          });
          
          stripeAccountId = account.id;
          profile.stripeConnectAccountId = stripeAccountId;
          await kv.set(`user:profile:${userId}`, profile);
        }
        
        // 2. Vérifier onboarding complet
        const account = await stripe.accounts.retrieve(stripeAccountId);
        if (!account.details_submitted) {
          // Redirect to onboarding
          const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${BASE_URL}/creator/payouts/onboarding/refresh`,
            return_url: `${BASE_URL}/creator/payouts/onboarding/complete`,
            type: 'account_onboarding'
          });
          
          return c.json({
            onboardingRequired: true,
            onboardingUrl: accountLink.url,
            message: 'Complete Stripe onboarding first'
          }, 400);
        }
        
        // 3. Créer Transfer vers Connect Account
        const transfer = await stripe.transfers.create({
          amount,
          currency: getCurrencyByCountry(userCountry).toLowerCase(),
          destination: stripeAccountId,
          metadata: {
            userId,
            type: 'creator_payout',
            accountType: 'individual'
          }
        });
        
        // 4. Créer Payout (bank transfer)
        const payout = await stripe.payouts.create(
          {
            amount,
            currency: getCurrencyByCountry(userCountry).toLowerCase(),
            method: method.type === 'instant' ? 'instant' : 'standard',
            statement_descriptor: 'Cortexia Payout',
            metadata: {
              userId,
              transferId: transfer.id
            }
          },
          { stripeAccount: stripeAccountId }
        );
        
        // 5. Mettre à jour balance
        balance.availableBalance -= amount;
        balance.pendingPayout += amount;
        await kv.set(`creator:balance:${userId}`, balance);
        
        // 6. Logger
        await logPayoutRequest({
          userId,
          payoutId: payout.id,
          transferId: transfer.id,
          amount,
          gateway: 'stripe',
          status: 'processing',
          estimatedArrival: payout.arrival_date
        });
        
        // 7. Notification
        await sendPayoutNotification(userId, 'processing', amount);
        
        return c.json({
          payoutId: payout.id,
          transferId: transfer.id,
          gateway: 'stripe',
          status: 'processing',
          amount,
          currency: getCurrencyByCountry(userCountry),
          estimatedArrival: new Date(payout.arrival_date * 1000).toISOString(),
          estimatedDays: '2-7 days',
          message: 'Payout initiated successfully'
        });
      } catch (error) {
        console.error('Stripe payout error:', error);
        return c.json({ 
          error: 'Stripe payout failed', 
          details: error.message 
        }, 500);
      }
    }
  } catch (error) {
    console.error('Request payout error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ========================================
// WEBHOOKS PAYOUTS
// ========================================

// Webhook FedaPay Payout
app.post('/fedapay/payout-webhook', async (c) => {
  try {
    const signature = c.req.header('X-FEDAPAY-SIGNATURE') || '';
    const payload = await c.req.text();
    const webhookSecret = Deno.env.get('FEDAPAY_PAYOUT_WEBHOOK_SECRET') || '';
    
    // Vérifier signature
    const isValid = verifyFedaPayWebhookSignature(payload, signature, webhookSecret);
    
    if (!isValid) {
      console.error('FedaPay payout webhook verification failed');
      return c.json({ error: 'Invalid signature' }, 400);
    }
    
    const event = JSON.parse(payload);
    
    console.log(`🔔 FedaPay payout webhook received: ${event.name}`);
    
    if (event.name === 'payout.sent') {
      const payout = event.entity;
      const userId = payout.customer.email; // TODO: Better mapping
      
      // Mettre à jour balance
      const balance = await kv.get(`creator:balance:${userId}`);
      if (balance) {
        balance.pendingPayout -= payout.amount;
        balance.totalWithdrawn += payout.amount;
        balance.lastPayoutDate = new Date().toISOString();
        balance.lastPayoutAmount = payout.amount;
        balance.payoutHistory.unshift({
          id: payout.id,
          amount: payout.amount,
          date: new Date().toISOString(),
          status: 'completed',
          gateway: 'fedapay',
          method: payout.mode
        });
        await kv.set(`creator:balance:${userId}`, balance);
      }
      
      // Mettre à jour payout log
      const payoutLog = await kv.get(`payout:log:${payout.id}`);
      if (payoutLog) {
        payoutLog.status = 'completed';
        payoutLog.completedAt = new Date().toISOString();
        await kv.set(`payout:log:${payout.id}`, payoutLog);
      }
      
      // Notification
      await sendPayoutNotification(userId, 'completed', payout.amount);
      
      console.log(`✅ FedaPay payout completed: ${payout.id} (${payout.amount})`);
    } else if (event.name === 'payout.failed') {
      const payout = event.entity;
      const userId = payout.customer.email;
      
      // Remettre les fonds dans available balance
      const balance = await kv.get(`creator:balance:${userId}`);
      if (balance) {
        balance.availableBalance += payout.amount;
        balance.pendingPayout -= payout.amount;
        await kv.set(`creator:balance:${userId}`, balance);
      }
      
      // Mettre à jour payout log
      const payoutLog = await kv.get(`payout:log:${payout.id}`);
      if (payoutLog) {
        payoutLog.status = 'failed';
        await kv.set(`payout:log:${payout.id}`, payoutLog);
      }
      
      // Notification
      await sendPayoutNotification(userId, 'failed', payout.amount);
      
      console.log(`❌ FedaPay payout failed: ${payout.id}`);
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('FedaPay payout webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Webhook Stripe Payout
app.post('/stripe/payout-webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const payload = await c.req.text();
    const webhookSecret = Deno.env.get('STRIPE_PAYOUT_WEBHOOK_SECRET');
    
    // Vérifier signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature!,
        webhookSecret!
      );
    } catch (err) {
      console.error('Stripe payout webhook verification failed:', err);
      return c.json({ error: 'Invalid signature' }, 400);
    }
    
    console.log(`🔔 Stripe payout webhook received: ${event.type}`);
    
    if (event.type === 'payout.paid') {
      const payout = event.data.object as Stripe.Payout;
      const userId = payout.metadata?.userId;
      
      if (!userId) {
        console.error('Missing userId in payout metadata');
        return c.json({ error: 'Invalid metadata' }, 400);
      }
      
      // Mettre à jour balance
      const balance = await kv.get(`creator:balance:${userId}`);
      if (balance) {
        balance.pendingPayout -= payout.amount;
        balance.totalWithdrawn += payout.amount;
        balance.lastPayoutDate = new Date(payout.arrival_date * 1000).toISOString();
        balance.lastPayoutAmount = payout.amount;
        balance.payoutHistory.unshift({
          id: payout.id,
          amount: payout.amount,
          date: new Date(payout.arrival_date * 1000).toISOString(),
          status: 'completed',
          gateway: 'stripe'
        });
        await kv.set(`creator:balance:${userId}`, balance);
      }
      
      // Mettre à jour payout log
      const payoutLog = await kv.get(`payout:log:${payout.id}`);
      if (payoutLog) {
        payoutLog.status = 'completed';
        payoutLog.completedAt = new Date(payout.arrival_date * 1000).toISOString();
        await kv.set(`payout:log:${payoutLog.id}`, payoutLog);
      }
      
      // Notification
      await sendPayoutNotification(userId, 'completed', payout.amount);
      
      console.log(`✅ Stripe payout completed: ${payout.id} (${payout.amount})`);
    } else if (event.type === 'payout.failed') {
      const payout = event.data.object as Stripe.Payout;
      const userId = payout.metadata?.userId;
      
      if (!userId) {
        console.error('Missing userId in payout metadata');
        return c.json({ error: 'Invalid metadata' }, 400);
      }
      
      // Remettre les fonds dans available balance
      const balance = await kv.get(`creator:balance:${userId}`);
      if (balance) {
        balance.availableBalance += payout.amount;
        balance.pendingPayout -= payout.amount;
        await kv.set(`creator:balance:${userId}`, balance);
      }
      
      // Mettre à jour payout log
      const payoutLog = await kv.get(`payout:log:${payout.id}`);
      if (payoutLog) {
        payoutLog.status = 'failed';
        await kv.set(`payout:log:${payoutLog.id}`, payoutLog);
      }
      
      // Notification
      await sendPayoutNotification(userId, 'failed', payout.amount);
      
      console.log(`❌ Stripe payout failed: ${payout.id}`);
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('Stripe payout webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// ========================================
// QUERIES
// ========================================

// Récupérer historique des payouts
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const userPayouts = await kv.get(`payout:user:${userId}`) || [];
    const payouts = [];
    
    for (const payoutId of userPayouts.slice(0, 50)) { // Limiter à 50 derniers
      const payout = await kv.get(`payout:log:${payoutId}`);
      if (payout) {
        payouts.push(payout);
      }
    }
    
    return c.json({ payouts });
  } catch (error) {
    console.error('Get payouts error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
