export const BLACK = 'b';
export const WHITE = 'w';

export const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = { piece: BLACK, isKing: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = { piece: WHITE, isKing: false };
    }
  }
  return board;
};

const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const getMoveDirs = (piece, isKing) => {
  const dirs = [];
  if (piece === BLACK || isKing) dirs.push([1, -1], [1, 1]);
  if (piece === WHITE || isKing) dirs.push([-1, -1], [-1, 1]);
  return dirs;
};

const getCaptureSequences = (board, row, col, visitedKeys = []) => {
  const cell = board[row][col];
  if (!cell) return [];
  const { piece, isKing } = cell;
  const dirs = getMoveDirs(piece, isKing);
  const sequences = [];

  for (const [dr, dc] of dirs) {
    const mr = row + dr, mc = col + dc;
    const er = row + 2 * dr, ec = col + 2 * dc;
    const key = `${mr},${mc}`;

    if (
      inBounds(er, ec) &&
      board[mr][mc]?.piece &&
      board[mr][mc].piece !== piece &&
      !board[er][ec] &&
      !visitedKeys.includes(key)
    ) {
      const tempBoard = board.map(r => r.map(c => c ? { ...c } : null));
      const becomeKing = isKing || (piece === BLACK && er === 7) || (piece === WHITE && er === 0);
      tempBoard[er][ec] = { piece, isKing: becomeKing };
      tempBoard[row][col] = null;
      tempBoard[mr][mc] = null;

      const further = getCaptureSequences(tempBoard, er, ec, [...visitedKeys, key]);

      if (further.length > 0) {
        for (const seq of further) {
          sequences.push({
            path: [[row, col], ...seq.path],
            captured: [[mr, mc], ...seq.captured],
          });
        }
      } else {
        sequences.push({
          path: [[row, col], [er, ec]],
          captured: [[mr, mc]],
        });
      }
    }
  }

  return sequences;
};

export const getAllValidMoves = (board, player) => {
  const captures = [];
  const regulars = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell || cell.piece !== player) continue;

      const seqs = getCaptureSequences(board, r, c);
      for (const seq of seqs) {
        captures.push({
          from: seq.path[0],
          to: seq.path[seq.path.length - 1],
          path: seq.path,
          captured: seq.captured,
        });
      }

      if (captures.length === 0) {
        const { piece, isKing } = cell;
        for (const [dr, dc] of getMoveDirs(piece, isKing)) {
          const nr = r + dr, nc = c + dc;
          if (inBounds(nr, nc) && !board[nr][nc]) {
            regulars.push({ from: [r, c], to: [nr, nc], path: [[r, c], [nr, nc]], captured: [] });
          }
        }
      }
    }
  }

  // Recalculate regulars properly when no captures exist
  if (captures.length > 0) return captures;

  const allRegulars = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell || cell.piece !== player) continue;
      const { piece, isKing } = cell;
      for (const [dr, dc] of getMoveDirs(piece, isKing)) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc) && !board[nr][nc]) {
          allRegulars.push({ from: [r, c], to: [nr, nc], path: [[r, c], [nr, nc]], captured: [] });
        }
      }
    }
  }
  return allRegulars;
};

export const getValidMovesForPiece = (board, player, row, col, allMoves = null) => {
  const moves = allMoves || getAllValidMoves(board, player);
  return moves.filter(m => m.from[0] === row && m.from[1] === col);
};

export const executeMove = (board, move) => {
  const newBoard = board.map(r => r.map(c => c ? { ...c } : null));
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = { ...newBoard[fr][fc] };

  for (const [cr, cc] of (move.captured || [])) {
    newBoard[cr][cc] = null;
  }

  newBoard[fr][fc] = null;
  newBoard[tr][tc] = piece;

  if (piece.piece === BLACK && tr === 7) newBoard[tr][tc].isKing = true;
  if (piece.piece === WHITE && tr === 0) newBoard[tr][tc].isKing = true;

  return newBoard;
};

export const checkWinner = (board, nextPlayer) => {
  let hasPieces = false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.piece === nextPlayer) { hasPieces = true; break; }
    }
    if (hasPieces) break;
  }
  if (!hasPieces) return nextPlayer === BLACK ? WHITE : BLACK;

  const moves = getAllValidMoves(board, nextPlayer);
  if (moves.length === 0) return nextPlayer === BLACK ? WHITE : BLACK;

  return null;
};

export const countPieces = (board) => {
  let b = 0, w = 0, bk = 0, wk = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      if (cell.piece === BLACK) { b++; if (cell.isKing) bk++; }
      else if (cell.piece === WHITE) { w++; if (cell.isKing) wk++; }
    }
  }
  return { black: b, white: w, blackKings: bk, whiteKings: wk };
};

export const moveToNotation = (move, moveNumber) => {
  const cols = 'abcdefgh';
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const from = `${cols[fc]}${8 - fr}`;
  const to = `${cols[tc]}${8 - tr}`;
  const sep = move.captured?.length > 0 ? 'x' : '-';
  return `${moveNumber}. ${from}${sep}${to}`;
};
