import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createRoom, joinRoom, subscribeToRoom, leaveRoom } from '../utils/multiplayerService'

const ROOM_TIMEOUT = 180 // 3 minutes in seconds

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

function getPlayerId(user) {
  if (user?.id) return user.id
  let id = sessionStorage.getItem('dama-pid')
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('dama-pid', id) }
  return id
}

function formatCountdown(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MultiplayerLobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [queryParams] = useSearchParams()

  const [tab, setTab] = useState('create')

  // Create-room state machine: idle → waiting → expired | navigated
  const [roomCode, setRoomCode] = useState(null)
  const [creating, setCreating] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [expired, setExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROOM_TIMEOUT)
  const [copied, setCopied] = useState(false)
  const [createError, setCreateError] = useState(null)

  // Join-room state
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState(null)

  const unsubRef = useRef(null)

  // Pre-fill join code from invite link (?join=CODE)
  useEffect(() => {
    const code = queryParams.get('join')
    if (code) {
      setTab('join')
      setJoinCode(code.toUpperCase().slice(0, 4))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => { unsubRef.current?.() }
  }, [])

  // Countdown tick — uses setTimeout chain so interval drift doesn't accumulate
  useEffect(() => {
    if (!waiting || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [waiting, timeLeft])

  // Expiry — fires when countdown hits 0
  useEffect(() => {
    if (!waiting || timeLeft > 0) return
    unsubRef.current?.()
    unsubRef.current = null
    if (roomCode) leaveRoom(roomCode)
    setWaiting(false)
    setExpired(true)
  }, [waiting, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    setExpired(false)
    setTimeLeft(ROOM_TIMEOUT)
    const code = generateCode()
    const playerId = getPlayerId(user)
    try {
      await createRoom(code, playerId)
      setRoomCode(code)
      setWaiting(true)
      unsubRef.current = subscribeToRoom(code, (data) => {
        if (data?.status === 'active' && data.guest_id) {
          // Guest joined — head to the game, passing roomActive=true so game
          // page skips its own waiting overlay
          navigate(`/play?mode=online&room=${code}&role=host`, { state: { roomActive: true } })
        }
      })
    } catch (err) {
      setCreateError(err.message ?? 'Failed to create room. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    unsubRef.current?.()
    unsubRef.current = null
    if (roomCode) leaveRoom(roomCode)
    setWaiting(false)
    setExpired(false)
    setRoomCode(null)
    setTimeLeft(ROOM_TIMEOUT)
  }

  const handleJoin = async () => {
    const code = joinCode.toUpperCase().trim()
    if (code.length < 4) return
    setJoining(true)
    setJoinError(null)
    const playerId = getPlayerId(user)
    try {
      await joinRoom(code, playerId)
      navigate(`/play?mode=online&room=${code}&role=guest`)
    } catch (err) {
      setJoinError(err.message ?? 'Room not found or already in progress.')
    } finally {
      setJoining(false)
    }
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/multiplayer?join=${roomCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Waiting state — full card replacement ──────────────────────────────────
  if (waiting) {
    const urgent = timeLeft <= 30
    return (
      <div className="min-h-screen pt-[70px] animate-fade-in">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
            <div>
              <h1 className="text-2xl font-bold">Play Online</h1>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0]">Waiting for opponent</p>
            </div>
          </div>

          <div className="card flex flex-col items-center gap-6 py-8">
            {/* Room code with pulsing background */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#999] dark:text-[#555] text-center mb-3">
                Room Code
              </p>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-[#f1a208]/15 animate-pulse" />
                <div className="relative text-6xl font-bold tracking-[0.3em] text-[#f1a208] px-8 py-5 select-all">
                  {roomCode}
                </div>
              </div>
            </div>

            {/* Live status + countdown */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#b0b0b0]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                </span>
                Waiting for opponent to join...
              </div>
              <span className={`text-sm font-mono font-semibold tabular-nums ${urgent ? 'text-[#e63946]' : 'text-[#f1a208]'}`}>
                {formatCountdown(timeLeft)}
              </span>
            </div>

            {urgent && (
              <p className="text-xs text-[#e63946] text-center -mt-2">
                Room expires soon — share the code quickly!
              </p>
            )}

            {/* Copy invite link */}
            <button onClick={handleCopy} className="btn-secondary gap-2 text-sm w-full justify-center">
              {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy invite link</>}
            </button>

            {/* Divider */}
            <div className="w-full border-t border-[#e0e0e0] dark:border-[#333]" />

            {/* Cancel — always visible */}
            <button
              onClick={handleCancel}
              className="text-sm text-[#999] dark:text-[#555] hover:text-[#e63946] dark:hover:text-[#e63946] transition-colors duration-150"
            >
              Cancel and go back
            </button>
          </div>

          <p className="text-center text-xs text-[#999] dark:text-[#555] mt-6">
            Share the code or invite link. The game starts the moment your opponent joins.
          </p>
        </div>
      </div>
    )
  }

  // ── Main lobby layout ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
          <div>
            <h1 className="text-2xl font-bold">Play Online</h1>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0]">Challenge a friend anywhere in the world</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-xl mb-6">
          {[['create', 'Create Room'], ['join', 'Join Room']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                tab === t
                  ? 'bg-white dark:bg-[#111] shadow-sm text-[#1a1a1a] dark:text-white'
                  : 'text-[#666] dark:text-[#555] hover:text-[#1a1a1a] dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <div className="card flex flex-col gap-5">
            {expired ? (
              /* Expiry state */
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="text-4xl">⏰</div>
                <div>
                  <p className="font-semibold text-[#1a1a1a] dark:text-white">Room expired</p>
                  <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-1">
                    No one joined in 3 minutes.
                  </p>
                </div>
                <button onClick={handleCreate} disabled={creating} className="btn-primary w-full justify-center">
                  {creating ? 'Creating...' : 'Create a new room'}
                </button>
              </div>
            ) : (
              /* Idle state */
              <>
                <div className="text-sm text-[#666] dark:text-[#b0b0b0] flex flex-col gap-1">
                  <p>Create a private room and share the code with your opponent.</p>
                  <p>You will play as <span className="font-semibold text-[#e63946]">Red</span> and move first.</p>
                </div>
                {createError && <p className="text-sm text-[#e63946]">{createError}</p>}
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="btn-primary w-full justify-center"
                >
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </>
            )}
          </div>
        ) : (
          /* Join tab */
          <div className="card flex flex-col gap-5">
            <div className="text-sm text-[#666] dark:text-[#b0b0b0] flex flex-col gap-1">
              <p>Enter the 4-letter code your opponent shared with you.</p>
              <p>You will play as <span className="font-semibold">Black</span>.</p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase().slice(0, 4)); setJoinError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ABCD"
                maxLength={4}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase border border-[#e0e0e0] dark:border-[#333] rounded-xl bg-white dark:bg-[#111] focus:outline-none focus:border-[#f1a208] transition-colors"
              />
              {joinError && <p className="text-sm text-[#e63946] text-center">{joinError}</p>}
            </div>
            <button
              onClick={handleJoin}
              disabled={joining || joinCode.length < 4}
              className="btn-primary w-full justify-center"
            >
              {joining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[#999] dark:text-[#555] mt-6">
          Both players must be connected at the same time. Moves sync in real-time.
        </p>
      </div>
    </div>
  )
}
