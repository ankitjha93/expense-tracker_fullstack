/**
 * Authentication and Mocking Helper for AURA Playwright Tests
 */

const mockUser = {
  id: 'usr_playwright_test_999',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'playwright.tester@aurawealth.com',
  email_confirmed_at: '2026-09-01T00:00:00.000Z',
  phone: '',
  confirmed_at: '2026-09-01T00:00:00.000Z',
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {
    full_name: 'Alex Vance',
    role: 'Portfolio Lead',
    aura_color: 'emerald',
    has_custom_avatar: false,
    avatar_url: null,
  },
  identities: [],
  created_at: '2026-09-01T00:00:00.000Z',
  updated_at: new Date().toISOString(),
};

const mockSession = {
  access_token: 'fake-jwt-token-for-e2e-testing',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'fake-refresh-token',
  user: mockUser,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

// Initial mock financial data
const initialIncomes = [
  { _id: 'inc_1', title: 'Tech Lead Salary', amount: 8500, category: 'salary', date: '2026-09-15', description: 'Primary monthly compensation', type: 'income' },
  { _id: 'inc_2', title: 'Advisory Freelance', amount: 2200, category: 'freelancing', date: '2026-09-20', description: 'Fintech strategy consulting', type: 'income' },
  { _id: 'inc_3', title: 'Stock Dividend', amount: 650, category: 'stocks', date: '2026-09-25', description: 'Q3 dividend payout', type: 'income' },
];

const initialExpenses = [
  { _id: 'exp_1', title: 'Penthouse Mortgage', amount: 2800, category: 'other', date: '2026-09-02', description: 'Monthly residence payment', type: 'expense' },
  { _id: 'exp_2', title: 'Whole Foods Market', amount: 620, category: 'groceries', date: '2026-09-10', description: 'Organic supplies', type: 'expense' },
  { _id: 'exp_3', title: 'Cloud Servers', amount: 180, category: 'subscriptions', date: '2026-09-14', description: 'Dev infrastructure', type: 'expense' },
  { _id: 'exp_4', title: 'Michelin Dinner', amount: 450, category: 'takeaways', date: '2026-09-18', description: 'Client dinner', type: 'expense' },
];

const initialBudgets = [
  { _id: 'bud_1', category: 'groceries', amount: 800, monthlyLimit: 800 },
  { _id: 'bud_2', category: 'takeaways', amount: 600, monthlyLimit: 600 },
  { _id: 'bud_3', category: 'subscriptions', amount: 250, monthlyLimit: 250 },
];

/**
 * Injects an active Supabase user session and mock API endpoints into the page.
 */
async function setupAuthenticatedSession(page) {
  // 1. Inject Supabase session in localStorage
  await page.addInitScript(({ session, user }) => {
    try {
      const storageKey = 'sb-grbuyfbviuycarhipqyi-auth-token';
      window.localStorage.setItem(storageKey, JSON.stringify(session));
      window.localStorage.setItem(`user_custom_profile_${user.id}`, JSON.stringify(user.user_metadata));
      window.localStorage.setItem('user_custom_profile', JSON.stringify(user.user_metadata));
    } catch (e) {
      console.error('Storage injection error:', e);
    }
  }, { session: mockSession, user: mockUser });

  // 2. Intercept backend endpoints for 100% reliable deterministic tests
  let currentIncomes = [...initialIncomes];
  let currentExpenses = [...initialExpenses];
  let currentBudgets = [...initialBudgets];

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/get-incomes')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentIncomes) });
    }
    if (url.includes('/get-expenses')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentExpenses) });
    }
    if (url.includes('/get-budgets')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentBudgets) });
    }
    if (url.includes('/add-income') && method === 'POST') {
      const postData = JSON.parse(route.request().postData() || '{}');
      const newInc = { _id: `inc_${Date.now()}`, ...postData, type: 'income' };
      currentIncomes.unshift(newInc);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Income Added', income: newInc }) });
    }
    if (url.includes('/add-expense') && method === 'POST') {
      const postData = JSON.parse(route.request().postData() || '{}');
      const newExp = { _id: `exp_${Date.now()}`, ...postData, type: 'expense' };
      currentExpenses.unshift(newExp);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Expense Added', expense: newExp }) });
    }
    if (url.includes('/delete-income/')) {
      const id = url.split('/delete-income/')[1]?.split('?')[0];
      currentIncomes = currentIncomes.filter(i => i._id !== id);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Income Deleted' }) });
    }
    if (url.includes('/delete-expense/')) {
      const id = url.split('/delete-expense/')[1]?.split('?')[0];
      currentExpenses = currentExpenses.filter(e => e._id !== id);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Expense Deleted' }) });
    }
    if (url.includes('/set-budget') && method === 'POST') {
      const { category, amount } = JSON.parse(route.request().postData() || '{}');
      const existing = currentBudgets.find(b => b.category === category);
      if (existing) {
        existing.amount = amount;
        existing.monthlyLimit = amount;
      } else {
        currentBudgets.push({ _id: `bud_${Date.now()}`, category, amount, monthlyLimit: amount });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Budget configured successfully' }) });
    }
    if (url.includes('/seed-data') && method === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Sample financial data generated successfully!', count: 12 }) });
    }
    if (url.includes('/clear-data') && method === 'POST') {
      currentIncomes = [];
      currentExpenses = [];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'All transactions cleared successfully' }) });
    }
    if (url.includes('/ai-insights')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          healthScore: 88,
          grade: 'A',
          summary: 'Exceptional liquidity with healthy savings allocation exceeding 50% of net inflows.',
          model: 'gemini-3.5-flash',
          framework503020: { needs: { percent: 38 }, wants: { percent: 12 }, savings: { percent: 50 } },
          runway: { dailyBurn: 135, daysRemaining: 120, projectedMonthEnd: 7300 },
          subscores: { cashflowScore: 92, savingsScore: 95, budgetScore: 84, discretionaryScore: 82 }
        })
      });
    }
    if (url.includes('/ai-chat') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'Based on your recent capital flow, your current savings rate is 50%, which is well ahead of typical benchmarks. Allocating surplus into index funds could accelerate long-term compounding.',
          model: 'gemini-3.5-flash'
        })
      });
    }

    return route.continue();
  });
}

/**
 * Helper to navigate between application tabs across desktop and mobile viewports
 */
async function navigateToTab(page, tabTitle) {
  const isMobile = await page.locator('.mobile-top-bar').isVisible();
  if (isMobile) {
    const isDrawerOpen = await page.locator('.drawer-body').isVisible();
    if (!isDrawerOpen) {
      await page.locator('.hamburger-btn').click();
      await page.locator('.drawer-body').waitFor({ state: 'visible' });
    }
    await page.locator('.drawer-body .menu-items li').filter({ hasText: tabTitle }).click();
  } else {
    await page.locator('.desktop-sidebar .menu-items li').filter({ hasText: tabTitle }).click();
  }
}

module.exports = {
  setupAuthenticatedSession,
  navigateToTab,
  mockUser,
  mockSession,
};
