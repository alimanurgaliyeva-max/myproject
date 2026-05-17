import GameHistory from '../components/GameHistory'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function History() {
  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm">
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Match History</h1>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-0.5">Your complete game record</p>
          </div>
        </div>
        <GameHistory />
      </div>
    </div>
  )
}
