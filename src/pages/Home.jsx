import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EXAMPLES = [
  'Tourbillon volant avec répétition minutes',
  'Grande complication style Patek Philippe',
  'Montre astronomique avec carte du ciel',
  'Ultra-complication avec toutes les complications possibles',
  'Calendrier perpétuel, chronographe rattrapante, équation du temps',
  'Tourbillon tri-axe, grande sonnerie Westminster, quantième perpétuel',
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const handleGenerate = () => {
    if (!prompt.trim()) return
    navigate('/designer', { state: { prompt } })
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif text-gold-400 text-center mb-4 tracking-tight">
        WatchForge AI
      </h1>
      <p className="text-center text-gray-400 mb-12 text-lg">
        Décris ta montre de rêve. L'IA conçoit le mouvement.
      </p>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
          placeholder="Ex: Une montre avec tourbillon volant, répétition minutes, calendrier perpétuel et phase de lune..."
          rows={4}
          className="w-full bg-[#111] border border-gold-600/40 rounded-lg px-5 py-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gold-400 transition text-base"
        />
        <button
          onClick={handleGenerate}
          className="mt-4 w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 rounded-lg transition tracking-widest text-sm"
        >
          GÉNÉRER LE MOUVEMENT
        </button>
      </div>

      <div className="mt-10">
        <p className="text-xs text-gray-600 mb-3 tracking-widest uppercase">Exemples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-xs border border-gray-700 text-gray-400 hover:border-gold-500 hover:text-gold-400 px-3 py-1.5 rounded-full transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
