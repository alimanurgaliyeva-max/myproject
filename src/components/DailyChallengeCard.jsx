import { Link } from 'react-router-dom'
import { Flame, ChevronRight, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getTodayKey } from '../utils/dailyChallenges'
import { useState, useEffect } from 'react'

function Countdown() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      const diff = midnight - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime(`${h}h ${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono text-xs">{time}</span>
}

export default function DailyChallengeCard() {
  const { profile } = useApp()
  const today = getTodayKey()
  const completedToday = profile.lastDailyDate === new Date().toDateString()

  return (
    <div className="card border-[#f1a208]/30 bg-gradient-to-br from-white to-[#fffbf0] dark:from-[#1a1a1a] dark:to-[#1a1500]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f1a208] flex items-center justify-center flex-shrink-0">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Daily Challenge</h3>
              {profile.dailyStreak > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f1a208]/10 text-[#f1a208] dark:bg-[#ffd700]/10 dark:text-[#ffd700]">
                  🔥 {profile.dailyStreak} day streak
                </span>
              )}
            </div>
            <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-0.5">
              Resets in <Countdown />
            </p>
          </div>
        </div>
        {completedToday && (
          <CheckCircle size={20} className="text-[#22c55e] flex-shrink-0" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Easy', xp: '+20 XP', color: 'text-[#22c55e]' },
          { label: 'Medium', xp: '+50 XP', color: 'text-[#f1a208]' },
          { label: 'Hard', xp: '+100 XP', color: 'text-[#e63946]' },
        ].map(({ label, xp, color }) => (
          <div key={label} className="bg-[#f5f5f5] dark:bg-[#111] rounded-lg py-2 px-3">
            <p className="text-xs font-semibold">{label}</p>
            <p className={`text-[11px] font-bold mt-0.5 ${color}`}>{xp}</p>
          </div>
        ))}
      </div>

      <Link
        to="/daily"
        className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
          completedToday
            ? 'bg-[#f5f5f5] dark:bg-[#111] text-[#666] dark:text-[#b0b0b0] cursor-default'
            : 'btn-primary'
        }`}
      >
        {completedToday ? '✓ Completed today — come back tomorrow!' : <>Play Today\'s Challenge <ChevronRight size={15} /></>}
      </Link>
    </div>
  )
}
