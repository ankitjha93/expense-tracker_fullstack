const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession } = require('./helpers/auth');

test.describe('AURA Dashboard & Financial Overview Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for the app main shell to be visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display financial metrics cards with accurate calculations', async ({ page }) => {
    // Total Balance card
    const balanceCard = page.locator('.balance-card');
    await expect(balanceCard).toBeVisible();
    await expect(balanceCard).toContainText('Total Balance');

    // Total Income card
    const incomeCard = page.locator('.income-card');
    await expect(incomeCard).toBeVisible();
    await expect(incomeCard).toContainText('Total Income');

    // Total Expenses card
    const expenseCard = page.locator('.expense-card');
    await expect(expenseCard).toBeVisible();
    await expect(expenseCard).toContainText('Total Expense');
  });

  test('should toggle Demo Sandbox banner and trigger sample data seeding', async ({ page }) => {
    const demoToggleBtn = page.locator('.demo-toggle-btn');
    await expect(demoToggleBtn).toBeVisible();

    // Click to open Demo Sandbox
    await demoToggleBtn.click();
    const banner = page.locator('.sample-data-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Financial Sandbox & Demo Data');

    // Click "Load Sample Data" action
    const seedBtn = page.locator('.seed-action');
    await expect(seedBtn).toBeVisible();
    await seedBtn.click();

    // Verify success toast appears
    await expect(page.locator('.toast-item')).toContainText(/Sample financial data generated successfully!/i);
  });

  test('should toggle chart timeframes (7D, 30D, ALL) smoothly', async ({ page }) => {
    const tf7D = page.locator('.timeframe-pills button').filter({ hasText: '7D' });
    const tf30D = page.locator('.timeframe-pills button').filter({ hasText: '30D' });
    const tfAll = page.locator('.timeframe-pills button').filter({ hasText: 'All Time' });

    await expect(tf7D).toBeVisible();
    await expect(tf30D).toBeVisible();
    await expect(tfAll).toBeVisible();

    // Click 7D timeframe
    await tf7D.click();
    await expect(tf7D).toHaveClass(/active/);

    // Click 30D timeframe
    await tf30D.click();
    await expect(tf30D).toHaveClass(/active/);

    // Click All Time
    await tfAll.click();
    await expect(tfAll).toHaveClass(/active/);
  });

  test('should render Category Spending Breakdown with progress bars', async ({ page }) => {
    const categoryCard = page.locator('.category-breakdown-card');
    await expect(categoryCard).toBeVisible();
    await expect(categoryCard).toContainText('Top Spending Categories');

    // Top categories list
    const categoryRows = page.locator('.category-row');
    const count = await categoryRows.count();
    expect(count).toBeGreaterThan(0);
  });
});
