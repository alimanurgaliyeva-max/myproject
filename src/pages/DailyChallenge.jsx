import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Flame, Lightbulb, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useGameLogic } from '../hooks/useGameLogic'
import Board from '../components/Board'
import GameControls from '../components/GameControls'
import { getDailyChallenge, getTodayKey } from '../utils/dailyChallenges'
import { GAME_MODE, DIFFICULTY, XP_REWARDS, PLAYER } from '../utils/constants'

const DIFF_OPTIONS = [
  { key: 'easy',   label: 'Easy',   xp: XP_REWARDS.DAILY_EASY,   color: 'text-[#22c55e] border-[#22c55e]', bg: 'bg-[#22c55e]', aiDiff: DIFFICULTY.L2 },
  { key: 'medium', label: 'Medium', xp: XP_REWARDS.DAILY_MEDIUM, color: 'text-[#f1a208] border-[#f1a208]', bg: 'bg-[#f1a208]', aiDiff: DIFFICULTY.L3 },
  { key: 'hard',   label: 'Hard',   xp: XP_REWARDS.DAILY_HARD,   color: 'text-[#e63946] border-[#e63946]', bg: 'bg-[#e63946]', aiDiff: DIFFICULTY.L4 },
]

export default function DailyChallenge() {
  const [selectedDiff, setSelectedDiff] = useState('easy')
  const [gameKey, setGameKey] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState(null)

  const { profile, addXP, addCoins, recordDailyChallenge, checkAndUnlockAchievements } = useApp()

  const challenge = getDailyChallenge(selectedDiff)
  const diff = DIFF_OPTIONS.find(d => d.key === selectedDiff)

  // Per-difficulty completion check
  const today = new Date().toDateString()
  const todayCompletions = profile.dailyCompletions?.[today] ?? {}
  const isCompleted = (key) => todayCompletions[key] === true

  const handleGameEnd = useCallback(({ winner }) => {
    const won = winner === PLAYER.RED
    setResult(won ? 'won' : 'lost')
    if (won) {
      const d = DIFF_OPTIONS.find(x => x.key === selectedDiff)
      addXP(d.xp, `Daily Challenge (${d.label})!`)
      addCoins(d.key === 'easy' ? 5 : d.key === 'medium' ? 10 : 20)
      recordDailyChallenge(d.key)
      checkAndUnlockAchievements({ type: 'daily_complete' })
    }
  }, [selectedDiff, addXP, addCoins, recordDailyChallenge, checkAndUnlockAchievements])

  const handleCapture = useCallback(() => {}, [])

  const game = useGameLogic({
    mode: GAME_MODE.AI,
    difficulty: diff?.aiDiff ?? DIFFICULTY.L2,
    startingBoard: challenge.board,
    onGameEnd: handleGameEnd,
    onCapture: handleCapture,
  })

  const resetChallenge = useCallback(() => {
    game.reset(challenge.board)
    setResult(null)
    setShowHint(false)
    setGameKey(k => k + 1)
  }, [game.reset, challenge.board])

  const changeDiff = useCallback((d) => {
    const newChallenge = getDailyChallenge(d)
    setSelectedDiff(d)
    setResult(null)
    setShowHint(false)
    setGameKey(k => k + 1)
    game.reset(newChallenge.board)
  }, [game.reset])

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#e0e0e0] dark:border-[#333] bg-gradient-to-r from-[#fffbf0] to-white dark:from-[#1a1500] dark:to-[#0d0d0d]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 flex items-center gap-4 flex-wrap">
          <Link to="/" className="btn-ghost gap-2 text-sm flex-shrink-0"><ArrowLeft size={15} />Home</Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f1a208] flex items-center justify-center">
              <Flame size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Daily Challenge</h1>
              <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
                {profile.dailyStreak > 0 ? `🔥 ${profile.dailyStreak} day streak` : 'Start your daily streak!'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            {DIFF_OPTIONS.map(d => (
              <button
                key={d.key}
                onClick={() => changeDiff(d.key)}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
                  selectedDiff === d.key ? `${d.bg} text-white border-transparent` : `border-[#e0e0e0] dark:border-[#333] ${d.color} hover:opacity-80`
                }`}
              >
                {d.label}
                <span className="ml-1.5 text-[10px] opacity-80">+{d.xp} XP</span>
                {isCompleted(d.key) && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">✓</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Board */}
          <div className="flex flex-col gap-4 w-full lg:w-auto items-center">
            <Board
              key={gameKey}
              board={game.board}
              selected={game.selected}
              validMoves={game.validMoves}
              lastMove={game.lastMove}
              lastCaptures={game.lastCaptures}
              onSquareClick={game.handleSquareClick}
              boardTheme={profile.boardTheme}
            />
            <div className="w-full max-w-[600px]">
              <GameControls onNewGame={resetChallenge} status={game.status} />
            </div>
          </div>

          {/* Info panel */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            {/* Challenge info */}
            <div className="card border-[#f1a208]/20">
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${diff?.bg} text-white`}>
                <Flame size={11} />{diff?.label} Challenge
              </div>
              <h2 className="font-bold text-lg mb-2">{challenge.title}</h2>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0] leading-relaxed">{challenge.description}</p>
              <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-[#f1a208]">
                <span>🎯 Win to earn +{diff?.xp} XP</span>
              </div>
            </div>

            {/* Hint */}
            <div className="card">
              <button
                onClick={() => setShowHint(h => !h)}
                className="flex items-center justify-between w-full text-sm font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb size={15} className="text-[#f1a208]" />
                  Get a hint
                </span>
                {showHint ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showHint && (
                <p className="mt-3 text-sm text-[#666] dark:text-[#b0b0b0] bg-[#f1a208]/5 border border-[#f1a208]/20 rounded-lg p-3 leading-relaxed">
                  💡 {challenge.hint}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="card">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Status</p>
              {result ? (
                <div className="text-center py-2">
                  <p className="text-3xl mb-2">{result === 'won' ? '🏆' : '😤'}</p>
                  <p className="font-bold text-lg">{result === 'won' ? 'Challenge Complete!' : 'Keep Trying!'}</p>
                  {result === 'won' && (
                    <p className="text-[#f1a208] font-semibold text-sm mt-1">+{diff?.xp} XP earned!</p>
                  )}
                  <button onClick={resetChallenge} className="btn-secondary mt-4 text-sm py-2 w-full justify-center">
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex-shrink-0 border-2 ${
                    game.currentPlayer === PLAYER.RED
                      ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-[#d0253a]'
                      : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] border-[#444]'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm">{game.currentPlayer === PLAYER.RED ? 'Red (You)' : 'AI'}</p>
                    <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
                      {game.aiThinking ? 'AI is thinking...' : game.currentPlayer === PLAYER.RED ? 'Your turn!' : 'Moving...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Today's progress */}
            <div className="card">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Today's Progress</p>
              <div className="grid grid-cols-3 gap-2">
                {DIFF_OPTIONS.map(d => {
                  const done = isCompleted(d.key)
                  return (
                    <div key={d.key} className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        done ? `${d.bg} text-white border-transparent` : 'border-[#e0e0e0] dark:border-[#333] text-[#999]'
                      }`}>
                        {done ? '✓' : '○'}
                      </div>
                      <p className={`text-[10px] font-semibold ${d.color}`}>{d.label}</p>
                      <p className="text-[9px] text-[#999] dark:text-[#555]">+{d.xp} XP</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
