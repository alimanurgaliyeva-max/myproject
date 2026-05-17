// All pieces must be on dark squares (row + col = odd)
function makeBoard(pieces) {
  const b = Array(8).fill(null).map(() => Array(8).fill(null))
  for (const [r, c, p] of pieces) b[r][c] = p
  return b
}

const EASY = [
  {
    id: 'e1', title: 'Triple Strike',
    description: 'Red to move. Find the triple capture chain to promote a piece to King!',
    hint: 'Look for a piece that can jump three times in a row.',
    board: makeBoard([
      [6,1,'red'], [7,2,'red'], [7,4,'red'],
      [5,2,'black'], [3,4,'black'], [1,6,'black'], [0,1,'black'], [0,5,'black'],
    ]),
  },
  {
    id: 'e2', title: 'Double Trouble',
    description: 'Red to move. Execute a double capture to gain a material advantage.',
    hint: 'One red piece can capture two black pieces in a single turn.',
    board: makeBoard([
      [6,3,'red'], [7,0,'red'], [7,6,'red'],
      [5,2,'black'], [3,2,'black'], [0,3,'black'], [0,7,'black'], [1,4,'black'],
    ]),
  },
  {
    id: 'e3', title: 'Mop Up',
    description: 'Red has a big material advantage. Capture all black pieces to win!',
    hint: 'Use your piece advantage to corner and capture every black piece.',
    board: makeBoard([
      [5,0,'red'], [5,4,'red'], [6,3,'red'], [6,7,'red'], [7,2,'red'], [7,6,'red'],
      [4,1,'black'], [4,5,'black'],
    ]),
  },
]

const MEDIUM = [
  {
    id: 'm1', title: 'The Fork',
    description: 'Red to move. Find the sequence that leads to a King promotion!',
    hint: 'There is a 2-capture sequence that crowns a piece.',
    board: makeBoard([
      [4,5,'red'], [6,1,'red'], [7,4,'red'],
      [3,4,'black'], [1,2,'black'], [0,3,'black'], [3,6,'black'], [1,6,'black'],
    ]),
  },
  {
    id: 'm2', title: 'King Power',
    description: "Use your King's full mobility to make a double capture!",
    hint: 'Your King can move in all four diagonal directions — use that freedom.',
    board: makeBoard([
      [4,3,'red-king'], [7,0,'red'], [7,6,'red'],
      [3,4,'black'], [1,4,'black'], [0,1,'black'], [0,7,'black'], [2,7,'black'],
    ]),
  },
  {
    id: 'm3', title: 'Precision Play',
    description: 'Black has a solid defense. Find the breakthrough!',
    hint: 'Look for forced captures that disrupt black\'s formation.',
    board: makeBoard([
      [4,1,'red'], [5,4,'red'], [6,7,'red'], [7,2,'red'],
      [3,0,'black'], [3,2,'black'], [3,6,'black'], [1,4,'black'], [0,3,'black'], [0,7,'black'],
    ]),
  },
]

const HARD = [
  {
    id: 'h1', title: 'The Squeeze',
    description: 'Black has a strong defensive wall. Find the winning break!',
    hint: 'Coordinated multi-piece attacks can break any wall.',
    board: makeBoard([
      [5,0,'red'], [5,6,'red'], [6,3,'red'], [7,4,'red'],
      [4,1,'black'], [4,3,'black'], [2,1,'black'], [2,5,'black'], [0,5,'black'], [1,6,'black'],
    ]),
  },
  {
    id: 'h2', title: 'Endgame Crucible',
    description: 'Black is well coordinated. Precise play is required to win.',
    hint: 'Every move matters — one mistake and black takes control.',
    board: makeBoard([
      [5,2,'red'], [6,1,'red'], [6,5,'red'], [7,6,'red'],
      [4,1,'black'], [4,3,'black'], [3,4,'black'], [1,0,'black'], [1,4,'black'], [0,3,'black'],
    ]),
  },
  {
    id: 'h3', title: 'King vs Army',
    description: 'Your King is powerful but outnumbered. Find the winning combination!',
    hint: 'A King in the center can dominate — use its range.',
    board: makeBoard([
      [3,2,'red-king'], [6,1,'red'], [7,4,'red'],
      [2,1,'black'], [2,3,'black'], [0,5,'black'], [4,3,'black'], [4,5,'black'], [1,6,'black'],
    ]),
  },
]

const ALL_CHALLENGES = { easy: EASY, medium: MEDIUM, hard: HARD }

export function getDailyChallenge(difficulty = 'easy') {
  const pool = ALL_CHALLENGES[difficulty] ?? EASY
  // Cycle based on day of year so it changes daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return pool[dayOfYear % pool.length]
}

export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function getTimeUntilMidnightUTC() {
  const now = new Date()
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return midnight - now
}
