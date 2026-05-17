import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_PLAYERS = [
  { rank: 1,  name: 'Айгерим К.', city: 'Алматы',  rating: 2847, wins: 342, avatar: '👑', color: '#FFD700' },
  { rank: 2,  name: 'Нурлан А.',  city: 'Астана',   rating: 2791, wins: 289, avatar: '🎖️', color: '#C0C0C0' },
  { rank: 3,  name: 'Дина Х.',    city: 'Шымкент',  rating: 2734, wins: 261, avatar: '🥉', color: '#CD7F32' },
  { rank: 4,  name: 'Асель М.',   city: 'Алматы',   rating: 2698, wins: 243, avatar: '🦁', color: '#9B6DFF' },
  { rank: 5,  name: 'Ержан С.',   city: 'Астана',   rating: 2651, wins: 228, avatar: '🐯', color: '#FF6B7A' },
  { rank: 6,  name: 'Камила П.',  city: 'Алматы',   rating: 2612, wins: 215, avatar: '🌟', color: '#00C9A7' },
  { rank: 7,  name: 'Тимур Б.',   city: 'Шымкент',  rating: 2574, wins: 201, avatar: '🦊', color: '#FFB300' },
  { rank: 8,  name: 'Зарина Е.',  city: 'Астана',   rating: 2531, wins: 188, avatar: '🐺', color: '#9B6DFF' },
  { rank: 9,  name: 'Арман Н.',   city: 'Алматы',   rating: 2489, wins: 176, avatar: '🐉', color: '#FF6B7A' },
  { rank: 10, name: 'Гульнара О.',city: 'Шымкент',  rating: 2445, wins: 164, avatar: '🌺', color: '#C7CEEA' },
  { rank: 11, name: 'Рустем Д.',  city: 'Алматы',   rating: 2401, wins: 152, avatar: '⚡', color: '#FFB300' },
  { rank: 12, name: 'Маргарита В.',city: 'Астана',  rating: 2358, wins: 141, avatar: '🔮', color: '#00C9A7' },
];

const CITIES = ['Все', 'Алматы', 'Астана', 'Шымкент'];

export default function Leaderboard() {
  const [city, setCity] = useState('Все');

  const filtered = city === 'Все' ? ALL_PLAYERS : ALL_PLAYERS.filter(p => p.city === city);

  return (
    <motion.div
      className="min-h-screen pt-28 pb-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-4xl font-bold gradient-text mb-2">Лидерборд</h2>
          <p className="text-purple-600/60">Лучшие игроки платформы</p>
        </div>

        {/* City filter */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {CITIES.map(c => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCity(c)}
              className="px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200"
              style={{
                background: city === c ? 'linear-gradient(135deg, #9B6DFF, #FF6B7A)' : 'rgba(255,255,255,0.25)',
                color: city === c ? '#fff' : '#6B4FA0',
                backdropFilter: 'blur(10px)',
                border: city === c ? 'none' : '1px solid rgba(255,255,255,0.4)',
              }}
            >
              {c}
            </motion.button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className="flex justify-center items-end gap-3 mb-8">
          {filtered.slice(0, 3).map((p, i) => {
            const heights = [140, 170, 120];
            const order = [1, 0, 2];
            const player = filtered[order[i]];
            return (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center glass-card p-4 w-28"
                style={{ height: heights[i] }}
              >
                <div className="text-3xl">{player.avatar}</div>
                <div className="font-bold text-xs mt-2 text-center gradient-text">{player.name.split(' ')[0]}</div>
                <div className="text-xl font-bold mt-auto" style={{ color: player.color }}>
                  #{order[i] + 1}
                </div>
                <div className="text-xs opacity-60">{player.rating}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="glass-card overflow-hidden">
          <AnimatePresence>
            {filtered.map((player, i) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 border-b border-white/20 last:border-0 hover:bg-white/10 transition-colors duration-150"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{
                    background: i < 3 ? `${player.color}30` : 'rgba(255,255,255,0.15)',
                    color: i < 3 ? player.color : '#6B4FA0',
                  }}
                >
                  {i + 1}
                </div>

                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: `${player.color}20`, border: `2px solid ${player.color}40` }}
                >
                  {player.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-purple-900/80 truncate">{player.name}</div>
                  <div className="text-xs text-purple-600/50">{player.city}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm" style={{ color: player.color }}>{player.rating}</div>
                  <div className="text-xs text-purple-600/50">{player.wins} побед</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* User position placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 mt-4 flex items-center gap-4"
          style={{ border: '2px solid rgba(155, 109, 255, 0.4)' }}
        >
          <div className="w-8 h-8 rounded-xl glass flex items-center justify-center text-xs font-bold text-purple-600">?</div>
          <div className="w-10 h-10 rounded-full piece-p1 flex items-center justify-center">
            <span className="text-white text-sm">Ты</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm gradient-text">Твоя позиция</div>
            <div className="text-xs text-purple-600/50">Сыграй больше игр!</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm text-purple-600/60">—</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
