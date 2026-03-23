import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { EPISODES } from '../data/episodes'
import type { EpisodeInsights, Takeaway } from '../data/episodes'
import rawCache from '../data/takeaways.json'
import { trackEpisodeView, trackTimeOnPage } from '../lib/analytics'
import styles from './EpisodePage.module.css'

const CACHE = new Map(
  (rawCache.episodes as EpisodeInsights[]).map(e => [e.episodeId, e])
)

const FORMAT_LABEL: Record<string, string> = {
  'do-this':       '→ Do this',
  'remember-this': '★ Remember this',
  'real-example':  '◉ Real example',
  'ask-yourself':  '? Ask yourself',
  'avoid-this':    '✕ Avoid this',
}
const FORMAT_COLOR: Record<string, string> = {
  'do-this':       '#E8A030',
  'remember-this': '#60A5FA',
  'real-example':  '#34D399',
  'ask-yourself':  '#A78BFA',
  'avoid-this':    '#F87171',
}
const TYPE_ICON: Record<string, string> = {
  book: '📖', article: '📄', framework: '🧩', tool: '🛠️'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function EpisodePage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const episode  = EPISODES.find(e => e.id === Number(id))
  const enteredAt = useRef(Date.now())

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!episode) return
    trackEpisodeView(episode.id)
    enteredAt.current = Date.now()
    return () => {
      const secs = Math.round((Date.now() - enteredAt.current) / 1000)
      trackTimeOnPage(episode.id, secs)
    }
  }, [episode?.id])

  if (!episode) return (
    <div className={styles.notFound}>
      Episode not found.
      <button onClick={() => navigate('/')}>← Back to episodes</button>
    </div>
  )

  const insights = CACHE.get(episode.id)

  return (
    <div className={styles.page}>
      {/* Sticky nav */}
      <div className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to episodes
        </button>
        <div className={styles.navMeta}>Ep. {episode.id} · {fmtDate(episode.date)}</div>
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.guestRow}>
            <div className={styles.avatar}>{initials(episode.guest)}</div>
            <div>
              <div className={styles.guestName}>{episode.guest}</div>
              <div className={styles.guestRole}>{episode.role}</div>
            </div>
            {insights && (
              <div className={styles.bestFor}>
                {insights.bestFor.map(b => <span key={b} className={styles.bestTag}>{b}</span>)}
              </div>
            )}
          </div>
          <h1 className={styles.title}>{episode.title}</h1>
          <p className={styles.desc}>{episode.desc}</p>
          <div className={styles.tags}>
            {episode.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        </div>

        {insights ? (
          <div className={styles.insights}>
            {/* Pull quote */}
            <div className={styles.quoteBlock}>
              <div className={styles.quoteGlyph}>"</div>
              <blockquote className={styles.quote}>{insights.quote}</blockquote>
              <div className={styles.quoteAttr}>— {episode.guest}</div>
            </div>

            {/* Framework */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>🧠 <span>The framework</span></div>
              <div className={styles.frameworkBox}>{insights.framework}</div>
            </div>

            {/* Takeaways */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>💡 <span>5 ways to apply this</span></div>
              <div className={styles.takeaways}>
                {insights.takeaways.map((tw: Takeaway, i: number) => (
                  <div key={i} className={styles.takeaway}
                    style={{ borderLeftColor: FORMAT_COLOR[tw.format] }}>
                    <div className={styles.twHeader} style={{ color: FORMAT_COLOR[tw.format] }}>
                      {FORMAT_LABEL[tw.format]}
                    </div>
                    <div className={styles.twText}>{tw.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            {insights.resources?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHead}>📚 <span>Go deeper</span></div>
                <div className={styles.resources}>
                  {insights.resources.map((r, i) => (
                    <div key={i} className={styles.resource}>
                      <span>{TYPE_ICON[r.type] ?? '📌'}</span>
                      <span className={styles.resourceTitle}>{r.title}</span>
                      <span className={styles.resourceType}>{r.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noCache}>Insights not yet available for this episode.</div>
        )}

        {/* Listen CTA */}
        <div className={styles.cta}>
          <a href={episode.url} target="_blank" rel="noopener noreferrer" className={styles.listenBtn}>
            ▶ Listen to the full episode on Lenny's Podcast
          </a>
        </div>
      </div>
    </div>
  )
}
