const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true });

// Compound unique index ensuring one budget limit per category per user
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
