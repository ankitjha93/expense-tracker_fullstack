const express = require('express')
const cors = require('cors')
const { db } = require('./db/db')
const {readdirSync} = require('fs')
const app = express()

require('dotenv').config()

const PORT = process.env.PORT

// middlewares

app.use(express.json())
app.use(cors())

// routes
readdirSync('./routes').map((route) => app.use('/api/v1', require('./routes/' + route)))


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