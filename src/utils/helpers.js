export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function cloneBoard(board) {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

export function moveKey(move) {
  return `${move.from.row},${move.from.col}->${move.to.row},${move.to.col}`
}
