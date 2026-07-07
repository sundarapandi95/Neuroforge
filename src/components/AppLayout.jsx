import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import IncidentBanner from './IncidentBanner.jsx'
import NeuroBotWidget from './NeuroBotWidget.jsx'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <IncidentBanner />
      <main className="app-content">
        <Outlet />
      </main>
      <NeuroBotWidget />
    </div>
  )
}