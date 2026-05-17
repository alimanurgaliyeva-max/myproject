import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MINI_BOARD_SIZE = 8;
const DEMO_PIECES = [
  { r: 1, c: 0, p: 'b' }, { r: 1, c: 2, p: 'b' }, { r: 1, c: 4, p: 'b' }, { r: 1, c: 6, p: 'b' },
  { r: 2, c: 1, p: 'b' }, { r: 2, c: 3, p: 'b' }, { r: 2, c: 5, p: 'b' }, { r: 2, c: 7, p: 'b' },
  { r: 5, c: 0, p: 'w' }, { r: 5, c: 2, p: 'w' }, { r: 5, c: 4, p: 'w' }, { r: 5, c: 6, p: 'w' },
  { r: 6, c: 1, p: 'w' }, { r: 6, c: 3, p: 'w' }, { r: 6, c: 5, p: 'w' }, { r: 6, c: 7, p: 'w' },
];

const FloatingPiece = ({ delay, x, y, color }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: 40, height: 40, left: `${x}%`, top: `${y}%`,
      background: color === 'b'
        ? 'radial-gradient(circle at 35% 35%, #b892ff, #7B4FE0)'
        : 'radial-gradient(circle at 35% 35%, #ff9ba3, #E84D5E)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      opacity: 0.35,
    }}
    animate={{
      y: [0, -25, 0],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{ duration: 6 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const MiniBoard = () => {
  const [pieces, setPieces] = useState(DEMO_PIECES);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tick % 3 !== 0) return;
    setPieces(prev => {
      const p = [...prev];
      const idx = Math.floor(Math.random() * p.length);
      const piece = p[idx];
      const dir = piece.p === 'b' ? 1 : -1;
      const dc = Math.random() < 0.5 ? -1 : 1;
      const nr = piece.r + dir, nc = piece.c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !p.some(x => x.r === nr && x.c === nc)) {
        const np = [...p];
        np[idx] = { ...piece, r: nr, c: nc };
        return np;
      }
      return p;
    });
  }, [tick]);

  return (
    <div className="w-full h-full opacity-20 pointer-events-none">
      {Array.from({ length: MINI_BOARD_SIZE }, (_, r) => (
        <div key={r} className="flex" style={{ height: '12.5%' }}>
          {Array.from({ length: MINI_BOARD_SIZE }, (_, c) => {
            const isDark = (r + c) % 2 === 1;
            const piece = pieces.find(p => p.r === r && p.c === c);
            return (
              <div
                key={c}
                className="flex-1 flex items-center justify-center"
                style={{ background: isDark ? '#B5EAD7' : '#FFFFD8' }}
              >
                {piece && (
                  <div
                    className="w-[65%] h-[65%] rounded-full"
                    style={{
                      background: piece.p === 'b'
                        ? 'radial-gradient(circle at 35% 35%, #b892ff, #7B4FE0)'
                        : 'radial-gradient(circle at 35% 35%, #ff9ba3, #E84D5E)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  const floaters = [
    { x: 5, y: 15, delay: 0, color: 'b' },
    { x: 88, y: 10, delay: 1.5, color: 'w' },
    { x: 92, y: 70, delay: 0.8, color: 'b' },
    { x: 3, y: 75, delay: 2.2, color: 'w' },
    { x: 50, y: 5, delay: 1.0, color: 'b' },
    { x: 60, y: 88, delay: 2.8, color: 'w' },
  ];

  return (
    <motion.div
      className="min-h-screen pt-24 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Floating decorations */}
      {floaters.map((f, i) => <FloatingPiece key={i} {...f} />)}

      {/* Animated mini board background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-3xl overflow-hidden opacity-30">
          <MiniBoard />
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full piece-p1 flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
            </div>
            <h1 className="font-display text-7xl md:text-8xl font-bold shimmer-text">Dama</h1>
            <div className="w-14 h-14 rounded-full piece-p2 flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-purple-700/70 dark:text-lavender/70 mb-3 font-light"
          >
            elegant checkers experience
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-purple-600/50 mb-12 max-w-lg mx-auto"
          >
            Классическая игра в шашки в новом, красивом исполнении. Играй с друзьями, бросай вызов ИИ, становись чемпионом.
          </motion.p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="mb-16"
        >
          <motion.button
            className="btn-primary text-lg px-12 py-5 text-xl font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/play')}
          >
            🎮 Начать игру
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {[
            { label: 'Игроков онлайн', value: '1,240', icon: '🟢' },
            { label: 'Партий сейчас', value: '328', icon: '♟️' },
            { label: 'Побед сыграно', value: '94,821', icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card px-6 py-4 text-center min-w-[140px]">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-purple-600/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature nav cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pb-16"
        >
          {[
            { icon: '🎮', label: 'Играть', to: '/play', desc: 'Несколько режимов' },
            { icon: '🏆', label: 'Лидерборд', to: '/leaderboard', desc: 'Топ игроков' },
            { icon: '📖', label: 'Как играть', to: '/how-to-play', desc: 'Правила и туториал' },
            { icon: '✨', label: 'Pro', to: '/pro', desc: 'Скины и бонусы' },
          ].map((item) => (
            <motion.div
              key={item.to}
              className="glass-card p-4 text-center group"
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => navigate(item.to)}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="font-semibold text-purple-800/80 text-sm">{item.label}</div>
              <div className="text-xs text-purple-600/50 mt-1">{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
