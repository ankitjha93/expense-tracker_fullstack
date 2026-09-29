import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
    }

    :root {
        /* Neo-Fintech Dark Palette */
        --bg-body: #080B10;
        --bg-surface: #0E131F;
        --bg-card: rgba(17, 24, 39, 0.72);
        --bg-card-hover: rgba(26, 35, 56, 0.85);
        --bg-input: rgba(15, 23, 42, 0.6);
        
        --border-subtle: rgba(255, 255, 255, 0.08);
        --border-glow: rgba(99, 102, 241, 0.4);
        --border-focus: #6366F1;

        --primary-color: #F8FAFC;
        --accent-violet: #6366F1;
        --accent-violet-light: #818CF8;
        --color-green: #10B981;
        --color-income: #10B981;
        --color-income-glow: rgba(16, 185, 129, 0.15);
        --color-expense: #F43F5E;
        --color-delete: #F43F5E;
        --color-expense-glow: rgba(244, 63, 94, 0.15);
        --color-accent: #6366F1;
        --text-muted: #94A3B8;
        --text-dim: #64748B;
        --color-gray: #334155;
    }

    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: clamp(0.95rem, 1.2vw, 1.05rem);
        background-color: var(--bg-body);
        color: var(--primary-color);
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
        color: var(--primary-color);
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    /* Custom sleek dark scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    .error {
        color: var(--color-expense);
        animation: shake 0.4s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
    }
`;
