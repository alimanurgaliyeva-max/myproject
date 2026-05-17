import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Clock, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PLAYER, GAME_MODE, AI_OPPONENTS } from '../utils/constants'
import { useLocalStorage } from '../hooks/useLocalStorage'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function History() {
  const { history, profile } = useApp()
  const [, setLegacyHistory] = useLocalStorage('dama-history-v2', [])

  if (history.length === 0) {
    return (
      <div className="min-h-screen pt-[70px] animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
            <h1 className="text-2xl font-bold">Match History</h1>
          </div>
          <div className="card flex flex-col items-center justify-center py-16 gap-4 text-center">
            <Clock size={32} className="text-[#ccc] dark:text-[#444]" />
            <div>
              <p className="font-semibold text-[#666] dark:text-[#b0b0b0]">No games yet</p>
              <p className="text-sm text-[#999] dark:text-[#555] mt-1">Play a game to see your history here</p>
            </div>
            <Link to="/play" className="btn-primary gap-2 mt-2">Play Now</Link>
          </div>
        </div>
      </div>
    )
  }

  const wins = history.filter(g => g.won).length

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
          <div>
            <h1 className="text-2xl font-bold">Match History</h1>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0]">{history.length} games played</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Games', value: history.length },
            { label: 'Wins', value: wins, color: 'text-[#22c55e]' },
            { label: 'Win Rate', value: `${Math.round((wins / history.length) * 100)}%`, color: 'text-[#f1a208]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <p className={`text-3xl font-bold ${color ?? ''}`}>{value}</p>
              <p className="text-xs text-[#999] dark:text-[#555] mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* History list */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] dark:border-[#333]">
            <h3 className="font-semibold">All Games</h3>
            <button
              onClick={() => setLegacyHistory([])}
              className="btn-ghost text-xs text-[#999] dark:text-[#555] gap-1.5"
            >
              <Trash2 size={12} />Clear
            </button>
          </div>
          <div className="divide-y divide-[#e0e0e0] dark:divide-[#333]">
            {history.map(game => {
              const ai = AI_OPPONENTS[game.difficulty]
              return (
                <div key={game.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#f5f5f5] dark:hover:bg-[#111] transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      game.won ? 'bg-[#fff3cd] dark:bg-[#3a2e00] text-[#f1a208]' : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#999]'
                    }`}>
                      <Trophy size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{game.won ? 'Victory' : 'Defeat'}</p>
                      <p className="text-xs text-[#999] dark:text-[#555]">
                        {game.mode === GAME_MODE.AI ? `vs ${ai?.name ?? 'AI'} · ${ai?.subtitle ?? game.difficulty}` : 'Local Multiplayer'}
                        {game.moveCount ? ` · ${game.moveCount} moves` : ''}
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
    </div>
  )
}
