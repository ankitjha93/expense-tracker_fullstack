const { test, expect } = require('@playwright/test');
const { setupAuthenticatedSession } = require('./helpers/auth');

test.describe('AURA Profile Customization & 3D Avatar Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  });

  async function openProfileModal(page) {
    const isMobile = await page.locator('.mobile-top-bar').isVisible();
    if (isMobile) {
      await page.locator('.mobile-avatar-trigger').click();
    } else {
      await page.locator('.bottom-profile .user-badge').click();
    }
    await expect(page.locator('.modal-header h3')).toContainText('Customize Profile & Avatar');
  }

  test('should open Profile Customization modal portal with live preview card', async ({ page }) => {
    await openProfileModal(page);

    const livePreview = page.locator('.live-preview-card');
    await expect(livePreview).toBeVisible();
    await expect(livePreview).toContainText('Alex Vance');
    await expect(livePreview).toContainText('Portfolio Lead');
  });

  test('should switch 3D avatar preset from curated gallery', async ({ page }) => {
    await openProfileModal(page);

    // Verify presets exist in the gallery
    const presets = page.locator('.gallery-grid .preset-card');
    const count = await presets.count();
    expect(count).toBeGreaterThan(3);

    // Click on Cyber Punk / Quantum preset
    const targetPreset = presets.nth(2);
    await targetPreset.click();
    await expect(targetPreset).toHaveClass(/selected/);
  });

  test('should customize aura ring glow color and fintech role chip', async ({ page }) => {
    await openProfileModal(page);

    // Select role chip
    const roleChip = page.locator('.chips-row .role-chip').filter({ hasText: 'Venture Capitalist' });
    if (await roleChip.isVisible()) {
      await roleChip.click();
      await expect(roleChip).toHaveClass(/active/);
    }

    // Select aura color
    const auraChip = page.locator('.aura-grid .aura-chip').filter({ hasText: 'Violet' });
    if (await auraChip.isVisible()) {
      await auraChip.click();
      await expect(auraChip).toHaveClass(/active/);
    }

    // Click Cancel to dismiss
    await page.locator('.modal-footer .cancel-btn').click();
    await expect(page.locator('.modal-header')).not.toBeVisible();
  });
});
