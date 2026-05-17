import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot, Users, Brain } from 'lucide-react'
import { useState, useCallback } from 'react'
import Board from '../components/Board'
import GameInfo from '../components/GameInfo'
import GameControls from '../components/GameControls'
import CoachPanel from '../components/CoachPanel'
import PostGameAnalysis from '../components/PostGameAnalysis'
import GameTimer from '../components/GameTimer'
import { useGameLogic } from '../hooks/useGameLogic'
import { useAICoach } from '../hooks/useAICoach'
import { useGameTimer } from '../hooks/useGameTimer'
import { useApp } from '../context/AppContext'
import { analyzeGame } from '../utils/aiCoach'
import { calculateNewElo, getAIElo } from '../utils/eloSystem'
import { GAME_MODE, DIFFICULTY, TIMER_MODES, AI_OPPONENTS, XP_REWARDS } from '../utils/constants'

const DIFF_ORDER = [DIFFICULTY.L1, DIFFICULTY.L2, DIFFICULTY.L3, DIFFICULTY.L4, DIFFICULTY.L5]

function DifficultySelector({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {DIFF_ORDER.map(d => {
        const ai = AI_OPPONENTS[d]
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              value === d
                ? 'bg-[#f1a208] text-white border-[#f1a208]'
                : 'border-[#e0e0e0] dark:border-[#333] text-[#666] dark:text-[#b0b0b0] hover:border-[#f1a208]'
            }`}
          >
            <span>{ai.emoji}</span>
            {ai.name}
          </button>
        )
      })}
    </div>
  )
}

function TimerSelector({ value, onChange }) {
  const modes = [
    [TIMER_MODES.NONE, 'Untimed'],
    [TIMER_MODES.BLITZ, 'Blitz 3m'],
    [TIMER_MODES.RAPID, 'Rapid 10m'],
  ]
  return (
    <div className="flex gap-1">
      {modes.map(([mode, label]) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
            value === mode
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] border-transparent'
              : 'border-[#e0e0e0] dark:border-[#333] text-[#666] dark:text-[#b0b0b0] hover:border-[#666]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function Game() {
  const [params] = useSearchParams()
  const rawMode = params.get('mode') === 'local' ? GAME_MODE.LOCAL : GAME_MODE.AI
  const [mode] = useState(rawMode)
  const [difficulty, setDifficulty] = useState(DIFFICULTY.L3)
  const [timerMode, setTimerMode] = useState(TIMER_MODES.NONE)
  const [gameKey, setGameKey] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [gameAnalysis, setGameAnalysis] = useState(null)
  const [lastGameResult, setLastGameResult] = useState(null)

  const { profile, addXP, updateElo, recordGame, checkAndUnlockAchievements } = useApp()

  const [coachEnabled, setCoachEnabled] = useState(profile.coachEnabled ?? true)
  const [hintLevel, setHintLevel] = useState(profile.hintLevel ?? 2)

  const coach = useAICoach(coachEnabled, hintLevel)

  const handleCapture = useCallback(({ player, count }) => {
    if (count >= 3) {
      checkAndUnlockAchievements({ type: 'capture_chain', count, player })
    }
  }, [checkAndUnlockAchievements])

  const handleGameEnd = useCallback(({ winner }) => {
    const won = winner === 'red'
    const ai = AI_OPPONENTS[difficulty]

    // XP
    const xpKey = won
      ? { l1: 'WIN_AI_L1', l2: 'WIN_AI_L2', l3: 'WIN_AI_L3', l4: 'WIN_AI_L4', l5: 'WIN_AI_L5' }[difficulty]
      : 'LOSS'
    addXP(XP_REWARDS[xpKey] ?? XP_REWARDS.LOSS, won ? `Defeated ${ai?.name}!` : 'Participation XP')

    // Elo
    if (mode === GAME_MODE.AI) {
      const newElo = calculateNewElo(profile.elo, getAIElo(difficulty), won ? 1 : 0, profile.gamesPlayed)
      updateElo(newElo)
    }

    // Record + achievement check
    recordGame({ won, difficulty, mode, capturedByOpponent: 0, moveCount: 0, usedHints: coach.hintsUsed > 0 })
    checkAndUnlockAchievements({ type: 'game_end', won, difficulty, usedHints: coach.hintsUsed > 0, capturedByOpponent: 0 })

    setLastGameResult({ winner, won })
    setTimeout(() => setShowAnalysis(true), 800)
  }, [difficulty, mode, profile, addXP, updateElo, recordGame, checkAndUnlockAchievements, coach.hintsUsed])

  const game = useGameLogic({ mode, difficulty, onGameEnd: handleGameEnd, onCapture: handleCapture })
  const timer = useGameTimer(timerMode, game.currentPlayer, game.status === 'playing')

  const handleNewGame = () => {
    game.reset()
    coach.resetCoach()
    timer.resetTimer()
    setShowAnalysis(false)
    setGameAnalysis(null)
    setGameKey(k => k + 1)
  }

  const handleDifficultyChange = d => { setDifficulty(d); handleNewGame() }
  const handleTimerChange = t => { setTimerMode(t); handleNewGame() }

  const handleResign = () => {
    handleGameEnd({ winner: 'black' })
  }

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in bg-white dark:bg-[#0d0d0d]">
      {/* Top bar */}
      <div className="border-b border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="btn-ghost gap-2 text-sm flex-shrink-0">
            <ArrowLeft size={15} />
            Home
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-[#666] dark:text-[#b0b0b0] flex-shrink-0">
            {mode === GAME_MODE.AI ? <Bot size={15} /> : <Users size={15} />}
            {mode === GAME_MODE.AI ? 'vs AI' : 'Local Multiplayer'}
          </div>
          {mode === GAME_MODE.AI && (
            <DifficultySelector value={difficulty} onChange={handleDifficultyChange} />
          )}
          <div className="flex-1" />
          <TimerSelector value={timerMode} onChange={handleTimerChange} />
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Board + Controls */}
          <div className="flex flex-col gap-4 w-full lg:w-auto items-center">
            {timerMode !== TIMER_MODES.NONE && (
              <div className="w-full max-w-[600px]">
                <GameTimer
                  redTime={timer.redTime} blackTime={timer.blackTime}
                  currentPlayer={game.currentPlayer} formatTime={timer.formatTime}
                  timerMode={timerMode}
                />
              </div>
            )}
            <Board
              key={gameKey}
              board={game.board}
              selected={game.selected}
              validMoves={game.validMoves}
              lastMove={game.lastMove}
              onSquareClick={game.handleSquareClick}
              boardTheme={profile.boardTheme}
            />
            <div className="w-full max-w-[600px]">
              <GameControls onNewGame={handleNewGame} onResign={handleResign} status={game.status} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
            <GameInfo
              currentPlayer={game.currentPlayer}
              aiThinking={game.aiThinking}
              moveCount={game.moveCount}
              capturedRed={game.capturedRed}
              capturedBlack={game.capturedBlack}
              status={game.status}
              winner={game.winner}
              mode={mode}
              difficulty={difficulty}
            />
            {mode === GAME_MODE.AI && (
              <CoachPanel
                enabled={coachEnabled}
                onToggle={() => setCoachEnabled(e => !e)}
                hint={coach.hint}
                loading={coach.loading}
                onRequestHint={() => coach.requestHint(game.board, game.currentPlayer)}
                hintLevel={hintLevel}
                onHintLevelChange={setHintLevel}
                currentPlayer={game.currentPlayer}
              />
            )}
          </div>
        </div>
      </div>

      {showAnalysis && lastGameResult && (
        <PostGameAnalysis
          winner={lastGameResult.winner}
          mode={mode}
          difficulty={difficulty}
          analysis={gameAnalysis}
          capturedByOpponent={game.capturedBlack}
          onPlayAgain={handleNewGame}
        />
      )}
    </div>
  )
}
