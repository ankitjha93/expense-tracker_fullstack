import React from 'react';
import styled, { keyframes } from 'styled-components';

const floatA = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(80px, 50px) scale(1.1); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const floatB = keyframes`
  0% { transform: translate(0px, 0px) scale(1.1); }
  50% { transform: translate(-60px, -40px) scale(0.95); }
  100% { transform: translate(0px, 0px) scale(1.1); }
`;

function Orb() {
  return (
    <AmbientContainer>
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>
      <div className="glow-sphere sphere-3"></div>
    </AmbientContainer>
  );
}

const AmbientContainer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;

  .glow-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.45;
  }

  .sphere-1 {
    width: 600px;
    height: 600px;
    top: -150px;
    left: -150px;
    background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
    animation: ${floatA} 18s ease-in-out infinite;
  }

  .sphere-2 {
    width: 550px;
    height: 550px;
    bottom: -150px;
    right: 5%;
    background: radial-gradient(circle, #10b981 0%, rgba(16, 185, 129, 0) 70%);
    opacity: 0.35;
    animation: ${floatB} 22s ease-in-out infinite;
  }

  .sphere-3 {
    width: 450px;
    height: 450px;
    top: 40%;
    left: 45%;
    background: radial-gradient(circle, #06b6d4 0%, rgba(6, 182, 212, 0) 70%);
    opacity: 0.25;
    animation: ${floatA} 25s ease-in-out reverse infinite;
  }
`;

export default Orb;