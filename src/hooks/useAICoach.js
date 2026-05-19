import { useState, useCallback } from 'react'
import { getRankedMoves } from '../utils/aiEngine'
import { PLAYER, BOARD_SIZE } from '../utils/constants'

const colLetter = c => String.fromCharCode(65 + c)
const squareName = (r, c) => `${colLetter(c)}${BOARD_SIZE - r}`

function moveDescription(move) {
  const from = squareName(...move.from)
  const to = squareName(...move.to)
  const captures = move.captures.length
  if (captures >= 3) return `${from} to ${to} (triple capture!)`
  if (captures === 2) return `${from} to ${to} (double capture!)`
  if (captures === 1) return `${from} to ${to} (captures 1 piece)`
  return `${from} to ${to}`
}

function boardToText(board) {
  const lines = []
  for (let r = 0; r < board.length; r++) {
    const row = board[r]
    const cells = row.map(cell => {
      if (!cell) return '.'
      if (cell === PLAYER.RED) return 'r'
      if (cell === PLAYER.BLACK) return 'b'
      if (cell === 'RED_KING') return 'R'
      if (cell === 'BLACK_KING') return 'B'
      return '?'
    }).join(' ')
    lines.push(`${BOARD_SIZE - r} ${cells}`)
  }
  lines.push('  A B C D E F G H')
  return lines.join('\n')
}

async function askClaude(prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key')
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 120,
      system: 'You are an expert checkers coach. Give concise hints in 1-2 sentences. Be specific. r=red piece, R=red king, b=black piece, B=black king, .=empty.',
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await response.json()
  return data.content?.[0]?.text ?? null
}

export function useAICoach(enabled, hintLevel = 2) {
  const [hint, setHint] = useState(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [loading, setLoading] = useState(false)

  const requestHint = useCallback(async (board, player) => {
    if (!enabled || player !== PLAYER.RED) return
    setLoading(true)
    setHint(null)

    try {
      const ranked = getRankedMoves(board, player)
      if (!ranked || ranked.length === 0) { setLoading(false); return }

      const best = ranked[0].move
      const bestDesc = moveDescription(best)
      const hasCapture = best.captures.length > 0
      const boardText = boardToText(board)

      let prompt
      if (hintLevel === 1) {
        prompt = `Checkers board (r=red/you, b=black/opponent, R/B=kings):\n${boardText}\n\nGive a vague strategic tip without mentioning specific squares. 1 sentence.`
      } else if (hintLevel === 2) {
        const [fr, fc] = best.from
        prompt = `Checkers board (r=red/you, b=black/opponent, R/B=kings):\n${boardText}\n\nThe best move starts from ${squareName(fr, fc)}. Explain why this square is important without revealing the destination. 1-2 sentences.`
      } else {
        prompt = `Checkers board (r=red/you, b=black/opponent, R/B=kings):\n${boardText}\n\nThe best move is ${bestDesc}. Explain why this is the best move. 1-2 sentences.`
      }

      const text = await askClaude(prompt)
      setHint({ hint: text, bestMove: best })
      setHintsUsed(c => c + 1)
    } catch (e) {
      const ranked = getRankedMoves(board, player)
      const best = ranked?.[0]?.move
      setHint({ hint: best ? `Try: ${moveDescription(best)}` : 'Look for captures first!', bestMove: best })
    } finally {
      setLoading(false)
    }
  }, [enabled, hintLevel])

  const clearHint = useCallback(() => setHint(null), [])
  const resetCoach = useCallback(() => { setHint(null); setHintsUsed(0) }, [])

  return { hint, hintsUsed, loading, requestHint, clearHint, resetCoach }
}
