import { BOARD_SIZE, PLAYER, PIECE_TYPE, GAME_STATUS } from './constants.js'

export function isInBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function getOpponent(player) {
  return player === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED
}

// Returns all valid moves for a piece at (row, col)
// Each move: { from: {row,col}, to: {row,col}, captures: [{row,col},...] }
export function getMovesForPiece(board, row, col, mustCapture = false) {
  const piece = board[row][col]
  if (!piece) return []

  const captures = getCapturesForPiece(board, row, col, piece, [])
  if (captures.length > 0) return captures
  if (mustCapture) return []

  return getSimpleMovesForPiece(board, row, col, piece)
}

function getSimpleMovesForPiece(board, row, col, piece) {
  const moves = []
  const dirs = getDirections(piece)

  for (const [dr, dc] of dirs) {
    if (piece.type === PIECE_TYPE.KING) {
      // King slides diagonally any distance
      let r = row + dr
      let c = col + dc
      while (isInBounds(r, c) && !board[r][c]) {
        moves.push({ from: { row, col }, to: { row: r, col: c }, captures: [] })
        r += dr
        c += dc
      }
    } else {
      const r = row + dr
      const c = col + dc
      if (isInBounds(r, c) && !board[r][c]) {
        moves.push({ from: { row, col }, to: { row: r, col: c }, captures: [] })
      }
    }
  }

  return moves
}

function getCapturesForPiece(board, row, col, piece, alreadyCaptured) {
  const captures = []
  const dirs = getDirections(piece)

  for (const [dr, dc] of dirs) {
    if (piece.type === PIECE_TYPE.KING) {
      // King can jump over any distance
      let r = row + dr
      let c = col + dc
      while (isInBounds(r, c) && !board[r][c]) {
        r += dr
        c += dc
      }
      // r,c is now blocked or out of bounds
      if (!isInBounds(r, c)) continue
      const target = board[r][c]
      if (!target || target.player === piece.player) continue
      const captureKey = `${r},${c}`
      if (alreadyCaptured.some(p => `${p.row},${p.col}` === captureKey)) continue

      // Look for landing squares past the captured piece
      let lr = r + dr
      let lc = c + dc
      while (isInBounds(lr, lc) && !board[lr][lc]) {
        const newCaptured = [...alreadyCaptured, { row: r, col: c }]
        const chainCaptures = getCapturesForPiece(
          applyMoveToBoard(board, { from: { row, col }, to: { row: lr, col: lc }, captures: newCaptured }),
          lr, lc, piece, newCaptured
        )
        if (chainCaptures.length > 0) {
          chainCaptures.forEach(cc => captures.push({
            from: { row, col },
            to: cc.to,
            captures: [{ row: r, col: c }, ...cc.captures],
          }))
        } else {
          captures.push({ from: { row, col }, to: { row: lr, col: lc }, captures: [{ row: r, col: c }] })
        }
        lr += dr
        lc += dc
      }
    } else {
      // Normal piece: jump exactly 2 squares
      const mr = row + dr
      const mc = col + dc
      const lr = row + 2 * dr
      const lc = col + 2 * dc

      if (!isInBounds(mr, mc) || !isInBounds(lr, lc)) continue
      const mid = board[mr][mc]
      if (!mid || mid.player === piece.player) continue
      const captureKey = `${mr},${mc}`
      if (alreadyCaptured.some(p => `${p.row},${p.col}` === captureKey)) continue
      if (board[lr][lc]) continue

      const newCaptured = [...alreadyCaptured, { row: mr, col: mc }]
      const tempBoard = applyMoveToBoard(board, { from: { row, col }, to: { row: lr, col: lc }, captures: newCaptured })
      const chainCaptures = getCapturesForPiece(tempBoard, lr, lc, piece, newCaptured)

      if (chainCaptures.length > 0) {
        chainCaptures.forEach(cc => captures.push({
          from: { row, col },
          to: cc.to,
          captures: [{ row: mr, col: mc }, ...cc.captures],
        }))
      } else {
        captures.push({ from: { row, col }, to: { row: lr, col: lc }, captures: newCaptured })
      }
    }
  }

  return captures
}

function getDirections(piece) {
  if (piece.type === PIECE_TYPE.KING) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }
  return piece.player === PLAYER.RED
    ? [[1, -1], [1, 1]]   // Red moves down
    : [[-1, -1], [-1, 1]] // Black moves up
}

// Get all legal moves for a player
export function getAllMovesForPlayer(board, player) {
  const captures = []
  const simple = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (!piece || piece.player !== player) continue

      const pieceMoves = getMovesForPiece(board, r, c, false)
      pieceMoves.forEach(m => {
        if (m.captures.length > 0) captures.push(m)
        else simple.push(m)
      })
    }
  }

  // Mandatory capture rule
  return captures.length > 0 ? captures : simple
}

// Apply a move to a board (immutably)
export function applyMoveToBoard(board, move) {
  const newBoard = board.map(row => [...row])
  const piece = newBoard[move.from.row][move.from.col]

  newBoard[move.from.row][move.from.col] = null
  newBoard[move.to.row][move.to.col] = { ...piece }

  // Remove captured pieces
  if (move.captures) {
    move.captures.forEach(cap => {
      newBoard[cap.row][cap.col] = null
    })
  }

  // King promotion
  if (piece.type === PIECE_TYPE.NORMAL) {
    if (piece.player === PLAYER.RED && move.to.row === BOARD_SIZE - 1) {
      newBoard[move.to.row][move.to.col].type = PIECE_TYPE.KING
    } else if (piece.player === PLAYER.BLACK && move.to.row === 0) {
      newBoard[move.to.row][move.to.col].type = PIECE_TYPE.KING
    }
  }

  return newBoard
}

// Check if there's a king promotion from this move
export function isPromotion(board, move) {
  const piece = board[move.from.row][move.from.col]
  if (!piece || piece.type === PIECE_TYPE.KING) return false
  if (piece.player === PLAYER.RED && move.to.row === BOARD_SIZE - 1) return true
  if (piece.player === PLAYER.BLACK && move.to.row === 0) return true
  return false
}

export function checkGameStatus(board, currentPlayer) {
  const moves = getAllMovesForPlayer(board, currentPlayer)
  if (moves.length === 0) {
    return currentPlayer === PLAYER.RED ? GAME_STATUS.BLACK_WINS : GAME_STATUS.RED_WINS
  }

  const redPieces = countPieces(board, PLAYER.RED)
  const blackPieces = countPieces(board, PLAYER.BLACK)

  if (redPieces === 0) return GAME_STATUS.BLACK_WINS
  if (blackPieces === 0) return GAME_STATUS.RED_WINS

  return GAME_STATUS.PLAYING
}

export function countPieces(board, player) {
  let count = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.player === player) count++
    }
  }
  return count
}

export function countKings(board, player) {
  let count = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.player === player && board[r][c]?.type === PIECE_TYPE.KING) count++
    }
  }
  return count
}
