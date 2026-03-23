import { useNavigate, useLocation } from 'react-router-dom'
import styles from './PortfolioSidebar.module.css'

export default function PortfolioSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path
  }

  return (
    <div className={styles.sidebar}>

      <div className={styles.identity}>
        <div className={styles.avatar}>SA</div>
        <div className={styles.name}>Sri Adidam</div>
        <div className={styles.tagline}>Product · AI · Builder</div>
        <div className={styles.links}>
          <a href="https://linkedin.com/in/sriadidam" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn ↗</a>
          <a href="https://github.com/semantic-sage" target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub ↗</a>
        </div>
      </div>

      <div className={styles.rule} />

      {/* Nav links */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navLink} ${isActive('/') ? styles.navActive : ''}`}
          onClick={() => navigate('/')}
        >
          🏠 Home
        </button>
        <button
          className={`${styles.navLink} ${isActive('/episodes') ? styles.navActive : ''}`}
          onClick={() => navigate('/episodes')}
        >
          📋 All episodes
        </button>
        <button
          className={`${styles.navLink} ${isActive('/dashboard') ? styles.navActive : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          📊 Analytics
        </button>
      </nav>

      <div className={styles.rule} />

      <div className={styles.section}>
        <div className={styles.label}>This project</div>
        <p className={styles.text}>
          I'm a heavy Lenny listener who kept losing track of the right episode for the right moment.
          This tool navigates by <em>intent</em> — what you're trying to learn — and surfaces AI-extracted insights from each episode.
        </p>
      </div>

      <div className={styles.rule} />

      <div className={styles.section}>
        <div className={styles.label}>Who is Lenny?</div>
        <p className={styles.text}>
          Former Airbnb PM turned writer and podcaster. 500+ episodes of deep-dives with the world's top operators on product, growth, and startups.
        </p>
      </div>

      <div className={styles.rule} />

      <div className={styles.section}>
        <div className={styles.label}>What's extracted per episode</div>
        <div className={styles.insightTypes}>
          {[
            { icon: '💬', label: 'Best quote',    desc: "Guest's sharpest line" },
            { icon: '🧠', label: 'Framework',     desc: 'The core mental model' },
            { icon: '💡', label: '5 takeaways',   desc: 'Rotating actionable formats' },
            { icon: '📚', label: 'Resources',     desc: 'Books, tools, articles' },
          ].map(i => (
            <div key={i.label} className={styles.insightRow}>
              <span className={styles.insightIcon}>{i.icon}</span>
              <div>
                <div className={styles.insightLabel}>{i.label}</div>
                <div className={styles.insightDesc}>{i.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rule} />

      <div className={styles.section}>
        <div className={styles.label}>Built with</div>
        <div className={styles.stackPills}>
          {['React 18', 'TypeScript', 'Vite', 'Claude API', 'Supabase', 'GitHub Pages'].map(t => (
            <span key={t} className={styles.stackPill}>{t}</span>
          ))}
        </div>
      </div>

    </div>
  )
}
