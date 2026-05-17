import { useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext.jsx';

const createBeep = (ctx, freq, duration, type = 'sine', vol = 0.3) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

export const useSound = () => {
  const { soundEnabled } = useGame();
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }, []);

  const playMove = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    createBeep(ctx, 440, 0.1, 'sine', 0.2);
  }, [soundEnabled, getCtx]);

  const playCapture = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    createBeep(ctx, 300, 0.08, 'square', 0.25);
    setTimeout(() => createBeep(ctx, 200, 0.12, 'square', 0.2), 80);
  }, [soundEnabled, getCtx]);

  const playKing = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => createBeep(ctx, freq, 0.2, 'sine', 0.3), i * 100);
    });
  }, [soundEnabled, getCtx]);

  const playWin = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => createBeep(ctx, freq, 0.3, 'sine', 0.35), i * 150);
    });
  }, [soundEnabled, getCtx]);

  const playLose = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    [440, 349, 262].forEach((freq, i) => {
      setTimeout(() => createBeep(ctx, freq, 0.3, 'sine', 0.25), i * 200);
    });
  }, [soundEnabled, getCtx]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    createBeep(ctx, 600, 0.05, 'sine', 0.15);
  }, [soundEnabled, getCtx]);

  return { playMove, playCapture, playKing, playWin, playLose, playClick };
};
