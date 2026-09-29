const { addExpense, getExpenses, deleteExpense } = require('../controllers/expense');
const { addIncome, getIncomes, deleteIncome } = require('../controllers/income');
const { seedUserData, clearUserData } = require('../controllers/seed');
const { setBudget, getBudgets, deleteBudget } = require('../controllers/budget');
const { getAiInsights, getAiChat } = require('../controllers/advisor');
const { requireAuth } = require('../middleware/auth');

const router = require('express').Router();

// Apply authentication middleware to all transaction routes
router.use(requireAuth);

router.post('/add-income', addIncome)
    .get('/get-incomes', getIncomes)
    .delete('/delete-income/:id', deleteIncome)
    .post('/add-expense', addExpense)
    .get('/get-expenses', getExpenses)
    .delete('/delete-expense/:id', deleteExpense)
    .post('/seed-data', seedUserData)
    .post('/clear-data', clearUserData)
    .post('/set-budget', setBudget)
    .get('/get-budgets', getBudgets)
    .delete('/delete-budget/:id', deleteBudget)
    .post('/ai-insights', getAiInsights)
    .get('/ai-insights', getAiInsights)
    .post('/ai-chat', getAiChat);

module.exports = router;