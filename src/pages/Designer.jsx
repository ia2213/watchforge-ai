import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MovementCanvas from '../components/MovementCanvas'
import { generateMovement } from '../lib/groq'
import { supabase } from '../lib/supabase'

export default function Designer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState(location.state?.prompt || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (location.state?.prompt) {
      handleGenerate(location.state.prompt)
    }
  }, [])

  const handleGenerate = async (p = prompt) => {
    if (!p.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    try {
      const data = await generateMovement(p)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    const { error } = await supabase.from('designs').insert({
      prompt,
      result,
      created_at: new Date().toISOString(),
    })
    if (!error) setSaved(true)
  }

  const COMPLEXITY_COLORS = {
    simple: 'text-green-400',
    elaborate: 'text-blue-400',
    grande_complication: 'text-purple-400',
    ultra_complication: 'text-red-400 animate-pulse',
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex gap-3 mb-8">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="Décris ta montre..."
          className="flex-1 bg-[#111] border border-gold-600/40 rounded-lg px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black font-bold px-6 rounded-lg transition tracking-widest text-sm"
        >
          {loading ? '...' : 'GÉNÉRER'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <svg viewBox="0 0 100 100" className="w-20 h-20 animate-spin-slow text-gold-400">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 4" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          <p className="text-gray-500 tracking-widest text-sm">Conception du mouvement en cours...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 text-sm">
          Erreur : {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MovementCanvas complications={result.complications} />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Complexité</p>
              <p className={`text-2xl font-serif capitalize ${COMPLEXITY_COLORS[result.complexity] || 'text-white'}`}>
                {result.complexity?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Composants estimés</p>
              <p className="text-3xl text-gold-400 font-serif">{result.estimatedComponents?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">Complications ({result.complications?.length})</p>
              <div className="space-y-2">
                {result.complications?.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#111] rounded-lg p-3">
                    <span className="text-lg">{getIcon(c.type)}</span>
                    <div>
                      <p className="text-sm text-white font-medium capitalize">{c.type?.replace(/_/g, ' ')}</p>
                      {c.variant && <p className="text-xs text-gray-500">{c.variant}</p>}
                      {c.description && <p className="text-xs text-gray-600 mt-1">{c.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {result.inspirations?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">Inspirations</p>
                <div className="flex flex-wrap gap-2">
                  {result.inspirations.map(ins => (
                    <span key={ins} className="text-xs border border-gray-700 text-gray-400 px-3 py-1 rounded-full">{ins}</span>
                  ))}
                </div>
              </div>
            )}
            {result.notes && (
              <div>
                <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Notes de l'horloger</p>
                <p className="text-sm text-gray-400 italic">{result.notes}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className="flex-1 border border-gold-600/50 hover:border-gold-400 text-gold-400 py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-400 py-2 rounded-lg text-sm transition"
              >
                Voir la galerie
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function getIcon(type) {
  const icons = {
    tourbillon: '🌀', minute_repeater: '🔔', chronograph: '⏱', perpetual_calendar: '📅',
    moon_phase: '🌙', equation_of_time: '☀️', gmt: '🌍', power_reserve: '🔋',
    sky_chart: '✨', automata: '🤖', grande_sonnerie: '🎵', world_time: '🗺',
  }
  return icons[type] || '⚙️'
}
