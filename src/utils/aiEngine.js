import { getAllMoves, applyMove, checkWinner, isRed, isBlack, isKing } from './gameRules'
import { PLAYER, DIFFICULTY, BOARD_SIZE } from './constants'

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

function evaluate(board) {
  let score = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue
      const center = CENTER_BONUS[r][c] * 0.15
      const king = isKing(p) ? 3 : 1
      const advance = isRed(p) ? (7 - r) * 0.08 : r * 0.08
      const val = king + center + advance
      if (isRed(p)) score -= val
      else score += val
    }
  }
  return score
}

// Captures first: dramatically improves alpha-beta pruning efficiency
function orderMoves(moves) {
  return moves.slice().sort((a, b) => b.captures.length - a.captures.length)
}

function minimax(board, depth, alpha, beta, maximizing) {
  const winner = checkWinner(board)
  if (winner === PLAYER.BLACK) return 1000 + depth
  if (winner === PLAYER.RED)   return -1000 - depth
  if (depth === 0) return evaluate(board)

  const player = maximizing ? PLAYER.BLACK : PLAYER.RED
  const moves = orderMoves(getAllMoves(board, player))
  if (moves.length === 0) return maximizing ? -1000 : 1000

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, false)
      if (val > best) best = val
      if (val > alpha) alpha = val
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, true)
      if (val < best) best = val
      if (val < beta) beta = val
      if (beta <= alpha) break
    }
    return best
  }
}

// L1: Always random — makes obvious blunders
// L2: 60% random, depth 1 for rest — very weak
// L3: 10% random, depth 2 — sees simple tactics
// L4: Full depth 4 — sees 2-move combinations
// L5: Full depth 6 — strong strategic play

const DEPTH_MAP = {
  [DIFFICULTY.L1]: 0,
  [DIFFICULTY.L2]: 1,
  [DIFFICULTY.L3]: 2,
  [DIFFICULTY.L4]: 4,
  [DIFFICULTY.L5]: 6,
}

const RANDOM_RATE = {
  [DIFFICULTY.L1]: 1.0,
  [DIFFICULTY.L2]: 0.6,
  [DIFFICULTY.L3]: 0.1,
  [DIFFICULTY.L4]: 0.0,
  [DIFFICULTY.L5]: 0.0,
}

export function getBestMove(board, difficulty) {
  const moves = getAllMoves(board, PLAYER.BLACK)
  if (moves.length === 0) return null

  if (Math.random() < (RANDOM_RATE[difficulty] ?? 0)) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  const depth = DEPTH_MAP[difficulty] ?? 2
  if (depth === 0) return moves[Math.floor(Math.random() * moves.length)]

  const ordered = orderMoves(moves)
  let bestMove = ordered[0]
  let bestVal = -Infinity

  for (const move of ordered) {
    const val = minimax(applyMove(board, move), depth - 1, -Infinity, Infinity, false)
    if (val > bestVal) { bestVal = val; bestMove = move }
  }
  return bestMove
}

// Coach uses depth 2 to stay fast
export function getRankedMoves(board, player) {
  const moves = getAllMoves(board, player)
  if (moves.length === 0) return []
  const maximizing = player === PLAYER.BLACK
  return orderMoves(moves)
    .map(m => ({ move: m, score: minimax(applyMove(board, m), 2, -Infinity, Infinity, !maximizing) }))
    .sort((a, b) => maximizing ? b.score - a.score : a.score - b.score)
}
