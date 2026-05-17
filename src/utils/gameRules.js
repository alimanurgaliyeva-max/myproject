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

const ALL_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

function inBounds(r, c) { return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE }

function getFwdDirs(piece) {
  if (piece === PIECE.RED)   return [[-1, -1], [-1, 1]]
  if (piece === PIECE.BLACK) return [[1, -1], [1, 1]]
  return ALL_DIRS
}

function getOwner(piece) {
  return isRed(piece) ? PLAYER.RED : PLAYER.BLACK
}

// Apply a move temporarily to a board (for chain capture look-ahead)
function tempApply(board, fromR, fromC, toR, toC, captured) {
  const b = board.map(r => [...r])
  const piece = b[fromR][fromC]
  b[fromR][fromC] = PIECE.EMPTY
  for (const [cr, cc] of captured) b[cr][cc] = PIECE.EMPTY
  b[toR][toC] = piece
  return b
}

// Recursively find all capture chains from (row, col).
// capturedSoFar: squares already captured in this chain (prevent re-capture).
// startRow/startCol: original piece position (all results share the same 'from').
function findChains(board, row, col, piece, capturedSoFar, startRow, startCol) {
  const owner = getOwner(piece)
  const result = []

  if (isKing(piece)) {
    // Flying king: slides along each diagonal until blocked
    for (const [dr, dc] of ALL_DIRS) {
      let opponentPos = null
      for (let dist = 1; dist < BOARD_SIZE; dist++) {
        const r = row + dr * dist
        const c = col + dc * dist
        if (!inBounds(r, c)) break
        const cell = board[r][c]

        if (opponentPos === null) {
          // Sliding toward an opponent
          if (cell === PIECE.EMPTY) continue
          if (belongsTo(cell, owner)) break  // own piece blocks
          if (capturedSoFar.some(([cr, cc]) => cr === r && cc === c)) break  // already captured
          opponentPos = [r, c]
        } else {
          // Past the opponent — landing squares
          if (cell !== PIECE.EMPTY) break  // blocked beyond opponent
          const newCaptured = [...capturedSoFar, opponentPos]
          const tmp = tempApply(board, row, col, r, c, [opponentPos])
          const chains = findChains(tmp, r, c, piece, newCaptured, startRow, startCol)
          if (chains.length === 0) {
            result.push({ from: [startRow, startCol], to: [r, c], captures: newCaptured })
          } else {
            result.push(...chains)
          }
        }
      }
    }
  } else {
    // Regular piece: captures in all 4 directions (international Dama rules)
    for (const [dr, dc] of ALL_DIRS) {
      const mr = row + dr,   mc = col + dc    // middle (opponent) square
      const lr = row + dr*2, lc = col + dc*2  // landing square
      if (!inBounds(lr, lc)) continue
      const mid = board[mr]?.[mc]
      if (!mid || mid === PIECE.EMPTY) continue
      if (belongsTo(mid, owner)) continue
      if (capturedSoFar.some(([cr, cc]) => cr === mr && cc === mc)) continue
      if (board[lr][lc] !== PIECE.EMPTY) continue

      const newCaptured = [...capturedSoFar, [mr, mc]]
      const tmp = tempApply(board, row, col, lr, lc, [[mr, mc]])
      const chains = findChains(tmp, lr, lc, piece, newCaptured, startRow, startCol)
      if (chains.length === 0) {
        result.push({ from: [startRow, startCol], to: [lr, lc], captures: newCaptured })
      } else {
        result.push(...chains)
      }
    }
  }
  return result
}

// All valid moves for a single piece (captures take priority)
export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  // Captures first (mandatory)
  const captures = findChains(board, row, col, piece, [], row, col)
  if (captures.length > 0) return captures

  // No captures — regular moves
  const moves = []
  if (isKing(piece)) {
    // Flying king: any distance along forward/backward diagonals
    for (const [dr, dc] of ALL_DIRS) {
      for (let dist = 1; dist < BOARD_SIZE; dist++) {
        const nr = row + dr * dist, nc = col + dc * dist
        if (!inBounds(nr, nc) || board[nr][nc] !== PIECE.EMPTY) break
        moves.push({ from: [row, col], to: [nr, nc], captures: [] })
      }
    }
  } else {
    // Regular piece: one square forward
    for (const [dr, dc] of getFwdDirs(piece)) {
      const nr = row + dr, nc = col + dc
      if (inBounds(nr, nc) && board[nr][nc] === PIECE.EMPTY) {
        moves.push({ from: [row, col], to: [nr, nc], captures: [] })
      }
    }
  }
  return moves
}

// All moves for a player (mandatory capture enforced across all pieces)
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
  if (piece === PIECE.RED   && tr === 0)              piece = PIECE.RED_KING
  if (piece === PIECE.BLACK && tr === BOARD_SIZE - 1) piece = PIECE.BLACK_KING
  newBoard[tr][tc] = piece
  return newBoard
}

export function checkWinner(board) {
  let reds = 0, blacks = 0
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isRed(board[r][c]))   reds++
      if (isBlack(board[r][c])) blacks++
    }
  if (reds   === 0) return PLAYER.BLACK
  if (blacks  === 0) return PLAYER.RED
  if (getAllMoves(board, PLAYER.RED).length   === 0) return PLAYER.BLACK
  if (getAllMoves(board, PLAYER.BLACK).length === 0) return PLAYER.RED
  return null
}
