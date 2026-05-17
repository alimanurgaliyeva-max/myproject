import React, { createContext, useContext, useReducer, useCallback } from 'react';

const GameContext = createContext(null);

const initialState = {
  mode: null,          // 'classic' | 'blitz' | 'ai' | 'twoPlayer' | 'puzzle'
  aiDifficulty: 'amateur',
  soundEnabled: true,
  theme: 'light',
  skin: 'classic',
  stats: JSON.parse(localStorage.getItem('dama_stats') || '{"wins":0,"losses":0,"draws":0,"bestTime":null,"gamesPlayed":0}'),
  lastGame: null,      // { moves, winner, duration, moveCount }
  easterEggUnlocked: false,
  logoClickCount: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_AI_DIFFICULTY':
      return { ...state, aiDifficulty: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { ...state, theme: newTheme };
    }
    case 'SET_SKIN':
      return { ...state, skin: action.payload };
    case 'RECORD_WIN': {
      const stats = { ...state.stats, wins: state.stats.wins + 1, gamesPlayed: state.stats.gamesPlayed + 1 };
      if (action.payload?.time && (!stats.bestTime || action.payload.time < stats.bestTime)) {
        stats.bestTime = action.payload.time;
      }
      localStorage.setItem('dama_stats', JSON.stringify(stats));
      return { ...state, stats };
    }
    case 'RECORD_LOSS': {
      const stats = { ...state.stats, losses: state.stats.losses + 1, gamesPlayed: state.stats.gamesPlayed + 1 };
      localStorage.setItem('dama_stats', JSON.stringify(stats));
      return { ...state, stats };
    }
    case 'RECORD_DRAW': {
      const stats = { ...state.stats, draws: state.stats.draws + 1, gamesPlayed: state.stats.gamesPlayed + 1 };
      localStorage.setItem('dama_stats', JSON.stringify(stats));
      return { ...state, stats };
    }
    case 'SET_LAST_GAME':
      return { ...state, lastGame: action.payload };
    case 'LOGO_CLICK': {
      const count = state.logoClickCount + 1;
      if (count >= 5) {
        return { ...state, logoClickCount: 0, easterEggUnlocked: true, skin: 'astronaut' };
      }
      return { ...state, logoClickCount: count };
    }
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback((mode) => dispatch({ type: 'SET_MODE', payload: mode }), []);
  const setAIDifficulty = useCallback((d) => dispatch({ type: 'SET_AI_DIFFICULTY', payload: d }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const setSkin = useCallback((s) => dispatch({ type: 'SET_SKIN', payload: s }), []);
  const recordResult = useCallback((result, data) => dispatch({ type: `RECORD_${result.toUpperCase()}`, payload: data }), []);
  const setLastGame = useCallback((data) => dispatch({ type: 'SET_LAST_GAME', payload: data }), []);
  const handleLogoClick = useCallback(() => dispatch({ type: 'LOGO_CLICK' }), []);

  return (
    <GameContext.Provider value={{
      ...state,
      setMode, setAIDifficulty, toggleSound, toggleTheme, setSkin,
      recordResult, setLastGame, handleLogoClick,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
