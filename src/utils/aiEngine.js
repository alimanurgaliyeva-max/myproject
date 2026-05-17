import { getAllMoves, applyMove, checkWinner, isRed, isBlack, isKing } from './gameRules'
import { PLAYER, DIFFICULTY, BOARD_SIZE } from './constants'

// Positional bonus: center control
const CENTER_BONUS = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,2,2,2,2,1,0],
  [0,1,2,3,3,2,1,0],
  [0,1,2,3,3,2,1,0],
  [0,1,2,2,2,2,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0],
]

function evaluate(board, depth) {
  let score = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue
      const center = CENTER_BONUS[r][c] * 0.1
      const kingBonus = isKing(p) ? 3 : 1
      const advancement = isRed(p) ? (7 - r) * 0.05 : r * 0.05
      const val = kingBonus + center + advancement
      if (isRed(p)) score -= val
      else score += val
    }
  }
  return score
}

function minimax(board, depth, alpha, beta, maximizing) {
  const winner = checkWinner(board)
  if (winner === PLAYER.BLACK) return 1000 + depth
  if (winner === PLAYER.RED)   return -1000 - depth
  if (depth === 0) return evaluate(board, depth)

  const player = maximizing ? PLAYER.BLACK : PLAYER.RED
  const moves = getAllMoves(board, player)
  if (moves.length === 0) return maximizing ? -1000 : 1000

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, false)
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, true)
      best = Math.min(best, val)
      beta = Math.min(beta, val)
      if (beta <= alpha) break
    }
    return best
  }
}

const DEPTH_MAP = {
  [DIFFICULTY.L1]: 1,
  [DIFFICULTY.L2]: 2,
  [DIFFICULTY.L3]: 4,
  [DIFFICULTY.L4]: 6,
  [DIFFICULTY.L5]: 8,
}

const RANDOM_RATE = {
  [DIFFICULTY.L1]: 0.5,
  [DIFFICULTY.L2]: 0.2,
  [DIFFICULTY.L3]: 0.05,
  [DIFFICULTY.L4]: 0,
  [DIFFICULTY.L5]: 0,
}

export function getBestMove(board, difficulty) {
  const moves = getAllMoves(board, PLAYER.BLACK)
  if (moves.length === 0) return null

  // Lower levels make random moves sometimes
  if (Math.random() < (RANDOM_RATE[difficulty] ?? 0)) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = DEPTH_MAP[difficulty] ?? 4
  let bestMove = null
  let bestVal = -Infinity

  // Shuffle moves slightly for variety at lower depths
  const shuffled = [...moves].sort(() => (depth <= 2 ? Math.random() - 0.5 : 0))

  for (const move of shuffled) {
    const val = minimax(applyMove(board, move), depth - 1, -Infinity, Infinity, false)
    if (val > bestVal) { bestVal = val; bestMove = move }
  }
  return bestMove
}

// Used by coach: returns all moves ranked by strength for the given player
export function getRankedMoves(board, player) {
  const moves = getAllMoves(board, player)
  if (moves.length === 0) return []
  const maximizing = player === PLAYER.BLACK
  return moves
    .map(m => ({ move: m, score: minimax(applyMove(board, m), 3, -Infinity, Infinity, !maximizing) }))
    .sort((a, b) => maximizing ? b.score - a.score : a.score - b.score)
}
