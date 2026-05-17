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

function tempApply(board, fromR, fromC, toR, toC, captured) {
  const b = board.map(r => [...r])
  const piece = b[fromR][fromC]
  b[fromR][fromC] = PIECE.EMPTY
  for (const [cr, cc] of captured) b[cr][cc] = PIECE.EMPTY
  b[toR][toC] = piece
  return b
}

// waypoints[i] = landing square after captures[i]
function findChains(board, row, col, piece, capturedSoFar, startRow, startCol, waypointsSoFar = []) {
  const owner = getOwner(piece)
  const result = []

  if (isKing(piece)) {
    for (const [dr, dc] of ALL_DIRS) {
      let opponentPos = null
      for (let dist = 1; dist < BOARD_SIZE; dist++) {
        const r = row + dr * dist
        const c = col + dc * dist
        if (!inBounds(r, c)) break
        const cell = board[r][c]

        if (opponentPos === null) {
          if (cell === PIECE.EMPTY) continue
          if (belongsTo(cell, owner)) break
          if (capturedSoFar.some(([cr, cc]) => cr === r && cc === c)) break
          opponentPos = [r, c]
        } else {
          if (cell !== PIECE.EMPTY) break
          const newCaptured = [...capturedSoFar, opponentPos]
          const newWaypoints = [...waypointsSoFar, [r, c]]
          const tmp = tempApply(board, row, col, r, c, [opponentPos])
          const chains = findChains(tmp, r, c, piece, newCaptured, startRow, startCol, newWaypoints)
          if (chains.length === 0) {
            result.push({ from: [startRow, startCol], to: [r, c], captures: newCaptured, waypoints: newWaypoints })
          } else {
            result.push(...chains)
          }
        }
      }
    }
  } else {
    for (const [dr, dc] of ALL_DIRS) {
      const mr = row + dr,   mc = col + dc
      const lr = row + dr*2, lc = col + dc*2
      if (!inBounds(lr, lc)) continue
      const mid = board[mr]?.[mc]
      if (!mid || mid === PIECE.EMPTY) continue
      if (belongsTo(mid, owner)) continue
      if (capturedSoFar.some(([cr, cc]) => cr === mr && cc === mc)) continue
      if (board[lr][lc] !== PIECE.EMPTY) continue

      const newCaptured = [...capturedSoFar, [mr, mc]]
      const newWaypoints = [...waypointsSoFar, [lr, lc]]
      const tmp = tempApply(board, row, col, lr, lc, [[mr, mc]])
      const chains = findChains(tmp, lr, lc, piece, newCaptured, startRow, startCol, newWaypoints)
      if (chains.length === 0) {
        result.push({ from: [startRow, startCol], to: [lr, lc], captures: newCaptured, waypoints: newWaypoints })
      } else {
        result.push(...chains)
      }
    }
  }
  return result
}

// Returns all single-step capture options from (row, col), excluding already-captured squares.
// Each result: { to: [r, c], captured: [mr, mc] }
export function getImmediateCaptures(board, row, col, excludedCaptures = []) {
  const piece = board[row][col]
  if (!piece || piece === PIECE.EMPTY) return []
  const owner = getOwner(piece)
  const result = []

  if (isKing(piece)) {
    for (const [dr, dc] of ALL_DIRS) {
      let opponentPos = null
      for (let dist = 1; dist < BOARD_SIZE; dist++) {
        const r = row + dr * dist, c = col + dc * dist
        if (!inBounds(r, c)) break
        const cell = board[r][c]
        if (opponentPos === null) {
          if (cell === PIECE.EMPTY) continue
          if (belongsTo(cell, owner)) break
          if (excludedCaptures.some(([er, ec]) => er === r && ec === c)) break
          opponentPos = [r, c]
        } else {
          if (cell !== PIECE.EMPTY) break
          result.push({ to: [r, c], captured: opponentPos })
        }
      }
    }
  } else {
    for (const [dr, dc] of ALL_DIRS) {
      const mr = row + dr, mc = col + dc
      const lr = row + dr * 2, lc = col + dc * 2
      if (!inBounds(lr, lc)) continue
      const mid = board[mr]?.[mc]
      if (!mid || mid === PIECE.EMPTY) continue
      if (belongsTo(mid, owner)) continue
      if (excludedCaptures.some(([er, ec]) => er === mr && ec === mc)) continue
      if (board[lr][lc] !== PIECE.EMPTY) continue
      result.push({ to: [lr, lc], captured: [mr, mc] })
    }
  }
  return result
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const captures = findChains(board, row, col, piece, [], row, col)
  if (captures.length > 0) return captures

  const moves = []
  if (isKing(piece)) {
    for (const [dr, dc] of ALL_DIRS) {
      for (let dist = 1; dist < BOARD_SIZE; dist++) {
        const nr = row + dr * dist, nc = col + dc * dist
        if (!inBounds(nr, nc) || board[nr][nc] !== PIECE.EMPTY) break
        moves.push({ from: [row, col], to: [nr, nc], captures: [], waypoints: [] })
      }
    }
  } else {
    for (const [dr, dc] of getFwdDirs(piece)) {
      const nr = row + dr, nc = col + dc
      if (inBounds(nr, nc) && board[nr][nc] === PIECE.EMPTY) {
        moves.push({ from: [row, col], to: [nr, nc], captures: [], waypoints: [] })
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
