import { getAllMoves, applyMove, checkWinner, isRed, isBlack, isKing } from './gameRules'
import { PLAYER, DIFFICULTY, BOARD_SIZE } from './constants'

function evaluate(board) {
  let score = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue
      if (isRed(p)) { score -= isKing(p) ? 3 : 1 }
      else { score += isKing(p) ? 3 : 1 }
    }
  }
  return score
}

function minimax(board, depth, alpha, beta, maximizing) {
  const winner = checkWinner(board)
  if (winner === PLAYER.BLACK) return 1000
  if (winner === PLAYER.RED) return -1000
  if (depth === 0) return evaluate(board)

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

export function getBestMove(board, difficulty) {
  const depth = difficulty === DIFFICULTY.EASY ? 1 : difficulty === DIFFICULTY.MEDIUM ? 3 : 5
  const moves = getAllMoves(board, PLAYER.BLACK)
  if (moves.length === 0) return null

  if (difficulty === DIFFICULTY.EASY && Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  let bestMove = null
  let bestVal = -Infinity
  for (const move of moves) {
    const val = minimax(applyMove(board, move), depth - 1, -Infinity, Infinity, false)
    if (val > bestVal) { bestVal = val; bestMove = move }
  }
  return bestMove
}
