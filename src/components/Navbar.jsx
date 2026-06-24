import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="border-b border-gold-600/30 px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-gold-400 font-serif text-xl tracking-widest">⚙ WATCHFORGE AI</Link>
      <div className="flex gap-6 text-sm text-gray-400">
        <Link to="/" className="hover:text-gold-400 transition">Accueil</Link>
        <Link to="/designer" className="hover:text-gold-400 transition">Designer</Link>
        <Link to="/gallery" className="hover:text-gold-400 transition">Galerie</Link>
      </div>
    </nav>
  )
}
