import { Link } from 'react-router-dom'
import { Bot, Users, Flame, Trophy, ChevronRight, Zap, Shield, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import DailyChallengeCard from '../components/DailyChallengeCard'
import { ACHIEVEMENTS } from '../utils/achievements'
import { getEloTier } from '../utils/eloSystem'

function XPBar({ xpInLevel, xpToNext, level, title, progress }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#f1a208] flex items-center justify-center text-white font-bold text-xl shadow-medium">
            {level}
          </div>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-xs text-[#666] dark:text-[#b0b0b0]">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{xpInLevel} <span className="text-[#999] dark:text-[#555] font-normal">/ {xpToNext} XP</span></p>
          <p className="text-xs text-[#999] dark:text-[#555]">to next level</p>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[#e0e0e0] dark:bg-[#333] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f1a208] to-[#ffd700] transition-all duration-700"
          style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-[#f1a208]' }) {
  return (
    <div className="card flex flex-col gap-2 text-center py-4">
      <Icon size={20} className={`${color} mx-auto`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-[#999] dark:text-[#555]">{label}</p>
    </div>
  )
}

function ModeCard({ icon: Icon, title, desc, to, badge, accent = '#f1a208' }) {
  return (
    <Link to={to} className="card group flex flex-col gap-4 hover:border-[#f1a208] hover:shadow-medium transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
          <Icon size={22} style={{ color: accent }} />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-base mb-1 group-hover:text-[#f1a208] transition-colors duration-200">{title}</h3>
        <p className="text-sm text-[#666] dark:text-[#b0b0b0] leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center text-sm font-semibold gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: accent }}>
        Play now <ChevronRight size={14} />
      </div>
    </Link>
  )
}

function RecentAchievements({ unlockedIds }) {
  const unlocked = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).slice(-4)
  if (unlocked.length === 0) return null
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Recent Achievements</h3>
        <Link to="/achievements" className="text-xs text-[#f1a208] hover:underline">View all</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {unlocked.map(a => (
          <div key={a.id} className="flex items-center gap-2 bg-[#f5f5f5] dark:bg-[#111] rounded-xl px-3 py-2">
            <span className="text-lg">{a.emoji}</span>
            <div>
              <p className="text-xs font-semibold">{a.name}</p>
              <p className="text-[10px] text-[#999] dark:text-[#555]">+{a.xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { profile, history } = useApp()
  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      {/* Hero */}
      <section className="border-b border-[#e0e0e0] dark:border-[#333] bg-gradient-to-br from-white via-[#fdf8f0] to-[#f5f0e8] dark:from-[#0d0d0d] dark:via-[#110e05] dark:to-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Left: Welcome */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#f1a208] dark:text-[#ffd700] uppercase tracking-widest mb-3">
                Welcome back, {profile.username}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Ready to play<br />
                <span className="text-[#f1a208] dark:text-[#ffd700]">DAMA</span>?
              </h1>
              <p className="text-[#666] dark:text-[#b0b0b0] mb-6 max-w-md">
                The ancient game of checkers — reimagined for the modern player.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/play" className="btn-primary px-8 py-3 rounded-xl shadow-medium">
                  Play Now
                </Link>
                <Link to="/profile" className="btn-secondary px-6 py-3 rounded-xl">
                  My Profile
                </Link>
              </div>
            </div>

            {/* Right: XP + Stats */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
              <XPBar
                xpInLevel={profile.xpInLevel ?? 0}
                xpToNext={profile.xpToNext ?? 100}
                level={profile.level}
                title={profile.title ?? 'Novice'}
                progress={profile.progress ?? 0}
              />
              <div className="grid grid-cols-4 gap-3">
                <StatCard icon={Trophy} label="Wins" value={profile.wins} />
                <StatCard icon={TrendingUp} label="Win %" value={`${winRate}%`} color="text-[#22c55e]" />
                <StatCard icon={Flame} label="Streak" value={profile.winStreak} color="text-[#e63946]" />
                <StatCard icon={Shield} label="Elo" value={profile.elo} color="text-[#6c63ff]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DailyChallengeCard />

          <div>
            <h2 className="text-xl font-bold mb-4">Game Modes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                icon={Bot} title="Play vs AI"
                desc="Challenge one of 5 AI opponents — from beginner Mira to the unbeatable Viktor."
                to="/play?mode=ai" badge="Popular"
              />
              <ModeCard
                icon={Users} title="Local Multiplayer"
                desc="Play against a friend on the same device. Red vs Black."
                to="/play?mode=local"
              />
              <ModeCard
                icon={Flame} title="Daily Challenge"
                desc="A new puzzle every 24 hours. Earn XP and maintain your streak!"
                to="/daily" badge="New" accent="#e63946"
              />
              <ModeCard
                icon={Trophy} title="Achievements"
                desc={`You've unlocked ${profile.achievements.length} of ${ACHIEVEMENTS.length} achievements.`}
                to="/achievements" accent="#6c63ff"
              />
            </div>
          </div>

          <RecentAchievements unlockedIds={profile.achievements} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Elo card */}
          <div className="card">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Rating</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#6c63ff]/10 flex items-center justify-center">
                <Shield size={22} className="text-[#6c63ff]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.elo}</p>
                <p className="text-sm text-[#666] dark:text-[#b0b0b0]">{getEloTier(profile.elo)}</p>
              </div>
            </div>
            {profile.eloHistory && profile.eloHistory.length > 1 && (
              <div className="flex items-end gap-0.5 h-12">
                {profile.eloHistory.slice(-20).map((e, i) => {
                  const max = Math.max(...profile.eloHistory.slice(-20).map(x => x.elo))
                  const min = Math.min(...profile.eloHistory.slice(-20).map(x => x.elo))
                  const range = max - min || 1
                  const h = ((e.elo - min) / range) * 100
                  return (
                    <div key={i} className="flex-1 rounded-t-sm bg-[#6c63ff]/60" style={{ height: `${Math.max(10, h)}%` }} />
                  )
                })}
              </div>
            )}
          </div>

          {/* Tutorials */}
          <div className="card">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Learn</p>
            <h3 className="font-bold mb-2">Tutorials</h3>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0] mb-4">Master the fundamentals with guided lessons.</p>
            <Link to="/tutorials" className="btn-secondary w-full justify-center text-sm py-2.5">
              Start Learning
            </Link>
          </div>

          {/* Quick stats */}
          <div className="card">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Career Stats</p>
            <div className="flex flex-col gap-2">
              {[
                ['Games Played', profile.gamesPlayed],
                ['Total Wins', profile.wins],
                ['Best Win Streak', profile.bestStreak],
                ['Daily Streak', `${profile.dailyStreak} days 🔥`],
                ['Total XP', profile.totalXP.toLocaleString()],
                ['Coins', `${profile.coins} 💰`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-[#666] dark:text-[#b0b0b0]">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#999] dark:text-[#555]">
          <p>© {new Date().getFullYear()} DAMA · Master the Ancient Game of Checkers</p>
          <div className="flex gap-5">
            <Link to="/tutorials" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Tutorials</Link>
            <Link to="/history" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">History</Link>
            <Link to="/achievements" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Achievements</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
