const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession, navigateToTab } = require('./helpers/auth');

test.describe('AURA Inflow & Outflow Management Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  test('should record a new income stream with quick-add pills and category chips', async ({ page }) => {
    await navigateToTab(page, 'Incomes');
    await expect(page.locator('.page-header h1')).toContainText('Incomes & Inflows');
    await expect(page.locator('.total-badge')).toContainText('Total Inflow');

    // Title input
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Angel Syndicate Dividend');

    // Quick add button +$1,000 or type amount
    const quick1k = page.locator('.quick-amounts button').filter({ hasText: /1,000|1000/ });
    if (await quick1k.isVisible()) {
      await quick1k.click();
    } else {
      await page.locator('input[name="amount"]').fill('1000');
    }

    // Select category chip "Investments"
    const catChip = page.locator('.category-chips .chip-btn').filter({ hasText: 'Investments' });
    if (await catChip.isVisible()) {
      await catChip.click();
    } else {
      await page.locator('select[name="category"]').selectOption('investments');
    }

    // Submit form
    const submitBtn = page.locator('form .submit-btn');
    await submitBtn.click();

    // Verify record appears in the list column
    await expect(page.locator('.list-col')).toContainText('Angel Syndicate Dividend');
  });

  test('should record a new expense outflow with category chips and reference notes', async ({ page }) => {
    await navigateToTab(page, 'Expenses');
    await expect(page.locator('.page-header h1')).toContainText('Expenses & Outflows');
    await expect(page.locator('.total-badge')).toContainText('Total Outflow');

    // Title input
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Datacenter Cloud Cluster');

    // Quick add button or fill amount
    const quick500 = page.locator('.quick-amounts button').filter({ hasText: /500/ });
    if (await quick500.isVisible()) {
      await quick500.click();
    } else {
      await page.locator('input[name="amount"]').fill('500');
    }

    // Select category chip "Subscriptions"
    const catChip = page.locator('.category-chips .chip-btn').filter({ hasText: 'Subscriptions' });
    if (await catChip.isVisible()) {
      await catChip.click();
    } else {
      await page.locator('select[name="category"]').selectOption('subscriptions');
    }

    // Optional reference notes
    const descInput = page.locator('textarea[name="description"]');
    if (await descInput.isVisible()) {
      await descInput.fill('High-availability GPU dev cluster');
    }

    // Submit form
    const submitBtn = page.locator('form .submit-btn');
    await submitBtn.click();

    // Verify record appears in the list column
    await expect(page.locator('.list-col')).toContainText('Datacenter Cloud Cluster');
  });
});
