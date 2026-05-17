import { Link } from 'react-router-dom'
import { Target, TrendingUp, AlertTriangle, Zap, RotateCcw, Home } from 'lucide-react'
import { PLAYER, GAME_MODE, AI_OPPONENTS } from '../utils/constants'

function Stat({ icon: Icon, label, value, color = '' }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-[#f5f5f5] dark:bg-[#111] rounded-xl">
      <Icon size={18} className={color || 'text-[#666] dark:text-[#b0b0b0]'} />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#555]">{label}</span>
    </div>
  )
}

function AccuracyRing({ accuracy }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (accuracy / 100) * circ
  const color = accuracy >= 80 ? '#22c55e' : accuracy >= 60 ? '#f1a208' : '#e63946'
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-[#e0e0e0] dark:text-[#333]" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round" />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>{accuracy}%</span>
    </div>
  )
}

export default function PostGameAnalysis({ winner, mode, difficulty, analysis, capturedByOpponent, onPlayAgain }) {
  const won = winner === PLAYER.RED
  const ai = AI_OPPONENTS[difficulty]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="card max-w-md w-full p-0 overflow-hidden shadow-heavy animate-slide-up">
        {/* Header */}
        <div className={`px-6 py-5 text-center ${won ? 'bg-[#fffbf0] dark:bg-[#1a1500] border-b border-[#f1a208]/20' : 'bg-[#fff5f5] dark:bg-[#1a0505] border-b border-[#e63946]/20'}`}>
          <div className="text-4xl mb-2">{won ? '🏆' : '😤'}</div>
          <h2 className="text-xl font-bold">{won ? 'Victory!' : 'Defeat'}</h2>
          <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-1">
            {mode === GAME_MODE.AI
              ? won ? `You defeated ${ai?.name ?? 'AI'}!` : `${ai?.name ?? 'AI'} wins this round.`
              : won ? 'Red wins the match!' : 'Black wins the match!'}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Accuracy */}
          {analysis && (
            <div className="flex items-center gap-4">
              <AccuracyRing accuracy={analysis.accuracy} />
              <div>
                <p className="font-bold text-lg">{analysis.accuracy}% Accuracy</p>
                <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-0.5">
                  {analysis.accuracy >= 80 ? 'Excellent play!' : analysis.accuracy >= 60 ? 'Good game, room to improve.' : 'Keep practicing — you\'ll get there!'}
                </p>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {analysis && <>
              <Stat icon={Target} label="Best Moves" value={analysis.bestMoves} color="text-[#22c55e]" />
              <Stat icon={TrendingUp} label="Mistakes" value={analysis.mistakes} color="text-[#f1a208]" />
              <Stat icon={AlertTriangle} label="Blunders" value={analysis.blunders} color="text-[#e63946]" />
            </>}
            <Stat icon={Zap} label="Captures" value={capturedByOpponent ?? 0} />
          </div>

          {/* Advice */}
          {analysis && (
            <div className="bg-[#f5f5f5] dark:bg-[#111] rounded-xl p-4 text-sm text-[#666] dark:text-[#b0b0b0] leading-relaxed">
              {analysis.mistakes > 3 || analysis.blunders > 1
                ? '💡 Focus on spotting capture opportunities before moving — slow down and scan the whole board.'
                : analysis.accuracy >= 80
                ? '🌟 Excellent game! Try increasing the AI difficulty to keep improving.'
                : '💡 Good effort! Try enabling AI Coach hints to learn from each position.'}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button onClick={onPlayAgain} className="btn-primary w-full justify-center gap-2">
              <RotateCcw size={15} />
              Play Again
            </button>
            <Link to="/" className="btn-secondary w-full justify-center gap-2">
              <Home size={15} />
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
