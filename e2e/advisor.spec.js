const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession, navigateToTab } = require('./helpers/auth');

test.describe('AURA AI Financial Advisor & Insights Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    await navigateToTab(page, 'AI Advisor');
    await expect(page.locator('.page-header h1')).toContainText('AI Financial Insights & Advisor');
  });

  test('should display AI engine status pill and recalculate button', async ({ page }) => {
    const livePill = page.locator('.live-pill');
    await expect(livePill).toBeVisible();
    await expect(livePill).toContainText('Fintech Intelligence Engine');

    const engineBadge = page.locator('.engine-badge');
    await expect(engineBadge).toBeVisible();

    const recalculateBtn = page.locator('.refresh-btn');
    await expect(recalculateBtn).toBeVisible();
  });

  test('should render 50/30/20 framework with progress indicators', async ({ page }) => {
    const frameworkCard = page.locator('.framework-card');
    await expect(frameworkCard).toBeVisible();
    await expect(frameworkCard).toContainText('50 / 30 / 20 Framework');

    // Needs, Wants, Savings bars
    await expect(frameworkCard).toContainText('Needs');
    await expect(frameworkCard).toContainText('Wants');
    await expect(frameworkCard).toContainText('Savings');

    const tracks = frameworkCard.locator('.track .fill');
    expect(await tracks.count()).toBe(3);
  });

  test('should interact with FinAdvisor chat using suggestion chips and input bar', async ({ page }) => {
    // Initial welcome message should be rendered
    const welcomeMsg = page.locator('.messages-container .message-bubble.ai-msg').first();
    await expect(welcomeMsg).toBeVisible();
    await expect(welcomeMsg).toContainText('FinAdvisor AI');

    // Click on suggestion chip
    const chip = page.locator('.chips-row .prompt-chip').first();
    await expect(chip).toBeVisible();
    const promptText = await chip.textContent();
    await chip.click();

    // Verify user message appears in chat
    const userMsg = page.locator('.messages-container .message-bubble.user-msg');
    await expect(userMsg.last()).toContainText(promptText);

    // Verify AI response arrives from intercepted mock endpoint
    const latestAiMsg = page.locator('.messages-container .message-bubble.ai-msg').last();
    await expect(latestAiMsg).toBeVisible();
    await expect(latestAiMsg).toContainText(/savings rate|capital|financial/i);
  });
});
