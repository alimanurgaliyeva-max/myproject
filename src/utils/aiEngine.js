import { getAllMovesForPlayer, applyMoveToBoard, checkGameStatus, countPieces, countKings } from './gameRules.js'
import { PLAYER, PIECE_TYPE, GAME_STATUS, AI_DEPTH, AI_DIFFICULTY } from './constants.js'

// Heuristic board evaluation (from BLACK's perspective — AI plays as BLACK)
function evaluateBoard(board) {
  let score = 0

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue

      const isBlack = piece.player === PLAYER.BLACK
      const isKing = piece.type === PIECE_TYPE.KING
      const baseValue = isKing ? 3 : 1
      const sign = isBlack ? 1 : -1

      score += sign * baseValue

      // Positional bonuses
      if (!isKing) {
        // Advancement bonus
        const advancement = isBlack ? (7 - r) : r
        score += sign * advancement * 0.05

        // Center control
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) {
          score += sign * 0.1
        }
      }

      // Edge penalty for normal pieces (harder to get captured near edge)
      if (c === 0 || c === 7) score += sign * 0.05
    }
  }

  return score
}

function minimax(board, depth, alpha, beta, maximizing, currentPlayer) {
  const status = checkGameStatus(board, currentPlayer)
  if (status === GAME_STATUS.BLACK_WINS) return 1000 + depth
  if (status === GAME_STATUS.RED_WINS) return -1000 - depth
  if (status === GAME_STATUS.DRAW) return 0
  if (depth === 0) return evaluateBoard(board)

  const moves = getAllMovesForPlayer(board, currentPlayer)
  const opponent = currentPlayer === PLAYER.BLACK ? PLAYER.RED : PLAYER.BLACK

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move)
      const val = minimax(newBoard, depth - 1, alpha, beta, false, opponent)
      best = Math.max(best, val)
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move)
      const val = minimax(newBoard, depth - 1, alpha, beta, true, opponent)
      best = Math.min(best, val)
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

export function getBestMove(board, difficulty = AI_DIFFICULTY.EASY) {
  const depth = AI_DEPTH[difficulty]
  const moves = getAllMovesForPlayer(board, PLAYER.BLACK)

  if (moves.length === 0) return null

  // Easy: add some randomness
  if (difficulty === AI_DIFFICULTY.EASY && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  let bestScore = -Infinity
  let bestMove = moves[0]

  // Shuffle moves to add variety at equal scores
  const shuffled = [...moves].sort(() => Math.random() - 0.5)

  for (const move of shuffled) {
    const newBoard = applyMoveToBoard(board, move)
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, PLAYER.RED)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
