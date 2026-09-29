const ExpenseSchema = require('../models/ExpenseModel');
const IncomeSchema = require('../models/IncomeModel');
const BudgetSchema = require('../models/BudgetModel');
const { GoogleGenAI } = require('@google/genai');

// Standard 50/30/20 Category Mappings
const NEEDS_CATEGORIES = new Set(['groceries', 'housing', 'rent', 'utilities', 'medical', 'transport', 'electricity', 'water', 'gas', 'health', 'bills']);
const WANTS_CATEGORIES = new Set(['takeaways', 'takeaway', 'dining', 'clothing', 'travel', 'shopping', 'entertainment', 'tv', 'hobbies', 'personal', 'subscriptions', 'other']);
const SAVINGS_CATEGORIES = new Set(['investments', 'stocks', 'bitcoin', 'crypto', 'savings', 'bank']);

/**
 * Aggregates all user financial metrics for analysis
 */
async function aggregateUserFinancials(userId) {
  const [incomes, expenses, budgets] = await Promise.all([
    IncomeSchema.find({ userId }).sort({ date: -1 }),
    ExpenseSchema.find({ userId }).sort({ date: -1 }),
    BudgetSchema.find({ userId }).sort({ category: 1 })
  ]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = Math.max(1, now.getDate());
  const daysRemaining = Math.max(0, daysInMonth - currentDay);

  // Month-to-date items
  const mtdIncomes = incomes.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const mtdExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncomeMTD = mtdIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenseMTD = mtdExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavingsMTD = totalIncomeMTD - totalExpenseMTD;
  const savingsRate = totalIncomeMTD > 0 ? Math.round((netSavingsMTD / totalIncomeMTD) * 100) : 0;

  // Lifetime balances
  const lifetimeIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const lifetimeExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const lifetimeBalance = lifetimeIncome - lifetimeExpense;

  // Category breakdown MTD
  const categorySpending = {};
  mtdExpenses.forEach(e => {
    const cat = (e.category || 'other').toLowerCase();
    categorySpending[cat] = (categorySpending[cat] || 0) + e.amount;
  });

  // 50/30/20 Breakdown
  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsInvestmentsTotal = 0;

  Object.entries(categorySpending).forEach(([cat, amt]) => {
    if (NEEDS_CATEGORIES.has(cat)) {
      needsTotal += amt;
    } else if (SAVINGS_CATEGORIES.has(cat)) {
      savingsInvestmentsTotal += amt;
    } else {
      wantsTotal += amt;
    }
  });

  // Add net positive cash savings to savings bucket
  if (netSavingsMTD > 0) {
    savingsInvestmentsTotal += netSavingsMTD;
  }

  const effectiveIncome = Math.max(totalIncomeMTD, totalExpenseMTD, 1);
  const needsPct = Math.round((needsTotal / effectiveIncome) * 100);
  const wantsPct = Math.round((wantsTotal / effectiveIncome) * 100);
  const savingsPct = Math.round((savingsInvestmentsTotal / effectiveIncome) * 100);

  // Budget compliance
  const budgetMap = {};
  budgets.forEach(b => {
    budgetMap[b.category.toLowerCase()] = Number(b.monthlyLimit) || 0;
  });

  const budgetAnalysis = budgets.map(b => {
    const cat = b.category.toLowerCase();
    const spent = categorySpending[cat] || 0;
    const limit = Number(b.monthlyLimit) || 0;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return {
      category: b.category,
      limit,
      spent,
      pct,
      isOver: spent > limit,
      overAmount: Math.max(0, spent - limit),
      remaining: Math.max(0, limit - spent)
    };
  });

  // Burn velocity & runway projection
  const dailyBurn = currentDay > 0 ? totalExpenseMTD / currentDay : 0;
  const projectedMonthExpense = Math.round(totalExpenseMTD + (dailyBurn * daysRemaining));
  const projectedMonthEndBalance = Math.round(totalIncomeMTD - projectedMonthExpense);

  // Heuristic Executive Health Score (0 - 100)
  // 1. Cash flow score (0-25)
  let cashflowScore = 0;
  if (totalIncomeMTD > 0) {
    const ratio = netSavingsMTD / totalIncomeMTD;
    if (ratio >= 0.3) cashflowScore = 25;
    else if (ratio >= 0.15) cashflowScore = 20;
    else if (ratio >= 0) cashflowScore = 15;
    else if (ratio >= -0.15) cashflowScore = 8;
    else cashflowScore = 3;
  } else if (totalExpenseMTD === 0) {
    cashflowScore = 15;
  }

  // 2. Savings rate score (0-25)
  let savingsScore = 0;
  if (savingsRate >= 25) savingsScore = 25;
  else if (savingsRate >= 15) savingsScore = 20;
  else if (savingsRate >= 5) savingsScore = 14;
  else if (savingsRate >= 0) savingsScore = 8;
  else savingsScore = 2;

  // 3. Budget compliance score (0-25)
  let budgetScore = 20;
  if (budgetAnalysis.length > 0) {
    const overCount = budgetAnalysis.filter(b => b.isOver).length;
    if (overCount === 0) budgetScore = 25;
    else if (overCount === 1) budgetScore = 16;
    else if (overCount === 2) budgetScore = 10;
    else budgetScore = 5;
  }

  // 4. Discretionary vs Essential spend score (0-25)
  let discretionaryScore = 18;
  if (totalExpenseMTD > 0) {
    const wantsShare = (wantsTotal / totalExpenseMTD) * 100;
    if (wantsShare <= 30) discretionaryScore = 25;
    else if (wantsShare <= 45) discretionaryScore = 20;
    else if (wantsShare <= 60) discretionaryScore = 14;
    else discretionaryScore = 6;
  }

  const overallScore = Math.min(100, Math.max(0, cashflowScore + savingsScore + budgetScore + discretionaryScore));
  let letterGrade = 'A+';
  if (overallScore < 50) letterGrade = 'C-';
  else if (overallScore < 65) letterGrade = 'C+';
  else if (overallScore < 75) letterGrade = 'B';
  else if (overallScore < 85) letterGrade = 'B+';
  else if (overallScore < 93) letterGrade = 'A';

  // Anomalies / Alerts
  const anomalies = [];
  budgetAnalysis.filter(b => b.limit > 0 && b.isOver).forEach(b => {
    anomalies.push({
      type: 'budget_exceeded',
      title: `${b.category.toUpperCase()} Cap Exceeded`,
      description: `Spent $${b.spent.toLocaleString()} against $${b.limit.toLocaleString()} budget (${b.pct}% consumed).`,
      severity: 'high'
    });
  });

  if (wantsPct > 45 && totalExpenseMTD > 1000) {
    anomalies.push({
      type: 'high_discretionary',
      title: 'High Discretionary Burn',
      description: `Discretionary 'Wants' account for ${wantsPct}% of cash outflows (target: ≤30%).`,
      severity: 'medium'
    });
  }

  if (projectedMonthEndBalance < 0 && totalIncomeMTD > 0) {
    anomalies.push({
      type: 'deficit_projection',
      title: 'Projected Month-End Deficit',
      description: `At current burn ($${Math.round(dailyBurn)}/day), expenses will exceed monthly income by $${Math.abs(projectedMonthEndBalance).toLocaleString()}.`,
      severity: 'high'
    });
  }

  // Opportunities to save
  const opportunities = [];
  const sortedWants = Object.entries(categorySpending)
    .filter(([cat]) => WANTS_CATEGORIES.has(cat))
    .sort((a, b) => b[1] - a[1]);

  if (sortedWants.length > 0) {
    const [topWantCat, topWantAmt] = sortedWants[0];
    const potentialSaving = Math.round(topWantAmt * 0.2);
    opportunities.push({
      category: topWantCat,
      title: `Optimize ${topWantCat.charAt(0).toUpperCase() + topWantCat.slice(1)} Spending`,
      description: `Trimming ${topWantCat} outflows by 20% conserves $${potentialSaving.toLocaleString()}/mo toward your emergency reserve.`,
      potentialSaving
    });
  }

  if (netSavingsMTD > 1000) {
    opportunities.push({
      category: 'investments',
      title: 'Deploy Liquid Cash Surplus',
      description: `You have $${netSavingsMTD.toLocaleString()} in net monthly surplus. Consider allocating to index funds or high-yield yield accounts.`,
      potentialSaving: Math.round(netSavingsMTD * 0.05)
    });
  }

  return {
    mtd: {
      income: totalIncomeMTD,
      expense: totalExpenseMTD,
      net: netSavingsMTD,
      savingsRate
    },
    lifetime: {
      income: lifetimeIncome,
      expense: lifetimeExpense,
      balance: lifetimeBalance
    },
    categories: categorySpending,
    framework503020: {
      needs: { amount: needsTotal, pct: needsPct, target: 50 },
      wants: { amount: wantsTotal, pct: wantsPct, target: 30 },
      savings: { amount: savingsInvestmentsTotal, pct: savingsPct, target: 20 }
    },
    healthScore: {
      overall: overallScore,
      grade: letterGrade,
      breakdown: {
        cashflow: cashflowScore,
        savings: savingsScore,
        budget: budgetScore,
        discretionary: discretionaryScore
      }
    },
    budgets: budgetAnalysis,
    forecast: {
      daysInMonth,
      currentDay,
      daysRemaining,
      dailyBurn: Math.round(dailyBurn),
      projectedExpense: projectedMonthExpense,
      projectedEndBalance: projectedMonthEndBalance
    },
    anomalies,
    opportunities
  };
}

/**
 * Helper to get active Gemini API key from environment or request headers
 */
function getGeminiApiKey(req) {
  return req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || null;
}

/**
 * Controller: GET / POST /api/v1/ai-insights
 */
const getAiInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const telemetry = await aggregateUserFinancials(userId);
    const apiKey = getGeminiApiKey(req);

    let narrativeInsights = null;
    let engine = 'heuristic';

    // If Gemini API Key is available, invoke Gemini 3.8 Flash for rich natural language commentary
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are FinAdvisor AI, a premier Certified Financial Planner embedded in a luxury dark-fintech wealth management terminal.
Analyze the following user financial telemetry for the current month and produce a concise executive briefing:

Financial Telemetry:
- Month-to-date Income: $${telemetry.mtd.income.toLocaleString()}
- Month-to-date Expenses: $${telemetry.mtd.expense.toLocaleString()}
- Net Monthly Savings: $${telemetry.mtd.net.toLocaleString()} (Savings Rate: ${telemetry.mtd.savingsRate}%)
- Total Liquid Net Worth in Tracker: $${telemetry.lifetime.balance.toLocaleString()}
- 50/30/20 Actual: Needs ${telemetry.framework503020.needs.pct}% (Target 50%), Wants ${telemetry.framework503020.wants.pct}% (Target 30%), Savings ${telemetry.framework503020.savings.pct}% (Target 20%)
- Overall Financial Health Score: ${telemetry.healthScore.overall}/100 (Grade ${telemetry.healthScore.grade})
- Daily Burn Velocity: $${telemetry.forecast.dailyBurn}/day, Projected Month-End Balance: $${telemetry.forecast.projectedEndBalance.toLocaleString()}
- Top Categories: ${JSON.stringify(telemetry.categories)}
- Active Budgets: ${JSON.stringify(telemetry.budgets)}

Respond strictly in valid JSON with exactly two fields:
{
  "executiveSummary": "2-3 sentences providing an authoritative, motivating wealth critique highlighting their primary strength and primary vulnerability.",
  "topTacticalAction": "1 high-leverage specific recommendation with dollar impact for this month."
}`;

        let response = null;
        for (const candidateModel of ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']) {
          try {
            response = await ai.models.generateContent({
              model: candidateModel,
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
            });
            if (response?.text) {
              engine = candidateModel;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${candidateModel} failed:`, modelErr.message);
          }
        }

        if (response?.text) {
          const parsed = JSON.parse(response.text.trim());
          narrativeInsights = parsed;
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', geminiErr.message);
      }
    }

    // Default heuristic executive summary if no Gemini API key or on error
    if (!narrativeInsights) {
      const isPositive = telemetry.mtd.net >= 0;
      narrativeInsights = {
        executiveSummary: isPositive
          ? `Your cash flow maintains positive momentum with a ${telemetry.mtd.savingsRate}% monthly savings rate. Capital preservation remains robust with ${telemetry.framework503020.savings.pct}% directed toward savings and liquidity reserves.`
          : `Outflows currently exceed inflows this month by $${Math.abs(telemetry.mtd.net).toLocaleString()}. To preserve your balance before month-end, focus on cooling discretionary categories.`,
        topTacticalAction: telemetry.opportunities.length > 0
          ? telemetry.opportunities[0].description
          : `Review high-frequency categories to maintain healthy buffers against unexpected outlays.`
      };
    }

    res.status(200).json({
      success: true,
      engine,
      telemetry,
      narrative: narrativeInsights
    });
  } catch (err) {
    console.error('getAiInsights error:', err);
    res.status(500).json({ message: 'Failed to generate financial insights', error: err.message });
  }
};

/**
 * Controller: POST /api/v1/ai-chat
 * Multi-turn grounded financial advisor chat
 */
const getAiChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'User prompt message is required' });
    }

    const telemetry = await aggregateUserFinancials(userId);
    const apiKey = getGeminiApiKey(req);

    // If Gemini key is available, generate response via Gemini 3.8 Flash
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FinAdvisor AI, a top-tier private wealth advisor and fintech intelligence agent.
You have real-time visibility into the user's financial ledger:
- Current Month Inflows: $${telemetry.mtd.income.toLocaleString()}
- Current Month Outflows: $${telemetry.mtd.expense.toLocaleString()}
- Net Monthly Cash Flow: $${telemetry.mtd.net.toLocaleString()}
- Total Balance: $${telemetry.lifetime.balance.toLocaleString()}
- 50/30/20 Distribution: Needs: ${telemetry.framework503020.needs.pct}%, Wants: ${telemetry.framework503020.wants.pct}%, Savings: ${telemetry.framework503020.savings.pct}%
- Health Score: ${telemetry.healthScore.overall}/100 (${telemetry.healthScore.grade})
- Spending by Category: ${JSON.stringify(telemetry.categories)}
- Category Budgets: ${JSON.stringify(telemetry.budgets)}
- Projected Month-End: $${telemetry.forecast.projectedEndBalance.toLocaleString()} (Daily burn: $${telemetry.forecast.dailyBurn}/day)

Guidelines:
- Give crisp, actionable, sophisticated financial advice.
- Cite their actual numbers where relevant.
- Format with clean markdown (bullet points, bold text for key numbers).
- Keep answers concise (2-4 paragraphs max).
- If they ask about saving money, refer to their highest discretionary expense categories.`;

        // Format history for Gemini
        const contents = [];
        conversationHistory.slice(-6).forEach(msg => {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });

        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        let chatResponse = null;
        let activeEngine = 'gemini-3.5-flash-lite';
        for (const candidateModel of ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']) {
          try {
            chatResponse = await ai.models.generateContent({
              model: candidateModel,
              contents,
              config: {
                systemInstruction: systemPrompt
              }
            });
            if (chatResponse?.text) {
              activeEngine = candidateModel;
              break;
            }
          } catch (modelErr) {
            console.warn(`Chat with ${candidateModel} failed:`, modelErr.message);
          }
        }

        if (chatResponse?.text) {
          return res.status(200).json({
            success: true,
            engine: activeEngine,
            reply: chatResponse.text
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini chat failed, falling back to heuristic advisor:', geminiErr.message);
      }
    }

    // Deterministic Heuristic Advisor Chat Fallback
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('save') || lower.includes('cut') || lower.includes('reduce')) {
      const topOpp = telemetry.opportunities[0];
      reply = `### 💡 Strategic Savings Plan\n\n` +
        `Based on your current ledger, your fastest path to increasing monthly savings is optimizing **${topOpp ? topOpp.category : 'discretionary expenses'}**.\n\n` +
        `- **Current Monthly Inflows**: $${telemetry.mtd.income.toLocaleString()}\n` +
        `- **Current Monthly Outflows**: $${telemetry.mtd.expense.toLocaleString()}\n` +
        `- **Discretionary 'Wants' Ratio**: ${telemetry.framework503020.wants.pct}% (Ideal: ≤ 30%)\n\n` +
        `**Action Step**: ${topOpp ? topOpp.description : 'Cut restaurant dining and non-essential subscriptions by 20% to bank an extra $200-$400 monthly.'}`;
    } else if (lower.includes('50/30/20') || lower.includes('framework') || lower.includes('rule')) {
      reply = `### 📊 Your 50/30/20 Rule Breakdown\n\n` +
        `Here is how your current monthly spending stacks up against the classic **50/30/20 Wealth Framework**:\n\n` +
        `- **Essential Needs (Target 50%)**: **${telemetry.framework503020.needs.pct}%** ($${telemetry.framework503020.needs.amount.toLocaleString()})\n` +
        `- **Discretionary Wants (Target 30%)**: **${telemetry.framework503020.wants.pct}%** ($${telemetry.framework503020.wants.amount.toLocaleString()})\n` +
        `- **Savings & Growth (Target 20%)**: **${telemetry.framework503020.savings.pct}%** ($${telemetry.framework503020.savings.amount.toLocaleString()})\n\n` +
        (telemetry.framework503020.savings.pct >= 20
          ? `🎉 **Superb Discipline**: Your savings and investment rate meets or exceeds the golden 20% threshold!`
          : `⚠️ **Adjustment Recommended**: Your savings rate is currently ${telemetry.framework503020.savings.pct}%. Reducing Wants closer to 30% will accelerate your wealth building.`);
    } else if (lower.includes('budget') || lower.includes('limit') || lower.includes('cap')) {
      const overBudgets = telemetry.budgets.filter(b => b.isOver);
      reply = `### 🎯 Budget Adherence Diagnostic\n\n` +
        `You currently have **${telemetry.budgets.length} category budgets** set.\n\n` +
        (overBudgets.length > 0
          ? `⚠️ **Over-Limit Categories**:\n` + overBudgets.map(b => `- **${b.category}**: $${b.spent.toLocaleString()} spent vs $${b.limit.toLocaleString()} cap (+$${b.overAmount.toLocaleString()} over)`).join('\n') + `\n\nI recommend freezing discretionary purchases in these categories for the remainder of the month.`
          : `✅ **All Categories Within Caps**: All active budgets are currently running on track without any overruns. Great fiscal control!`);
    } else {
      reply = `### 🏦 FinAdvisor Executive Overview\n\n` +
        `Here is your live financial snapshot for this month:\n\n` +
        `- **Financial Health Score**: **${telemetry.healthScore.overall}/100** (Grade ${telemetry.healthScore.grade})\n` +
        `- **Net Cash Flow**: **${telemetry.mtd.net >= 0 ? '+' : ''}$${telemetry.mtd.net.toLocaleString()}** (Savings Rate: ${telemetry.mtd.savingsRate}%)\n` +
        `- **Daily Burn Rate**: ~$${telemetry.forecast.dailyBurn}/day\n` +
        `- **Projected End Balance**: **$${telemetry.forecast.projectedEndBalance.toLocaleString()}**\n\n` +
        `Feel free to ask me:\n` +
        `1. *"How can I save $500 this month?"*\n` +
        `2. *"Am I on track with the 50/30/20 rule?"*\n` +
        `3. *"Which categories should I trim first?"*`;
    }

    res.status(200).json({
      success: true,
      engine: 'heuristic',
      reply
    });
  } catch (err) {
    console.error('getAiChat error:', err);
    res.status(500).json({ message: 'Failed to process advisor chat', error: err.message });
  }
};

module.exports = {
  getAiInsights,
  getAiChat
};
