import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Designer from './pages/Designer'
import Gallery from './pages/Gallery'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/designer" element={<Designer />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </div>
  )
}
