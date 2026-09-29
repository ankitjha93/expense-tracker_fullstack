const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession, navigateToTab } = require('./helpers/auth');

test.describe('AURA Transaction Explorer Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    await navigateToTab(page, 'View Transactions');
    await expect(page.locator('.view-header h1')).toContainText('Transaction Explorer');
  });

  test('should display summary bar with accurate record counts and net balance', async ({ page }) => {
    const summaryBar = page.locator('.summary-bar');
    await expect(summaryBar).toBeVisible();

    // Verify pills exist
    await expect(summaryBar).toContainText('Showing');
    await expect(summaryBar).toContainText('Total Inflow');
    await expect(summaryBar).toContainText('Total Outflow');
    await expect(summaryBar).toContainText('Net Cash Flow');
  });

  test('should filter transactions in real-time by search query', async ({ page }) => {
    const searchInput = page.locator('.search-wrap input');
    await expect(searchInput).toBeVisible();

    // Initially multiple items exist
    const items = page.locator('.transactions-feed > div');
    await expect(items.first()).toBeVisible();
    const initialCount = await items.count();
    expect(initialCount).toBeGreaterThan(1);

    // Type "Salary" in search
    await searchInput.fill('Salary');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Tech Lead Salary');

    // Clear search
    await page.locator('.search-wrap .clear-btn').click();
    await expect(items).toHaveCount(initialCount);
  });

  test('should filter by transaction type tabs (All, Incomes, Expenses)', async ({ page }) => {
    const allTab = page.locator('.type-tabs button').filter({ hasText: 'All' });
    const incomeTab = page.locator('.type-tabs button').filter({ hasText: 'Incomes' });
    const expenseTab = page.locator('.type-tabs button').filter({ hasText: 'Expenses' });

    // Switch to Incomes - auto-waits for exit animation of expenses
    await incomeTab.click();
    await expect(incomeTab).toHaveClass(/active/);
    await expect(page.locator('.transactions-feed .amount-badge.expense')).toHaveCount(0);
    const incomeCount = await page.locator('.transactions-feed .amount-badge.income').count();
    expect(incomeCount).toBeGreaterThan(0);

    // Switch to Expenses - auto-waits for exit animation of incomes
    await expenseTab.click();
    await expect(expenseTab).toHaveClass(/active/);
    await expect(page.locator('.transactions-feed .amount-badge.income')).toHaveCount(0);
    const expCount = await page.locator('.transactions-feed .amount-badge.expense').count();
    expect(expCount).toBeGreaterThan(0);

    // Switch back to All
    await allTab.click();
    await expect(allTab).toHaveClass(/active/);
  });

  test('should trigger CSV file download with proper filename naming pattern', async ({ page }) => {
    const exportBtn = page.locator('.export-btn');
    await expect(exportBtn).toBeVisible();

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^aura-transactions-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('should support safe delete prompt with cancel and confirmation', async ({ page }) => {
    const firstItem = page.locator('.transactions-feed > div').first();
    await expect(firstItem).toBeVisible();

    const deleteBtn = firstItem.locator('.delete-btn');
    await deleteBtn.click();

    // Confirm box should appear
    const confirmBox = firstItem.locator('.delete-confirm-box');
    await expect(confirmBox).toBeVisible();
    await expect(confirmBox).toContainText('Delete?');

    // Click Cancel first
    const cancelBtn = confirmBox.locator('.cancel-btn');
    await cancelBtn.click();
    await expect(confirmBox).not.toBeVisible();
    await expect(deleteBtn).toBeVisible();
  });
});
