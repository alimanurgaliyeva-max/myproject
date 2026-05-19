export const PLAYER = { RED: 'red', BLACK: 'black' }
export const PIECE = { EMPTY: null, RED: 'red', BLACK: 'black', RED_KING: 'red-king', BLACK_KING: 'black-king' }
export const DIFFICULTY = { L1: 'l1', L2: 'l2', L3: 'l3', L4: 'l4', L5: 'l5' }
export const GAME_MODE = { AI: 'ai', LOCAL: 'local', DAILY: 'daily', ONLINE: 'online' }
export const GAME_STATUS = { PLAYING: 'playing', OVER: 'over' }
export const BOARD_SIZE = 8
export const TIMER_MODES = { NONE: 'none', BLITZ: 'blitz', RAPID: 'rapid', CLASSICAL: 'classical' }

export const AI_OPPONENTS = {
  [DIFFICULTY.L1]: { name: 'Mira', subtitle: 'Beginner', emoji: '🌸', elo: 800,  xpReward: 30,  description: 'Perfect for learning the basics' },
  [DIFFICULTY.L2]: { name: 'Rashid', subtitle: 'Casual',   emoji: '😊', elo: 1000, xpReward: 50,  description: 'A relaxed, friendly opponent' },
  [DIFFICULTY.L3]: { name: 'Leo',    subtitle: 'Intermediate', emoji: '⚡', elo: 1200, xpReward: 75,  description: 'Sees tactics 3-4 moves ahead' },
  [DIFFICULTY.L4]: { name: 'Nika',   subtitle: 'Advanced',  emoji: '🎯', elo: 1500, xpReward: 100, description: 'Sharp and strategic — a real challenge' },
  [DIFFICULTY.L5]: { name: 'Viktor', subtitle: 'Master',    emoji: '👑', elo: 1800, xpReward: 150, description: 'Near-perfect play. Good luck.' },
}

export const TIMER_SETTINGS = {
  [TIMER_MODES.NONE]:      { label: 'Untimed',    seconds: null },
  [TIMER_MODES.BLITZ]:     { label: 'Blitz 3+2',  seconds: 180 },
  [TIMER_MODES.RAPID]:     { label: 'Rapid 10+5', seconds: 600 },
  [TIMER_MODES.CLASSICAL]: { label: 'Classical',  seconds: 1800 },
}

export const BOARD_THEMES = {
  classic: { name: 'Classic',  light: '#e8d5c4', dark: '#8b6f47' },
  ocean:   { name: 'Ocean',    light: '#b8d4e0', dark: '#2d6e8e' },
  forest:  { name: 'Forest',   light: '#c8ddc8', dark: '#3d7d3d' },
}

export const XP_REWARDS = {
  WIN_AI_L1: 30, WIN_AI_L2: 50, WIN_AI_L3: 75, WIN_AI_L4: 100, WIN_AI_L5: 150,
  WIN_LOCAL: 50,
  LOSS: 10,
  DAILY_EASY: 20, DAILY_MEDIUM: 50, DAILY_HARD: 100,
  PERFECT_MOVE: 5,
}

export const COIN_REWARDS = {
  WIN: 10, DAILY: 15, ACHIEVEMENT: 50, MILESTONE: 100,
}
