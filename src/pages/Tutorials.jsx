import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle, Circle } from 'lucide-react'

const LESSONS = [
  {
    id: 1,
    title: 'Basic Movement',
    emoji: '♟️',
    duration: '5 min',
    steps: [
      {
        title: 'The Board',
        content: `Dama is played on an 8×8 board. Pieces only move on the **dark squares** — the board has 32 dark squares in total.

The board is oriented so each player has a dark square in the bottom-left corner of their side.`,
        visual: 'board_overview',
      },
      {
        title: 'Your Pieces',
        content: `**Red pieces** start at the bottom and move **upward**. **Black pieces** start at the top and move **downward**.

Each player starts with **12 pieces**, arranged on the dark squares of the first three rows on their side.`,
        visual: 'starting_position',
      },
      {
        title: 'How to Move',
        content: `Regular pieces move **diagonally forward only** — one square at a time.

Red pieces move toward row 1 (up the board). Black pieces move toward row 8 (down the board).

Click a piece to select it, then click a highlighted square to move there.`,
        visual: 'movement',
      },
      {
        title: 'Try It!',
        content: `You now know how regular pieces move. Head to a game and try moving your first piece.

**Tip**: When you select a piece, valid moves are shown as gold dots on the board.`,
        visual: 'cta',
        cta: { label: 'Play a Game', to: '/play?mode=ai' },
      },
    ],
  },
  {
    id: 2,
    title: 'Captures & Mandatory Captures',
    emoji: '⚔️',
    duration: '8 min',
    steps: [
      {
        title: 'Capturing',
        content: `To **capture** an opponent's piece, jump over it diagonally to the empty square beyond it.

The captured piece is removed from the board. Captures are how you win — reduce your opponent to zero pieces!`,
        visual: 'capture_basic',
      },
      {
        title: 'Mandatory Captures',
        content: `**Important rule**: if you can capture an opponent's piece, you **must** capture it — you cannot make a regular move instead.

If multiple captures are available, you must make one of them (you choose which).`,
        visual: 'mandatory_capture',
      },
      {
        title: 'Chain Captures',
        content: `After capturing, if your piece can capture another opponent piece immediately, you **continue the chain** in the same turn.

Chain captures (double, triple, or more) are powerful and exciting — look for them!`,
        visual: 'chain_capture',
      },
      {
        title: 'Practice!',
        content: `Look for capture opportunities every turn. Chain captures can swing a game dramatically.

**Tip**: Enable the **AI Coach** in-game to get hints when a capture opportunity is available.`,
        visual: 'cta',
        cta: { label: 'Try Daily Challenge', to: '/daily' },
      },
    ],
  },
  {
    id: 3,
    title: 'Kings & Strategy',
    emoji: '👑',
    duration: '10 min',
    steps: [
      {
        title: 'Becoming a King',
        content: `When your piece reaches the **last row** of the opponent's side, it becomes a **King** — marked with a crown.

Kings are far more powerful than regular pieces — they're a major advantage.`,
        visual: 'promotion',
      },
      {
        title: 'King Movement',
        content: `Kings can move **diagonally in all four directions** — forward and backward.

This makes them extremely flexible. A king in the center of the board can threaten pieces in all directions.`,
        visual: 'king_movement',
      },
      {
        title: 'Strategic Principles',
        content: `Three key ideas to improve your game:

1. **Control the center** — pieces in the center have more options
2. **Protect your pieces** — don't let them get captured for free
3. **Promote to king** — race to the back rank when safe`,
        visual: 'strategy',
      },
      {
        title: "You're Ready!",
        content: `You now understand all the fundamentals of Dama!

The best way to improve is to **play games and review them** with the AI Coach enabled. Good luck!`,
        visual: 'cta',
        cta: { label: 'Play vs AI', to: '/play?mode=ai' },
      },
    ],
  },
]

const VISUALS = {
  board_overview: () => (
    <div className="grid grid-cols-8 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-[#333] shadow-medium">
      {Array(64).fill(null).map((_, i) => {
        const row = Math.floor(i / 8), col = i % 8
        const dark = (row + col) % 2 === 1
        return <div key={i} className={`aspect-square ${dark ? 'bg-[#8b6f47]' : 'bg-[#e8d5c4]'}`} />
      })}
    </div>
  ),
  starting_position: () => (
    <div className="grid grid-cols-8 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-[#333] shadow-medium">
      {Array(64).fill(null).map((_, i) => {
        const row = Math.floor(i / 8), col = i % 8
        const dark = (row + col) % 2 === 1
        const hasBlack = dark && row < 3
        const hasRed = dark && row > 4
        return (
          <div key={i} className={`aspect-square flex items-center justify-center ${dark ? 'bg-[#8b6f47]' : 'bg-[#e8d5c4]'}`}>
            {hasBlack && <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#333] to-[#111] border border-[#555]" />}
            {hasRed && <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border border-[#d0253a]" />}
          </div>
        )
      })}
    </div>
  ),
  movement: () => (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-4 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-[#333] shadow-medium w-48">
        {Array(16).fill(null).map((_, i) => {
          const row = Math.floor(i / 4), col = i % 4
          const dark = (row + col) % 2 === 1
          const hasPiece = row === 2 && col === 1
          const isTarget = (row === 1 && col === 0) || (row === 1 && col === 2)
          return (
            <div key={i} className={`aspect-square flex items-center justify-center ${dark ? 'bg-[#8b6f47]' : 'bg-[#e8d5c4]'}`}>
              {hasPiece && <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#f1a208] shadow-lg" />}
              {isTarget && dark && <div className="w-[35%] h-[35%] rounded-full bg-[#f1a208]/70" />}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#999] dark:text-[#555] text-center">Selected piece (gold ring) with valid moves shown as gold dots</p>
    </div>
  ),
  capture_basic: () => (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-4 rounded-xl overflow-hidden border border-[#e0e0e0] dark:border-[#333] shadow-medium w-48">
        {Array(16).fill(null).map((_, i) => {
          const row = Math.floor(i / 4), col = i % 4
          const dark = (row + col) % 2 === 1
          const hasRed = row === 2 && col === 1
          const hasBlack = row === 1 && col === 2
          const isLanding = row === 0 && col === 3
          return (
            <div key={i} className={`aspect-square flex items-center justify-center ${dark ? 'bg-[#8b6f47]' : 'bg-[#e8d5c4]'}`}>
              {hasRed && <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border border-[#d0253a]" />}
              {hasBlack && <div className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#333] to-[#111] border border-[#555] opacity-60 ring-2 ring-[#e63946]" />}
              {isLanding && dark && <div className="w-[35%] h-[35%] rounded-full bg-[#f1a208]/70" />}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#999] dark:text-[#555] text-center">Jump over the black piece (ringed red) to land on the gold square</p>
    </div>
  ),
  promotion: () => (
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#d0253a] shadow-piece flex items-center justify-center">
        </div>
        <p className="text-xs text-[#999]">Regular</p>
      </div>
      <ChevronRight size={24} className="text-[#f1a208]" />
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#f1a208] shadow-piece flex items-center justify-center">
          <span className="text-xl">👑</span>
        </div>
        <p className="text-xs text-[#f1a208] font-semibold">King!</p>
      </div>
    </div>
  ),
  strategy: () => (
    <div className="grid grid-cols-3 gap-3 text-center">
      {[['🎯', 'Center Control', 'Pieces in the middle have more moves'], ['🛡️', 'Protect Pieces', 'Don\'t give free captures away'], ['👑', 'Race to King', 'Kings win endgames']].map(([e, t, d]) => (
        <div key={t} className="bg-[#f5f5f5] dark:bg-[#111] rounded-xl p-3">
          <p className="text-2xl mb-1">{e}</p>
          <p className="text-xs font-bold">{t}</p>
          <p className="text-[10px] text-[#999] dark:text-[#555] mt-1">{d}</p>
        </div>
      ))}
    </div>
  ),
  cta: () => null,
  mandatory_capture: () => (
    <div className="bg-[#fff5f5] dark:bg-[#1a0505] border border-[#e63946]/20 rounded-xl p-4 text-center">
      <p className="text-2xl mb-2">⚠️</p>
      <p className="font-bold text-sm text-[#e63946]">Captures are mandatory!</p>
      <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-1">If a capture is available, you must make it.</p>
    </div>
  ),
  chain_capture: () => (
    <div className="bg-[#f1a208]/5 border border-[#f1a208]/20 rounded-xl p-4 text-center">
      <p className="text-2xl mb-2">🔗</p>
      <p className="font-bold text-sm">Chain Captures</p>
      <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-1">Keep jumping until no more captures are available!</p>
    </div>
  ),
  king_movement: () => (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#f1a208] shadow-piece flex items-center justify-center text-xl">
        👑
      </div>
      <div className="grid grid-cols-3 gap-1 w-20 mt-2">
        {['↖', '', '↗', '', '♚', '', '↙', '', '↘'].map((s, i) => (
          <div key={i} className="aspect-square flex items-center justify-center text-lg text-[#f1a208] font-bold">{s}</div>
        ))}
      </div>
      <p className="text-xs text-[#999] dark:text-[#555]">Kings move in all 4 diagonal directions</p>
    </div>
  ),
}

export default function Tutorials() {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [step, setStep] = useState(0)

  if (selectedLesson !== null) {
    const lesson = LESSONS[selectedLesson]
    const currentStep = lesson.steps[step]
    const Visual = VISUALS[currentStep.visual]

    return (
      <div className="min-h-screen pt-[70px] animate-fade-in">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setSelectedLesson(null); setStep(0) }} className="btn-ghost gap-2 text-sm">
              <ArrowLeft size={15} />Lessons
            </button>
            <div className="flex-1 flex gap-1">
              {lesson.steps.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[#f1a208]' : 'bg-[#e0e0e0] dark:bg-[#333]'}`} />
              ))}
            </div>
            <span className="text-xs text-[#999] dark:text-[#555]">{step + 1}/{lesson.steps.length}</span>
          </div>

          <div className="card flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#f1a208] mb-2">{lesson.title}</p>
              <h2 className="text-2xl font-bold">{currentStep.title}</h2>
            </div>

            {/* Visual */}
            {Visual && (
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <Visual />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="text-[#666] dark:text-[#b0b0b0] leading-relaxed text-sm whitespace-pre-line">
              {currentStep.content.split('**').map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-[#1a1a1a] dark:text-white font-semibold">{part}</strong> : part
              )}
            </div>

            {/* CTA if last step */}
            {currentStep.cta && (
              <Link to={currentStep.cta.to} className="btn-primary justify-center gap-2">
                {currentStep.cta.label} <ChevronRight size={15} />
              </Link>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e0e0e0] dark:border-[#333]">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="btn-ghost gap-2 text-sm disabled:opacity-30"
              >
                <ChevronLeft size={15} />Previous
              </button>
              {step < lesson.steps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} className="btn-primary gap-2 py-2.5 text-sm">
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={() => { setSelectedLesson(null); setStep(0) }} className="btn-secondary gap-2 py-2.5 text-sm">
                  Finish <CheckCircle size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
          <div>
            <h1 className="text-2xl font-bold">Tutorials</h1>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0]">Learn Dama from the basics to advanced strategy</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {LESSONS.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => { setSelectedLesson(i); setStep(0) }}
              className="card text-left flex items-center gap-5 hover:border-[#f1a208] hover:shadow-medium transition-all duration-200 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#f1a208]/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-[#f1a208]/20 transition-colors">
                {lesson.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#999] dark:text-[#555]">Lesson {lesson.id}</span>
                  <span className="text-[10px] text-[#999] dark:text-[#555]">· {lesson.duration}</span>
                </div>
                <h3 className="font-bold text-lg group-hover:text-[#f1a208] transition-colors">{lesson.title}</h3>
                <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-0.5">{lesson.steps.length} steps</p>
              </div>
              <ChevronRight size={18} className="text-[#ccc] dark:text-[#444] group-hover:text-[#f1a208] transition-colors" />
            </button>
          ))}
        </div>

        <div className="mt-8 card bg-[#f1a208]/5 border-[#f1a208]/20 text-center">
          <p className="text-lg mb-2">Ready to play?</p>
          <p className="text-sm text-[#666] dark:text-[#b0b0b0] mb-4">Put your knowledge to the test!</p>
          <Link to="/play?mode=ai" className="btn-primary inline-flex justify-center gap-2">
            Play with AI Coach <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
