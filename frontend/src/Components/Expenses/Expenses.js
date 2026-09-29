import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { AnimatePresence } from 'framer-motion'
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import IncomeItem from '../IncomeItem/IncomeItem';
import ExpenseForm from './ExpenseForm';

function Expenses() {
  const { expenses, getExpenses, deleteExpense, totalExpenses } = useGlobalContext()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => {
    getExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = totalExpenses()

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
      const matchCat = catFilter === 'all' || item.category === catFilter
      return matchSearch && matchCat
    })
  }, [expenses, search, catFilter])

  return (
    <ExpenseStyled>
      <InnerLayout>
        <div className='page-header'>
          <div>
            <h1>Expenses & Outflows</h1>
            <p className='subtitle'>Track and control your spending habits</p>
          </div>
          <div className='total-badge'>
            <span>Total Outflow</span>
            <h3>-${total.toLocaleString()}</h3>
          </div>
        </div>

        <div className='expense-layout'>
          <div className='form-col'>
            <ExpenseForm />
          </div>

          <div className='list-col'>
            {expenses.length > 0 && (
              <div className='filter-bar'>
                <div className='search-input-wrap'>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type='text'
                    placeholder='Filter expenses...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type='button' className='clear-btn' onClick={() => setSearch('')}>
                      ×
                    </button>
                  )}
                </div>

                <div className='filter-right'>
                  <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className='category-select'
                  >
                    <option value='all'>All Categories</option>
                    <option value='education'>Education</option>
                    <option value='groceries'>Groceries</option>
                    <option value='health'>Health</option>
                    <option value='subscriptions'>Subscriptions</option>
                    <option value='takeaways'>Takeaways</option>
                    <option value='clothing'>Clothing</option>
                    <option value='travelling'>Travelling</option>
                    <option value='other'>Other</option>
                  </select>
                  <span className='counter-chip'>{filteredExpenses.length} of {expenses.length}</span>
                </div>
              </div>
            )}

            {expenses.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h4>No Expenses Recorded Yet</h4>
                <p>Use the form on the left to log your first expenditure.</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className='empty-state'>
                <h4>No Matching Expenses</h4>
                <p>Try modifying your search query or category filter.</p>
              </div>
            ) : (
              <div className='expenses-feed'>
                <AnimatePresence>
                  {filteredExpenses.map((expense) => {
                    const { _id, title, amount, date, category, description, type } = expense;
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
                        indicatorColor='#F43F5E'
                        deleteItem={deleteExpense}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </InnerLayout>
    </ExpenseStyled>
  )
}

const ExpenseStyled = styled.div`
  display: flex;
  overflow: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.8rem;

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

    .total-badge {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-radius: 20px;
      padding: 0.8rem 1.4rem;
      text-align: right;

      span {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }

      h3 {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fb7185;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  .expense-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.8rem;
    align-items: start;

    .list-col {
      display: flex;
      flex-direction: column;

      .filter-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;

        .search-input-wrap {
          flex: 1;
          min-width: 200px;
          position: relative;
          display: flex;
          align-items: center;

          svg {
            position: absolute;
            left: 12px;
            color: var(--text-dim);
            pointer-events: none;
          }

          input {
            width: 100%;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 0.55rem 1rem 0.55rem 2.2rem;
            color: #ffffff;
            font-family: inherit;
            font-size: 0.85rem;
            outline: none;
            transition: all 0.2s ease;

            &::placeholder {
              color: var(--text-dim);
            }

            &:focus {
              border-color: rgba(244, 63, 94, 0.5);
              box-shadow: 0 0 12px rgba(244, 63, 94, 0.15);
            }
          }

          .clear-btn {
            position: absolute;
            right: 10px;
            background: transparent;
            border: none;
            color: var(--text-dim);
            font-size: 1.1rem;
            cursor: pointer;
            line-height: 1;

            &:hover {
              color: #ffffff;
            }
          }
        }

        .filter-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;

          .category-select {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 0.55rem 0.9rem;
            color: #e2e8f0;
            font-family: inherit;
            font-size: 0.82rem;
            outline: none;
            cursor: pointer;

            option {
              background: #0f172a;
              color: #ffffff;
            }
          }

          .counter-chip {
            font-size: 0.75rem;
            font-weight: 600;
            color: #fb7185;
            background: rgba(244, 63, 94, 0.1);
            border: 1px solid rgba(244, 63, 94, 0.25);
            padding: 0.35rem 0.65rem;
            border-radius: 999px;
            white-space: nowrap;
          }
        }
      }
    }
  }

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
      background: rgba(244, 63, 94, 0.1);
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

  @media (max-width: 1100px) {
    .expense-layout {
      grid-template-columns: 1fr;
    }
  }
`;

export default Expenses