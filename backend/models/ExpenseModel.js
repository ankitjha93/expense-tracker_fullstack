const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
        },
        amount: {
            type: Number,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            default: 'expense',
        },
        date: {
            type: Date,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);