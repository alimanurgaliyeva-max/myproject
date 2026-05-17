import { getAllValidMoves, executeMove, countPieces, BLACK, WHITE } from './gameLogic.js';

const CENTER_WEIGHT = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 2, 1, 0],
  [0, 1, 2, 3, 3, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const evaluate = (board, player) => {
  const opponent = player === BLACK ? WHITE : BLACK;
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell) continue;

      const posBonus = CENTER_WEIGHT[r][c] * 0.1;
      const kingVal = cell.isKing ? 2.5 : 1;

      if (cell.piece === player) {
        score += kingVal + posBonus;
        // Back row protection bonus
        if (!cell.isKing) {
          if (player === BLACK && r === 0) score += 0.3;
          if (player === WHITE && r === 7) score += 0.3;
        }
      } else if (cell.piece === opponent) {
        score -= kingVal + posBonus;
      }
    }
  }

  return score;
};

const minimax = (board, depth, alpha, beta, maximizing, player) => {
  const currentPlayer = maximizing ? player : (player === BLACK ? WHITE : BLACK);
  const moves = getAllValidMoves(board, currentPlayer);

  if (depth === 0 || moves.length === 0) {
    return { score: evaluate(board, player), move: null };
  }

  let best = maximizing ? -Infinity : Infinity;
  let bestMove = moves[0];

  // Shuffle moves slightly for variety at same evaluation
  const shuffled = [...moves].sort(() => Math.random() * 0.2 - 0.1);

  for (const move of shuffled) {
    const newBoard = executeMove(board, move);
    const { score } = minimax(newBoard, depth - 1, alpha, beta, !maximizing, player);

    if (maximizing) {
      if (score > best) { best = score; bestMove = move; }
      alpha = Math.max(alpha, score);
    } else {
      if (score < best) { best = score; bestMove = move; }
      beta = Math.min(beta, score);
    }

    if (beta <= alpha) break;
  }

  return { score: best, move: bestMove };
};

export const DIFFICULTY = {
  novice: { depth: 1, randomness: 0.5 },
  amateur: { depth: 2, randomness: 0.2 },
  master: { depth: 4, randomness: 0.05 },
  legend: { depth: 6, randomness: 0 },
};

export const getAIMove = (board, player, difficulty = 'amateur') => {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.amateur;
  const moves = getAllValidMoves(board, player);
  if (moves.length === 0) return null;

  // Random move for easy difficulties
  if (Math.random() < config.randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const { move } = minimax(board, config.depth, -Infinity, Infinity, true, player);
  return move || moves[0];
};
