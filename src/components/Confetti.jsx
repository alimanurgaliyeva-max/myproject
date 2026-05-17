import React, { useEffect, useRef } from 'react';

const COLORS = ['#9B6DFF', '#FF6B7A', '#FFB7B2', '#B5EAD7', '#FFDAC1', '#C7CEEA', '#FFD700'];

export default function Confetti({ active }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const particles = [];

    for (let i = 0; i < 120; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      const size = Math.random() * 10 + 6;
      el.style.cssText = `
        width: ${size}px;
        height: ${size * (Math.random() < 0.5 ? 1 : 0.4)}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        left: ${Math.random() * 100}vw;
        border-radius: ${Math.random() < 0.3 ? '50%' : '2px'};
        --drift: ${(Math.random() - 0.5) * 200}px;
        animation-duration: ${Math.random() * 2 + 2}s;
        animation-delay: ${Math.random() * 1}s;
        opacity: 1;
      `;
      container.appendChild(el);
      particles.push(el);
    }

    const cleanup = setTimeout(() => {
      particles.forEach(p => p.remove());
    }, 4000);

    return () => {
      clearTimeout(cleanup);
      particles.forEach(p => p.remove());
    };
  }, [active]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9990]" />;
}
