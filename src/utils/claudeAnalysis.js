import { PLAYER, BOARD_SIZE } from './constants'

function colLetter(c) { return String.fromCharCode(65 + c) }
function squareName(r, c) { return `${colLetter(c)}${BOARD_SIZE - r}` }

function formatMoveHistory(moveHistory) {
  return moveHistory.map((entry, i) => {
    const { move, player } = entry
    const from = squareName(...move.from)
    const to = squareName(...move.to)
    const side = player === PLAYER.RED ? 'Red' : 'Black'
    const captures = move.captures?.length ?? 0
    let desc = `Move ${i + 1}: ${side} ${from}→${to}`
    if (captures >= 3) desc += ' (triple capture!)'
    else if (captures === 2) desc += ' (double capture!)'
    else if (captures === 1) desc += ' (captured 1 piece)'
    return desc
  }).join('\n')
}

export async function analyzeGameWithClaude(moveHistory, winner, difficulty) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing VITE_ANTHROPIC_API_KEY')

  const side = winner === PLAYER.RED ? 'Red' : 'Black'
  const formattedMoves = formatMoveHistory(moveHistory)

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
      max_tokens: 400,
      system: 'You are an expert checkers coach analyzing a completed game. Give specific, actionable feedback in 3-4 sentences. Mention specific moves by number if relevant. Be encouraging but honest.',
      messages: [{
        role: 'user',
        content: `Game result: ${side} won.\nDifficulty: ${difficulty}.\nTotal moves: ${moveHistory.length}.\n\nMove history:\n${formattedMoves}`,
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.content[0].text
}
