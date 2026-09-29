const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession } = require('./helpers/auth');

test.describe('AURA Responsive Cross-Device Navigation Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display appropriate sidebar or mobile header based on viewport', async ({ page }) => {
    const isMobile = await page.locator('.mobile-top-bar').isVisible();

    if (isMobile) {
      await expect(page.locator('.mobile-top-bar')).toBeVisible();
      await expect(page.locator('.desktop-sidebar')).not.toBeVisible();
      await expect(page.locator('.hamburger-btn')).toBeVisible();
    } else {
      await expect(page.locator('.desktop-sidebar')).toBeVisible();
      await expect(page.locator('.mobile-top-bar')).not.toBeVisible();
      await expect(page.locator('.desktop-sidebar .menu-items')).toBeVisible();
    }
  });

  test('should open and close mobile slide-out drawer via hamburger button and close button', async ({ page }) => {
    const isMobile = await page.locator('.mobile-top-bar').isVisible();

    if (isMobile) {
      // Open drawer
      await page.locator('.hamburger-btn').click();
      const drawerBody = page.locator('.drawer-body');
      await expect(drawerBody).toBeVisible();

      // Verify menu items in drawer
      await expect(drawerBody.locator('.menu-items li')).toHaveCount(6);

      // Close drawer using close button
      await page.locator('.drawer-close-btn').click();
      await expect(drawerBody).not.toBeVisible();
    } else {
      // On desktop, verify all 6 navigation links are directly accessible
      await expect(page.locator('.desktop-sidebar .menu-items li')).toHaveCount(6);
    }
  });

  test('should close mobile drawer with keyboard Escape key', async ({ page }) => {
    const isMobile = await page.locator('.mobile-top-bar').isVisible();

    if (isMobile) {
      // Open drawer
      await page.locator('.hamburger-btn').click();
      await expect(page.locator('.drawer-body')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('.drawer-body')).not.toBeVisible();
    }
  });
});
