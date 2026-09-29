import React, { useState } from 'react'
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext'
import { dateFormat } from '../../utils/dateFormat'

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Chart() {
  const { incomes, expenses } = useGlobalContext()
  const [timeframe, setTimeframe] = useState('ALL') // '7D', '30D', 'ALL'

  // Filter items based on selected timeframe
  const filterByTimeframe = (items) => {
    if (timeframe === 'ALL') return items
    const now = new Date()
    const days = timeframe === '7D' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return items.filter(item => new Date(item.date) >= cutoff)
  }

  const filteredIncomes = filterByTimeframe(incomes)
  const filteredExpenses = filterByTimeframe(expenses)

  // Generate sorted unique date labels
  const allDates = [
    ...filteredIncomes.map(item => item.date),
    ...filteredExpenses.map(item => item.date)
  ]
  allDates.sort((a, b) => new Date(a) - new Date(b))
  const labels = Array.from(new Set(allDates)).map(date => dateFormat(date))

  const data = {
    labels: labels.length ? labels : ['No Data in Range'],
    datasets: [
      {
        label: 'Income',
        data: labels.length
          ? labels.map(label => {
              const matched = filteredIncomes.filter(inc => dateFormat(inc.date) === label)
              return matched.reduce((acc, curr) => acc + curr.amount, 0)
            })
          : [0],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0B0E14',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: 'Expenses',
        data: labels.length
          ? labels.map(label => {
              const matched = filteredExpenses.filter(exp => dateFormat(exp.date) === label)
              return matched.reduce((acc, curr) => acc + curr.amount, 0)
            })
          : [0],
        borderColor: '#F43F5E',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#F43F5E',
        pointBorderColor: '#0B0E14',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#94A3B8',
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(14, 19, 31, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 12,
        usePointStyle: true,
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 13,
          weight: 700,
        },
        bodyFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
          },
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  }

  return (
    <ChartStyled>
      <div className='chart-header'>
        <div className='header-left'>
          <h4>Cash Flow Analytics</h4>
          <span className='live-badge'>Live Stream</span>
        </div>
        <div className='timeframe-pills'>
          {['7D', '30D', 'ALL'].map((tf) => (
            <button
              key={tf}
              type='button'
              className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf === 'ALL' ? 'All Time' : tf}
            </button>
          ))}
        </div>
      </div>
      <div className='canvas-wrapper'>
        <Line data={data} options={options} />
      </div>
    </ChartStyled>
  )
}

const ChartStyled = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 1.4rem;
  border-radius: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.75rem;
    flex-wrap: wrap;

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      h4 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #ffffff;
      }

      .live-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #34d399;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        padding: 0.18rem 0.55rem;
        border-radius: 999px;

        &::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
      }
    }

    .timeframe-pills {
      display: flex;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 3px;
      gap: 3px;

      .tf-btn {
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-dim);
        font-family: inherit;
        font-size: 0.76rem;
        font-weight: 600;
        padding: 0.3rem 0.65rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          color: #ffffff;
        }

        &.active {
          background: rgba(99, 102, 241, 0.25);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }
      }
    }
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
    min-height: 260px;
  }
`;

export default Chart