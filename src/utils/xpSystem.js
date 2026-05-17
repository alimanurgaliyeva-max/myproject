const TITLES = [
  [1,  'Novice'],
  [6,  'Apprentice'],
  [11, 'Player'],
  [16, 'Tactician'],
  [21, 'Strategist'],
  [26, 'Contender'],
  [31, 'Expert'],
  [36, 'Master'],
  [41, 'Grandmaster'],
  [46, 'Legend'],
]

export function getTitle(level) {
  let title = 'Novice'
  for (const [minLevel, t] of TITLES) {
    if (level >= minLevel) title = t
    else break
  }
  return title
}

// XP needed to reach level N from level N-1: 100 + (N-2)*50
// Total XP to reach level N: sum from 1 to N-1
function xpForLevel(n) {
  if (n <= 1) return 0
  // XP to go from level k to k+1 = 100 + (k-1)*50
  let total = 0
  for (let k = 1; k < n; k++) total += 100 + (k - 1) * 50
  return total
}

export function getLevelInfo(totalXP) {
  let level = 1
  while (xpForLevel(level + 1) <= totalXP) level++
  const xpForCurrent = xpForLevel(level)
  const xpForNext = xpForLevel(level + 1)
  return {
    level,
    title: getTitle(level),
    xpInLevel: totalXP - xpForCurrent,
    xpToNext: xpForNext - xpForCurrent,
    progress: (totalXP - xpForCurrent) / (xpForNext - xpForCurrent),
  }
}
