import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEARNING_PATHS } from '../data/episodes'
import HeroSection from '../components/HeroSection'
import { trackPageView } from '../lib/analytics'
import styles from './HomePage.module.css'

function getRandomMode(): 'A' | 'B' | 'C' {
  return (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)]
}

export default function HomePage() {
  const navigate = useNavigate()
  const heroMode = useMemo(getRandomMode, [])
  const [search, setSearch] = useState('')

  useEffect(() => { trackPageView(heroMode) }, [heroMode])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate('/episodes', { state: { search: search.trim() } })
    }
  }

  function handlePath(label: string) {
    navigate('/episodes', { state: { path: label } })
  }

  function handleBrowseAll() {
    navigate('/episodes', { state: {} })
  }

  return (
    <div className={styles.page}>
      <HeroSection onEpisodeSelect={id => navigate(`/episode/${id}`)} />

      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search episodes, guests, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="submit" className={styles.searchBtn}>Search →</button>
          )}
        </form>
      </div>

      <div className={styles.pathsSection}>
        <div className={styles.pathsLabel}>Or choose what you want to learn</div>
        <div className={styles.pathGrid}>
          {LEARNING_PATHS.map(p => (
            <button
              key={p.label}
              className={styles.pathCard}
              onClick={() => handlePath(p.label)}
            >
              <span className={styles.pathIcon}>{p.icon}</span>
              <div className={styles.pathText}>
                <div className={styles.pathName}>{p.label}</div>
                <div className={styles.pathSub}>{p.sub}</div>
              </div>
              <span className={styles.pathArrow}>→</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.browseAll}>
        <button className={styles.browseBtn} onClick={handleBrowseAll}>
          Browse all 22 episodes →
        </button>
      </div>
    </div>
  )
}
