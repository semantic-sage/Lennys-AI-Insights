import { Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import PortfolioSidebar from './components/PortfolioSidebar'
import HomePage from './pages/HomePage'
import EpisodesPage from './pages/EpisodesPage'
import EpisodePage from './pages/EpisodePage'
import DashboardPage from './pages/DashboardPage'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.root}>
      <Topbar />
      <div className={styles.body}>
        <div className={styles.left}>
          <PortfolioSidebar />
        </div>
        <div className={styles.center}>
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/episodes"    element={<EpisodesPage />} />
            <Route path="/episode/:id" element={<EpisodePage />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
