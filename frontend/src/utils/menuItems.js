import { dashboard, expenses, piggy, sparkles, transactions, trend } from "./Icons";

export const menuItems = [
  {
    id: 1,
    title : 'Dashboard',
    icon : dashboard,
    link : '/dashboard'
  },
  {
    id: 2,
    title : 'View Transactions',
    icon :  transactions,
    link : '/dashboard'
  },
  {
    id: 3,
    title : 'Incomes',
    icon : trend,
    link : '/dashboard'
  },
  {
    id: 4,
    title : 'Expenses',
    icon :  expenses,
    link : '/dashboard'
  },
  {
    id: 5,
    title : 'Budgets & Limits',
    icon : piggy,
    link : '/dashboard'
  },
  {
    id: 6,
    title : 'AI Advisor',
    icon : sparkles,
    link : '/dashboard'
  },
]