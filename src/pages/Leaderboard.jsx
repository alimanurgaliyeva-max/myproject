import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { getLevelInfo } from '../utils/xpSystem'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, username, elo, wins, losses, xp')
        .order('elo', { ascending: false })
        .limit(50)
      if (err) throw err
      setPlayers(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0]">Top 50 players by ELO rating</p>
            </div>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="btn-ghost gap-2 text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#999] dark:text-[#555]">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <p className="font-semibold text-[#e63946]">Failed to load leaderboard</p>
              <p className="text-sm text-[#999] dark:text-[#555]">{error}</p>
              <button onClick={fetchLeaderboard} className="btn-secondary text-sm">Try again</button>
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Trophy size={32} className="text-[#ccc] dark:text-[#444]" />
              <div>
                <p className="font-semibold text-[#666] dark:text-[#b0b0b0]">No players yet — be the first!</p>
                <p className="text-sm text-[#999] dark:text-[#555] mt-1">Play a game to appear on the leaderboard.</p>
              </div>
              <Link to="/play" className="btn-primary gap-2 mt-2">Play Now</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2.5rem_1fr_5rem_4.5rem_4.5rem_3.5rem] gap-2 px-5 py-3 border-b border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#111]">
                {['#', 'Player', 'ELO', 'Wins', 'Win%', 'Lvl'].map(h => (
                  <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-[#999] dark:text-[#555]">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-[#e0e0e0] dark:divide-[#333]">
                {players.map((p, i) => {
                  const isMe = user?.id === p.id
                  const total = (p.wins ?? 0) + (p.losses ?? 0)
                  const winPct = total > 0 ? Math.round(((p.wins ?? 0) / total) * 100) : 0
                  const level = getLevelInfo(p.xp ?? 0).level
                  return (
                    <div
                      key={p.id}
                      className={`grid grid-cols-[2.5rem_1fr_5rem_4.5rem_4.5rem_3.5rem] gap-2 items-center px-5 py-3.5 transition-colors duration-150 ${
                        isMe
                          ? 'bg-[#f1a208]/10 dark:bg-[#f1a208]/10'
                          : i % 2 !== 0
                            ? 'bg-[#fafafa] dark:bg-[#0a0a0a] hover:bg-[#f0f0f0] dark:hover:bg-[#111]'
                            : 'hover:bg-[#f5f5f5] dark:hover:bg-[#111]'
                      }`}
                    >
                      <span className="text-sm font-bold text-[#999] dark:text-[#555] leading-none">
                        {MEDALS[i] ?? i + 1}
                      </span>
                      <span className={`text-sm font-semibold truncate ${isMe ? 'text-[#f1a208]' : ''}`}>
                        {p.username ?? 'Player'}
                        {isMe && <span className="ml-1.5 text-[10px] font-normal opacity-60">(you)</span>}
                      </span>
                      <span className="text-sm font-bold">{p.elo ?? 1600}</span>
                      <span className="text-sm text-[#666] dark:text-[#b0b0b0]">{p.wins ?? 0}</span>
                      <span className="text-sm text-[#666] dark:text-[#b0b0b0]">{winPct}%</span>
                      <span className="text-sm text-[#666] dark:text-[#b0b0b0]">{level}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
