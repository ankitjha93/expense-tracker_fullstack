const express = require('express')
const cors = require('cors')
const { db } = require('./db/db')
const {readdirSync} = require('fs')
const app = express()

require('dotenv').config()

const PORT = process.env.PORT

// middlewares

app.use(express.json())
// Robust CORS configuration supporting both direct browser calls and reverse proxy requests
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key', 'Accept']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// routes - support both /api/v1 prefix and direct root fallback
readdirSync('./routes').map((route) => {
  const router = require('./routes/' + route);
  app.use('/api/v1', router);
  app.use('/', router);
});


// Root Health Check & API Status Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Expense Tracker & FinAdvisor API',
    version: '1.0.0',
    documentation: 'All API endpoints are prefixed under /api/v1',
    endpoints: {
      incomes: '/api/v1/get-incomes',
      expenses: '/api/v1/get-expenses',
      budgets: '/api/v1/get-budgets',
      aiInsights: '/api/v1/ai-insights',
      aiChat: '/api/v1/ai-chat',
      seedData: '/api/v1/seed-data'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

const server = () => {
  db()
  app.listen(PORT, () => {
    console.log('you are listening to port :',PORT)
  })
 
}

server()