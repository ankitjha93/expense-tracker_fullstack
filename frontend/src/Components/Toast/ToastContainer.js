import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/toastContext';

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                );
        }
    };

    return (
        <ContainerStyled>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9, x: 25 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.85, x: 40, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className={`toast-item ${toast.type}`}
                    >
                        <div className="icon-con">{getIcon(toast.type)}</div>
                        <div className="content">
                            <h4>{toast.title}</h4>
                            <p>{toast.message}</p>
                        </div>
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            &times;
                        </button>
                        <motion.div
                            className="progress-bar"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 4.5, ease: 'linear' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </ContainerStyled>
    );
}

const ContainerStyled = styled.div`
    position: fixed;
    top: 1.8rem;
    right: 1.8rem;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    max-width: 380px;
    width: 100%;

    .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        background: rgba(14, 19, 31, 0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        padding: 0.95rem 1.15rem;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3.5px;
        }

        &.success::before {
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }

        &.error::before {
            background: #f43f5e;
            box-shadow: 0 0 10px #f43f5e;
        }

        &.info::before {
            background: #818cf8;
            box-shadow: 0 0 10px #818cf8;
        }

        .icon-con {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
        }

        .content {
            flex: 1;
            h4 {
                font-size: 0.92rem;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 0.15rem;
            }
            p {
                font-size: 0.82rem;
                color: var(--text-muted);
                line-height: 1.35;
            }
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.25rem;
            line-height: 1;
            color: var(--text-dim);
            cursor: pointer;
            padding: 0 0.2rem;
            transition: color 0.2s ease;

            &:hover {
                color: #ffffff;
            }
        }

        .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2.5px;
            opacity: 0.85;
        }

        &.success .progress-bar {
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
        }

        &.error .progress-bar {
            background: #f43f5e;
            box-shadow: 0 0 8px #f43f5e;
        }

        &.info .progress-bar {
            background: #818cf8;
            box-shadow: 0 0 8px #818cf8;
        }
    }
`;

export default ToastContainer;
