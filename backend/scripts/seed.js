const mongoose = require('mongoose');
const dns = require('dns');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Income = require('../models/IncomeModel');
const Expense = require('../models/ExpenseModel');

// Ensure DNS works for MongoDB Atlas on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    console.log('--- Starting Seed Process ---');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected.');

    const targetEmail = process.argv[2] || 'demo@vault.finance';
    const targetPassword = 'Password123!';
    let userId = null;

    console.log(`Authenticating with Supabase for: ${targetEmail}...`);
    
    // First try sign in
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    if (signInData?.user) {
      userId = signInData.user.id;
      console.log(`Found and authenticated existing user (ID: ${userId})`);
    } else {
      console.log(`Registering account in Supabase...`);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
        options: {
          data: {
            full_name: 'Alex Vance',
          },
        },
      });

      if (signUpError) {
        throw new Error(`Failed to register Supabase user: ${signUpError.message}`);
      }

      userId = signUpData.user?.id;
      console.log(`Successfully registered user (ID: ${userId})`);
    }

    if (!userId) {
      throw new Error('Unable to obtain user ID for seeding.');
    }

    // Clean up existing records for this user
    console.log(`Clearing existing records for user ${userId}...`);
    await Income.deleteMany({ userId });
    await Expense.deleteMany({ userId });

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

    console.log(`Inserting ${sampleIncomes.length} incomes...`);
    await Income.insertMany(sampleIncomes);

    console.log(`Inserting ${sampleExpenses.length} expenses...`);
    await Expense.insertMany(sampleExpenses);

    console.log('\n======================================');
    console.log('SUCCESS: Seed data inserted successfully!');
    console.log(`Demo Account:  ${targetEmail}`);
    console.log(`Password:      ${targetPassword}`);
    console.log(`Total Incomes:  5 ($12,800.00)`);
    console.log(`Total Expenses: 7 ($5,735.00)`);
    console.log(`Net Balance:    +$7,065.00`);
    console.log('======================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
