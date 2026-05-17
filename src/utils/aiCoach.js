import { getRankedMoves } from './aiEngine'
import { PLAYER, BOARD_SIZE } from './constants'
import { isKing } from './gameRules'

function colLetter(c) { return String.fromCharCode(65 + c) }
function squareName(r, c) { return `${colLetter(c)}${BOARD_SIZE - r}` }

function moveDescription(move) {
  const from = squareName(...move.from)
  const to = squareName(...move.to)
  const captures = move.captures.length
  if (captures >= 3) return `${from} → ${to} (triple capture!)`
  if (captures === 2) return `${from} → ${to} (double capture!)`
  if (captures === 1) return `${from} → ${to} (captures 1 piece)`
  return `${from} → ${to}`
}

function buildHint(rankedMoves, hintLevel) {
  if (!rankedMoves || rankedMoves.length === 0) return null
  const best = rankedMoves[0].move
  const isCap = best.captures.length > 0

  if (hintLevel === 1) {
    if (isCap) return "There's a capture available — look for it!"
    return "Look at your piece positions — advancing toward the center could be strong."
  }
  if (hintLevel === 2) {
    const [fr, fc] = best.from
    return `Consider moving the piece at ${squareName(fr, fc)}.`
  }
  // Level 3 — exact
  return `Best move: ${moveDescription(best)}`
}

export function getCoachHint(board, player, hintLevel = 2) {
  const ranked = getRankedMoves(board, player)
  return {
    hint: buildHint(ranked, hintLevel),
    bestMove: ranked[0]?.move ?? null,
    alternatives: ranked.slice(1, 3).map(r => moveDescription(r.move)),
  }
}

// Post-game analysis: compare player moves against engine moves
export function analyzeGame(moveHistory, startingBoard) {
  if (!moveHistory || moveHistory.length === 0) return null
  const playerMoves = moveHistory.filter(m => m.player === PLAYER.RED)
  if (playerMoves.length === 0) return null

  let bestMoves = 0
  let mistakes = 0
  let blunders = 0

  for (const { board, move } of playerMoves) {
    const ranked = getRankedMoves(board, PLAYER.RED)
    if (ranked.length === 0) continue
    const topScore = ranked[0].score
    const playerScore = ranked.find(r =>
      r.move.from[0] === move.from[0] && r.move.from[1] === move.from[1] &&
      r.move.to[0] === move.to[0] && r.move.to[1] === move.to[1]
    )?.score ?? ranked[ranked.length - 1].score

    const diff = Math.abs(topScore - playerScore)
    if (diff < 0.15) bestMoves++
    else if (diff < 0.8) mistakes++
    else blunders++
  }

  const total = playerMoves.length
  const accuracy = Math.round((bestMoves / total) * 100)

  return { accuracy, bestMoves, mistakes, blunders, total }
}
