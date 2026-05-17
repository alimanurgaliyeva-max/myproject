import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';

const SKINS = [
  {
    id: 'classic',
    name: 'Классика',
    emoji: '♟️',
    desc: 'Элегантные пастельные шашки',
    p1Color: 'radial-gradient(circle at 35% 35%, #b892ff, #7B4FE0)',
    p2Color: 'radial-gradient(circle at 35% 35%, #ff9ba3, #E84D5E)',
    free: true,
  },
  {
    id: 'astronaut',
    name: 'Астронавты',
    emoji: '🚀',
    desc: 'Покори вселенную шашек',
    pieces: ['🚀', '👾'],
    free: false,
  },
  {
    id: 'animal',
    name: 'Животные',
    emoji: '🐱',
    desc: 'Милые зверята на доске',
    pieces: ['🐱', '🐶'],
    free: false,
  },
  {
    id: 'crystal',
    name: 'Кристаллы',
    emoji: '💎',
    desc: 'Магические кристаллы силы',
    pieces: ['💎', '🔮'],
    free: false,
  },
];

const FEATURES = [
  { label: 'Классический режим', free: true },
  { label: 'Блиц режим', free: true },
  { label: 'ИИ Новичок', free: true },
  { label: 'Два игрока', free: true },
  { label: 'ИИ Мастер & Легенда', free: false },
  { label: 'Кастомные скины (3+)', free: false },
  { label: 'Coach Dama анализ', free: false },
  { label: 'Задачи (все 50+)', free: false },
  { label: 'Без рекламы', free: false },
  { label: 'Профиль игрока', free: false },
];

export default function ProPage() {
  const [hoveredSkin, setHoveredSkin] = useState(null);
  const { setSkin, skin } = useGame();

  return (
    <motion.div
      className="min-h-screen pt-28 pb-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-5xl mb-4"
          >
            ✨
          </motion.div>
          <h2 className="font-display text-4xl font-bold gradient-text mb-3">Dama Pro</h2>
          <p className="text-purple-600/60 max-w-md mx-auto">
            Открой весь потенциал игры. Премиум опыт для настоящих игроков.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8"
          >
            <h3 className="text-xl font-bold text-purple-700/80 mb-1">Free</h3>
            <div className="text-4xl font-bold gradient-text mb-6">0₸</div>
            <ul className="space-y-3 mb-8">
              {FEATURES.map(f => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <span className={f.free ? 'text-green-500' : 'text-purple-300/40'}>
                    {f.free ? '✓' : '✗'}
                  </span>
                  <span className={f.free ? 'text-purple-800/70' : 'text-purple-600/30'}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="btn-secondary text-center py-3 rounded-2xl text-sm font-medium">
              Текущий план
            </div>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative glass-card p-8 overflow-hidden"
            style={{ border: '2px solid rgba(155, 109, 255, 0.5)' }}
          >
            <div
              className="absolute -top-1 -right-1 px-3 py-1 rounded-bl-2xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #9B6DFF, #FF6B7A)' }}
            >
              Популярный
            </div>

            <h3 className="text-xl font-bold gradient-text mb-1">Pro</h3>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold gradient-text">990₸</span>
              <span className="text-purple-600/50 text-sm mb-1">/месяц</span>
            </div>
            <div className="text-xs text-purple-600/40 mb-6">или 7 900₸/год (экономия 35%)</div>

            <ul className="space-y-3 mb-8">
              {FEATURES.map(f => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-purple-800/70">{f.label}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full text-sm py-3"
            >
              Получить Pro
            </motion.button>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {['💳', '🏦', '📱'].map((icon, i) => (
                <div key={i} className="glass rounded-lg px-3 py-1.5 text-lg">{icon}</div>
              ))}
            </div>
            <p className="text-xs text-center text-purple-600/40 mt-2">Visa · Mastercard · Apple Pay</p>
          </motion.div>
        </div>

        {/* Skins preview */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold gradient-text text-center mb-6">Скины фигур</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SKINS.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.04, y: -4 }}
                className="glass-card p-5 text-center relative overflow-hidden"
                style={{
                  border: skin === s.id ? '2px solid #9B6DFF' : '2px solid rgba(255,255,255,0.4)',
                }}
                onHoverStart={() => setHoveredSkin(s.id)}
                onHoverEnd={() => setHoveredSkin(null)}
                onClick={() => s.free && setSkin(s.id)}
              >
                {!s.free && (
                  <div className="absolute top-2 right-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                    Pro
                  </div>
                )}

                <div className="text-3xl mb-3">{s.emoji}</div>

                {/* Preview pieces */}
                <div className="flex justify-center gap-2 mb-3">
                  {s.pieces ? (
                    <>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(155,109,255,0.2)' }}>
                        {s.pieces[0]}
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(255,107,122,0.2)' }}>
                        {s.pieces[1]}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full" style={{ background: s.p1Color }} />
                      <div className="w-8 h-8 rounded-full" style={{ background: s.p2Color }} />
                    </>
                  )}
                </div>

                <div className="font-semibold text-sm text-purple-800/80">{s.name}</div>
                <div className="text-xs text-purple-600/50 mt-1">{s.desc}</div>

                {s.free && skin !== s.id && (
                  <div className="text-xs text-green-500 mt-2">Бесплатно</div>
                )}
                {skin === s.id && (
                  <div className="text-xs gradient-text mt-2 font-bold">Активен ✓</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
