import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useGlobalContext } from '../../context/globalContext';

function History({ setActive }) {
  const { transactionHistory } = useGlobalContext()
  const history = transactionHistory()

  return (
    <HistoryStyled>
      <div className='history-header'>
        <div className='title-wrap'>
          <h3>Recent Activity</h3>
          <span className='feed-count'>{history.length}</span>
        </div>
        {setActive && (
          <button
            type='button'
            className='view-all-link'
            onClick={() => setActive(2)}
            title='View all transactions'
          >
            <span>View All</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        )}
      </div>

      <div className='items-list'>
        {history.length === 0 ? (
          <div className='empty-feed'>No recent transactions</div>
        ) : (
          history.map((item) => {
            const { _id, title, amount, type } = item
            const isExpense = type === 'expense'

            return (
              <motion.div
                key={_id}
                className='history-item'
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className='item-left'>
                  <span className={`type-dot ${isExpense ? 'expense' : 'income'}`}></span>
                  <p className='item-title'>{title}</p>
                </div>

                <span className={`item-amount ${isExpense ? 'expense' : 'income'}`}>
                  {isExpense ? `-$${amount.toLocaleString()}` : `+$${amount.toLocaleString()}`}
                </span>
              </motion.div>
            )
          })
        )}
      </div>
    </HistoryStyled>
  )
}

const HistoryStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      h3 {
        font-size: 1.05rem;
        font-weight: 700;
        color: #ffffff;
      }

      .feed-count {
        font-size: 0.72rem;
        color: var(--text-dim);
        font-weight: 600;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
      }
    }

    .view-all-link {
      background: transparent;
      border: none;
      outline: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--accent-violet-light);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        color: #ffffff;
        transform: translateX(2px);
      }
    }
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .empty-feed {
    padding: 1.5rem;
    text-align: center;
    color: var(--text-dim);
    font-size: 0.85rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 14px;
    border: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .history-item {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    padding: 0.8rem 1rem;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-card-hover);
      border-color: rgba(255, 255, 255, 0.14);
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .type-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.income {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        &.expense {
          background: #f43f5e;
          box-shadow: 0 0 8px #f43f5e;
        }
      }

      .item-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: #f1f5f9;
        text-transform: capitalize;
      }
    }

    .item-amount {
      font-size: 0.92rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;

      &.income {
        color: #34d399;
      }

      &.expense {
        color: #fb7185;
      }
    }
  }
`;

export default History