const { test, expect } = require('@playwright/test');

test.describe('AURA Authentication & Security Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should display proper page title, AURA branding and Quantum Prism logo', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/AURA \| Intelligent Wealth & Capital Flow/i);

    // Check AURA kinetic typography title
    const brandTitle = page.locator('.brand-title').first();
    await expect(brandTitle).toBeVisible();
    await expect(brandTitle).toContainText('AURA');

    // Check subtitle
    const brandSubtitle = page.locator('.brand-subtitle').first();
    await expect(brandSubtitle).toBeVisible();
    await expect(brandSubtitle).toContainText('Intelligent Wealth & Flow');

    // Check Quantum Prism logo
    const prismLogo = page.locator('.prism-container').first();
    await expect(prismLogo).toBeVisible();
  });

  test('should toggle between Sign In and Sign Up tabs', async ({ page }) => {
    const signInTab = page.locator('.tab-switcher button').filter({ hasText: 'Sign In' });
    const signUpTab = page.locator('.tab-switcher button').filter({ hasText: 'Sign Up' });

    await expect(signInTab).toBeVisible();
    await expect(signUpTab).toBeVisible();

    // Click Sign Up tab
    await signUpTab.click();
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
    await expect(page.locator('input[placeholder="e.g. Ankit Jha"]')).toBeVisible();

    // Click Sign In tab
    await signInTab.click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should toggle password visibility with the eye icon button', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Type a password
    await passwordInput.fill('SecretPassword123!');

    // Find and click the eye button
    const eyeBtn = page.locator('.eye-btn');
    await expect(eyeBtn).toBeVisible();
    await eyeBtn.click();

    // Input type should now be "text"
    await expect(page.locator('.password-wrapper input')).toHaveAttribute('type', 'text');

    // Click again to mask
    await eyeBtn.click();
    await expect(page.locator('.password-wrapper input')).toHaveAttribute('type', 'password');
  });

  test('should accurately calculate live password strength and criteria chips on Sign Up', async ({ page }) => {
    // Switch to Sign Up tab
    const signUpTab = page.locator('.tab-switcher button').filter({ hasText: 'Sign Up' });
    await signUpTab.click();

    const passwordInput = page.locator('.password-wrapper input');
    await expect(passwordInput).toBeVisible();

    // Level 1: Weak
    await passwordInput.fill('abc');
    await expect(page.locator('.strength-value')).toContainText('Weak');

    // Level 2: Fair (length + mixed case)
    await passwordInput.fill('Abcdefgh');
    await expect(page.locator('.strength-value')).toContainText('Fair');

    // Level 3: Good (length + mixed case + number)
    await passwordInput.fill('Abcdefgh1');
    await expect(page.locator('.strength-value')).toContainText('Good');

    // Level 4: Strong (length + mixed case + number + symbol)
    await passwordInput.fill('Abcdefgh1!');
    await expect(page.locator('.strength-value')).toContainText('Strong');

    // Check that all 4 criteria chips are marked as met
    const metChips = page.locator('.req-chip.met');
    await expect(metChips).toHaveCount(4);
  });
});
