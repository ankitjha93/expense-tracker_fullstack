import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

function InteractiveLogo({ size = 'md', className, onClick }) {
  // Determine pixel dimensions
  const dimensions = {
    sm: { width: 36, height: 36, prismSize: 22 },
    md: { width: 48, height: 48, prismSize: 30 },
    lg: { width: 64, height: 64, prismSize: 40 },
  }[size] || { width: 48, height: 48, prismSize: 30 };

  // 3D Mouse Tilt Tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['18deg', '-18deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-18deg', '18deg']);

  // Particle Burst State on Click
  const [particles, setParticles] = useState([]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogoClick = (e) => {
    if (onClick) onClick(e);

    // Spawn 8 luminous energy particles radiating outward
    const colors = ['#6366F1', '#A855F7', '#10B981', '#38BDF8', '#F43F5E', '#FBBF24'];
    const newParticles = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45) * (Math.PI / 180);
      const distance = 24 + Math.random() * 20;
      return {
        id: Date.now() + i + Math.random(),
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance,
        color: colors[i % colors.length],
        scale: 0.8 + Math.random() * 0.6,
      };
    });

    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 700);
  };

  return (
    <LogoWrapper
      className={className}
      style={{ width: dimensions.width, height: dimensions.height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleLogoClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      title="AURA Quantum Prism • Click for energy burst"
    >
      {/* Dynamic 3D Prism Container */}
      <motion.div
        className="prism-container"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Ambient Holographic Glow Aura */}
        <div className="ambient-glow" />

        {/* Counter-Rotating Orbital Rings */}
        <div className="orbit-system">
          <div className="orbit-ring ring-primary">
            <span className="electron-node node-indigo" />
          </div>
          <div className="orbit-ring ring-secondary">
            <span className="electron-node node-emerald" />
          </div>
        </div>

        {/* Multi-Faceted Isometric Quantum Crystal Prism SVG */}
        <svg
          className="prism-svg"
          width={dimensions.prismSize}
          height={dimensions.prismSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Holographic Gradients */}
            <linearGradient id="auraTopFacet" x1="50" y1="6" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C7D2FE" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>

            <linearGradient id="auraLeftFacet" x1="12" y1="50" x2="50" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>

            <linearGradient id="auraRightFacet" x1="88" y1="50" x2="50" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="60%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="auraCoreRay" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>

            <filter id="auraNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Isometric Diamond / Prism Facets */}
          {/* Top Diamond Facet */}
          <polygon
            points="50,8 86,30 50,52 14,30"
            fill="url(#auraTopFacet)"
            opacity="0.95"
          />

          {/* Left Diamond Facet */}
          <polygon
            points="14,30 50,52 50,92 14,70"
            fill="url(#auraLeftFacet)"
            opacity="0.92"
          />

          {/* Right Diamond Facet */}
          <polygon
            points="50,52 86,30 86,70 50,92"
            fill="url(#auraRightFacet)"
            opacity="0.95"
          />

          {/* Crystal Bevel Seams & Edge Refractions */}
          <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
          <line x1="50" y1="52" x2="14" y2="30" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" />
          <line x1="50" y1="52" x2="86" y2="30" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" />
          <line x1="14" y1="30" x2="86" y2="30" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="2 3" />

          {/* Central Quantum Nexus Spark */}
          <circle cx="50" cy="52" r="5" fill="url(#auraCoreRay)" filter="url(#auraNeonGlow)" />
          <circle cx="50" cy="52" r="2.5" fill="#FFFFFF" />
        </svg>

        {/* Click Particle Burst System */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="burst-particle"
              initial={{ x: 0, y: 0, scale: p.scale, opacity: 1 }}
              animate={{
                x: p.targetX,
                y: p.targetY,
                scale: 0.1,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </LogoWrapper>
  );
}

// Keyframe Animations for Orbital Rings and Floating
const rotateOrbitClockwise = keyframes`
  0% { transform: rotateX(68deg) rotateZ(0deg); }
  100% { transform: rotateX(68deg) rotateZ(360deg); }
`;

const rotateOrbitCounter = keyframes`
  0% { transform: rotateY(68deg) rotateZ(360deg); }
  100% { transform: rotateY(68deg) rotateZ(0deg); }
`;

const pulseAura = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.75; }
`;

const LogoWrapper = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  perspective: 700px;
  user-select: none;

  .prism-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: radial-gradient(circle at 35% 35%, rgba(99, 102, 241, 0.22) 0%, rgba(16, 185, 129, 0.1) 60%, rgba(14, 19, 31, 0.6) 100%);
    border: 1px solid rgba(129, 140, 248, 0.35);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.25), inset 0 0 12px rgba(99, 102, 241, 0.15);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      border-color: rgba(168, 85, 247, 0.65);
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.25);

      .ambient-glow {
        opacity: 0.85;
      }
    }
  }

  .ambient-glow {
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%);
    filter: blur(8px);
    pointer-events: none;
    animation: ${pulseAura} 4s ease-in-out infinite;
    z-index: 1;
  }

  .orbit-system {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
  }

  .orbit-ring {
    position: absolute;
    width: 82%;
    height: 82%;
    border-radius: 50%;
    border: 1px dashed rgba(255, 255, 255, 0.2);

    &.ring-primary {
      border-color: rgba(129, 140, 248, 0.35);
      animation: ${rotateOrbitClockwise} 7s linear infinite;
    }

    &.ring-secondary {
      border-color: rgba(52, 211, 153, 0.35);
      animation: ${rotateOrbitCounter} 9s linear infinite;
    }

    .electron-node {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);

      &.node-indigo {
        background: #818cf8;
        box-shadow: 0 0 8px #818cf8, 0 0 14px #6366f1;
      }

      &.node-emerald {
        background: #34d399;
        box-shadow: 0 0 8px #34d399, 0 0 14px #10b981;
      }
    }
  }

  .prism-svg {
    position: relative;
    z-index: 3;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
    transition: transform 0.2s ease;
  }

  .burst-particle {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    z-index: 10;
    pointer-events: none;
  }
`;

export default InteractiveLogo;
