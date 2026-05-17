import { Trophy, Clock, Trash2 } from 'lucide-react'
import { PLAYER, GAME_MODE } from '../utils/constants'
import { useLocalStorage } from '../hooks/useLocalStorage'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function GameHistory() {
  const [history, setHistory] = useLocalStorage('dama-history', [])

  if (history.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
          <Clock size={28} className="text-[#ccc] dark:text-[#444]" />
        </div>
        <div>
          <p className="font-semibold text-[#666] dark:text-[#b0b0b0]">No games yet</p>
          <p className="text-sm text-[#999] dark:text-[#555] mt-1">Play a game to see your history here</p>
        </div>
      </div>
    )
  }

  const wins = history.filter(g => g.winner === PLAYER.RED).length
  const losses = history.filter(g => g.winner !== PLAYER.RED && g.mode === GAME_MODE.AI).length

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Games', value: history.length },
          { label: 'Wins', value: wins, color: 'text-[#e63946] dark:text-[#ff6b6b]' },
          { label: 'Losses', value: losses, color: 'text-[#666] dark:text-[#b0b0b0]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <p className={`text-3xl font-bold ${color || ''}`}>{value}</p>
            <p className="text-xs text-[#999] dark:text-[#555] mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* History list */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] dark:border-[#333]">
          <h3 className="font-semibold text-base">Match History</h3>
          <button
            onClick={() => setHistory([])}
            className="btn-ghost text-xs text-[#999] dark:text-[#555] gap-1.5"
          >
            <Trash2 size={13} />
            Clear all
          </button>
        </div>
        <div className="divide-y divide-[#e0e0e0] dark:divide-[#333]">
          {history.map(game => {
            const won = game.winner === PLAYER.RED
            return (
              <div key={game.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    won
                      ? 'bg-[#fff3cd] dark:bg-[#3a2e00] text-[#f1a208]'
                      : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#999] dark:text-[#555]'
                  }`}>
                    <Trophy size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {won ? 'Victory' : game.mode === GAME_MODE.AI ? 'Defeat' : 'Black wins'}
                    </p>
                    <p className="text-xs text-[#999] dark:text-[#555]">
                      {game.mode === GAME_MODE.AI ? `vs AI · ${game.difficulty}` : 'Local Multiplayer'} · {game.moves} moves
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#666] dark:text-[#b0b0b0]">{formatDate(game.date)}</p>
                  <p className="text-xs text-[#999] dark:text-[#555]">{formatTime(game.date)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
