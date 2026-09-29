import React, { useContext, useEffect, useState } from "react"
import axios from 'axios'
import { useAuth } from './authContext'

const BASE_URL = 'http://localhost:5000/api/v1/';

const GlobalContext = React.createContext()

export const GlobalProvider = ({ children }) => {
  const { session } = useAuth()
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [advisorData, setAdvisorData] = useState(null)
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [geminiApiKey, setGeminiApiKeyState] = useState(() => {
    return localStorage.getItem('gemini_custom_key') || ''
  })
  const [error, setError] = useState(null)

  const setGeminiApiKey = (key) => {
    setGeminiApiKeyState(key)
    if (key) {
      localStorage.setItem('gemini_custom_key', key)
    } else {
      localStorage.removeItem('gemini_custom_key')
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      getIncomes();
      getExpenses();
      getBudgets();
      getAiInsights();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIncomes([]);
      setExpenses([]);
      setBudgets([]);
      setAdvisorData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  //calculate incomes
  const addIncome = async (income) => {
    try {
      await axios.post(`${BASE_URL}add-income`, income)
      getIncomes()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const getIncomes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-incomes`)
      setIncomes(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-income/${id}`)
      getIncomes()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const totalIncome = () => {
    let total = 0
    incomes.forEach((income) => {
      total = total + income.amount
    })
    return total
  }

  //calculate expenses
  const addExpense = async (expense) => {
    try {
      await axios.post(`${BASE_URL}add-expense`, expense)
      getExpenses()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const getExpenses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-expenses`)
      setExpenses(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-expense/${id}`)
      getExpenses()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const totalExpenses = () => {
    let total = 0
    expenses.forEach((expense) => {
      total = total + expense.amount
    })
    return total
  }

  const totalBalance = () => {
    return totalIncome() - totalExpenses()
  }

  const transactionHistory = () => {
    const history = [...incomes, ...expenses]
    history.sort((a, b) => {
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    })
    return history.slice(0, 5)
  }

  const getBudgets = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-budgets`)
      setBudgets(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const setBudget = async (category, amount) => {
    try {
      const res = await axios.post(`${BASE_URL}set-budget`, { category, amount })
      await getBudgets()
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteBudget = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-budget/${id}`)
      await getBudgets()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const seedDemoData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}seed-data`)
      await getIncomes()
      await getExpenses()
      await getBudgets()
      await getAiInsights()
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const clearUserData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}clear-data`)
      await getIncomes()
      await getExpenses()
      await getBudgets()
      await getAiInsights()
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const getAiInsights = async () => {
    try {
      setAdvisorLoading(true)
      const headers = {}
      if (geminiApiKey) {
        headers['x-gemini-key'] = geminiApiKey
      }
      const res = await axios.post(`${BASE_URL}ai-insights`, {}, { headers })
      setAdvisorData(res.data)
      return res.data
    } catch (err) {
      console.warn('Failed to load AI insights:', err)
      setError(err.response?.data?.message || err.message)
      return null
    } finally {
      setAdvisorLoading(false)
    }
  }

  const sendAiChat = async (message, conversationHistory = []) => {
    try {
      const headers = {}
      if (geminiApiKey) {
        headers['x-gemini-key'] = geminiApiKey
      }
      const res = await axios.post(
        `${BASE_URL}ai-chat`,
        { message, conversationHistory },
        { headers }
      )
      return res.data
    } catch (err) {
      console.error('AI chat failed:', err)
      throw err
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        addIncome,
        getIncomes,
        incomes,
        deleteIncome,
        totalIncome,
        expenses,
        addExpense,
        getExpenses,
        totalExpenses,
        deleteExpense,
        totalBalance,
        transactionHistory,
        budgets,
        getBudgets,
        setBudget,
        deleteBudget,
        advisorData,
        advisorLoading,
        geminiApiKey,
        setGeminiApiKey,
        getAiInsights,
        sendAiChat,
        seedDemoData,
        clearUserData,
        error,
        setError,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}