import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import IncomeItem from '../IncomeItem/IncomeItem';

function TransactionsView() {
  const { incomes, expenses, deleteIncome, deleteExpense } = useGlobalContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Combine transactions
  const allTransactions = useMemo(() => {
    const formattedIncomes = incomes.map(i => ({ ...i, type: 'income' }))
    const formattedExpenses = expenses.map(e => ({ ...e, type: 'expense' }))
    return [...formattedIncomes, ...formattedExpenses]
  }, [incomes, expenses])

  // Get unique categories for dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Set(allTransactions.map(t => t.category).filter(Boolean))
    return Array.from(cats)
  }, [allTransactions])

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter(item => {
        // Type filter
        if (typeFilter !== 'all' && item.type !== typeFilter) return false
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          const titleMatch = item.title?.toLowerCase().includes(term)
          const descMatch = item.description?.toLowerCase().includes(term)
          const catMatch = item.category?.toLowerCase().includes(term)
          return titleMatch || descMatch || catMatch
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount
        }
        return 0
      })
  }, [allTransactions, typeFilter, selectedCategory, searchTerm, sortBy])

  // Metrics for filtered result
  const filteredMetrics = useMemo(() => {
    let inflow = 0
    let outflow = 0
    filteredTransactions.forEach(t => {
      if (t.type === 'income') inflow += t.amount
      else outflow += t.amount
    })
    return {
      count: filteredTransactions.length,
      inflow,
      outflow,
      net: inflow - outflow,
    }
  }, [filteredTransactions])

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredTransactions.length) return

    const headers = ['Type', 'Title', 'Amount', 'Category', 'Date', 'Description']
    const rows = filteredTransactions.map(t => [
      t.type,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.category || '',
      new Date(t.date || t.createdAt).toISOString().split('T')[0],
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vault-transactions-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <TransactionsStyled>
      <InnerLayout>
        <div className='view-header'>
          <div>
            <h1>Transaction Explorer</h1>
            <p className='subtitle'>Filter, search, sort and export your comprehensive financial audit log</p>
          </div>

          <div className='header-cta'>
            <motion.button
              type='button'
              className='export-btn'
              onClick={handleExportCSV}
              disabled={!filteredTransactions.length}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export CSV</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className='summary-bar'>
          <div className='stat-pill'>
            <span className='dim'>Showing</span>
            <strong>{filteredMetrics.count} Records</strong>
          </div>
          <div className='stat-pill'>
            <span className='dim'>Total Inflow</span>
            <strong className='text-emerald'>+${filteredMetrics.inflow.toLocaleString()}</strong>
          </div>
          <div className='stat-pill'>
            <span className='dim'>Total Outflow</span>
            <strong className='text-rose'>-${filteredMetrics.outflow.toLocaleString()}</strong>
          </div>
          <div className='stat-pill'>
            <span className='dim'>Net Cash Flow</span>
            <strong className={filteredMetrics.net >= 0 ? 'text-emerald' : 'text-rose'}>
              {filteredMetrics.net >= 0 ? '+' : ''}${filteredMetrics.net.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Controls Container */}
        <div className='controls-panel'>
          {/* Search Input */}
          <div className='search-wrap'>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type='text'
              placeholder='Search by title, description or tag...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type='button' className='clear-btn' onClick={() => setSearchTerm('')}>
                &times;
              </button>
            )}
          </div>

          <div className='filters-row'>
            {/* Type Filter Tabs */}
            <div className='type-tabs'>
              <button
                type='button'
                className={typeFilter === 'all' ? 'active' : ''}
                onClick={() => setTypeFilter('all')}
              >
                All ({allTransactions.length})
              </button>
              <button
                type='button'
                className={typeFilter === 'income' ? 'active' : ''}
                onClick={() => setTypeFilter('income')}
              >
                Incomes ({incomes.length})
              </button>
              <button
                type='button'
                className={typeFilter === 'expense' ? 'active' : ''}
                onClick={() => setTypeFilter('expense')}
              >
                Expenses ({expenses.length})
              </button>
            </div>

            {/* Category Dropdown */}
            <div className='select-wrap'>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value='all'>All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className='select-wrap'>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value='date-desc'>Date (Newest first)</option>
                <option value='date-asc'>Date (Oldest first)</option>
                <option value='amount-desc'>Amount (Highest first)</option>
                <option value='amount-asc'>Amount (Lowest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Feed */}
        <div className='transactions-feed'>
          {filteredTransactions.length === 0 ? (
            <div className='empty-feed'>
              <div className='empty-icon'>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <h4>No Transactions Found</h4>
              <p>Try adjusting your search query, type filter, or selected category.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredTransactions.map(item => {
                const { _id, title, amount, date, category, description, type } = item
                const isExpense = type === 'expense'
                return (
                  <IncomeItem
                    key={_id}
                    id={_id}
                    title={title}
                    description={description}
                    type={type}
                    amount={amount}
                    date={date}
                    category={category}
                    indicatorColor={isExpense ? '#F43F5E' : '#10B981'}
                    deleteItem={isExpense ? deleteExpense : deleteIncome}
                  />
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </InnerLayout>
    </TransactionsStyled>
  )
}

const TransactionsStyled = styled.div`
  display: flex;
  overflow: auto;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .subtitle {
      font-size: 0.88rem;
      color: var(--text-dim);
    }

    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: rgba(99, 102, 241, 0.28);
        border-color: rgba(99, 102, 241, 0.6);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }

  .summary-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;

    .stat-pill {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 0.75rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.88rem;

      .dim {
        color: var(--text-dim);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      strong {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #ffffff;

        &.text-emerald {
          color: #34d399;
        }

        &.text-rose {
          color: #fb7185;
        }
      }
    }
  }

  .controls-panel {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 20px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .search-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-input);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: var(--accent-violet);
        background: rgba(15, 23, 42, 0.95);
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
      }

      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: inherit;
        font-size: 0.95rem;
        color: #ffffff;

        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      .clear-btn {
        background: none;
        border: none;
        color: var(--text-dim);
        font-size: 1.3rem;
        cursor: pointer;
        line-height: 1;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      .type-tabs {
        display: flex;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 3px;
        gap: 3px;

        button {
          padding: 0.5rem 0.9rem;
          background: transparent;
          border: none;
          border-radius: 9px;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;

          &.active {
            background: rgba(99, 102, 241, 0.25);
            color: #ffffff;
            border: 1px solid rgba(99, 102, 241, 0.4);
          }

          &:hover:not(.active) {
            color: #ffffff;
          }
        }
      }

      .select-wrap {
        select {
          background: var(--bg-input);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.6rem 1rem;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 0.88rem;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--accent-violet);
          }

          option {
            background: #0e131f;
            color: #ffffff;
          }
        }
      }
    }
  }

  .transactions-feed {
    display: flex;
    flex-direction: column;

    .empty-feed {
      background: var(--bg-card);
      border: 1px dashed var(--border-subtle);
      border-radius: 24px;
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;

      .empty-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
      }

      h4 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
      }

      p {
        font-size: 0.88rem;
        color: var(--text-dim);
        max-width: 320px;
      }
    }
  }
`;

export default TransactionsView
