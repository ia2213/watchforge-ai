import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Gallery() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setDesigns(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-serif text-gold-400 mb-8">Galerie des créations</h2>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : designs.length === 0 ? (
        <p className="text-gray-500">Aucun design sauvegardé pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map(d => (
            <div
              key={d.id}
              onClick={() => navigate('/designer', { state: { prompt: d.prompt } })}
              className="bg-[#111] border border-gray-800 hover:border-gold-600/50 rounded-xl p-5 cursor-pointer transition"
            >
              <p className="text-sm text-white mb-2 line-clamp-2">{d.prompt}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gold-500 capitalize">{d.result?.complexity?.replace('_', ' ')}</span>
                <span className="text-xs text-gray-600">{d.result?.complications?.length} complications</span>
              </div>
              <p className="text-xs text-gray-700 mt-2">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
