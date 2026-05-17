import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoveHistory({ moves }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moves]);

  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, p1: moves[i], p2: moves[i + 1] });
  }

  return (
    <div className="glass rounded-2xl p-4 h-full flex flex-col gap-2">
      <h3 className="text-sm font-semibold gradient-text mb-2">История ходов</h3>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 text-xs">
        <AnimatePresence>
          {pairs.map((pair) => (
            <motion.div
              key={pair.num}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="w-6 text-right opacity-40 font-mono">{pair.num}.</span>
              <span
                className="px-2 py-0.5 rounded-lg font-mono"
                style={{ background: 'rgba(155, 109, 255, 0.15)', color: '#7B4FE0' }}
              >
                {pair.p1}
              </span>
              {pair.p2 && (
                <span
                  className="px-2 py-0.5 rounded-lg font-mono"
                  style={{ background: 'rgba(255, 107, 122, 0.15)', color: '#C0334A' }}
                >
                  {pair.p2}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      {moves.length === 0 && (
        <p className="text-xs opacity-40 text-center">Игра не начата</p>
      )}
    </div>
  );
}
