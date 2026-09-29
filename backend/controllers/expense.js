const ExpenseSchema = require("../models/ExpenseModel");

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    const expense = new ExpenseSchema({
        userId: req.user.id,
        title,
        description,
        amount,
        category,
        date,
    });

    try {
        // validation
        if (!title || !description || !category || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (amount <= 0 || typeof amount !== 'number') {
            return res.status(400).json({ message: 'Amount must be positive number!' });
        }
        await expense.save();
        res.status(200).json({ message: 'Expense Added', expense });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await ExpenseSchema.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await ExpenseSchema.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (err) {
        console.error('Delete expense error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};