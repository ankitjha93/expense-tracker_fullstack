import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  bitcoin,
  book,
  calender,
  card,
  circle,
  clothing,
  comment,
  food,
  freelance,
  medical,
  money,
  piggy,
  stocks,
  takeaway,
  trash,
  tv,
  users,
  yt,
} from '../../utils/Icons'
import { dateFormat } from '../../utils/dateFormat'

function IncomeItem({
  id,
  title,
  amount,
  date,
  category,
  description,
  deleteItem,
  indicatorColor,
  type,
}) {
  const isExpense = type === 'expense'
  const [confirmDelete, setConfirmDelete] = useState(false)

  const categoryIcon = () => {
    switch (category) {
      case 'salary':
        return money
      case 'freelancing':
        return freelance
      case 'investments':
        return stocks
      case 'stocks':
        return users
      case 'bitcoin':
        return bitcoin
      case 'bank':
        return card
      case 'youtube':
        return yt
      case 'other':
        return piggy
      default:
        return card
    }
  }

  const expenseCatIcon = () => {
    switch (category) {
      case 'education':
        return book
      case 'groceries':
        return food
      case 'health':
        return medical
      case 'subscriptions':
        return tv
      case 'takeaways':
        return takeaway
      case 'clothing':
        return clothing
      case 'travelling':
        return freelance
      case 'other':
        return circle
      default:
        return card
    }
  }

  return (
    <IncomeItemStyled
      indicator={indicatorColor}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <div className={`icon-box ${isExpense ? 'expense-box' : 'income-box'}`}>
        {isExpense ? expenseCatIcon() : categoryIcon()}
      </div>

      <div className='content'>
        <div className='title-row'>
          <div className='title-group'>
            <span className='indicator-dot' style={{ background: indicatorColor, boxShadow: `0 0 8px ${indicatorColor}` }}></span>
            <h5>{title}</h5>
          </div>
          <span className={`amount-badge ${isExpense ? 'expense' : 'income'}`}>
            {isExpense ? `-$${amount.toLocaleString()}` : `+$${amount.toLocaleString()}`}
          </span>
        </div>

        <div className='meta-row'>
          <div className='meta-details'>
            <span className='meta-item'>
              {calender} {dateFormat(date)}
            </span>
            <span className='meta-badge'>{category}</span>
            {description && (
              <span className='meta-desc' title={description}>
                {comment} {description}
              </span>
            )}
          </div>

          {confirmDelete ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='delete-confirm-box'
            >
              <span className='confirm-label'>Delete?</span>
              <button
                type='button'
                className='confirm-action-btn yes-btn'
                onClick={() => deleteItem(id)}
              >
                Yes
              </button>
              <button
                type='button'
                className='confirm-action-btn cancel-btn'
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.button
              type='button'
              className='delete-btn'
              onClick={() => setConfirmDelete(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title='Delete transaction'
            >
              {trash}
            </motion.button>
          )}
        </div>
      </div>
    </IncomeItemStyled>
  )
}

const IncomeItemStyled = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 1.1rem 1.25rem;
  margin-bottom: 0.85rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  width: 100%;
  transition: all 0.25s ease;

  &:hover {
    background: var(--bg-card-hover);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  .icon-box {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
      font-size: 1.5rem;
    }

    &.income-box {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
    }

    &.expense-box {
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.25);
      color: #fb7185;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    overflow: hidden;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-group {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        h5 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: capitalize;
        }
      }

      .amount-badge {
        font-size: 1.15rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;

        &.income {
          color: #34d399;
        }

        &.expense {
          color: #fb7185;
        }
      }
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .meta-details {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        flex-wrap: wrap;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-dim);
          font-size: 0.8rem;
          font-weight: 500;

          i {
            font-size: 0.85rem;
          }
        }

        .meta-badge {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .meta-desc {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-dim);
          font-size: 0.8rem;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .delete-btn {
        background: rgba(244, 63, 94, 0.1);
        border: 1px solid rgba(244, 63, 94, 0.2);
        color: #fb7185;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.5);
          color: #ffffff;
        }
      }

      .delete-confirm-box {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.3);
        padding: 0.2rem 0.5rem;
        border-radius: 999px;

        .confirm-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #fb7185;
          margin-right: 0.15rem;
        }

        .confirm-action-btn {
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;

          &.yes-btn {
            background: #f43f5e;
            color: #ffffff;

            &:hover {
              background: #e11d48;
            }
          }

          &.cancel-btn {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);

            &:hover {
              background: rgba(255, 255, 255, 0.2);
              color: #ffffff;
            }
          }
        }
      }
    }
  }

  @media (max-width: 540px) {
    padding: 0.85rem 0.95rem;
    gap: 0.85rem;
    border-radius: 16px;

    .icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;

      i {
        font-size: 1.2rem;
      }
    }

    .content {
      .title-row {
        .title-group h5 {
          font-size: 0.92rem;
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .amount-badge {
          font-size: 1rem;
        }
      }

      .meta-row .meta-details {
        gap: 0.45rem;

        .meta-desc {
          max-width: 120px;
        }
      }
    }
  }
`;

export default IncomeItem