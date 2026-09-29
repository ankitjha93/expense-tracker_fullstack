import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import InteractiveLogo from './InteractiveLogo';
import { useToast } from '../../context/toastContext';

function InteractiveBrand({ size = 'md', isCentered = false, showBadge = true, className }) {
  const { toast } = useToast();

  const handleBrandClick = () => {
    toast.info('AURA Core v2.4 Online • Real-time financial telemetry active.', 'AURA Intelligence');
  };

  return (
    <BrandContainer
      className={className}
      $isCentered={isCentered}
      $size={size}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleBrandClick}
      title="AURA Wealth OS • Click for system status"
    >
      <InteractiveLogo size={size} />

      <div className="brand-text-block">
        <div className="title-row">
          <motion.h3
            className="brand-title"
            whileHover={{ letterSpacing: '0.12em' }}
            transition={{ duration: 0.25 }}
          >
            AURA
          </motion.h3>
          {showBadge && (
            <span className="version-pill">
              <span className="live-dot" />
              <span>OS</span>
            </span>
          )}
        </div>
        <span className="brand-subtitle">
          Intelligent Wealth & Flow
        </span>
      </div>
    </BrandContainer>
  );
}

const shimmerAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseDot = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 6px #10b981; }
  50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 12px #34d399, 0 0 20px #10b981; }
`;

const BrandContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$size === 'lg' ? '1.1rem' : props.$size === 'sm' ? '0.65rem' : '0.85rem')};
  justify-content: ${(props) => (props.$isCentered ? 'center' : 'flex-start')};
  cursor: pointer;
  user-select: none;
  width: fit-content;

  .brand-text-block {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .brand-title {
      font-size: ${(props) => (props.$size === 'lg' ? '1.75rem' : props.$size === 'sm' ? '1.15rem' : '1.4rem')};
      font-weight: 800;
      letter-spacing: 0.09em;
      margin: 0;
      line-height: 1.1;

      /* Kinetic Holographic Shimmer Gradient */
      background: linear-gradient(
        135deg,
        #ffffff 0%,
        #c7d2fe 25%,
        #818cf8 50%,
        #c084fc 75%,
        #34d399 100%
      );
      background-size: 200% auto;
      animation: ${shimmerAnimation} 6s linear infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 10px rgba(99, 102, 241, 0.35));
    }

    .version-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0.12rem 0.45rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.28);
      font-size: 0.65rem;
      font-weight: 700;
      color: #34d399;
      letter-spacing: 0.05em;

      .live-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #10b981;
        animation: ${pulseDot} 2s ease-in-out infinite;
      }
    }

    .brand-subtitle {
      font-size: ${(props) => (props.$size === 'lg' ? '0.78rem' : props.$size === 'sm' ? '0.62rem' : '0.7rem')};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #94a3b8;
      transition: color 0.2s ease;
      white-space: nowrap;
    }
  }

  &:hover {
    .brand-text-block .brand-subtitle {
      color: #c7d2fe;
    }
  }
`;

export default InteractiveBrand;
