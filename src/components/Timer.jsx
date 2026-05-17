import React from 'react';
import { motion } from 'framer-motion';

export default function Timer({ seconds, maxSeconds, label, urgent }) {
  const pct = maxSeconds > 0 ? seconds / maxSeconds : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const color = urgent ? '#FF6B7A' : pct > 0.5 ? '#9B6DFF' : '#FFB300';

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs font-medium opacity-60">{label}</span>}
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="timer-ring"
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color, textShadow: `0 0 8px ${color}40` }}
          >
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
