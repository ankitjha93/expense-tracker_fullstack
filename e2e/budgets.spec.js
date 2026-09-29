const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession, navigateToTab } = require('./helpers/auth');

test.describe('AURA Budgets & Spending Ceilings Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    await navigateToTab(page, 'Budgets & Limits');
    await expect(page.locator('.page-header h1')).toContainText('Budgets & Limits');
  });

  test('should display summary card with monthly allowance and burn rate track', async ({ page }) => {
    const summaryCard = page.locator('.summary-card');
    await expect(summaryCard).toBeVisible();

    await expect(summaryCard).toContainText('Total Monthly Budget');
    await expect(summaryCard).toContainText('Spent This Month');
    await expect(summaryCard).toContainText('Remaining Liquidity');
    await expect(summaryCard).toContainText('Monthly Burn Rate');

    const burnTrack = page.locator('.burn-track .burn-fill');
    await expect(burnTrack).toBeVisible();
  });

  test('should configure a new category budget limit with quick add pills', async ({ page }) => {
    // Select category
    const categorySelect = page.locator('.budget-form select');
    await categorySelect.selectOption('education');

    // Click quick add +$250
    const quick250 = page.locator('.budget-form .quick-amounts button').filter({ hasText: '+$250' });
    await expect(quick250).toBeVisible();
    await quick250.click();

    const amountInput = page.locator('.budget-form input[type="number"]');
    await expect(amountInput).toHaveValue('250');

    // Submit form
    const submitBtn = page.locator('.budget-form .submit-btn');
    await submitBtn.click();

    // Verify toast confirmation
    await expect(page.locator('.toast-item')).toBeVisible();
  });

  test('should render budget cards with current burn status and category limits', async ({ page }) => {
    const cardsCol = page.locator('.cards-col');
    await expect(cardsCol).toBeVisible();

    // Verify existing seeded/mocked budget cards
    const budgetCards = page.locator('.cards-col > div');
    const count = await budgetCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
