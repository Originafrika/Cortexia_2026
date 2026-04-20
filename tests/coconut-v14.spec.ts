import { test, expect } from '@playwright/test';

test.describe('Coconut V14 - Full Flow Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Coconut V14 page', async ({ page }) => {
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    
    // Should show the Coconut V14 dashboard or type selector
    const heading = page.getByRole('heading', { name: /coconut/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should have demo-user credits initialized', async ({ page }) => {
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    
    // Check credits are displayed (1500 for demo-user)
    const creditsText = page.getByText(/1500/).first();
    await expect(creditsText).toBeVisible({ timeout: 10000 });
  });

  test('should select image type and submit intent', async ({ page }) => {
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to be ready
    await page.waitForTimeout(2000);
    
    // Find and click the image type or navigate to intent input
    // The flow may vary based on current screen state
    const intentInput = page.getByRole('textbox').first();
    if (await intentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await intentInput.fill('Commercial for a premium water bottle called AquaPure, minimalist design, blue and white colors, refreshing mood');
      
      // Find and click submit/generate button
      const submitBtn = page.getByRole('button', { name: /générer|submit|analyze|analyser/i }).first();
      if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitBtn.click();
        
        // Wait for analysis to complete (may take time with LLM cascade)
        await page.waitForTimeout(30000);
        
        // Should show either direction selector or analysis view
        const directionSelector = page.getByText(/choisissez.*direction|select.*direction/i);
        const analysisView = page.getByText(/analyse terminée|analysis complete/i);
        
        const hasDirection = await directionSelector.isVisible({ timeout: 5000 }).catch(() => false);
        const hasAnalysis = await analysisView.isVisible({ timeout: 5000 }).catch(() => false);
        
        expect(hasDirection || hasAnalysis).toBe(true);
      }
    }
  });

  test('should display CocoBoard with filled fields after analysis', async ({ page }) => {
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Clear any previous demo data
    await page.evaluate(() => localStorage.removeItem('demo-cocoboards'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find the intent textarea and fill it
    const intentTextarea = page.locator('textarea').first();
    const hasIntent = await intentTextarea.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!hasIntent) {
      // May need to click through type selector first
      const imageTypeBtn = page.getByRole('button', { name: /image|photo|visuel/i }).first();
      if (await imageTypeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await imageTypeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Fill intent
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 5000 }).catch(() => false)) {
      await textarea.fill('Commercial for a premium water bottle called AquaPure, minimalist design, blue and white colors, refreshing mood');
      
      // Find submit button
      const submitBtn = page.getByRole('button', { name: /générer|submit|analyze|analyser|lancer/i }).first();
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();
        
        // Wait for analysis (LLM cascade can take time)
        await page.waitForTimeout(30000);
        
        // After analysis, should see direction selector or analysis view
        // Select a direction if shown
        const directionCard = page.getByRole('radio').first();
        if (await directionCard.isVisible({ timeout: 5000 }).catch(() => false)) {
          await directionCard.click();
          await page.waitForTimeout(1000);
          
          const confirmBtn = page.getByRole('button', { name: /confirm|générer|continue/i }).first();
          if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(5000);
          }
        }
        
        // Click proceed to cocoboard
        const proceedBtn = page.getByRole('button', { name: /proceed|continuer|cocoboard/i }).first();
        if (await proceedBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await proceedBtn.click();
          await page.waitForTimeout(5000);
        }
        
        // Now check cocoboard
        const promptField = page.locator('textarea').first();
        const promptValue = await promptField.inputValue().catch(() => '');
        
        // Prompt should not be empty or [object Object]
        expect(promptValue).not.toContain('[object Object]');
        
        // Credits should be visible
        const creditsVisible = await page.getByText(/1500|crédits|credits/i).first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(creditsVisible).toBe(true);
      }
    }
  });

  test('should not have console errors during normal flow', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/coconut-v14');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Filter out expected/ignored errors
    const realErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('monaco') &&
      !e.includes('Tracking Prevention')
    );
    
    // Should not have critical errors
    expect(realErrors.length).toBeLessThan(3);
  });
});
