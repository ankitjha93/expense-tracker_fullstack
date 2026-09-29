import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { InnerLayout } from '../../styles/Layouts';
import Chart from '../Chart/Chart';
import { useGlobalContext } from '../../context/globalContext';
import { useToast } from '../../context/toastContext';
import History from '../History/History';

function Dashboard({ setActive }) {
  const { totalExpenses, incomes, expenses, totalIncome, totalBalance, getIncomes, getExpenses, budgets, getBudgets, advisorData, seedDemoData, clearUserData } = useGlobalContext()
  const { toast } = useToast()
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showSampleCard, setShowSampleCard] = useState(false)

  useEffect(() => {
    getIncomes()
    getExpenses()
    getBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSeed = async () => {
    try {
      setSeeding(true)
      await seedDemoData()
      toast.success('Sample financial data generated successfully!', 'Data Seeded')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to generate sample data'
      toast.error(errorMsg, 'Error')
    } finally {
      setSeeding(false)
    }
  }

  const handleClear = async () => {
    try {
      setClearing(true)
      await clearUserData()
      toast.info('All transaction records have been cleared.', 'Clean Slate')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to clear transaction records'
      toast.error(errorMsg, 'Error')
    } finally {
      setClearing(false)
    }
  }

  const incomeVal = totalIncome()
  const expenseVal = totalExpenses()
  const balanceVal = totalBalance()

  const minIncome = incomes.length ? Math.min(...incomes.map(item => item.amount)) : 0
  const maxIncome = incomes.length ? Math.max(...incomes.map(item => item.amount)) : 0
  const minExpense = expenses.length ? Math.min(...expenses.map(item => item.amount)) : 0
  const maxExpense = expenses.length ? Math.max(...expenses.map(item => item.amount)) : 0

  const savingsRate = incomeVal > 0 ? Math.max(0, Math.round(((incomeVal - expenseVal) / incomeVal) * 100)) : 0

  // Category Spending Breakdown calculation
  const categorySpending = useMemo(() => {
    if (!expenses.length) return []
    const map = {}
    expenses.forEach((item) => {
      const cat = item.category || 'other'
      map[cat] = (map[cat] || 0) + item.amount
    })
    const total = Object.values(map).reduce((acc, curr) => acc + curr, 0)
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [expenses])

  // Current Month Budget Health Overview
  const budgetStats = useMemo(() => {
    if (!budgets || budgets.length === 0) return null
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalAllocated = budgets.reduce((acc, b) => acc + (Number(b.monthlyLimit) || 0), 0)
    const budgetedCategories = new Set(budgets.map(b => (b.category || '').toLowerCase()))

    const spentThisMonth = expenses
      .filter(item => {
        const d = new Date(item.date)
        return (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          budgetedCategories.has((item.category || '').toLowerCase())
        )
      })
      .reduce((acc, curr) => acc + curr.amount, 0)

    const pct = totalAllocated > 0 ? Math.round((spentThisMonth / totalAllocated) * 100) : 0
    const overspent = spentThisMonth > totalAllocated

    return {
      count: budgets.length,
      totalAllocated,
      spentThisMonth,
      pct,
      overspent,
      remaining: Math.max(0, totalAllocated - spentThisMonth),
      overAmount: Math.max(0, spentThisMonth - totalAllocated)
    }
  }, [budgets, expenses])

  return (
    <DashboardStyled>
      <InnerLayout>
        <div className='page-header'>
          <div>
            <h1>Financial Overview</h1>
            <p className='subtitle'>Real-time cash flow and portfolio intelligence</p>
          </div>
          <div className='header-actions'>
            <motion.button
              type='button'
              className={`demo-toggle-btn ${showSampleCard ? 'active' : ''}`}
              onClick={() => setShowSampleCard(prev => !prev)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title='Toggle Demo Sandbox & Sample Data'
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31"></path>
                <path d="M14 9.3V1.99"></path>
                <path d="M8.5 2h7"></path>
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                <path d="M5.52 16h12.96"></path>
              </svg>
              <span>Demo Sandbox</span>
              <span className='toggle-indicator'>{showSampleCard ? '✕' : '▾'}</span>
            </motion.button>
            <div className='header-badge'>
              <span className='dot'></span>
              <span>Live Portfolio</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSampleCard && (
            <motion.div
              key="sample-data-card"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className='sample-data-banner'
            >
              <div className='banner-left'>
                <div className='flask-icon'>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31"></path>
                    <path d="M14 9.3V1.99"></path>
                    <path d="M8.5 2h7"></path>
                    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                    <path d="M5.52 16h12.96"></path>
                  </svg>
                </div>
                <div className='banner-text'>
                  <h4>Financial Sandbox & Demo Data</h4>
                  <p>
                    Quickly test the analytics, charts, and transaction feeds with 12 pre-configured incomes & expenses across the past month ($12.8k inflows, $5.7k outflows).
                  </p>
                </div>
              </div>

              <div className='banner-actions'>
                <button
                  type='button'
                  className='action-btn seed-action'
                  onClick={handleSeed}
                  disabled={seeding || clearing}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>{seeding ? 'Generating...' : 'Load Sample Data'}</span>
                </button>

                <button
                  type='button'
                  className='action-btn clear-action'
                  onClick={handleClear}
                  disabled={seeding || clearing || (incomes.length === 0 && expenses.length === 0)}
                  title='Clear all incomes & expenses for a clean slate'
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>{clearing ? 'Clearing...' : 'Clear All Data'}</span>
                </button>

                <button
                  type='button'
                  className='close-banner-btn'
                  onClick={() => setShowSampleCard(false)}
                  title='Hide Demo Sandbox Card'
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='metrics-grid'>
          <motion.div
            className='metric-card balance-card'
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='card-top'>
              <span className='label'>Total Balance</span>
              <span className='pill savings-pill'>{savingsRate}% Saved</span>
            </div>
            <div className='value-wrap'>
              <h2>${balanceVal.toLocaleString()}</h2>
            </div>
            <div className='card-footer'>
              <span>Available Liquidity</span>
              <span className='rate-text'>Net worth status</span>
            </div>
          </motion.div>

          <motion.div
            className='metric-card income-card'
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='card-top'>
              <span className='label'>Total Income</span>
              <div className='icon-bubble income-bubble'>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </div>
            </div>
            <div className='value-wrap'>
              <h2 className='income-val'>+${incomeVal.toLocaleString()}</h2>
            </div>
            <div className='card-footer'>
              <span>{incomes.length} Inflow transactions</span>
            </div>
          </motion.div>

          <motion.div
            className='metric-card expense-card'
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='card-top'>
              <span className='label'>Total Expenses</span>
              <div className='icon-bubble expense-bubble'>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </div>
            <div className='value-wrap'>
              <h2 className='expense-val'>-${expenseVal.toLocaleString()}</h2>
            </div>
            <div className='card-footer'>
              <span>{expenses.length} Outflow transactions</span>
            </div>
          </motion.div>
        </div>

        <div className='content-grid'>
          <div className='chart-section'>
            <Chart />

            <div className='category-breakdown-card'>
              <div className='card-header'>
                <div className='title-group'>
                  <h4>Top Spending Categories</h4>
                  <span className='subtitle'>Capital outflow distribution across accounts</span>
                </div>
                <span className='pill'>{categorySpending.length} Categories</span>
              </div>

              <div className='category-list'>
                {categorySpending.length === 0 ? (
                  <div className='empty-categories'>No expense transactions recorded yet</div>
                ) : (
                  categorySpending.map((cat) => (
                    <div key={cat.category} className='category-row'>
                      <div className='row-info'>
                        <span className='cat-name'>
                          {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                        </span>
                        <span className='cat-amount'>
                          ${cat.amount.toLocaleString()} <span className='percent'>({cat.percentage}%)</span>
                        </span>
                      </div>
                      <div className='cat-progress-track'>
                        <div
                          className='cat-progress-fill'
                          style={{ width: `${Math.max(4, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className='sidebar-section'>
            <History setActive={setActive} />

            <div className='range-analytics'>
              <div className='range-header'>
                <h3>Spread Analytics</h3>
              </div>

              <div className='range-card'>
                <div className='range-title'>
                  <span>Income Range</span>
                  <span className='accent-emerald'>Min - Max</span>
                </div>
                <div className='range-values'>
                  <p>${minIncome.toLocaleString()}</p>
                  <span className='range-bar'>
                    <span className='fill-emerald' style={{ width: maxIncome > 0 ? `${(minIncome / maxIncome) * 100}%` : '0%' }}></span>
                  </span>
                  <p>${maxIncome.toLocaleString()}</p>
                </div>
              </div>

              <div className='range-card'>
                <div className='range-title'>
                  <span>Expense Range</span>
                  <span className='accent-rose'>Min - Max</span>
                </div>
                <div className='range-values'>
                  <p>${minExpense.toLocaleString()}</p>
                  <span className='range-bar'>
                    <span className='fill-rose' style={{ width: maxExpense > 0 ? `${(minExpense / maxExpense) * 100}%` : '0%' }}></span>
                  </span>
                  <p>${maxExpense.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className='budget-health-card'>
              <div className='budget-card-header'>
                <div className='title-area'>
                  <div className='icon-wrap'>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-2 1.5-3 1.5-6.5-1-9z"></path>
                    </svg>
                  </div>
                  <h4>Monthly Budget Health</h4>
                </div>
                {budgetStats && (
                  <span className={`status-pill ${budgetStats.pct > 100 ? 'pill-rose' : budgetStats.pct > 75 ? 'pill-amber' : 'pill-emerald'}`}>
                    {budgetStats.pct > 100 ? 'Exceeded' : budgetStats.pct > 75 ? 'Near Cap' : 'On Track'}
                  </span>
                )}
              </div>

              {!budgetStats ? (
                <div className='budget-empty-state'>
                  <p>No monthly category limits set yet.</p>
                  <button type='button' className='setup-link' onClick={() => setActive && setActive(5)}>
                    Set Category Budgets →
                  </button>
                </div>
              ) : (
                <div className='budget-health-body'>
                  <div className='spend-row'>
                    <div className='spend-metric'>
                      <span className='label'>Spent This Month</span>
                      <span className={`value ${budgetStats.overspent ? 'val-rose' : ''}`}>
                        ${budgetStats.spentThisMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className='spend-metric right'>
                      <span className='label'>Cap ({budgetStats.count} categories)</span>
                      <span className='value'>${budgetStats.totalAllocated.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className='burn-progress-track'>
                    <div
                      className={`burn-progress-fill ${
                        budgetStats.pct > 100 ? 'fill-rose' : budgetStats.pct > 75 ? 'fill-amber' : 'fill-emerald'
                      }`}
                      style={{ width: `${Math.min(100, budgetStats.pct)}%` }}
                    />
                  </div>

                  <div className='budget-footer-row'>
                    <span className='burn-percent'>
                      {budgetStats.pct}% burned
                      {budgetStats.overspent && <span className='over-tag'> (${budgetStats.overAmount.toLocaleString()} over)</span>}
                    </span>
                    <button type='button' className='view-limits-btn' onClick={() => setActive && setActive(5)}>
                      Manage Limits →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className='ai-briefing-card'>
              <div className='briefing-header'>
                <div className='title-area'>
                  <div className='icon-wrap'>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  </div>
                  <h4>FinAdvisor AI Briefing</h4>
                </div>
                <span className='score-badge'>
                  Score {advisorData?.telemetry?.healthScore?.overall || 78}/100
                </span>
              </div>

              <p className='briefing-summary'>
                {advisorData?.narrative?.executiveSummary
                  ? advisorData.narrative.executiveSummary
                  : 'AI Ledger diagnostics indicate stable cashflow velocity. Consult the Advisor for personalized savings optimization.'}
              </p>

              <div className='briefing-footer'>
                <span className='engine-label'>
                  {advisorData?.engine?.startsWith('gemini') ? '✨ Gemini 3.5 Flash' : '⚡ Smart Heuristic'}
                </span>
                <button type='button' className='consult-btn' onClick={() => setActive && setActive(6)}>
                  Consult Advisor →
                </button>
              </div>
            </div>
          </div>
        </div>
      </InnerLayout>
    </DashboardStyled>
  )
}

const DashboardStyled = styled.div`
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.8rem;
    gap: 1rem;
    flex-wrap: wrap;

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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .demo-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.95rem;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.35);
        border-radius: 999px;
        color: #c7d2fe;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        .toggle-indicator {
          font-size: 0.72rem;
          opacity: 0.8;
          margin-left: 2px;
        }

        &:hover,
        &.active {
          background: rgba(99, 102, 241, 0.25);
          border-color: rgba(99, 102, 241, 0.6);
          color: #ffffff;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
      }

      .header-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        padding: 0.45rem 0.85rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #34d399;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
      }
    }
  }

  .sample-data-banner {
    background: linear-gradient(135deg, rgba(22, 28, 48, 0.9) 0%, rgba(15, 23, 42, 0.85) 100%);
    border: 1px solid rgba(99, 102, 241, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 25px rgba(99, 102, 241, 0.12);
    border-radius: 20px;
    padding: 1.15rem 1.4rem;
    margin-bottom: 1.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    overflow: hidden;

    .banner-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 280px;

      .flask-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .banner-text {
        h4 {
          font-size: 0.98rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.2rem;
        }

        p {
          font-size: 0.82rem;
          color: var(--text-dim);
          line-height: 1.4;
          max-width: 600px;
        }
      }
    }

    .banner-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.55rem 1rem;
        border-radius: 12px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &.seed-action {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: 1px solid rgba(99, 102, 241, 0.5);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

          &:hover:not(:disabled) {
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            transform: translateY(-1px);
          }
        }

        &.clear-action {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #fb7185;

          &:hover:not(:disabled) {
            background: rgba(244, 63, 94, 0.2);
            border-color: rgba(244, 63, 94, 0.5);
            color: #ffffff;
          }
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .close-banner-btn {
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-size: 1rem;
        cursor: pointer;
        padding: 0.4rem;
        border-radius: 8px;
        line-height: 1;
        transition: all 0.2s ease;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.8rem;

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 24px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.25s ease;

      &:hover {
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      }

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.income-bubble {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.25);
          }

          &.expense-bubble {
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
          }
        }

        .savings-pill {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }
      }

      .value-wrap {
        margin: 1rem 0;

        h2 {
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
        }

        .income-val {
          color: #34d399;
        }

        .expense-val {
          color: #fb7185;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
        color: var(--text-dim);

        .rate-text {
          color: var(--accent-violet-light);
          font-weight: 600;
        }
      }

      &.balance-card {
        background: linear-gradient(135deg, rgba(22, 28, 48, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        box-shadow: 0 0 30px rgba(99, 102, 241, 0.1);

        h2 {
          background: linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
  }

  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;

    .chart-section {
      min-height: 420px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .category-breakdown-card {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: 24px;
        padding: 1.4rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 0.5rem;

          .title-group {
            h4 {
              font-size: 1.05rem;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 0.2rem;
            }

            .subtitle {
              font-size: 0.8rem;
              color: var(--text-dim);
            }
          }

          .pill {
            font-size: 0.75rem;
            font-weight: 600;
            color: #a5b4fc;
            background: rgba(99, 102, 241, 0.12);
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 0.25rem 0.65rem;
            border-radius: 999px;
          }
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .empty-categories {
            padding: 1.5rem;
            text-align: center;
            color: var(--text-dim);
            font-size: 0.85rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 14px;
            border: 1px dashed rgba(255, 255, 255, 0.08);
          }

          .category-row {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;

            .row-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 0.85rem;

              .cat-name {
                font-weight: 600;
                color: #e2e8f0;
              }

              .cat-amount {
                font-weight: 700;
                color: #ffffff;
                font-variant-numeric: tabular-nums;

                .percent {
                  font-weight: 500;
                  color: var(--text-dim);
                  font-size: 0.78rem;
                  margin-left: 0.25rem;
                }
              }
            }

            .cat-progress-track {
              height: 6px;
              width: 100%;
              background: rgba(255, 255, 255, 0.06);
              border-radius: 999px;
              overflow: hidden;

              .cat-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
                border-radius: 999px;
                box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
              }
            }
          }
        }
      }
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .range-analytics {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: 24px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;

        .range-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .range-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .range-title {
            display: flex;
            justify-content: space-between;
            font-size: 0.78rem;
            color: var(--text-muted);
            font-weight: 600;

            .accent-emerald {
              color: #34d399;
            }
            .accent-rose {
              color: #fb7185;
            }
          }

          .range-values {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;

            p {
              font-size: 0.88rem;
              font-weight: 700;
              color: #f1f5f9;
              font-variant-numeric: tabular-nums;
            }

            .range-bar {
              flex: 1;
              height: 4px;
              background: rgba(255, 255, 255, 0.06);
              border-radius: 999px;
              overflow: hidden;
              position: relative;

              .fill-emerald {
                display: block;
                height: 100%;
                background: #10b981;
                border-radius: 999px;
              }

              .fill-rose {
                display: block;
                height: 100%;
                background: #f43f5e;
                border-radius: 999px;
              }
            }
          }
        }
      }

      .budget-health-card {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: 24px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;

        .budget-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .title-area {
            display: flex;
            align-items: center;
            gap: 0.6rem;

            .icon-wrap {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background: rgba(99, 102, 241, 0.12);
              border: 1px solid rgba(99, 102, 241, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            h4 {
              font-size: 0.98rem;
              font-weight: 700;
              color: #ffffff;
            }
          }

          .status-pill {
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.2rem 0.55rem;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: 0.03em;

            &.pill-emerald {
              background: rgba(16, 185, 129, 0.12);
              color: #34d399;
              border: 1px solid rgba(16, 185, 129, 0.3);
            }
            &.pill-amber {
              background: rgba(245, 158, 11, 0.12);
              color: #fbbf24;
              border: 1px solid rgba(245, 158, 11, 0.3);
            }
            &.pill-rose {
              background: rgba(244, 63, 94, 0.12);
              color: #fb7185;
              border: 1px solid rgba(244, 63, 94, 0.3);
            }
          }
        }

        .budget-empty-state {
          padding: 1.1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 14px;
          border: 1px dashed rgba(255, 255, 255, 0.08);
          text-align: center;

          p {
            font-size: 0.8rem;
            color: var(--text-dim);
            margin-bottom: 0.5rem;
          }

          .setup-link {
            background: none;
            border: none;
            color: #818cf8;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;

            &:hover {
              color: #a5b4fc;
            }
          }
        }

        .budget-health-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          .spend-row {
            display: flex;
            justify-content: space-between;

            .spend-metric {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;

              &.right {
                text-align: right;
              }

              .label {
                font-size: 0.72rem;
                color: var(--text-dim);
                text-transform: uppercase;
                letter-spacing: 0.04em;
              }

              .value {
                font-size: 1rem;
                font-weight: 700;
                color: #ffffff;
                font-variant-numeric: tabular-nums;

                &.val-rose {
                  color: #fb7185;
                }
              }
            }
          }

          .burn-progress-track {
            height: 6px;
            width: 100%;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 999px;
            overflow: hidden;

            .burn-progress-fill {
              height: 100%;
              border-radius: 999px;
              transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

              &.fill-emerald {
                background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
              }
              &.fill-amber {
                background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
                box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
              }
              &.fill-rose {
                background: linear-gradient(90deg, #f43f5e 0%, #fb7185 100%);
                box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
              }
            }
          }

          .budget-footer-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.78rem;

            .burn-percent {
              color: var(--text-dim);
              font-weight: 600;

              .over-tag {
                color: #fb7185;
              }
            }

            .view-limits-btn {
              background: none;
              border: none;
              color: #818cf8;
              font-weight: 600;
              font-size: 0.78rem;
              cursor: pointer;
              transition: color 0.15s ease;

              &:hover {
                color: #c7d2fe;
              }
            }
          }
        }
      }

      .ai-briefing-card {
        background: linear-gradient(135deg, rgba(22, 28, 48, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 24px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

        .briefing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .title-area {
            display: flex;
            align-items: center;
            gap: 0.6rem;

            .icon-wrap {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background: rgba(168, 85, 247, 0.15);
              border: 1px solid rgba(168, 85, 247, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            h4 {
              font-size: 0.95rem;
              font-weight: 700;
              color: #ffffff;
            }
          }

          .score-badge {
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.2rem 0.55rem;
            border-radius: 999px;
            background: rgba(168, 85, 247, 0.15);
            color: #c084fc;
            border: 1px solid rgba(168, 85, 247, 0.35);
          }
        }

        .briefing-summary {
          font-size: 0.82rem;
          color: #cbd5e1;
          line-height: 1.45;
        }

        .briefing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 0.65rem;

          .engine-label {
            font-size: 0.72rem;
            color: var(--text-dim);
            font-weight: 600;
          }

          .consult-btn {
            background: none;
            border: none;
            color: #c084fc;
            font-weight: 600;
            font-size: 0.78rem;
            cursor: pointer;
            transition: color 0.15s ease;

            &:hover {
              color: #e9d5ff;
            }
          }
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .metrics-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 1.2rem;
      gap: 0.8rem;

      h1 {
        font-size: 1.45rem;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }

    .sample-data-banner {
      flex-direction: column;
      align-items: flex-start;
      padding: 1rem;
      gap: 1rem;
      margin-bottom: 1.2rem;

      .banner-left {
        min-width: 100%;
      }

      .banner-actions {
        width: 100%;
        flex-wrap: wrap;

        .action-btn {
          flex: 1;
          justify-content: center;
        }

        .close-banner-btn {
          margin-left: auto;
        }
      }
    }

    .metrics-grid {
      margin-bottom: 1.2rem;

      .metric-card {
        padding: 1.1rem;

        .value-wrap h2 {
          font-size: 1.65rem;
        }
      }
    }

    .content-grid {
      gap: 1rem;

      .chart-section {
        min-height: auto;
        gap: 1rem;

        .category-breakdown-card {
          padding: 1.1rem;
        }
      }

      .sidebar-section {
        gap: 1rem;

        .range-analytics,
        .budget-overview-card,
        .ai-briefing-card {
          padding: 1.1rem;
        }
      }
    }
  }
`;

export default Dashboard