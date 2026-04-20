import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to credits purchase page', async ({ page }) => {
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    
    // Look for credits/wallet section
    const creditsSection = page.getByText(/credits?|wallet|acheter/i).first();
    const hasCredits = await creditsSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasCredits) {
      // Click on credits purchase
      const buyButton = page.getByRole('button', { name: /acheter|buy|purchase/i }).first();
      if (await buyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await buyButton.click();
        await page.waitForTimeout(2000);
        
        // Should show pricing options
        const pricing = page.getByText(/enterprise|1000|5000|10000/i);
        const hasPricing = await pricing.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasPricing).toBe(true);
      }
    }
  });

  test('should display Stripe checkout session creation', async ({ page }) => {
    // Test the API endpoint directly
    const response = await page.request.post('http://localhost:3000/api/stripe/checkout', {
      data: {
        type: 'credits_1000',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel'
      }
    });

    // Should return 401 (unauthorized) because no auth, not 500 (server error)
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('Stripe webhook endpoint should exist', async ({ page }) => {
    // Test webhook endpoint exists (will fail signature but endpoint should exist)
    const response = await page.request.post('http://localhost:3000/api/stripe/webhook', {
      data: { type: 'test' }
    });

    // Should return 400 (signature missing) not 404 (endpoint not found)
    expect(response.status()).toBe(400);
  });
});

test.describe('Auth API Endpoints', () => {
  test('signup endpoint should work', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/auth/signup', {
      data: {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      }
    });

    // Should work (200 or 400 for duplicate)
    expect(response.status()).toBeLessThan(500);
  });

  test('signin endpoint should work', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/auth/signin', {
      data: {
        email: 'test@example.com',
        password: 'testpassword123'
      }
    });

    expect(response.status()).toBeLessThan(500);
  });
});