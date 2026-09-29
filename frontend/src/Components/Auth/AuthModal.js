import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';

function AuthModal() {
    const { signIn, signUp } = useAuth();
    const { toast } = useToast();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Evaluate password strength & criteria live
    const passwordMetrics = useMemo(() => {
        if (!password) {
            return {
                score: 0,
                label: 'Empty',
                color: '#64748B',
                hasMinLength: false,
                hasUpperLower: false,
                hasNumber: false,
                hasSpecial: false,
            };
        }

        const hasMinLength = password.length >= 8;
        const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        let score = 0;
        if (hasMinLength) score++;
        if (hasUpperLower) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;

        let label = 'Weak';
        let color = '#F43F5E';
        if (score === 2) {
            label = 'Fair';
            color = '#F59E0B';
        } else if (score === 3) {
            label = 'Good';
            color = '#6366F1';
        } else if (score === 4) {
            label = 'Strong';
            color = '#10B981';
        }

        return {
            score,
            label,
            color,
            hasMinLength,
            hasUpperLower,
            hasNumber,
            hasSpecial,
        };
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            if (isSignUp) {
                if (!fullName.trim()) {
                    throw new Error('Please enter your full name');
                }
                const res = await signUp(email, password, fullName);
                if (res?.user && !res.session) {
                    const msg = 'Account created! Please check your email to confirm your account.';
                    setSuccessMsg(msg);
                    toast.info(msg, 'Account Created');
                } else {
                    toast.success('Account created successfully! Welcome to Vault Finance.', 'Account Created');
                }
            } else {
                const res = await signIn(email, password);
                const userName = res?.user?.user_metadata?.full_name || res?.user?.email?.split('@')[0] || 'User';
                toast.success(`Welcome back, ${userName}!`, 'Signed In');
            }
        } catch (err) {
            const errorText = err.message || 'Authentication failed';
            setErrorMsg(errorText);
            toast.error(errorText, 'Authentication Failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthStyled>
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
                <div className="brand-badge">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>VAULT FINANCE</span>
                </div>

                <div className="auth-header">
                    <motion.h2
                        key={isSignUp ? 'signup-title' : 'signin-title'}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isSignUp ? 'Create an Account' : 'Welcome Back'}
                    </motion.h2>
                    <p>{isSignUp ? 'Set up your credentials to manage your cash flow' : 'Sign in to access your financial intelligence suite'}</p>
                </div>

                <div className="tab-switcher">
                    <button
                        type="button"
                        className={!isSignUp ? 'active' : ''}
                        onClick={() => {
                            setIsSignUp(false);
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                    >
                        {!isSignUp && (
                            <motion.div
                                layoutId="activeAuthTab"
                                className="active-pill"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                        <span>Sign In</span>
                    </button>
                    <button
                        type="button"
                        className={isSignUp ? 'active' : ''}
                        onClick={() => {
                            setIsSignUp(true);
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                    >
                        {isSignUp && (
                            <motion.div
                                layoutId="activeAuthTab"
                                className="active-pill"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                        <span>Sign Up</span>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            key="error-box"
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="error-box"
                        >
                            {errorMsg}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div
                            key="success-box"
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="success-box"
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence initial={false}>
                        {isSignUp && (
                            <motion.div
                                key="fullname-field"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="input-group"
                            >
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ankit Jha"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={isSignUp}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {isSignUp && password.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="password-strength-indicator"
                            >
                                <div className="strength-header">
                                    <span className="strength-title">Password Strength:</span>
                                    <span className="strength-value" style={{ color: passwordMetrics.color }}>
                                        {passwordMetrics.label}
                                    </span>
                                </div>

                                <div className="strength-bars">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`bar ${step <= passwordMetrics.score ? 'filled' : ''}`}
                                            style={{
                                                backgroundColor: step <= passwordMetrics.score ? passwordMetrics.color : 'rgba(255, 255, 255, 0.08)',
                                                boxShadow: step <= passwordMetrics.score ? `0 0 8px ${passwordMetrics.color}50` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="requirements-grid">
                                    <span className={`req-chip ${passwordMetrics.hasMinLength ? 'met' : ''}`}>
                                        <span className="check-dot">{passwordMetrics.hasMinLength ? '✓' : '•'}</span> 8+ chars
                                    </span>
                                    <span className={`req-chip ${passwordMetrics.hasUpperLower ? 'met' : ''}`}>
                                        <span className="check-dot">{passwordMetrics.hasUpperLower ? '✓' : '•'}</span> Upper & lowercase
                                    </span>
                                    <span className={`req-chip ${passwordMetrics.hasNumber ? 'met' : ''}`}>
                                        <span className="check-dot">{passwordMetrics.hasNumber ? '✓' : '•'}</span> Number (0-9)
                                    </span>
                                    <span className={`req-chip ${passwordMetrics.hasSpecial ? 'met' : ''}`}>
                                        <span className="check-dot">{passwordMetrics.hasSpecial ? '✓' : '•'}</span> Symbol (!@#$)
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                        whileHover={!submitting ? { scale: 1.02 } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                    >
                        {submitting
                            ? 'Authenticating...'
                            : isSignUp
                            ? 'Create Account'
                            : 'Sign In'}
                    </motion.button>
                </form>

                <div className="toggle-text">
                    {isSignUp ? (
                        <span>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(false);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                            >
                                Sign In
                            </button>
                        </span>
                    ) : (
                        <span>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(true);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                            >
                                Sign Up
                            </button>
                        </span>
                    )}
                </div>
            </motion.div>
        </AuthStyled>
    );
}

const AuthStyled = styled.div`
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;

    .auth-card {
        width: 100%;
        max-width: 440px;
        background: rgba(14, 19, 31, 0.88);
        border: 1px solid var(--border-subtle);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.12);
        padding: 2.5rem 2.2rem;
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
    }

    .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        align-self: center;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.25);
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--accent-violet-light);
    }

    .auth-header {
        text-align: center;
        h2 {
            font-size: 1.7rem;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }
        p {
            color: var(--text-dim);
            font-size: 0.85rem;
            line-height: 1.4;
        }
    }

    .tab-switcher {
        display: flex;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 4px;
        gap: 4px;
        position: relative;

        button {
            flex: 1;
            padding: 0.65rem;
            border: none;
            background: transparent;
            font-family: inherit;
            font-weight: 600;
            color: var(--text-muted);
            border-radius: 10px;
            cursor: pointer;
            position: relative;
            z-index: 1;
            transition: color 0.25s ease;

            span {
                position: relative;
                z-index: 2;
                font-size: 0.9rem;
            }

            &.active {
                color: #ffffff;
            }

            .active-pill {
                position: absolute;
                inset: 0;
                background: rgba(99, 102, 241, 0.2);
                border: 1px solid rgba(99, 102, 241, 0.45);
                border-radius: 10px;
                box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
                z-index: 1;
            }
        }
    }

    .error-box {
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.3);
        color: #fb7185;
        padding: 0.65rem 1rem;
        border-radius: 12px;
        font-size: 0.85rem;
        text-align: center;
        overflow: hidden;
    }

    .success-box {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        padding: 0.65rem 1rem;
        border-radius: 12px;
        font-size: 0.85rem;
        text-align: center;
        overflow: hidden;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;

            label {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--text-muted);
            }

            .password-wrapper {
                position: relative;
                display: flex;
                align-items: center;

                input {
                    width: 100%;
                    padding-right: 2.75rem;
                }

                .eye-btn {
                    position: absolute;
                    right: 12px;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 6px;
                    transition: color 0.2s ease;

                    &:hover {
                        color: #ffffff;
                    }
                }
            }

            input {
                font-family: inherit;
                font-size: 0.95rem;
                outline: none;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: var(--bg-input);
                padding: 0.75rem 1rem;
                border-radius: 14px;
                color: #ffffff;
                transition: all 0.2s ease;

                &:focus {
                    border-color: var(--accent-violet);
                    background: rgba(15, 23, 42, 0.95);
                    box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
                }

                &::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }
            }

            .password-strength-indicator {
                display: flex;
                flex-direction: column;
                gap: 0.45rem;
                margin-top: 0.4rem;
                padding: 0.6rem 0.85rem;
                background: rgba(0, 0, 0, 0.28);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px;

                .strength-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;

                    .strength-title {
                        color: var(--text-dim);
                        font-weight: 500;
                    }

                    .strength-value {
                        font-weight: 700;
                        letter-spacing: 0.3px;
                    }
                }

                .strength-bars {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 5px;
                    height: 4px;

                    .bar {
                        border-radius: 999px;
                        transition: all 0.3s ease;
                    }
                }

                .requirements-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.3rem 0.5rem;
                    margin-top: 0.2rem;

                    .req-chip {
                        display: flex;
                        align-items: center;
                        gap: 0.35rem;
                        font-size: 0.69rem;
                        color: var(--text-dim);
                        transition: color 0.2s ease;

                        .check-dot {
                            font-weight: 700;
                            font-size: 0.75rem;
                        }

                        &.met {
                            color: #34d399;

                            .check-dot {
                                color: #10b981;
                            }
                        }
                    }
                }
            }
        }

        .submit-btn {
            margin-top: 0.4rem;
            padding: 0.85rem;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            border: 1px solid rgba(99, 102, 241, 0.5);
            color: #ffffff;
            border-radius: 14px;
            font-family: inherit;
            font-size: 0.98rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
            transition: all 0.25s ease;

            &:hover:not(:disabled) {
                box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
    }

    .toggle-text {
        text-align: center;
        font-size: 0.88rem;
        color: var(--text-dim);

        button {
            background: none;
            border: none;
            color: var(--accent-violet-light);
            font-weight: 700;
            cursor: pointer;
            text-decoration: underline;
            padding: 0 0.2rem;
            font-family: inherit;
            font-size: inherit;

            &:hover {
                color: #ffffff;
            }
        }
    }
`;

export default AuthModal;
