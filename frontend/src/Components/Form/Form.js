import React, { useState } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import { useGlobalContext } from '../../context/globalContext';
import { plus } from '../../utils/Icons';
import { motion } from 'framer-motion';

function Form() {
  const { addIncome, error, setError } = useGlobalContext()

  const [inputState, setInputState] = useState({
    title: '',
    amount: '',
    date: new Date(),
    category: '',
    description: '',
  })

  const { title, amount, date, category, description } = inputState;

  const handleInput = name => e => {
    setInputState({ ...inputState, [name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = e => {
    e.preventDefault()
    addIncome({
      ...inputState,
      amount: parseFloat(amount),
    })
    setInputState({
      title: '',
      amount: '',
      date: new Date(),
      category: '',
      description: '',
    })
  }

  return (
    <FormStyled onSubmit={handleSubmit}>
      <div className='form-header'>
        <h3>Record Income</h3>
        <p>Log your inflow streams to calculate wealth growth</p>
      </div>

      {error && <div className='error-notice'>{error}</div>}

      <div className='input-control'>
        <label>Income Title</label>
        <input
          type='text'
          value={title}
          name='title'
          placeholder='e.g. Developer Salary'
          onChange={handleInput('title')}
          required
        />
      </div>

      <div className='input-control'>
        <div className='label-row'>
          <label>Amount ($)</label>
          <span className='hint'>Quick add:</span>
        </div>
        <input
          type='number'
          step='any'
          value={amount}
          name='amount'
          id='amount'
          placeholder='0.00'
          onChange={handleInput('amount')}
          required
        />
        <div className='quick-amounts'>
          {[100, 500, 1000, 5000].map((val) => (
            <button
              key={val}
              type='button'
              className='quick-btn'
              onClick={() => {
                const curr = parseFloat(amount) || 0
                setInputState({ ...inputState, amount: (curr + val).toString() })
              }}
            >
              +${val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div className='input-control'>
        <label>Date Received</label>
        <DatePicker
          id='date'
          placeholderText='Select Date'
          selected={date}
          dateFormat='dd/MM/yyyy'
          onChange={(newDate) => {
            setInputState({ ...inputState, date: newDate })
          }}
          required
        />
      </div>

      <div className="selects input-control">
        <label>Category</label>
        <select required value={category} name="category" id="category" onChange={handleInput('category')}>
          <option value="" disabled>Select Source</option>
          <option value="salary">Salary</option>
          <option value="freelancing">Freelancing</option>
          <option value="investments">Investments</option>
          <option value="stocks">Stocks</option>
          <option value="bitcoin">Crypto / Bitcoin</option>
          <option value="bank">Bank Transfer</option>
          <option value="youtube">Content / YouTube</option>
          <option value="other">Other Inflow</option>
        </select>
        <div className='category-chips'>
          {['salary', 'freelancing', 'investments', 'stocks', 'bitcoin'].map((cat) => (
            <button
              key={cat}
              type='button'
              className={`chip-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setInputState({ ...inputState, category: cat })}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className='input-control'>
        <label>Reference Notes</label>
        <textarea
          name='description'
          value={description}
          placeholder='Add context or reference notes...'
          id='description'
          cols='30'
          rows='3'
          maxLength='200'
          onChange={handleInput('description')}
        ></textarea>
        <div className='desc-counter'>
          <span>Optional details</span>
          <span className={description.length >= 190 ? 'limit-warning' : ''}>
            {description.length}/200
          </span>
        </div>
      </div>

      <motion.button
        type='submit'
        className='submit-btn'
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {plus}
        <span>Add Income</span>
      </motion.button>
    </FormStyled>
  )
}

const FormStyled = styled.form`
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

  .error-notice {
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.25);
    color: #fb7185;
    padding: 0.6rem 0.85rem;
    border-radius: 12px;
    font-size: 0.85rem;
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
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.35);
          color: #34d399;
        }
      }
    }

    .category-chips {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.3rem;
      flex-wrap: wrap;

      .chip-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--text-secondary);
        border-radius: 8px;
        padding: 0.25rem 0.6rem;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        &.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #34d399;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }
      }
    }

    .desc-counter {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-dim);
      margin-top: 0.2rem;

      .limit-warning {
        color: #fb7185;
        font-weight: 700;
      }
    }

    input, textarea, select {
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
        background: rgba(15, 23, 42, 0.9);
        box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.25);
      }
    }

    .react-datepicker-wrapper {
      width: 100%;
    }

    select {
      cursor: pointer;
      option {
        background: #0e131f;
        color: #ffffff;
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
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 14px;
    color: #ffffff;
    font-family: inherit;
    font-size: 0.98rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
  }
`;

export default Form