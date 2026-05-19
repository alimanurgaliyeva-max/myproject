import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else {
        if (!username.trim()) { setError('Username is required'); setLoading(false); return }
        await signUp(email, password, username.trim())
      }
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#111] border border-[#e0e0e0] dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex gap-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-lg p-1">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-[#222] text-[#1a1a1a] dark:text-white shadow-sm'
                  : 'text-[#666] dark:text-[#888]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError('') }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'signup'
                  ? 'bg-white dark:bg-[#222] text-[#1a1a1a] dark:text-white shadow-sm'
                  : 'text-[#666] dark:text-[#888]'
              }`}
            >
              Sign Up
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-[#1a1a1a] dark:text-[#888] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666] dark:text-[#888] uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#0d0d0d] text-[#1a1a1a] dark:text-white text-sm placeholder:text-[#bbb] dark:placeholder:text-[#555] outline-none focus:border-[#f1a208] transition-colors"
            />
          </div>

          {tab === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#666] dark:text-[#888] uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Player123"
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#0d0d0d] text-[#1a1a1a] dark:text-white text-sm placeholder:text-[#bbb] dark:placeholder:text-[#555] outline-none focus:border-[#f1a208] transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666] dark:text-[#888] uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#0d0d0d] text-[#1a1a1a] dark:text-white text-sm placeholder:text-[#bbb] dark:placeholder:text-[#555] outline-none focus:border-[#f1a208] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#f1a208] hover:bg-[#d98f07] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
