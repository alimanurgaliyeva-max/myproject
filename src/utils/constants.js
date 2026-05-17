export const BOARD_SIZE = 8

export const PLAYER = {
  RED: 'red',
  BLACK: 'black',
}

export const PIECE_TYPE = {
  NORMAL: 'normal',
  KING: 'king',
}

export const GAME_STATUS = {
  PLAYING: 'playing',
  RED_WINS: 'red_wins',
  BLACK_WINS: 'black_wins',
  DRAW: 'draw',
}

export const AI_DIFFICULTY = {
  EASY: 'easy',
  HARD: 'hard',
}

export const AI_DEPTH = {
  [AI_DIFFICULTY.EASY]: 3,
  [AI_DIFFICULTY.HARD]: 6,
}

export const MAX_HISTORY = 10

// Board square colors
export const SQUARE_DARK = 'dark'
export const SQUARE_LIGHT = 'light'

// Initial board positions: red pieces on rows 0-2, black on rows 5-7
// Only on dark squares (row+col is odd)
export function getInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { player: PLAYER.RED, type: PIECE_TYPE.NORMAL }
        } else if (row > 4) {
          board[row][col] = { player: PLAYER.BLACK, type: PIECE_TYPE.NORMAL }
        }
      }
    }
  }

  return board
}
