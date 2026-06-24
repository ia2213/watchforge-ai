import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MovementCanvas from '../components/MovementCanvas'
import { generateMovement } from '../lib/groq'
import { supabase } from '../lib/supabase'

const COMPLEXITY_LABELS = {
  simple: { label: 'Simple', color: 'text-green-400' },
  elaborate: { label: 'Élaborée', color: 'text-blue-400' },
  grande_complication: { label: 'Grande Complication', color: 'text-purple-400' },
  ultra_complication: { label: 'Ultra-Complication', color: 'text-red-400 animate-pulse' },
}

const PHASE_COLORS = {
  'Conception': 'bg-purple-900/40 border-purple-700',
  'Usinage': 'bg-blue-900/40 border-blue-700',
  'Assemblage': 'bg-green-900/40 border-green-700',
  'Réglage': 'bg-yellow-900/40 border-yellow-700',
  'Contrôle': 'bg-red-900/40 border-red-700',
}

const DIFFICULTE_COLORS = {
  'Débutant': 'text-green-400',
  'Intermédiaire': 'text-blue-400',
  'Expert': 'text-orange-400',
  'Maître': 'text-red-400',
}

export default function Designer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState(location.state?.prompt || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('mouvement')

  useEffect(() => {
    if (location.state?.prompt) handleGenerate(location.state.prompt)
  }, [])

  const handleGenerate = async (p = prompt) => {
    if (!p.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    setActiveTab('mouvement')
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
    const { error } = await supabase.from('designs').insert({ prompt, result, created_at: new Date().toISOString() })
    if (!error) setSaved(true)
  }

  const cx = COMPLEXITY_LABELS[result?.complexite] || COMPLEXITY_LABELS.simple

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Prompt bar */}
      <div className="flex gap-3 mb-8">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="Décris ton mouvement de montre..."
          className="flex-1 bg-[#111] border border-gold-600/40 rounded-lg px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black font-bold px-8 rounded-lg transition tracking-widest text-sm"
        >
          {loading ? '...' : 'GÉNÉRER'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <svg viewBox="0 0 100 100" className="w-20 h-20 animate-spin-slow text-gold-400">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 4" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          <p className="text-gray-500 tracking-widest text-sm">Le maître horloger conçoit votre mouvement...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 text-sm">Erreur : {error}</div>
      )}

      {result && (
        <div>
          {/* Header stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Complexité</p>
              <p className={`text-xl font-serif ${cx.color}`}>{cx.label}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Composants</p>
              <p className="text-xl text-gold-400 font-serif">{result.composants_total?.toLocaleString()}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Complications</p>
              <p className="text-xl text-white font-serif">{result.complications?.length}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Coût estimé</p>
              <p className="text-xl text-gold-400 font-serif">{result.cout_estime_eur ? `${result.cout_estime_eur.toLocaleString()} €` : '—'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#111] rounded-lg p-1 w-fit">
            {[['mouvement', '⚙ Mouvement'], ['specs', '📐 Specs'], ['guide', '📋 Guide A→Z'], ['materiaux', '🔧 Matériaux']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-md text-sm transition ${
                  activeTab === id ? 'bg-gold-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Mouvement */}
          {activeTab === 'mouvement' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MovementCanvas complications={result.complications} />
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">Calibre</p>
                  <p className="text-lg text-white font-serif">{result.mouvement?.type}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Diamètre', result.mouvement?.diametre_mm ? `${result.mouvement.diametre_mm} mm` : '—'],
                    ['Hauteur', result.mouvement?.hauteur_mm ? `${result.mouvement.hauteur_mm} mm` : '—'],
                    ['Fréquence', result.mouvement?.frequence_bph ? `${result.mouvement.frequence_bph} A/h` : '—'],
                    ['Réserve', result.mouvement?.reserve_marche_h ? `${result.mouvement.reserve_marche_h}h` : '—'],
                    ['Rubis', result.mouvement?.nombre_rubis || '—'],
                    ['Finitions', result.mouvement?.finition || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#111] rounded-lg p-3">
                      <p className="text-xs text-gray-600">{k}</p>
                      <p className="text-sm text-white mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-600 tracking-widest uppercase mb-2">Complications ({result.complications?.length})</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {result.complications?.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 bg-[#111] rounded-lg p-3">
                        <span className="text-base">{getIcon(c.type)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm text-white font-medium">{c.nom_fr || c.type?.replace(/_/g, ' ')}</p>
                            <span className="text-xs text-gray-600">{c.nombre_pieces} pcs</span>
                          </div>
                          {c.variante && <p className="text-xs text-gray-500">{c.variante}</p>}
                          {c.description_technique && <p className="text-xs text-gray-600 mt-1">{c.description_technique}</p>}
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
                {result.notes_horloger && (
                  <div className="bg-[#111] rounded-lg p-4 border-l-2 border-gold-600">
                    <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">Notes du maître horloger</p>
                    <p className="text-sm text-gray-400 italic">{result.notes_horloger}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saved} className="flex-1 border border-gold-600/50 hover:border-gold-400 text-gold-400 py-2 rounded-lg text-sm transition disabled:opacity-50">
                    {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
                  </button>
                  <button onClick={() => navigate('/gallery')} className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-400 py-2 rounded-lg text-sm transition">
                    Galerie
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Specs */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h3 className="text-gold-400 font-serif text-lg mb-4">Calibre — {result.mouvement?.type}</h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-800">
                    {[
                      ['Type', result.mouvement?.type],
                      ['Diamètre', `${result.mouvement?.diametre_mm} mm`],
                      ['Hauteur totale', `${result.mouvement?.hauteur_mm} mm`],
                      ['Fréquence', `${result.mouvement?.frequence_bph} alternances/h`],
                      ['Réserve de marche', `${result.mouvement?.reserve_marche_h} heures`],
                      ['Nombre de rubis', result.mouvement?.nombre_rubis],
                      ['Finitions', result.mouvement?.finition],
                      ['Nombre de complications', result.complications?.length],
                      ['Total pièces', result.composants_total?.toLocaleString()],
                      ['Coût de fabrication', result.cout_estime_eur ? `${result.cout_estime_eur.toLocaleString()} €` : '—'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className="py-2 text-gray-500 pr-4">{k}</td>
                        <td className="py-2 text-white">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                {result.complications?.map((c, i) => (
                  <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-medium">{getIcon(c.type)} {c.nom_fr}</p>
                      <span className="text-xs text-gold-500">{c.nombre_pieces} pièces</span>
                    </div>
                    <p className="text-xs text-gray-400">{c.description_technique}</p>
                    <p className="text-xs text-gray-600 mt-1">Position : {c.position} · Variante : {c.variante || 'standard'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Guide A→Z */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm mb-6">Guide complet de fabrication — {result.guide_fabrication?.length} étapes</p>
              {result.guide_fabrication?.map((etape, i) => {
                const phaseClass = PHASE_COLORS[etape.phase] || 'bg-gray-900/40 border-gray-700'
                const diffClass = DIFFICULTE_COLORS[etape.niveau_difficulte] || 'text-gray-400'
                return (
                  <div key={i} className={`border rounded-xl p-5 ${phaseClass}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gold-400 font-serif text-2xl font-bold w-8">{etape.etape}</span>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-widest">{etape.phase}</span>
                          <h4 className="text-white font-medium">{etape.titre}</h4>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-medium ${diffClass}`}>{etape.niveau_difficulte}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{etape.duree_estimee}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{etape.description}</p>
                    {etape.outils?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Outils nécessaires :</p>
                        <div className="flex flex-wrap gap-1">
                          {etape.outils.map(o => (
                            <span key={o} className="text-xs bg-black/40 text-gray-400 px-2 py-0.5 rounded">{o}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab: Matériaux */}
          {activeTab === 'materiaux' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h3 className="text-gold-400 font-serif text-lg mb-4">Matériaux du mouvement</h3>
                <div className="space-y-3">
                  {result.materiaux && Object.entries(result.materiaux).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start border-b border-gray-800 pb-3">
                      <p className="text-gray-500 text-sm capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="text-white text-sm text-right ml-4">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h3 className="text-gold-400 font-serif text-lg mb-4">Notes du maître horloger</h3>
                <p className="text-gray-400 text-sm leading-relaxed italic">{result.notes_horloger}</p>
                <div className="mt-6">
                  <p className="text-xs text-gray-600 tracking-widest uppercase mb-3">Montres de référence</p>
                  {result.inspirations?.map(ins => (
                    <div key={ins} className="flex items-center gap-2 py-2 border-b border-gray-800">
                      <span className="text-gold-500 text-xs">◆</span>
                      <span className="text-gray-300 text-sm">{ins}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

function getIcon(type) {
  const icons = {
    tourbillon: '🌀', tourbillon_volant: '🌀', tourbillon_double_axe: '🌀', tourbillon_triple_axe: '🌀',
    repetition_minutes: '🔔', repetition_quarts: '🔔', grande_sonnerie: '🎵', carillon_westminster: '🎶',
    chronographe: '⏱', chronographe_flyback: '⏱', chronographe_rattrapante: '⏱',
    calendrier_perpetuel: '📅', calendrier_annuel: '📅', calendrier_islamique: '📅', calendrier_hebreu: '📅',
    phase_de_lune: '🌙', phase_de_lune_triple: '🌙', carte_du_ciel: '✨', heure_siderale: '⭐',
    equation_du_temps: '☀️', gmt_seconde_fuseau: '🌍', heure_universelle: '🗺',
    reserve_de_marche: '🔋', secondes_mortes: '⏸', automate: '🤖', jacquemart: '🏛',
    echappement_visible: '⚙️', barillet_visible: '🔩', affichage_heures_minutes: '🕐', affichage_secondes: '⏰',
  }
  return icons[type] || '⚙️'
}
