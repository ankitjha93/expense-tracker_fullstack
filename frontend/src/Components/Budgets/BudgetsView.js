import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import { useToast } from '../../context/toastContext';
import {
  book,
  card,
  circle,
  clothing,
  food,
  freelance,
  medical,
  plus,
  trash,
  tv,
  takeaway,
} from '../../utils/Icons';

function BudgetsView({ setActive }) {
  const { budgets, expenses, setBudget, deleteBudget } = useGlobalContext();
  const { toast } = useToast();

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Map category to icon
  const getCatIcon = (cat) => {
    switch (cat) {
      case 'education':
        return book;
      case 'groceries':
        return food;
      case 'health':
        return medical;
      case 'subscriptions':
        return tv;
      case 'takeaways':
        return takeaway;
      case 'clothing':
        return clothing;
      case 'travelling':
        return freelance;
      case 'other':
        return circle;
      default:
        return card;
    }
  };

  // Calculate current month's expenses per category
  const categorySpentMap = useMemo(() => {
    const map = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    expenses.forEach((item) => {
      const d = new Date(item.date);
      // Filter for current month/year or include all if date parsing allows
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const cat = item.category || 'other';
        map[cat] = (map[cat] || 0) + item.amount;
      }
    });

    return map;
  }, [expenses]);

  // Overall totals
  const totalBudgetAllowance = useMemo(() => {
    return budgets.reduce((acc, curr) => acc + curr.amount, 0);
  }, [budgets]);

  const totalSpentInBudgetedCategories = useMemo(() => {
    return budgets.reduce((acc, curr) => {
      return acc + (categorySpentMap[curr.category] || 0);
    }, 0);
  }, [budgets, categorySpentMap]);

  const overallBurnPercent = totalBudgetAllowance > 0
    ? Math.round((totalSpentInBudgetedCategories / totalBudgetAllowance) * 100)
    : 0;

  const remainingAllowance = Math.max(0, totalBudgetAllowance - totalSpentInBudgetedCategories);
  const isOverallOver = totalSpentInBudgetedCategories > totalBudgetAllowance && totalBudgetAllowance > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;

    try {
      setSubmitting(true);
      await setBudget(category, parseFloat(amount));
      toast.success(`Monthly limit for ${category} updated to $${parseFloat(amount).toLocaleString()}!`, 'Budget Configured');
      setCategory('');
      setAmount('');
    } catch (err) {
      toast.error('Failed to configure budget', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    try {
      await deleteBudget(id);
      toast.info(`Budget limit for ${catName} removed`, 'Budget Removed');
      setDeleteId(null);
    } catch (err) {
      toast.error('Failed to remove budget', 'Error');
    }
  };

  const handleEditClick = (cat, currentAmount) => {
    setCategory(cat);
    setAmount(currentAmount.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BudgetsStyled>
      <InnerLayout>
        <div className='page-header'>
          <div>
            <h1>Budgets & Limits</h1>
            <p className='subtitle'>Enforce monthly spending ceilings and monitor burn rate thresholds</p>
          </div>
          <div className='header-status'>
            <span className={`status-pill ${isOverallOver ? 'over' : overallBurnPercent > 75 ? 'warn' : 'safe'}`}>
              <span className='dot'></span>
              {isOverallOver ? 'Over Monthly Limit' : overallBurnPercent > 75 ? 'Caution: High Burn' : 'On Track'}
            </span>
          </div>
        </div>

        <div className='summary-card'>
          <div className='summary-metrics'>
            <div className='metric-box'>
              <span className='label'>Total Monthly Budget</span>
              <h2>${totalBudgetAllowance.toLocaleString()}</h2>
              <span className='hint'>{budgets.length} Category Limits Set</span>
            </div>

            <div className='metric-box'>
              <span className='label'>Spent This Month</span>
              <h2 className={isOverallOver ? 'accent-rose' : 'accent-violet'}>
                ${totalSpentInBudgetedCategories.toLocaleString()}
              </h2>
              <span className='hint'>{overallBurnPercent}% of Allowance</span>
            </div>

            <div className='metric-box'>
              <span className='label'>Remaining Liquidity</span>
              <h2 className='accent-emerald'>${remainingAllowance.toLocaleString()}</h2>
              <span className='hint'>Unallocated allowance</span>
            </div>
          </div>

          <div className='burn-progress-section'>
            <div className='burn-labels'>
              <span>Monthly Burn Rate</span>
              <span className={`burn-value ${isOverallOver ? 'accent-rose' : ''}`}>
                {overallBurnPercent}% {isOverallOver && '(Exceeded)'}
              </span>
            </div>
            <div className='burn-track'>
              <div
                className={`burn-fill ${isOverallOver ? 'fill-rose' : overallBurnPercent > 75 ? 'fill-amber' : 'fill-emerald'}`}
                style={{ width: `${Math.min(100, Math.max(3, overallBurnPercent))}%` }}
              />
            </div>
          </div>
        </div>

        <div className='budgets-layout'>
          <div className='form-col'>
            <form onSubmit={handleSubmit} className='budget-form'>
              <div className='form-header'>
                <h3>{category ? `Adjust ${category.toUpperCase()} Limit` : 'Set Category Budget'}</h3>
                <p>Define or update monthly ceiling for an expenditure category</p>
              </div>

              <div className='input-control'>
                <label>Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value='' disabled>Select Expense Category</option>
                  <option value='groceries'>Groceries & Food</option>
                  <option value='subscriptions'>Subscriptions & SaaS</option>
                  <option value='takeaways'>Dining & Takeaways</option>
                  <option value='health'>Healthcare & Medical</option>
                  <option value='clothing'>Apparel & Gear</option>
                  <option value='travelling'>Travel & Transport</option>
                  <option value='education'>Education & Learning</option>
                  <option value='other'>Rent & General Outflow</option>
                </select>
              </div>

              <div className='input-control'>
                <div className='label-row'>
                  <label>Monthly Limit ($)</label>
                  <span className='hint'>Quick add:</span>
                </div>
                <input
                  type='number'
                  step='any'
                  required
                  placeholder='0.00'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className='quick-amounts'>
                  {[50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      type='button'
                      className='quick-btn'
                      onClick={() => {
                        const curr = parseFloat(amount) || 0;
                        setAmount((curr + val).toString());
                      }}
                    >
                      +${val}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                type='submit'
                className='submit-btn'
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plus}
                <span>{submitting ? 'Saving...' : category ? 'Update Budget Limit' : 'Set Category Budget'}</span>
              </motion.button>

              <div className='budget-tip-box'>
                <div className='tip-icon'>💡</div>
                <div className='tip-text'>
                  <strong>50/30/20 Benchmark Rule:</strong> Keep necessities under 50% of net income, flexible lifestyle spending under 30%, and channel 20% to savings.
                </div>
              </div>
            </form>
          </div>

          <div className='cards-col'>
            {budgets.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 12h-4"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                </div>
                <h4>No Category Budgets Set Yet</h4>
                <p>Use the form on the left to set your first spending limit (e.g. Groceries or Subscriptions).</p>
              </div>
            ) : (
              <div className='budget-cards-grid'>
                <AnimatePresence>
                  {budgets.map((b) => {
                    const spent = categorySpentMap[b.category] || 0;
                    const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
                    const isOver = spent > b.amount;
                    const isWarn = percent >= 70 && !isOver;
                    const overAmount = isOver ? spent - b.amount : 0;

                    return (
                      <motion.div
                        key={b._id}
                        className={`budget-card ${isOver ? 'over' : isWarn ? 'warn' : 'safe'}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      >
                        <div className='card-top'>
                          <div className='cat-title-wrap'>
                            <div className='cat-icon'>
                              {getCatIcon(b.category)}
                            </div>
                            <div>
                              <h4>{b.category.charAt(0).toUpperCase() + b.category.slice(1)}</h4>
                              <span className='monthly-tag'>Monthly Limit</span>
                            </div>
                          </div>

                          <div className='card-actions'>
                            <button
                              type='button'
                              className='edit-btn'
                              onClick={() => handleEditClick(b.category, b.amount)}
                              title='Edit limit'
                            >
                              Edit
                            </button>

                            {deleteId === b._id ? (
                              <div className='delete-confirm'>
                                <button
                                  type='button'
                                  className='confirm-yes'
                                  onClick={() => handleDelete(b._id, b.category)}
                                >
                                  Yes
                                </button>
                                <button
                                  type='button'
                                  className='confirm-no'
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type='button'
                                className='delete-icon-btn'
                                onClick={() => setDeleteId(b._id)}
                                title='Delete budget'
                              >
                                {trash}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className='card-numbers'>
                          <div className='spent-display'>
                            <span className='value'>${spent.toLocaleString()}</span>
                            <span className='divider'> / </span>
                            <span className='limit'>${b.amount.toLocaleString()}</span>
                          </div>

                          <span className={`status-badge ${isOver ? 'badge-rose' : isWarn ? 'badge-amber' : 'badge-emerald'}`}>
                            {isOver ? `+${overAmount.toLocaleString()} OVER (${percent}%)` : `${percent}% spent`}
                          </span>
                        </div>

                        <div className='progress-con'>
                          <div className='track'>
                            <div
                              className={`bar ${isOver ? 'bar-rose' : isWarn ? 'bar-amber' : 'bar-emerald'}`}
                              style={{ width: `${Math.min(100, Math.max(3, percent))}%` }}
                            />
                          </div>
                        </div>

                        <div className='card-bottom'>
                          <span>
                            {isOver ? (
                              <strong className='accent-rose'>Budget exceeded by ${overAmount.toLocaleString()}</strong>
                            ) : (
                              `$${(b.amount - spent).toLocaleString()} remaining this month`
                            )}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </InnerLayout>
    </BudgetsStyled>
  );
}

const BudgetsStyled = styled.div`
  display: flex;
  overflow: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.8rem;
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

    .header-status {
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.95rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        &.safe {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;

          .dot {
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
          }
        }

        &.warn {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;

          .dot {
            background: #f59e0b;
            box-shadow: 0 0 8px #f59e0b;
          }
        }

        &.over {
          background: rgba(244, 63, 94, 0.14);
          border: 1px solid rgba(244, 63, 94, 0.4);
          color: #fb7185;

          .dot {
            background: #f43f5e;
            box-shadow: 0 0 8px #f43f5e;
          }
        }
      }
    }
  }

  .summary-card {
    background: linear-gradient(135deg, rgba(22, 28, 48, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%);
    border: 1px solid rgba(99, 102, 241, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 25px rgba(99, 102, 241, 0.08);
    border-radius: 24px;
    padding: 1.6rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;

    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      .metric-box {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        .label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        h2 {
          font-size: 1.9rem;
          font-weight: 800;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .hint {
          font-size: 0.76rem;
          color: var(--text-dim);
        }

        .accent-rose {
          color: #fb7185;
        }
        .accent-emerald {
          color: #34d399;
        }
        .accent-violet {
          color: #c7d2fe;
        }
      }
    }

    .burn-progress-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.1rem;

      .burn-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-secondary);

        .burn-value {
          color: #ffffff;
          &.accent-rose {
            color: #fb7185;
          }
        }
      }

      .burn-track {
        height: 8px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 999px;
        overflow: hidden;

        .burn-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;

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
    }
  }

  .budgets-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.8rem;
    align-items: start;

    .budget-form {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 24px;
      padding: 1.8rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .form-header {
        h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.2rem;
        }
        p {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
      }

      .input-control {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .hint {
            font-size: 0.72rem;
            color: var(--text-dim);
          }
        }

        input, select {
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: var(--bg-input);
          color: #f8fafc;
          transition: all 0.2s ease;
          width: 100%;

          &:focus {
            border-color: var(--accent-violet);
            background: rgba(15, 23, 42, 0.95);
            box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
          }

          &::placeholder {
            color: rgba(255, 255, 255, 0.25);
          }
        }

        select {
          cursor: pointer;
          option {
            background: #0e131f;
            color: #ffffff;
          }
        }

        .quick-amounts {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.2rem;
          flex-wrap: wrap;

          .quick-btn {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text-secondary);
            border-radius: 8px;
            padding: 0.25rem 0.55rem;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              background: rgba(99, 102, 241, 0.2);
              border-color: rgba(99, 102, 241, 0.4);
              color: #c7d2fe;
            }
          }
        }
      }

      .submit-btn {
        margin-top: 0.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        padding: 0.85rem;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border: 1px solid rgba(99, 102, 241, 0.5);
        border-radius: 14px;
        color: #ffffff;
        font-family: inherit;
        font-size: 0.98rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
        transition: all 0.25s ease;

        &:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.45);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .budget-tip-box {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 0.85rem;
        display: flex;
        gap: 0.65rem;
        align-items: flex-start;

        .tip-icon {
          font-size: 1.1rem;
        }

        .tip-text {
          font-size: 0.76rem;
          color: var(--text-dim);
          line-height: 1.4;

          strong {
            color: #e2e8f0;
          }
        }
      }
    }

    .cards-col {
      display: flex;
      flex-direction: column;

      .empty-state {
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

      .budget-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.1rem;

        .budget-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 1.25rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          transition: all 0.25s ease;

          &:hover {
            background: var(--bg-card-hover);
            border-color: rgba(255, 255, 255, 0.12);
          }

          &.over {
            border-color: rgba(244, 63, 94, 0.4);
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.12);
          }

          &.warn {
            border-color: rgba(245, 158, 11, 0.35);
          }

          .card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            .cat-title-wrap {
              display: flex;
              align-items: center;
              gap: 0.75rem;

              .cat-icon {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #c7d2fe;
                font-size: 1.2rem;
              }

              h4 {
                font-size: 1rem;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 0.15rem;
              }

              .monthly-tag {
                font-size: 0.72rem;
                color: var(--text-dim);
              }
            }

            .card-actions {
              display: flex;
              align-items: center;
              gap: 0.4rem;

              .edit-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-secondary);
                padding: 0.2rem 0.5rem;
                border-radius: 6px;
                font-size: 0.72rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                  background: rgba(99, 102, 241, 0.2);
                  color: #ffffff;
                }
              }

              .delete-icon-btn {
                background: rgba(244, 63, 94, 0.1);
                border: 1px solid rgba(244, 63, 94, 0.2);
                color: #fb7185;
                width: 26px;
                height: 26px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                  background: rgba(244, 63, 94, 0.25);
                  color: #ffffff;
                }
              }

              .delete-confirm {
                display: flex;
                gap: 0.25rem;

                button {
                  border: none;
                  font-size: 0.7rem;
                  font-weight: 700;
                  padding: 0.2rem 0.4rem;
                  border-radius: 4px;
                  cursor: pointer;

                  &.confirm-yes {
                    background: #f43f5e;
                    color: #ffffff;
                  }

                  &.confirm-no {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-secondary);
                  }
                }
              }
            }
          }

          .card-numbers {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .spent-display {
              .value {
                font-size: 1.25rem;
                font-weight: 800;
                color: #ffffff;
                font-variant-numeric: tabular-nums;
              }
              .divider {
                color: var(--text-dim);
                font-weight: 600;
              }
              .limit {
                color: var(--text-muted);
                font-weight: 700;
                font-size: 0.95rem;
              }
            }

            .status-badge {
              font-size: 0.72rem;
              font-weight: 700;
              padding: 0.2rem 0.55rem;
              border-radius: 999px;

              &.badge-emerald {
                background: rgba(16, 185, 129, 0.12);
                color: #34d399;
                border: 1px solid rgba(16, 185, 129, 0.3);
              }

              &.badge-amber {
                background: rgba(245, 158, 11, 0.12);
                color: #fbbf24;
                border: 1px solid rgba(245, 158, 11, 0.3);
              }

              &.badge-rose {
                background: rgba(244, 63, 94, 0.15);
                color: #fb7185;
                border: 1px solid rgba(244, 63, 94, 0.4);
                box-shadow: 0 0 10px rgba(244, 63, 94, 0.25);
              }
            }
          }

          .progress-con {
            .track {
              height: 6px;
              background: rgba(255, 255, 255, 0.06);
              border-radius: 999px;
              overflow: hidden;

              .bar {
                height: 100%;
                border-radius: 999px;
                transition: width 0.5s ease;

                &.bar-emerald {
                  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
                }

                &.bar-amber {
                  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
                }

                &.bar-rose {
                  background: linear-gradient(90deg, #f43f5e 0%, #fb7185 100%);
                  box-shadow: 0 0 8px rgba(244, 63, 94, 0.4);
                }
              }
            }
          }

          .card-bottom {
            font-size: 0.76rem;
            color: var(--text-dim);

            .accent-rose {
              color: #fb7185;
            }
          }
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .budgets-layout {
      grid-template-columns: 1fr;
      gap: 1.2rem;
    }
    .summary-card .summary-metrics {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
    }
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.8rem;
      margin-bottom: 1.2rem;

      h1 {
        font-size: 1.45rem;
      }
    }

    .summary-card {
      padding: 1.1rem;
      margin-bottom: 1.2rem;

      .summary-metrics {
        grid-template-columns: 1fr;
        gap: 0.75rem;

        .metric-box h2 {
          font-size: 1.5rem;
        }
      }
    }

    .budgets-layout .active-budgets-col .cards-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default BudgetsView;
