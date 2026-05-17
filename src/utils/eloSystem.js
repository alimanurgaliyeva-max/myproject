import { DIFFICULTY, AI_OPPONENTS } from './constants'

export const ELO_TIERS = [
  [0,    'Beginner'],
  [1200, 'Amateur'],
  [1400, 'Intermediate'],
  [1600, 'Advanced'],
  [1800, 'Expert'],
  [2000, 'Master'],
]

export function getEloTier(elo) {
  let tier = 'Beginner'
  for (const [min, name] of ELO_TIERS) {
    if (elo >= min) tier = name
    else break
  }
  return tier
}

export function calculateNewElo(playerElo, opponentElo, result, gamesPlayed = 20) {
  const k = gamesPlayed < 10 ? 64 : 32
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
  return Math.max(100, Math.round(playerElo + k * (result - expected)))
}

export function getAIElo(difficulty) {
  return AI_OPPONENTS[difficulty]?.elo ?? 1200
}
