const Budget = require('../models/BudgetModel');

exports.setBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, amount } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ message: 'Category and positive amount are required' });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ message: 'Budget amount must be a positive number' });
        }

        const budget = await Budget.findOneAndUpdate(
            { userId, category: category.toLowerCase().trim() },
            { amount: numericAmount },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Budget limit configured successfully', budget });
    } catch (err) {
        console.error('Set budget error:', err);
        res.status(500).json({ message: 'Server error setting budget' });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(budgets);
    } catch (err) {
        console.error('Get budgets error:', err);
        res.status(500).json({ message: 'Server error retrieving budgets' });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleted = await Budget.findOneAndDelete({ _id: id, userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Budget target not found' });
        }

        res.status(200).json({ message: 'Budget target removed successfully' });
    } catch (err) {
        console.error('Delete budget error:', err);
        res.status(500).json({ message: 'Server error removing budget' });
    }
};
