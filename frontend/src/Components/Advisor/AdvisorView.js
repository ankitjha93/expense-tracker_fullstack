import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { InnerLayout } from '../../styles/Layouts';
import { useGlobalContext } from '../../context/globalContext';
import { useToast } from '../../context/toastContext';

function AdvisorView({ setActive }) {
  const {
    advisorData,
    advisorLoading,
    getAiInsights,
    sendAiChat,
    geminiApiKey,
    setGeminiApiKey,
    incomes,
    expenses,
    budgets
  } = useGlobalContext();

  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am **FinAdvisor AI**, your private fintech wealth advisor. I analyze your cash flows, budgets, and savings velocity in real time. Ask me anything about optimizing your ledger, trimming discretionary leaks, or hitting your savings goals!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey || '');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    getAiInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length, budgets.length]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend || !textToSend.trim() || chatLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setChatLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome');
      const res = await sendAiChat(userMsg.text, history);
      
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply || 'Analysis complete.',
        engine: res.engine
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      toast.error('Advisor communication failed. Please try again.', 'Chat Error');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I encountered a hiccup connecting to the advisor engine. Please verify your connection or try again."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveKey = () => {
    setGeminiApiKey(tempKey.trim());
    setShowKeyModal(false);
    toast.success(
      tempKey.trim() ? 'Custom Gemini API Key saved!' : 'Switched to built-in financial intelligence engine.',
      'Advisor Settings'
    );
    getAiInsights();
  };

  const telemetry = advisorData?.telemetry;
  const narrative = advisorData?.narrative;
  const healthScore = telemetry?.healthScore?.overall || 78;
  const healthGrade = telemetry?.healthScore?.grade || 'B+';
  const framework = telemetry?.framework503020;
  const forecast = telemetry?.forecast;
  const isGemini = Boolean(advisorData?.engine && advisorData.engine.startsWith('gemini'));
  const engineLabel = isGemini ? '✨ Gemini 3.5 Flash Active' : '⚡ Smart Heuristic Engine';

  const quickPrompts = [
    "How can I save $500 this month?",
    "Analyze my 50/30/20 breakdown",
    "Are any of my category budgets at risk?",
    "What is my daily burn velocity?"
  ];

  return (
    <AdvisorStyled>
      <InnerLayout>
        {/* Page Header */}
        <div className="page-header">
          <div>
            <div className="badge-row">
              <span className="live-pill">
                <span className="dot"></span>
                Fintech Intelligence Engine
              </span>
              <span className={`engine-badge ${isGemini ? 'gemini' : 'heuristic'}`}>
                {engineLabel}
              </span>
            </div>
            <h1>AI Financial Insights & Advisor</h1>
            <p className="subtitle">Real-time ledger analytics, behavioral burn diagnostics, and wealth projections</p>
          </div>

          <div className="header-actions">
            <motion.button
              type="button"
              className="key-config-btn"
              onClick={() => setShowKeyModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Configure Gemini Cloud API Key"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-1.5 6.1L16 11l-1.5-1.5M10.5 13.5L3 21l3 3 7.5-7.5"></path>
                <circle cx="16.5" cy="7.5" r="4.5"></circle>
              </svg>
              <span>{geminiApiKey ? 'API Key Configured' : 'Connect Gemini Key'}</span>
            </motion.button>

            <motion.button
              type="button"
              className="refresh-btn"
              onClick={() => {
                getAiInsights();
                toast.info('Recalculating financial analytics...', 'Advisor Synced');
              }}
              disabled={advisorLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className={advisorLoading ? 'spin' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{advisorLoading ? 'Analyzing...' : 'Recalculate'}</span>
            </motion.button>
          </div>
        </div>

        {/* Executive Narrative Briefing */}
        {narrative && (
          <motion.div
            className="executive-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="banner-left">
              <div className="sparkle-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div className="banner-content">
                <h4>Executive Briefing</h4>
                <p className="summary-text">{narrative.executiveSummary}</p>
                {narrative.topTacticalAction && (
                  <div className="tactical-action">
                    <span className="pill">Priority Action</span>
                    <span className="action-text">{narrative.topTacticalAction}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Analytics Cards Grid */}
        <div className="analytics-grid">
          {/* Health Score Card */}
          <div className="metric-card score-card">
            <div className="card-top">
              <span className="label">Financial Health Score</span>
              <span className={`grade-pill grade-${healthGrade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                Grade {healthGrade}
              </span>
            </div>

            <div className="score-display">
              <div className="radial-score">
                <h2>{healthScore}</h2>
                <span className="max-score">/ 100</span>
              </div>
              <div className="score-desc">
                <p className="status-label">
                  {healthScore >= 85 ? 'Excellent Health' : healthScore >= 70 ? 'Stable Position' : 'Action Recommended'}
                </p>
                <span>Composite score computed across 4 wealth dimensions</span>
              </div>
            </div>

            <div className="subscores-list">
              <div className="subscore-row">
                <span className="name">Cash Flow Stability</span>
                <span className="val">{telemetry?.healthScore?.breakdown?.cashflow || 20}/25</span>
              </div>
              <div className="subscore-row">
                <span className="name">Savings Rate Efficiency</span>
                <span className="val">{telemetry?.healthScore?.breakdown?.savings || 18}/25</span>
              </div>
              <div className="subscore-row">
                <span className="name">Budget Adherence</span>
                <span className="val">{telemetry?.healthScore?.breakdown?.budget || 22}/25</span>
              </div>
              <div className="subscore-row">
                <span className="name">Discretionary Spend Ratio</span>
                <span className="val">{telemetry?.healthScore?.breakdown?.discretionary || 18}/25</span>
              </div>
            </div>
          </div>

          {/* 50/30/20 Framework Card */}
          <div className="metric-card framework-card">
            <div className="card-top">
              <span className="label">50 / 30 / 20 Framework</span>
              <span className="benchmark-pill">Standard Benchmark</span>
            </div>

            <div className="framework-bars">
              {/* Needs */}
              <div className="bar-group">
                <div className="bar-info">
                  <span className="cat-name">
                    <span className="dot needs-dot"></span>
                    Needs (Groceries, Housing, Bills)
                  </span>
                  <span className="cat-stat">
                    <strong>{framework?.needs?.pct || 0}%</strong>
                    <span className="target"> / Target 50%</span>
                  </span>
                </div>
                <div className="track">
                  <div
                    className="fill fill-needs"
                    style={{ width: `${Math.min(100, framework?.needs?.pct || 0)}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div className="bar-group">
                <div className="bar-info">
                  <span className="cat-name">
                    <span className="dot wants-dot"></span>
                    Wants (Dining, Shopping, Fun)
                  </span>
                  <span className="cat-stat">
                    <strong>{framework?.wants?.pct || 0}%</strong>
                    <span className="target"> / Target 30%</span>
                  </span>
                </div>
                <div className="track">
                  <div
                    className={`fill ${
                      (framework?.wants?.pct || 0) > 35 ? 'fill-rose' : 'fill-wants'
                    }`}
                    style={{ width: `${Math.min(100, framework?.wants?.pct || 0)}%` }}
                  />
                </div>
              </div>

              {/* Savings */}
              <div className="bar-group">
                <div className="bar-info">
                  <span className="cat-name">
                    <span className="dot savings-dot"></span>
                    Savings & Investments
                  </span>
                  <span className="cat-stat">
                    <strong>{framework?.savings?.pct || 0}%</strong>
                    <span className="target"> / Target 20%</span>
                  </span>
                </div>
                <div className="track">
                  <div
                    className="fill fill-savings"
                    style={{ width: `${Math.min(100, framework?.savings?.pct || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="card-footer">
              <span>
                {(framework?.savings?.pct || 0) >= 20
                  ? '✓ Savings rate exceeds recommended 20% benchmark.'
                  : 'Trimming Wants closer to 30% will elevate your savings.'}
              </span>
            </div>
          </div>

          {/* Runway & Burn Projection Card */}
          <div className="metric-card runway-card">
            <div className="card-top">
              <span className="label">Monthly Burn & Runway</span>
              <span className="burn-pill">Projection</span>
            </div>

            <div className="burn-stats-row">
              <div className="stat-col">
                <span className="sub">Daily Burn</span>
                <h3>${forecast?.dailyBurn || 0}<span className="unit">/day</span></h3>
              </div>
              <div className="stat-col">
                <span className="sub">Days Remaining</span>
                <h3>{forecast?.daysRemaining || 0}<span className="unit">days</span></h3>
              </div>
            </div>

            <div className="projected-balance-box">
              <div className="proj-info">
                <span>Projected Month-End Net</span>
                <span className="proj-tag">Current Trajectory</span>
              </div>
              <h2 className={(forecast?.projectedEndBalance || 0) >= 0 ? 'text-emerald' : 'text-rose'}>
                {(forecast?.projectedEndBalance || 0) >= 0 ? '+' : ''}${forecast?.projectedEndBalance?.toLocaleString() || '0'}
              </h2>
            </div>

            <div className="card-footer">
              <span>Projected Outflows: ${forecast?.projectedExpense?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>

        {/* Opportunities & Anomalies Row */}
        {((telemetry?.opportunities?.length || 0) > 0 || (telemetry?.anomalies?.length || 0) > 0) && (
          <div className="insights-row">
            {/* Opportunities */}
            <div className="insight-panel opportunities-panel">
              <div className="panel-header">
                <div className="title-wrap">
                  <span className="icon">💡</span>
                  <h4>Strategic Savings Opportunities</h4>
                </div>
              </div>

              <div className="insight-cards-list">
                {telemetry?.opportunities?.length === 0 ? (
                  <p className="empty-text">No immediate savings leaks detected.</p>
                ) : (
                  telemetry?.opportunities?.map((opp, idx) => (
                    <div key={idx} className="opportunity-item">
                      <div className="item-header">
                        <h5>{opp.title}</h5>
                        {opp.potentialSaving > 0 && (
                          <span className="saving-badge">+${opp.potentialSaving.toLocaleString()}/mo potential</span>
                        )}
                      </div>
                      <p>{opp.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Risk & Anomaly Radar */}
            <div className="insight-panel anomaly-panel">
              <div className="panel-header">
                <div className="title-wrap">
                  <span className="icon">⚠️</span>
                  <h4>Risk & Anomaly Radar</h4>
                </div>
              </div>

              <div className="insight-cards-list">
                {telemetry?.anomalies?.length === 0 ? (
                  <div className="safe-state">
                    <span className="check-icon">✓</span>
                    <p>All category limits and burn rates are within safe thresholds.</p>
                  </div>
                ) : (
                  telemetry?.anomalies?.map((anom, idx) => (
                    <div key={idx} className={`anomaly-item sev-${anom.severity}`}>
                      <h5>{anom.title}</h5>
                      <p>{anom.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conversational Advisor Chat Interface */}
        <div className="chat-section">
          <div className="chat-header">
            <div className="ai-profile">
              <div className="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div>
                <h4>FinAdvisor AI Assistant</h4>
                <span className="status-text">
                  <span className="online-dot"></span>
                  Grounded in your active financial ledger
                </span>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="chips-row">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleSendMessage(chip)}
                  disabled={chatLoading}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-window">
            <div className="messages-container">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`message-bubble ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.sender === 'ai' && (
                    <div className="sender-tag">
                      <span className="sparkle">✨</span> FinAdvisor AI
                    </div>
                  )}
                  <div className="msg-content">
                    {msg.text.split('\n').map((line, i) => {
                      if (!line.trim()) return <br key={i} />;
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="md-h4">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={i} className="md-li">{line.replace('- ', '')}</li>;
                      }
                      return <p key={i} className="md-p">{line}</p>;
                    })}
                  </div>
                </motion.div>
              ))}

              {chatLoading && (
                <div className="message-bubble ai-msg loading-msg">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="thinking-text">FinAdvisor is analyzing your ledger...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask FinAdvisor about your budgets, savings potential, or spending habits..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!inputMessage.trim() || chatLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Gemini API Key Modal */}
        <AnimatePresence>
          {showKeyModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div className="title-group">
                    <span className="key-icon">🔑</span>
                    <h4>Configure Google Gemini API Key</h4>
                  </div>
                  <button type="button" className="close-btn" onClick={() => setShowKeyModal(false)}>✕</button>
                </div>

                <p className="modal-desc">
                  Connect your personal Google Gemini API key to activate cloud <strong>Gemini 3.8 Flash</strong> reasoning. If left empty, the application uses the built-in deterministic financial intelligence engine with zero external dependencies.
                </p>

                <div className="input-group">
                  <label>Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                  />
                  <span className="hint">Your key is stored locally in your browser and transmitted securely over TLS.</span>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setTempKey('');
                      setGeminiApiKey('');
                      setShowKeyModal(false);
                      toast.info('Cleared custom Gemini API key. Using built-in engine.', 'Settings');
                      getAiInsights();
                    }}
                  >
                    Clear Key
                  </button>
                  <button type="button" className="save-btn" onClick={handleSaveKey}>
                    Save & Apply
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </InnerLayout>
    </AdvisorStyled>
  );
}

const AdvisorStyled = styled.div`
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.8rem;
    gap: 1rem;
    flex-wrap: wrap;

    .badge-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;

      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #818cf8;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 8px #818cf8;
        }
      }

      .engine-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;

        &.gemini {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: #c084fc;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
        }

        &.heuristic {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
      }
    }

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

      .key-config-btn, .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.95rem;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .key-config-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e2e8f0;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
      }

      .refresh-btn {
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.35);
        color: #818cf8;

        &:hover {
          background: rgba(99, 102, 241, 0.22);
          border-color: rgba(99, 102, 241, 0.5);
        }

        .spin {
          animation: spin 1s linear infinite;
        }
      }
    }
  }

  /* Executive Banner */
  .executive-banner {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.55) 0%, rgba(15, 23, 42, 0.7) 100%);
    border: 1px solid rgba(168, 85, 247, 0.35);
    border-radius: 20px;
    padding: 1.3rem 1.6rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);

    .banner-left {
      display: flex;
      gap: 1.1rem;

      .sparkle-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .banner-content {
        h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.35rem;
        }

        .summary-text {
          font-size: 0.9rem;
          color: #cbd5e1;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .tactical-action {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(168, 85, 247, 0.25);
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          font-size: 0.82rem;

          .pill {
            font-weight: 700;
            color: #c084fc;
            text-transform: uppercase;
            font-size: 0.68rem;
            letter-spacing: 0.05em;
          }

          .action-text {
            color: #f1f5f9;
            font-weight: 500;
          }
        }
      }
    }
  }

  /* Analytics Grid */
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.5rem;

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .grade-pill, .benchmark-pill, .burn-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }

        .grade-pill {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .benchmark-pill {
          background: rgba(99, 102, 241, 0.12);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .burn-pill {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
      }

      /* Score Card Specific */
      .score-display {
        display: flex;
        align-items: center;
        gap: 1.2rem;

        .radial-score {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;

          h2 {
            font-size: 2.8rem;
            font-weight: 900;
            background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
          }

          .max-score {
            font-size: 0.85rem;
            color: var(--text-dim);
            font-weight: 600;
          }
        }

        .score-desc {
          .status-label {
            font-size: 0.95rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.15rem;
          }

          span {
            font-size: 0.74rem;
            color: var(--text-dim);
            line-height: 1.3;
            display: block;
          }
        }
      }

      .subscores-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        padding: 0.65rem 0.85rem;

        .subscore-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.76rem;

          .name {
            color: #94a3b8;
          }

          .val {
            color: #ffffff;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
          }
        }
      }

      /* Framework Card Specific */
      .framework-bars {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;

        .bar-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .bar-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.78rem;

            .cat-name {
              display: flex;
              align-items: center;
              gap: 0.45rem;
              color: #e2e8f0;
              font-weight: 600;

              .dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;

                &.needs-dot { background: #38bdf8; }
                &.wants-dot { background: #a855f7; }
                &.savings-dot { background: #10b981; }
              }
            }

            .cat-stat {
              color: #ffffff;
              font-variant-numeric: tabular-nums;

              .target {
                color: var(--text-dim);
                font-size: 0.72rem;
              }
            }
          }

          .track {
            height: 6px;
            width: 100%;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 999px;
            overflow: hidden;

            .fill {
              height: 100%;
              border-radius: 999px;
              transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

              &.fill-needs { background: linear-gradient(90deg, #38bdf8, #0ea5e9); }
              &.fill-wants { background: linear-gradient(90deg, #a855f7, #6366f1); }
              &.fill-savings { background: linear-gradient(90deg, #10b981, #34d399); }
              &.fill-rose { background: linear-gradient(90deg, #f43f5e, #fb7185); }
            }
          }
        }
      }

      /* Runway Card Specific */
      .burn-stats-row {
        display: flex;
        justify-content: space-between;

        .stat-col {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;

          .sub {
            font-size: 0.72rem;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          h3 {
            font-size: 1.4rem;
            font-weight: 800;
            color: #ffffff;

            .unit {
              font-size: 0.76rem;
              font-weight: 500;
              color: var(--text-dim);
              margin-left: 0.2rem;
            }
          }
        }
      }

      .projected-balance-box {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 14px;
        padding: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        .proj-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          color: var(--text-dim);

          .proj-tag {
            color: #818cf8;
            font-weight: 600;
          }
        }

        h2 {
          font-size: 1.55rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;

          &.text-emerald { color: #34d399; }
          &.text-rose { color: #fb7185; }
        }
      }

      .card-footer {
        font-size: 0.74rem;
        color: var(--text-dim);
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        padding-top: 0.6rem;
      }
    }
  }

  /* Opportunities & Anomalies Row */
  .insights-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.5rem;

    .insight-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 1.35rem;

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .icon {
            font-size: 1.1rem;
          }

          h4 {
            font-size: 1rem;
            font-weight: 700;
            color: #ffffff;
          }
        }
      }

      .insight-cards-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .opportunity-item {
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 0.85rem 1rem;

          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.3rem;

            h5 {
              font-size: 0.88rem;
              font-weight: 700;
              color: #ffffff;
            }

            .saving-badge {
              font-size: 0.72rem;
              font-weight: 700;
              color: #34d399;
              background: rgba(16, 185, 129, 0.12);
              border: 1px solid rgba(16, 185, 129, 0.3);
              padding: 0.15rem 0.5rem;
              border-radius: 999px;
            }
          }

          p {
            font-size: 0.8rem;
            color: #cbd5e1;
            line-height: 1.4;
          }
        }

        .anomaly-item {
          border-radius: 12px;
          padding: 0.85rem 1rem;

          &.sev-high {
            background: rgba(244, 63, 94, 0.08);
            border: 1px solid rgba(244, 63, 94, 0.25);

            h5 { color: #fb7185; }
          }

          &.sev-medium {
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.25);

            h5 { color: #fbbf24; }
          }

          h5 {
            font-size: 0.88rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          p {
            font-size: 0.8rem;
            color: #cbd5e1;
            line-height: 1.4;
          }
        }

        .safe-state {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.05);
          border: 1px dashed rgba(16, 185, 129, 0.2);
          border-radius: 12px;

          .check-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #10b981;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 800;
            flex-shrink: 0;
          }

          p {
            font-size: 0.82rem;
            color: #94a3b8;
          }
        }
      }
    }
  }

  /* Chat Section */
  .chat-section {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);

    .chat-header {
      padding: 1.2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

      .ai-profile {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .ai-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }

        h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.15rem;
        }

        .status-text {
          font-size: 0.75rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.4rem;

          .online-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
          }
        }
      }

      .chips-row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        .prompt-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(99, 102, 241, 0.18);
            border-color: rgba(99, 102, 241, 0.4);
            color: #ffffff;
          }
        }
      }
    }

    .chat-window {
      display: flex;
      flex-direction: column;
      height: 480px;

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .message-bubble {
          max-width: 80%;
          padding: 0.9rem 1.2rem;
          border-radius: 18px;
          font-size: 0.88rem;
          line-height: 1.5;

          &.user-msg {
            align-self: flex-end;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.25);
          }

          &.ai-msg {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.07);
            color: #e2e8f0;
            border-bottom-left-radius: 4px;

            .sender-tag {
              font-size: 0.72rem;
              font-weight: 700;
              color: #c084fc;
              margin-bottom: 0.4rem;
              display: flex;
              align-items: center;
              gap: 0.3rem;
            }

            .md-h4 {
              font-size: 0.95rem;
              font-weight: 700;
              color: #ffffff;
              margin: 0.6rem 0 0.3rem 0;
            }

            .md-li {
              margin-left: 1.1rem;
              margin-bottom: 0.25rem;
            }

            .md-p {
              margin-bottom: 0.3rem;
            }
          }

          &.loading-msg {
            display: flex;
            align-items: center;
            gap: 0.8rem;

            .thinking-text {
              font-size: 0.8rem;
              color: var(--text-dim);
            }

            .typing-indicator {
              display: flex;
              align-items: center;
              gap: 4px;

              span {
                width: 6px;
                height: 6px;
                background: #a855f7;
                border-radius: 50%;
                animation: bounce 1.2s infinite ease-in-out both;

                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
              }
            }
          }
        }
      }

      .chat-input-bar {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        gap: 0.75rem;

        input {
          flex: 1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 0.75rem 1.25rem;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease;

          &:focus {
            border-color: #818cf8;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
          }

          &::placeholder {
            color: var(--text-muted);
          }
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.2s ease;

          &:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
          }

          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        }
      }
    }
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .modal-content {
      background: #0f172a;
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 20px;
      padding: 1.8rem;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.8rem;

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;

          .key-icon { font-size: 1.2rem; }

          h4 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #ffffff;
          }
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 1.2rem;
          cursor: pointer;

          &:hover { color: #ffffff; }
        }
      }

      .modal-desc {
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
        margin-bottom: 1.2rem;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1.5rem;

        label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;

          &:focus {
            border-color: #818cf8;
          }
        }

        .hint {
          font-size: 0.72rem;
          color: var(--text-dim);
        }
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;

        .clear-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          cursor: pointer;

          &:hover {
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.2);
          }
        }

        .save-btn {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border: none;
          color: #ffffff;
          padding: 0.5rem 1.2rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;

          &:hover {
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
          }
        }
      }
    }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1024px) {
    .analytics-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .insights-row {
      grid-template-columns: 1fr;
      gap: 1rem;
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

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }

    .analytics-grid .metric-overview-card {
      padding: 1.1rem;
    }

    .advisor-chat-card {
      padding: 1.1rem;

      .chat-messages {
        height: 280px;
      }

      .chat-input-row {
        gap: 0.5rem;
      }
    }
  }
`;

export default AdvisorView;
