import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

export default function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const pageNames: Record<string, string> = {
    '/': 'Home',
    '/episodes': 'All Episodes',
    '/dashboard': 'Analytics',
  }
  const isEpisodePage = location.pathname.startsWith('/episode/')
  const currentPage = isEpisodePage
    ? 'Episode'
    : pageNames[location.pathname] ?? ''

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.avatar}>SA</div>
        <button className={styles.nameBtn} onClick={() => navigate('/')}>
          Sri Adidam
        </button>
        <span className={styles.sep}>·</span>
        <span className={styles.sub}>Lenny's Podcast — AI Insights</span>
      </div>
      <div className={styles.right}>
        {currentPage && (
          <span className={styles.currentPage}>{currentPage}</span>
        )}
        {location.pathname !== '/' && (
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            ← Home
          </button>
        )}
      </div>
    </div>
  )
}
