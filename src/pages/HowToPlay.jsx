import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Доска и фигуры',
    icon: '♟️',
    content: 'Шашки играются на доске 8×8. Каждый игрок начинает с 12 фигурами, расположенными на тёмных клетках в первых трёх рядах.',
    visual: 'board',
  },
  {
    title: 'Ходы',
    icon: '↗️',
    content: 'Обычная шашка ходит только вперёд по диагонали на одну клетку. Она не может ходить назад.',
    visual: 'move',
  },
  {
    title: 'Взятие',
    icon: '💥',
    content: 'Если шашка противника стоит по диагонали, а за ней есть свободная клетка — нужно перепрыгнуть через неё и снять её с доски. Взятие обязательно!',
    visual: 'capture',
  },
  {
    title: 'Дамка',
    icon: '♛',
    content: 'Если шашка достигает последнего ряда противника — она превращается в дамку. Дамка может ходить в любом диагональном направлении.',
    visual: 'king',
  },
  {
    title: 'Победа',
    icon: '🏆',
    content: 'Ты выигрываешь, если у противника не осталось фигур или он не может сделать ни одного хода.',
    visual: 'win',
  },
];

const BoardVisual = ({ type }) => {
  const size = 5;
  const renderBoard = () => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isDark = (r + c) % 2 === 1;
        let content = null;
        let highlight = false;

        if (type === 'board') {
          if (r < 2 && isDark) content = <div className="w-[70%] h-[70%] rounded-full piece-p1" />;
          if (r > 2 && isDark) content = <div className="w-[70%] h-[70%] rounded-full piece-p2" />;
        }
        if (type === 'move') {
          if (r === 3 && c === 2) content = <div className="w-[70%] h-[70%] rounded-full piece-p1" />;
          if ((r === 2 && c === 1) || (r === 2 && c === 3)) highlight = true;
        }
        if (type === 'capture') {
          if (r === 3 && c === 2) content = <div className="w-[70%] h-[70%] rounded-full piece-p1" />;
          if (r === 2 && c === 3) content = <div className="w-[70%] h-[70%] rounded-full piece-p2" />;
          if (r === 1 && c === 4) highlight = true;
        }
        if (type === 'king') {
          if (r === 0 && c === 2) {
            content = (
              <div className="w-[70%] h-[70%] rounded-full piece-p1 flex items-center justify-center text-white text-xs">♛</div>
            );
          }
          if (r === 2 && c === 4) content = <div className="w-[70%] h-[70%] rounded-full piece-p1" />;
          if ((r === 1 && c === 3)) highlight = true;
        }
        if (type === 'win') {
          if (r === 2 && c === 2) content = <div className="w-[70%] h-[70%] rounded-full piece-p1 flex items-center justify-center text-white text-xs">♛</div>;
        }

        cells.push(
          <div
            key={`${r}-${c}`}
            className="flex items-center justify-center aspect-square"
            style={{
              width: `${100 / size}%`,
              background: highlight ? 'rgba(155, 109, 255, 0.4)' : isDark ? '#B5EAD7' : '#FFFFD8',
            }}
          >
            {content}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/40">
      <div className="flex flex-wrap w-full h-full">
        {renderBoard()}
      </div>
    </div>
  );
};

export default function HowToPlay() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <motion.div
      className="min-h-screen pt-28 pb-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold gradient-text mb-2">Как играть</h2>
          <p className="text-purple-600/60">Правила шашек за 5 шагов</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              onClick={() => setStep(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width: step === i ? 32 : 10,
                height: 10,
                background: step === i
                  ? 'linear-gradient(90deg, #9B6DFF, #FF6B7A)'
                  : 'rgba(155, 109, 255, 0.3)',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl">{STEPS[step].icon}</div>
                <BoardVisual type={STEPS[step].visual} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-600/50 mb-2">Шаг {step + 1} из {STEPS.length}</div>
                <h3 className="text-2xl font-bold gradient-text mb-4">{STEPS[step].title}</h3>
                <p className="text-purple-700/70 leading-relaxed">{STEPS[step].content}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className={`btn-secondary ${step === 0 ? 'opacity-30 pointer-events-none' : ''}`}
          >
            ← Назад
          </motion.button>

          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(s => s + 1)}
              className="btn-primary"
            >
              Далее →
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/play')}
              className="btn-primary"
            >
              🎮 Играть!
            </motion.button>
          )}
        </div>

        {/* Quick rules */}
        <div className="mt-10">
          <h3 className="text-xl font-bold gradient-text mb-4 text-center">Краткие правила</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '⚠️', text: 'Взятие обязательно, если оно возможно' },
              { icon: '🔄', text: 'Возможны многократные прыжки за один ход' },
              { icon: '♛', text: 'Дамка ходит в любом диагональном направлении' },
              { icon: '🚫', text: 'Нельзя прыгать через свои фигуры' },
              { icon: '🏁', text: 'Победа: соперник без ходов или фигур' },
              { icon: '🤝', text: 'Ничья по соглашению или при повторении' },
            ].map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-3 flex items-start gap-3"
              >
                <span className="text-xl">{rule.icon}</span>
                <span className="text-sm text-purple-700/70">{rule.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
