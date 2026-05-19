# DAMA ♟️ — Elegant Checkers Platform

> Classic checkers reimagined for the modern player. AI coaching, real-time multiplayer, global leaderboard, and daily challenges — all in one platform.

**Live:** [myproject-blond-six.vercel.app](https://myproject-blond-six.vercel.app)

---

## What is DAMA?

DAMA is not just a checkers board. It is a full gaming platform built to keep players coming back — through progression, competition, and intelligent coaching.

Most checkers sites are stuck in 2010. DAMA brings the experience up to modern standards: clean design, real AI feedback, online multiplayer with invite links, and a global leaderboard backed by a real database.

---

## Features

### 🤖 AI Opponents — 5 Levels of Difficulty
Play against five unique AI characters, each with a distinct personality and skill level:
- **Mira** — friendly beginner, great for learning
- **Rashid** — casual player, unpredictable moves
- **Leo** — aggressive mid-level opponent
- **Nika** — strategic and calculated
- **Viktor** — near-unbeatable grandmaster

The AI engine uses minimax with alpha-beta pruning, evaluating piece count, king value, positional advantage, and capture chains.

### 🧠 AI Coach — Powered by Claude
The in-game AI Coach uses the **Claude Sonnet API** (Anthropic) to give real, context-aware hints during play.

Three hint levels:
- **Vague** — general strategic tip without revealing moves
- **Direction** — tells you which piece to move and why
- **Exact** — shows the best move with full explanation

The coach sees the actual board state in real time and generates advice specific to the current position — not keyword matching, not pre-written templates.

### 🔍 Post-Game Analysis — Claude Reviews Your Game
After every game, Claude analyzes your actual move history and gives personalized feedback:
- What you did well
- Missed captures or tactical errors
- Specific move numbers referenced
- Encouragement with honest critique

### 🌐 Online Multiplayer — Play Anywhere
Real-time online multiplayer via **Supabase Realtime** (WebSockets):
- Create a room and get a 4-letter code
- Share an invite link — opponent opens it on any device, anywhere
- Moves sync instantly between players
- 3-minute room expiry timer if opponent does not join
- Host can cancel and leave at any time

No same-device limitation. Works across different browsers, devices, and networks.

### 🏆 Global Leaderboard — Real Database
The leaderboard pulls live data from **Supabase**:
- All registered players ranked by ELO rating
- Gold, silver, bronze medals for top 3
- Your own row highlighted in yellow
- Updates automatically after every game
- Win rate, total wins, and level displayed

### 📅 Daily Challenge
A new tactical puzzle every 24 hours:
- Three difficulty tiers: Easy (+20 XP), Medium (+50 XP), Hard (+100 XP)
- Maintains your daily streak
- Resets every 24 hours

### 👤 Authentication — Supabase Auth
Full user authentication with email confirmation:
- Sign up with username and email
- Email verification required before login
- Profile saved to Supabase database
- Progress, XP, ELO, and achievements persist across sessions and devices
- Sign in on any device and your stats are there

### 📈 Progression System
- **XP and Levels** — earn XP for every game, level up over time
- **ELO Rating** — dynamic rating that adjusts based on opponent difficulty and outcome
- **Win Streak** — tracked and displayed
- **Daily Streak** — play every day to maintain your streak
- **15 Achievements** — unlock for milestones like first win, triple capture, defeating Viktor

### ⚡ Game Modes
- **vs AI** — pick difficulty and AI character
- **Play Online** — real-time multiplayer via invite link or room code
- **Daily Challenge** — new puzzle every 24 hours
- **Blitz 3m / Rapid 10m** — timed games with per-player countdown

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (WebSockets) |
| AI Coach | Anthropic Claude Sonnet API |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Local Setup

```bash
git clone https://github.com/alimanurgaliyeva-max/myproject.git
cd myproject
npm install
cp .env.example .env
npm run start
```

**.env variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-claude-api-key
```

---

## Why DAMA stands out

Other checkers sites give you a board and nothing else. DAMA gives you:

**Retention** — daily challenges, streaks, XP, and leaderboard give players reasons to come back every day.

**Intelligence** — the AI coach powered by Claude does not just say "make a good move." It reads the actual board, understands the position, and explains its reasoning in plain language.

**Competition** — the global leaderboard means your ELO matters. Every game against Viktor is a real challenge.

**Social** — invite a friend with one link. No accounts needed for the opponent. Room is ready in seconds.

---

## What's next

- [ ] Stripe integration for cosmetic piece skins (monetization)
- [ ] Tournament mode — bracket-style competition
- [ ] Mobile app (React Native)
- [ ] Spectator mode for ongoing games

---

Built for nFactorial School Checkers Challenge · May 2026
