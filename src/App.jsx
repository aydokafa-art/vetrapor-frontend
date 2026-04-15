import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Breeds from './pages/Breeds'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Admin from './pages/Admin'
import VakaBul from './pages/VakaBul'
import FluidCalc from './pages/FluidCalc'
import MakaleAra from './pages/MakaleAra'
import DozHesap from './pages/DozHesap'
import Giris from './pages/Giris'
import Kayit from './pages/Kayit'
import Kurumlar from './pages/Kurumlar'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/giris" element={<Giris />} />
      <Route path="/kayit" element={<Kayit />} />
      <Route path="/kurumlar" element={<Kurumlar />} />
      <Route path="/vaka-bul" element={<VakaBul />} />
      <Route path="/sivi-hesap" element={<FluidCalc />} />
      <Route path="/doz-hesap" element={<DozHesap />} />
      <Route path="/makale-ara" element={<MakaleAra />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/vaka/:id" element={<CaseDetail />} />
      <Route path="/:animalType" element={<Breeds />} />
      <Route path="/:animalType/:breed" element={<Cases />} />
    </Routes>
  )
}

export default App
