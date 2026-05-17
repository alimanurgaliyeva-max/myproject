import { Brain, Lightbulb, ChevronRight, Loader2 } from 'lucide-react'
import { PLAYER } from '../utils/constants'

export default function CoachPanel({ enabled, onToggle, hint, loading, onRequestHint, hintLevel, onHintLevelChange, currentPlayer }) {
  if (!enabled) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-[#999] dark:text-[#555]" />
          <p className="text-sm font-semibold text-[#999] dark:text-[#555]">AI Coach</p>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#999] dark:text-[#555]">Off</span>
        </div>
        <button onClick={onToggle} className="btn-secondary text-sm py-2 w-full justify-center">
          Enable Coach
        </button>
      </div>
    )
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Brain size={16} className="text-[#f1a208] dark:text-[#ffd700]" />
        <p className="text-sm font-semibold">AI Coach</p>
        <button
          onClick={onToggle}
          className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#f1a208]/10 dark:bg-[#ffd700]/10 text-[#f1a208] dark:text-[#ffd700] hover:bg-[#f1a208]/20 transition-colors"
        >
          On
        </button>
      </div>

      {/* Hint level */}
      <div>
        <p className="text-xs text-[#999] dark:text-[#555] mb-2">Hint strength</p>
        <div className="flex rounded-lg border border-[#e0e0e0] dark:border-[#333] overflow-hidden text-xs">
          {[
            [1, 'Vague'],
            [2, 'Direction'],
            [3, 'Exact'],
          ].map(([lvl, label]) => (
            <button
              key={lvl}
              onClick={() => onHintLevelChange(lvl)}
              className={`flex-1 py-1.5 font-medium transition-colors ${hintLevel === lvl ? 'bg-[#f1a208] text-white' : 'text-[#666] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hint display */}
      <div className="min-h-[60px] flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#b0b0b0]">
            <Loader2 size={14} className="animate-spin" />
            Analyzing position...
          </div>
        ) : hint ? (
          <div className="bg-[#f1a208]/5 dark:bg-[#ffd700]/5 border border-[#f1a208]/20 dark:border-[#ffd700]/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-[#f1a208] dark:text-[#ffd700] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#1a1a1a] dark:text-white leading-relaxed">{hint.hint}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#999] dark:text-[#555]">
            {currentPlayer === PLAYER.RED ? 'Click "Get Hint" to ask the coach for advice.' : 'Waiting for your turn...'}
          </p>
        )}
      </div>

      <button
        onClick={onRequestHint}
        disabled={currentPlayer !== PLAYER.RED || loading}
        className="btn-primary text-sm py-2.5 w-full justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        <Lightbulb size={14} />
        Get Hint
        <ChevronRight size={13} />
      </button>
    </div>
  )
}
