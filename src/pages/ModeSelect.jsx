import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';

const MODES = [
  {
    id: 'classic',
    icon: '🎮',
    title: 'Классика',
    desc: 'Стандартные шашки по классическим правилам. Без ограничений по времени.',
    color: '#9B6DFF',
    bg: 'rgba(155, 109, 255, 0.12)',
  },
  {
    id: 'blitz',
    icon: '⚡',
    title: 'Блиц',
    desc: '1 минута на всю партию. Думай быстро, действуй решительно!',
    color: '#FF9B00',
    bg: 'rgba(255, 155, 0, 0.12)',
  },
  {
    id: 'ai',
    icon: '🧠',
    title: 'Против ИИ',
    desc: 'Испытай себя против умного компьютерного соперника. Выбери уровень сложности.',
    color: '#FF6B7A',
    bg: 'rgba(255, 107, 122, 0.12)',
  },
  {
    id: 'twoPlayer',
    icon: '👥',
    title: 'Два игрока',
    desc: 'Играй с другом на одном устройстве. Лицом к лицу!',
    color: '#00C9A7',
    bg: 'rgba(0, 201, 167, 0.12)',
  },
  {
    id: 'puzzle',
    icon: '🎯',
    title: 'Задачи',
    desc: 'Реши шашечную головоломку. Найди лучший ход!',
    color: '#C7CEEA',
    bg: 'rgba(199, 206, 234, 0.2)',
  },
];

const DIFFICULTIES = [
  { id: 'novice', label: 'Новичок', emoji: '🌱', desc: 'Для тех, кто только учится' },
  { id: 'amateur', label: 'Любитель', emoji: '⚔️', desc: 'Средний уровень' },
  { id: 'master', label: 'Мастер', emoji: '🎩', desc: 'Для опытных игроков' },
  { id: 'legend', label: 'Легенда', emoji: '🔥', desc: 'Максимальная сложность' },
];

export default function ModeSelect() {
  const navigate = useNavigate();
  const { setMode, aiDifficulty, setAIDifficulty } = useGame();
  const [hoveredMode, setHoveredMode] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  const handleSelect = (mode) => {
    if (mode.id === 'ai') {
      setSelectedMode(mode);
      return;
    }
    setMode(mode.id);
    navigate('/game');
  };

  const handleStartAI = () => {
    setMode('ai');
    navigate('/game');
  };

  return (
    <motion.div
      className="min-h-screen pt-28 pb-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold gradient-text mb-3">Выбери режим</h2>
          <p className="text-purple-600/60">Каждый режим — уникальный опыт</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6 relative overflow-hidden group"
              style={{
                border: hoveredMode === mode.id ? `2px solid ${mode.color}` : '2px solid rgba(255,255,255,0.4)',
                background: hoveredMode === mode.id ? mode.bg : 'rgba(255,255,255,0.25)',
              }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              onClick={() => handleSelect(mode)}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: hoveredMode === mode.id ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {mode.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-2" style={{ color: mode.color }}>{mode.title}</h3>
              <p className="text-sm text-purple-700/60 leading-relaxed">{mode.desc}</p>

              <motion.div
                className="absolute bottom-4 right-4 text-lg opacity-0 group-hover:opacity-100"
                animate={{ x: hoveredMode === mode.id ? 0 : 10 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.div>

              {/* Glow effect */}
              <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${mode.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* AI Difficulty modal */}
        {selectedMode?.id === 'ai' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold gradient-text mb-6 text-center">Выбери сложность ИИ</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {DIFFICULTIES.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-2xl text-center transition-all duration-200"
                  style={{
                    background: aiDifficulty === d.id ? 'rgba(155, 109, 255, 0.2)' : 'rgba(255,255,255,0.2)',
                    border: aiDifficulty === d.id ? '2px solid #9B6DFF' : '2px solid rgba(255,255,255,0.3)',
                  }}
                  onClick={() => setAIDifficulty(d.id)}
                >
                  <div className="text-3xl mb-2">{d.emoji}</div>
                  <div className="font-bold text-purple-800/80">{d.label}</div>
                  <div className="text-xs text-purple-600/50 mt-1">{d.desc}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setSelectedMode(null)}
              >
                Назад
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleStartAI}
              >
                Играть
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
