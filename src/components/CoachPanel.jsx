import { Brain, Lightbulb, ChevronRight } from 'lucide-react'
import { PLAYER } from '../utils/constants'

export default function CoachPanel({ enabled, onToggle, hint, loading, onRequestHint, hintLevel, onHintLevelChange, currentPlayer }) {
  if (!enabled) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-[#999] dark:text-[#555]" />
          <p className="text-sm font-semibold text-[#999] dark:text-[#555]">AI Coach</p>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] dark:bg-[#222] text-[#999] dark:text-[#555]">Off</span>
        </div>
        <button onClick={onToggle} className="btn-secondary text-sm py-2 w-full justify-center">
          Enable Coach
        </button>
      </div>
    )
  }

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain size={16} className="text-[#f1a208]" />
        <p className="text-sm font-semibold tracking-tight">AI Coach</p>
        <button
          onClick={onToggle}
          className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-[#f1a208]/10 text-[#f1a208] hover:bg-[#f1a208]/20 transition-colors font-medium"
        >
          On
        </button>
      </div>

      {/* Hint strength selector */}
      <div>
        <p className="text-[11px] font-medium text-[#999] dark:text-[#555] uppercase tracking-widest mb-2">Hint strength</p>
        <div className="flex rounded-lg border border-[#e0e0e0] dark:border-[#2a2a2a] overflow-hidden text-xs">
          {[
            [1, 'Vague'],
            [2, 'Direction'],
            [3, 'Exact'],
          ].map(([lvl, label]) => (
            <button
              key={lvl}
              onClick={() => onHintLevelChange(lvl)}
              className={`flex-1 py-1.5 font-semibold transition-all duration-150 ${
                hintLevel === lvl
                  ? 'bg-[#f1a208] text-white'
                  : 'text-[#666] dark:text-[#666] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#222]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hint display */}
      <div className="min-h-[64px] flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center gap-2.5 py-1">
            <span className="text-xs text-[#999] dark:text-[#555]">Analyzing</span>
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#f1a208] inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#f1a208] inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#f1a208] inline-block" />
          </div>
        ) : hint ? (
          <div className="animate-fade-in border-l-2 border-[#f1a208] bg-[#f1a208]/[0.04] dark:bg-[#f1a208]/[0.06] rounded-r-lg pl-3 pr-3 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={11} className="text-[#f1a208] flex-shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#f1a208]">Coach tip</span>
            </div>
            <p className="text-sm text-[#1a1a1a] dark:text-[#e0e0e0] leading-relaxed text-left">{hint.hint}</p>
          </div>
        ) : (
          <p className="text-xs text-[#999] dark:text-[#555] leading-relaxed">
            {currentPlayer === PLAYER.RED
              ? 'Ask the coach for a hint on your turn.'
              : 'Waiting for your turn…'}
          </p>
        )}
      </div>

      <button
        onClick={onRequestHint}
        disabled={currentPlayer !== PLAYER.RED || loading}
        className="btn-primary text-sm py-2.5 w-full justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        <Lightbulb size={14} />
        Get Hint
        <ChevronRight size={13} className="opacity-70" />
      </button>
    </div>
  )
}
