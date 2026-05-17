import { PIECE, PLAYER, BOARD_SIZE } from './constants'

export function initialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PIECE.EMPTY))
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = PIECE.BLACK
        else if (row > 4) board[row][col] = PIECE.RED
      }
    }
  }
  return board
}

export function isRed(piece) { return piece === PIECE.RED || piece === PIECE.RED_KING }
export function isBlack(piece) { return piece === PIECE.BLACK || piece === PIECE.BLACK_KING }
export function isKing(piece) { return piece === PIECE.RED_KING || piece === PIECE.BLACK_KING }
export function belongsTo(piece, player) {
  return player === PLAYER.RED ? isRed(piece) : isBlack(piece)
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []
  const moves = []
  const dirs = getDirections(piece)
  for (const [dr, dc] of dirs) {
    const nr = row + dr, nc = col + dc
    if (inBounds(nr, nc) && board[nr][nc] === PIECE.EMPTY) {
      moves.push({ from: [row, col], to: [nr, nc], captures: [] })
    }
    // Capture
    const jr = row + dr * 2, jc = col + dc * 2
    if (inBounds(jr, jc) && board[jr][jc] === PIECE.EMPTY) {
      const mid = board[nr]?.[nc]
      if (mid && !belongsTo(mid, isRed(piece) ? PLAYER.RED : PLAYER.BLACK)) {
        moves.push({ from: [row, col], to: [jr, jc], captures: [[nr, nc]] })
      }
    }
  }
  return moves
}

export function getAllMoves(board, player) {
  const all = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (piece && belongsTo(piece, player)) {
        all.push(...getValidMoves(board, r, c))
      }
    }
  }
  // Mandatory capture rule
  const captures = all.filter(m => m.captures.length > 0)
  return captures.length > 0 ? captures : all
}

export function applyMove(board, move) {
  const newBoard = board.map(r => [...r])
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  let piece = newBoard[fr][fc]
  newBoard[fr][fc] = PIECE.EMPTY
  for (const [cr, cc] of move.captures) newBoard[cr][cc] = PIECE.EMPTY
  // Promote
  if (piece === PIECE.RED && tr === 0) piece = PIECE.RED_KING
  if (piece === PIECE.BLACK && tr === BOARD_SIZE - 1) piece = PIECE.BLACK_KING
  newBoard[tr][tc] = piece
  return newBoard
}

export function checkWinner(board) {
  const reds = [], blacks = []
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isRed(board[r][c])) reds.push([r, c])
      if (isBlack(board[r][c])) blacks.push([r, c])
    }
  if (reds.length === 0) return PLAYER.BLACK
  if (blacks.length === 0) return PLAYER.RED
  if (getAllMoves(board, PLAYER.RED).length === 0) return PLAYER.BLACK
  if (getAllMoves(board, PLAYER.BLACK).length === 0) return PLAYER.RED
  return null
}

function getDirections(piece) {
  if (piece === PIECE.RED) return [[-1, -1], [-1, 1]]
  if (piece === PIECE.BLACK) return [[1, -1], [1, 1]]
  return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
}

function inBounds(r, c) { return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE }
