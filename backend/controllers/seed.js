const Income = require('../models/IncomeModel');
const Expense = require('../models/ExpenseModel');
const Budget = require('../models/BudgetModel');

exports.seedUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Clean up previous records for this user
        await Income.deleteMany({ userId });
        await Expense.deleteMany({ userId });
        await Budget.deleteMany({ userId });

        const now = new Date();
        const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

        const sampleIncomes = [
            {
                userId,
                title: 'Senior Tech Salary',
                amount: 7500,
                type: 'income',
                date: daysAgo(25),
                category: 'salary',
                description: 'Monthly engineering compensation',
            },
            {
                userId,
                title: 'Fintech Consulting',
                amount: 2800,
                type: 'income',
                date: daysAgo(18),
                category: 'freelancing',
                description: 'Contract UI/UX & backend advisory',
            },
            {
                userId,
                title: 'YouTube Sponsorship',
                amount: 1400,
                type: 'income',
                date: daysAgo(12),
                category: 'youtube',
                description: 'Dev tool video sponsorship',
            },
            {
                userId,
                title: 'Staking & Dividends',
                amount: 650,
                type: 'income',
                date: daysAgo(6),
                category: 'investments',
                description: 'Index fund quarterly distribution',
            },
            {
                userId,
                title: 'Crypto Yield',
                amount: 450,
                type: 'income',
                date: daysAgo(2),
                category: 'bitcoin',
                description: 'DeFi automated yield payout',
            },
        ];

        const sampleExpenses = [
            {
                userId,
                title: 'Studio Apartment Rent',
                amount: 2200,
                type: 'expense',
                date: daysAgo(26),
                category: 'other',
                description: 'Monthly downtown lease',
            },
            {
                userId,
                title: 'MacBook & Monitor Setup',
                amount: 1650,
                type: 'expense',
                date: daysAgo(20),
                category: 'clothing',
                description: 'Tech hardware refresh',
            },
            {
                userId,
                title: 'Tokyo Flight & Transit',
                amount: 850,
                type: 'expense',
                date: daysAgo(15),
                category: 'travelling',
                description: 'Vacation travel booking',
            },
            {
                userId,
                title: 'AWS & Cloud Infrastructure',
                amount: 380,
                type: 'expense',
                date: daysAgo(11),
                category: 'subscriptions',
                description: 'Production server instances',
            },
            {
                userId,
                title: 'Whole Foods Organic',
                amount: 340,
                type: 'expense',
                date: daysAgo(8),
                category: 'groceries',
                description: 'Bi-weekly grocery restocking',
            },
            {
                userId,
                title: 'Dental Procedure',
                amount: 220,
                type: 'expense',
                date: daysAgo(4),
                category: 'health',
                description: 'Routine healthcare checkup',
            },
            {
                userId,
                title: 'SaaS Tools (Figma/GitHub)',
                amount: 95,
                type: 'expense',
                date: daysAgo(1),
                category: 'subscriptions',
                description: 'Team workflow licenses',
            },
        ];

        const sampleBudgets = [
            { userId, category: 'groceries', amount: 500 },
            { userId, category: 'subscriptions', amount: 250 },
            { userId, category: 'health', amount: 300 },
            { userId, category: 'takeaways', amount: 200 },
            { userId, category: 'travelling', amount: 1000 },
            { userId, category: 'other', amount: 2500 },
        ];

        await Income.insertMany(sampleIncomes);
        await Expense.insertMany(sampleExpenses);
        await Budget.insertMany(sampleBudgets);

        res.status(200).json({
            message: 'Sample financial data generated successfully!',
            incomesCount: sampleIncomes.length,
            expensesCount: sampleExpenses.length,
            budgetsCount: sampleBudgets.length,
        });
    } catch (err) {
        console.error('Seed user data error:', err);
        res.status(500).json({ message: 'Failed to seed sample data' });
    }
};

exports.clearUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Income.deleteMany({ userId });
        await Expense.deleteMany({ userId });
        await Budget.deleteMany({ userId });

        res.status(200).json({
            message: 'All user transaction and budget records cleared successfully!',
        });
    } catch (err) {
        console.error('Clear user data error:', err);
        res.status(500).json({ message: 'Failed to clear user data' });
    }
};

