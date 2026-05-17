import { Link } from 'react-router-dom'
import { Bot, Users, History, ChevronRight, Shield, Zap, Trophy } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { PLAYER } from '../utils/constants'

function ModeCard({ icon: Icon, title, desc, to, badge }) {
  return (
    <Link
      to={to}
      className="card group flex flex-col gap-4 hover:border-[#f1a208] hover:shadow-medium transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-[#f1a208]/10 dark:bg-[#ffd700]/10 flex items-center justify-center group-hover:bg-[#f1a208]/20 dark:group-hover:bg-[#ffd700]/20 transition-colors duration-200">
          <Icon size={22} className="text-[#f1a208] dark:text-[#ffd700]" />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f1a208]/10 text-[#f1a208] dark:bg-[#ffd700]/10 dark:text-[#ffd700]">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1 group-hover:text-[#f1a208] dark:group-hover:text-[#ffd700] transition-colors duration-200">{title}</h3>
        <p className="text-sm text-[#666] dark:text-[#b0b0b0] leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center text-sm font-semibold text-[#f1a208] dark:text-[#ffd700] mt-auto gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Play now <ChevronRight size={15} />
      </div>
    </Link>
  )
}

function FeaturePill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#b0b0b0]">
      <Icon size={15} className="text-[#f1a208] dark:text-[#ffd700] flex-shrink-0" />
      {text}
    </div>
  )
}

export default function Home() {
  const [history] = useLocalStorage('dama-history', [])
  const wins = history.filter(g => g.winner === PLAYER.RED).length
  const hasStats = history.length > 0

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#fdf8f0] to-[#f5f0e8] dark:from-[#0d0d0d] dark:via-[#111008] dark:to-[#0d0d0d] border-b border-[#e0e0e0] dark:border-[#333]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#f1a208] shadow-heavy mb-8">
            <span className="text-white font-bold text-4xl leading-none">D</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1a1a1a] dark:text-white mb-4">
            DAMA
          </h1>
          <p className="text-lg md:text-xl text-[#666] dark:text-[#b0b0b0] mb-10 max-w-md mx-auto leading-relaxed">
            Master the Ancient Game of Checkers
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/play" className="btn-primary text-lg px-10 py-4 rounded-xl shadow-medium">
              Play Now
            </Link>
            <Link to="/history" className="btn-secondary px-8 py-4 rounded-xl">
              View History
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <FeaturePill icon={Shield} text="Mandatory captures enforced" />
            <FeaturePill icon={Zap} text="3 AI difficulty levels" />
            <FeaturePill icon={Trophy} text="Match history tracked" />
          </div>
        </div>

        {/* Decorative board preview */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 opacity-5 dark:opacity-[0.04] rotate-12 pointer-events-none hidden lg:block">
          <div className="grid grid-cols-4 w-full h-full">
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className={`${i % 2 === (Math.floor(i / 4) % 2) ? 'bg-[#8b6f47]' : 'bg-[#e8d5c4]'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats (if user has games) */}
      {hasStats && (
        <section className="border-b border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-wrap items-center justify-center gap-12">
              {[
                { label: 'Games Played', value: history.length },
                { label: 'Wins', value: wins },
                { label: 'Win Rate', value: `${Math.round((wins / history.length) * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-[#f1a208] dark:text-[#ffd700]">{value}</p>
                  <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Game modes */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Choose Your Game</h2>
          <p className="text-[#666] dark:text-[#b0b0b0]">Select a mode to get started</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModeCard
            icon={Bot}
            title="Play vs AI"
            desc="Challenge the computer at Easy, Medium, or Hard difficulty. Perfect for practice and improvement."
            to="/play?mode=ai"
            badge="Popular"
          />
          <ModeCard
            icon={Users}
            title="Local Multiplayer"
            desc="Play against a friend on the same device. Red vs Black — may the best player win."
            to="/play?mode=local"
          />
          <ModeCard
            icon={History}
            title="Match History"
            desc="Review all your past games, track your performance, and see your win rate over time."
            to="/history"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#999] dark:text-[#555]">
          <p>© {new Date().getFullYear()} Dama · Master the Ancient Game of Checkers</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => alert(
                'Dama Rules:\n\n' +
                '• Red moves up, Black moves down\n' +
                '• Capture by jumping over opponent pieces diagonally\n' +
                '• Captures are mandatory\n' +
                '• Reach the opposite end to become a King\n' +
                '• Kings can move in all 4 diagonal directions\n' +
                '• Win by capturing all opponent pieces or blocking them'
              )}
              className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
            >
              Rules
            </button>
            <Link to="/history" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">History</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
