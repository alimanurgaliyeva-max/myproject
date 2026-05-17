import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';

const getTips = (moveCount, winner, isAI) => {
  const tips = [];
  if (moveCount < 10) tips.push('Постарайся держать контроль центра доски в начале партии.');
  if (moveCount >= 10 && moveCount < 25) tips.push('Хорошее начало! Теперь сосредоточься на создании дамок.');
  if (moveCount >= 25) tips.push('Длинная партия! Старайся торговать фигурами с выгодой для себя.');

  if (isAI && winner === 'b') {
    tips.push('Отличная игра против ИИ! Попробуй следующий уровень сложности.');
  }
  if (isAI && winner !== 'b') {
    tips.push('ИИ использовал угловые позиции. Попробуй захватить углы раньше соперника.');
  }

  tips.push('Взятие нескольких фигур за один ход — ключ к победе в шашках.');
  return tips;
};

const getScore = (moveCount, winner, isAI, difficulty) => {
  let base = 50;
  if (winner === 'b') base += 25;
  if (moveCount > 15) base += 10;
  if (isAI) {
    const bonuses = { novice: 5, amateur: 15, master: 25, legend: 35 };
    base += bonuses[difficulty] || 10;
  }
  return Math.min(100, Math.max(20, base + Math.floor(Math.random() * 10 - 5)));
};

const MOMENTS = [
  { move: 5,  comment: 'Хорошее развитие — ты занял центр!', positive: true },
  { move: 12, comment: 'На этом ходу было выгоднее взять фигуру противника.', positive: false },
  { move: 18, comment: 'Отличная позиция для создания дамки!', positive: true },
  { move: 24, comment: 'Здесь ты упустил двойное взятие.', positive: false },
];

export default function CoachDama() {
  const navigate = useNavigate();
  const { lastGame, mode, aiDifficulty, stats } = useGame();

  const moveCount = lastGame?.moveCount || 20;
  const winner = lastGame?.winner || 'b';
  const isAI = mode === 'ai';
  const duration = lastGame?.duration || 180;

  const score = useMemo(() => getScore(moveCount, winner, isAI, aiDifficulty), [moveCount, winner, isAI, aiDifficulty]);
  const tips = useMemo(() => getTips(moveCount, winner, isAI), [moveCount, winner, isAI]);

  const scoreColor = score >= 75 ? '#00C9A7' : score >= 50 ? '#FFB300' : '#FF6B7A';

  const filtered = MOMENTS.filter(m => m.move <= moveCount);

  return (
    <motion.div
      className="min-h-screen pt-28 pb-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧑‍🏫</div>
          <h2 className="font-display text-4xl font-bold gradient-text mb-2">Coach Dama</h2>
          <p className="text-purple-600/60">Разбор твоей партии</p>
        </div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="glass-card p-8 text-center mb-6"
        >
          <div className="text-sm text-purple-600/60 mb-2">Рейтинг партии</div>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: scoreColor }}>{score}</span>
              <span className="text-xs text-purple-600/50">из 100</span>
            </div>
          </div>
          <p className="text-lg font-semibold gradient-text">
            {score >= 75 ? 'Отличная игра! 🌟' : score >= 50 ? 'Хорошая партия! 👍' : 'Есть куда расти! 💪'}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Ходов', value: moveCount, icon: '♟️' },
            { label: 'Время', value: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`, icon: '⏱️' },
            { label: 'Результат', value: winner === 'b' ? 'Победа' : 'Поражение', icon: winner === 'b' ? '🏆' : '😔' },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-purple-800/80">{s.value}</div>
              <div className="text-xs text-purple-600/50">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Key moments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="font-bold text-lg gradient-text mb-4">Ключевые моменты</h3>
          <div className="space-y-3">
            {filtered.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: m.positive ? 'rgba(0, 201, 167, 0.1)' : 'rgba(255, 107, 122, 0.1)' }}
              >
                <span className="text-xl">{m.positive ? '✅' : '💡'}</span>
                <div>
                  <div className="text-xs text-purple-600/50 mb-1">Ход {m.move}</div>
                  <div className="text-sm text-purple-700/70">{m.comment}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="font-bold text-lg gradient-text mb-4">💡 Советы для улучшения</h3>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-purple-400 mt-0.5">→</span>
                <span className="text-sm text-purple-700/70">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Overall stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="font-bold gradient-text mb-3">Твоя статистика</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold gradient-text">{stats.wins}</div>
              <div className="text-xs text-purple-600/50">Побед</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-500/80">{stats.losses}</div>
              <div className="text-xs text-purple-600/50">Поражений</div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/play')}>
            Выбрать режим
          </button>
          <button className="btn-primary flex-1" onClick={() => navigate('/game')}>
            🔄 Реванш
          </button>
        </div>
      </div>
    </motion.div>
  );
}
