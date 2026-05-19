import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bot, Users, Wifi, Copy, Check } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
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
import { PLAYER, GAME_MODE, DIFFICULTY, TIMER_MODES, AI_OPPONENTS, XP_REWARDS } from '../utils/constants'
import { subscribeToRoom, broadcastMove, leaveRoom } from '../utils/multiplayerService'
import { supabase } from '../utils/supabase'

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
  const navigate = useNavigate()

  const rawModeParam = params.get('mode')
  const rawMode = rawModeParam === 'local' ? GAME_MODE.LOCAL
    : rawModeParam === 'online' ? GAME_MODE.ONLINE
    : GAME_MODE.AI
  const roomCode = params.get('room')
  const role = params.get('role')

  const location = useLocation()
  const [mode] = useState(rawMode)
  const isOnline = mode === GAME_MODE.ONLINE
  const myPlayer = role === 'guest' ? PLAYER.BLACK : PLAYER.RED

  // Hosts start in "waiting" until guest joins, unless lobby already confirmed it
  const [roomActive, setRoomActive] = useState(
    role !== 'host' || location.state?.roomActive === true,
  )
  const roomActiveRef = useRef(roomActive)
  useEffect(() => { roomActiveRef.current = roomActive }, [roomActive])

  const [difficulty, setDifficulty] = useState(DIFFICULTY.L3)
  const [timerMode, setTimerMode] = useState(TIMER_MODES.NONE)
  const [gameKey, setGameKey] = useState(0)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [gameAnalysis, setGameAnalysis] = useState(null)
  const [lastGameResult, setLastGameResult] = useState(null)
  const [opponentName, setOpponentName] = useState('Opponent')
  const [overlayTimeLeft, setOverlayTimeLeft] = useState(180)
  const [overlayExpired, setOverlayExpired] = useState(false)
  const [overlayCopied, setOverlayCopied] = useState(false)

  const { profile, addXP, updateElo, recordGame, checkAndUnlockAchievements } = useApp()

  // Use refs so handleGameEnd never has stale profile/hints values
  // AND so that profile reference changes (from notifications) don't recreate handleGameEnd,
  // which would cause the AI setTimeout to be cleared and restarted mid-turn.
  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  const difficultyRef = useRef(difficulty)
  useEffect(() => { difficultyRef.current = difficulty }, [difficulty])

  const [coachEnabled, setCoachEnabled] = useState(profile.coachEnabled ?? true)
  const [hintLevel, setHintLevel] = useState(profile.hintLevel ?? 2)
  const coach = useAICoach(coachEnabled, hintLevel)
  const hintsUsedRef = useRef(0)
  useEffect(() => { hintsUsedRef.current = coach.hintsUsed }, [coach.hintsUsed])

  // Stable callback — no profile/coach in deps, uses refs instead
  const handleGameEnd = useCallback(({ winner, moveHistory, capturedRed, capturedBlack }) => {
    const p = profileRef.current
    const d = difficultyRef.current
    const won = winner === PLAYER.RED
    const ai = AI_OPPONENTS[d]

    const xpKey = mode === GAME_MODE.ONLINE
      ? (won ? 'WIN_LOCAL' : 'LOSS')
      : won
        ? { l1: 'WIN_AI_L1', l2: 'WIN_AI_L2', l3: 'WIN_AI_L3', l4: 'WIN_AI_L4', l5: 'WIN_AI_L5' }[d]
        : 'LOSS'
    addXP(XP_REWARDS[xpKey] ?? XP_REWARDS.LOSS, won ? (mode === GAME_MODE.ONLINE ? 'Online win!' : `Defeated ${ai?.name}!`) : 'Participation XP')

    if (mode === GAME_MODE.AI) {
      const newElo = calculateNewElo(p.elo, getAIElo(d), won ? 1 : 0, p.gamesPlayed)
      updateElo(newElo)
    }

    const analysis = analyzeGame(moveHistory ?? [])
    setGameAnalysis(analysis)

    recordGame({
      won,
      difficulty: d,
      mode,
      capturedByOpponent: capturedBlack ?? 0,
      moveCount: moveHistory?.length ?? 0,
      usedHints: hintsUsedRef.current > 0,
    })
    checkAndUnlockAchievements({ type: 'game_end', won, difficulty: d, usedHints: hintsUsedRef.current > 0 })

    setLastGameResult({ winner, won, moveHistory: moveHistory ?? [] })
    setTimeout(() => setShowAnalysis(true), 800)
  }, [mode, addXP, updateElo, recordGame, checkAndUnlockAchievements])

  const handleCapture = useCallback(({ player, count }) => {
    if (count >= 3) {
      checkAndUnlockAchievements({ type: 'capture_chain', count, player })
    }
  }, [checkAndUnlockAchievements])

  const game = useGameLogic({ mode, difficulty, localPlayer: isOnline ? myPlayer : null, onGameEnd: handleGameEnd, onCapture: handleCapture, soundEnabled: profile.soundEnabled !== false })
  const timer = useGameTimer(timerMode, game.currentPlayer, game.status === 'playing')

  // ── Online multiplayer ──────────────────────────────────────────────────────

  // Use a ref so the subscription callback never captures a stale syncBoard
  const syncBoardRef = useRef(null)
  useEffect(() => { syncBoardRef.current = game.syncBoard }, [game.syncBoard])

  // Fetch opponent name once the room is active (guest_id may be null before that)
  useEffect(() => {
    if (!isOnline || !roomCode || !roomActive) return
    supabase.from('rooms').select('host_id, guest_id').eq('code', roomCode).single()
      .then(async ({ data }) => {
        if (!data) return
        const opponentId = role === 'host' ? data.guest_id : data.host_id
        if (!opponentId) return
        const { data: prof } = await supabase.from('profiles').select('username').eq('id', opponentId).single()
        if (prof?.username) setOpponentName(prof.username)
      })
  }, [isOnline, roomCode, roomActive, role]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to room: detect guest joining + apply remote moves
  useEffect(() => {
    if (!isOnline || !roomCode) return
    // On mount: check current status and apply any existing board state (reconnect)
    supabase.from('rooms').select('board_state, current_player, status').eq('code', roomCode).single()
      .then(({ data }) => {
        if (data?.status === 'active' && !roomActiveRef.current) setRoomActive(true)
        if (data?.board_state) syncBoardRef.current?.(data.board_state, data.current_player)
      })
    const unsub = subscribeToRoom(roomCode, (data) => {
      if (!data || data.status === 'finished') return
      // Guest just joined — unblock the board
      if (!roomActiveRef.current && data.status === 'active') {
        setRoomActive(true)
        return
      }
      // Opponent made a move — apply it when it becomes our turn
      if (data.board_state && data.current_player === myPlayer) {
        syncBoardRef.current?.(data.board_state, data.current_player)
      }
    })
    return () => { unsub(); leaveRoom(roomCode) }
  }, [isOnline, roomCode, myPlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  // Overlay countdown — ticks only while the overlay is actually showing
  useEffect(() => {
    if (!isOnline || roomActive || overlayTimeLeft <= 0) return
    const id = setTimeout(() => setOverlayTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [isOnline, roomActive, overlayTimeLeft])

  // Overlay expiry — fires once when countdown reaches 0
  useEffect(() => {
    if (!isOnline || roomActive || overlayTimeLeft > 0) return
    leaveRoom(roomCode)
    setOverlayExpired(true)
  }, [isOnline, roomActive, overlayTimeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOverlayCopy = () => {
    const url = `${window.location.origin}/multiplayer?join=${roomCode}`
    navigator.clipboard.writeText(url).then(() => {
      setOverlayCopied(true)
      setTimeout(() => setOverlayCopied(false), 2000)
    })
  }

  // Broadcast our own moves
  // Uses moveHistory.length (not moveCount) as trigger: syncBoard increments moveCount
  // without adding to history, so this correctly fires only for our local moves.
  const lastBroadcastLenRef = useRef(0)
  useEffect(() => {
    if (!isOnline || !roomCode) return
    const last = game.moveHistory[game.moveHistory.length - 1]
    if (!last || last.player !== myPlayer) return
    if (game.moveHistory.length <= lastBroadcastLenRef.current) return
    lastBroadcastLenRef.current = game.moveHistory.length
    broadcastMove(roomCode, last.move, game.board, game.currentPlayer).catch(console.error)
  }, [isOnline, roomCode, myPlayer, game.moveHistory, game.board, game.currentPlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  // ───────────────────────────────────────────────────────────────────────────

  const handleNewGame = useCallback(() => {
    game.reset()
    coach.resetCoach()
    timer.resetTimer()
    setShowAnalysis(false)
    setGameAnalysis(null)
    setGameKey(k => k + 1)
  }, [game.reset, coach.resetCoach, timer.resetTimer])

  const handleDifficultyChange = useCallback((d) => {
    setDifficulty(d)
    game.reset()
    coach.resetCoach()
    timer.resetTimer()
    setShowAnalysis(false)
    setGameAnalysis(null)
    setGameKey(k => k + 1)
  }, [game.reset, coach.resetCoach, timer.resetTimer])

  const handleTimerChange = useCallback((t) => {
    setTimerMode(t)
    game.reset()
    coach.resetCoach()
    timer.resetTimer()
    setShowAnalysis(false)
    setGameAnalysis(null)
    setGameKey(k => k + 1)
  }, [game.reset, coach.resetCoach, timer.resetTimer])

  const handleResign = useCallback(() => {
    handleGameEnd({ winner: PLAYER.BLACK, moveHistory: game.moveHistory, capturedRed: game.capturedRed, capturedBlack: game.capturedBlack })
  }, [handleGameEnd, game.moveHistory, game.capturedRed, game.capturedBlack])

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
            {mode === GAME_MODE.AI ? <Bot size={15} /> : mode === GAME_MODE.ONLINE ? <Wifi size={15} /> : <Users size={15} />}
            {mode === GAME_MODE.AI ? 'vs AI' : mode === GAME_MODE.ONLINE ? `Online vs ${opponentName} · ${roomCode}` : '2 Players'}
          </div>
          {mode === GAME_MODE.AI && (
            <DifficultySelector value={difficulty} onChange={handleDifficultyChange} />
          )}
          <div className="flex-1" />
          <TimerSelector value={timerMode} onChange={handleTimerChange} />
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Board + Controls */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[600px] items-center">
            {timerMode !== TIMER_MODES.NONE && (
              <div className="w-full">
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
              lastCaptures={game.lastCaptures}
              onSquareClick={(!isOnline || roomActive) ? game.handleSquareClick : () => {}}
              boardTheme={profile.boardTheme}
            />
            {isOnline && game.currentPlayer !== myPlayer && game.status === 'playing' && (
              <div className="flex items-center justify-center gap-2 py-1.5 text-sm text-[#999] dark:text-[#555]">
                <svg className="animate-spin w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Waiting for {opponentName} to move...
              </div>
            )}
            <div className="w-full">
              <GameControls onNewGame={handleNewGame} onResign={handleResign} status={game.status} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
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

      {/* Waiting overlay — covers board + sidebar, blocks all interaction */}
      {isOnline && !roomActive && (
        <div className="fixed inset-0 pt-[70px] z-30 flex items-center justify-center bg-white/90 dark:bg-[#0d0d0d]/92 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full mx-4 flex flex-col items-center gap-5 py-8 text-center">

            {overlayExpired ? (
              /* ── Expired state ─────────────────────────────────────── */
              <>
                <div className="text-4xl">⏰</div>
                <div>
                  <p className="font-bold text-lg mb-1">Room expired</p>
                  <p className="text-sm text-[#666] dark:text-[#b0b0b0]">
                    No one joined in 3 minutes.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="btn-primary w-full justify-center"
                >
                  Go Home
                </button>
              </>
            ) : (
              /* ── Waiting state ─────────────────────────────────────── */
              <>
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#f1a208]/10 flex items-center justify-center">
                  <Wifi size={20} className="text-[#f1a208]" />
                </div>

                {/* Title */}
                <div>
                  <p className="font-bold text-lg mb-1">Waiting for opponent</p>
                  <p className="text-sm text-[#666] dark:text-[#b0b0b0]">
                    Share this code with your friend to start
                  </p>
                </div>

                {/* Room code with pulsing background */}
                <div className="relative flex items-center justify-center w-full">
                  <div className="absolute inset-0 rounded-2xl bg-[#f1a208]/12 animate-pulse" />
                  <div className="relative text-5xl font-bold tracking-[0.3em] text-[#f1a208] px-6 py-4 select-all font-mono">
                    {roomCode}
                  </div>
                </div>

                {/* Copy invite link */}
                <button
                  onClick={handleOverlayCopy}
                  className="btn-secondary gap-2 text-sm w-full justify-center"
                >
                  {overlayCopied
                    ? <><Check size={13} />Copied!</>
                    : <><Copy size={13} />Copy invite link</>}
                </button>

                {/* Live indicator + countdown */}
                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#b0b0b0]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                    </span>
                    Waiting for opponent...
                  </div>
                  <span className={`text-sm font-mono font-semibold tabular-nums ${overlayTimeLeft <= 30 ? 'text-[#e63946]' : 'text-[#f1a208]'}`}>
                    {Math.floor(overlayTimeLeft / 60)}:{String(overlayTimeLeft % 60).padStart(2, '0')}
                  </span>
                </div>

                {overlayTimeLeft <= 30 && (
                  <p className="text-xs text-[#e63946] -mt-1">
                    Room expires soon — share the link now!
                  </p>
                )}

                {/* Divider */}
                <div className="w-full border-t border-[#e0e0e0] dark:border-[#333]" />

                {/* Leave — always visible */}
                <button
                  onClick={() => { leaveRoom(roomCode); navigate('/multiplayer') }}
                  className="text-sm text-[#999] dark:text-[#555] hover:text-[#e63946] dark:hover:text-[#e63946] transition-colors duration-150"
                >
                  Leave Room
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showAnalysis && lastGameResult && (
        <PostGameAnalysis
          winner={lastGameResult.winner}
          mode={mode}
          difficulty={difficulty}
          analysis={gameAnalysis}
          capturedByOpponent={game.capturedBlack}
          onPlayAgain={handleNewGame}
          moveHistory={lastGameResult.moveHistory}
        />
      )}
    </div>
  )
}
