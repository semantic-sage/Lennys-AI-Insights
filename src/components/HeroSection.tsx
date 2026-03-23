import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EPISODES } from '../data/episodes'
import type { EpisodeInsights } from '../data/episodes'
import rawCache from '../data/takeaways.json'
import { trackHeroConvert } from '../lib/analytics'
import styles from './HeroSection.module.css'

const CACHE = new Map(
  (rawCache.episodes as EpisodeInsights[]).map(e => [e.episodeId, e])
)

function getRandomMode(): 'A' | 'B' | 'C' {
  return (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)]
}
function getRandomEpisode(exclude?: number) {
  const pool = EPISODES.filter(e => e.id !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

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

const TAG_LABEL: Record<string, string> = {
  product: 'product thinking', growth: 'growth', startups: 'building a company',
  leadership: 'leadership', design: 'product design', strategy: 'strategy',
  pricing: 'pricing', PMF: 'product-market fit', culture: 'culture',
  metrics: 'metrics', research: 'user research', career: 'your PM career',
}

interface Props { onEpisodeSelect: (id: number) => void }

export default function HeroSection({ onEpisodeSelect }: Props) {
  const navigate  = useNavigate()
  const mode      = useMemo(getRandomMode, [])
  const episode   = useMemo(() => getRandomEpisode(), [])
  const episode2  = useMemo(() => getRandomEpisode(episode.id), [episode.id])
  const insights  = CACHE.get(episode.id)
  const insights2 = CACHE.get(episode2.id)

  function go(ep: typeof episode) {
    trackHeroConvert(mode, ep.id)
    navigate(`/episode/${ep.id}`)
  }

  const av = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2)

  if (!insights) return null

  // ── MODE A ────────────────────────────────────────────────────────────────
  if (mode === 'A') {
    const highlight = insights.takeaways[0]
    return (
      <div className={styles.hero}>
        <div className={styles.modeTag}>✦ Featured episode</div>
        <div className={styles.modeA}>
          <div className={styles.aLeft}>
            <div className={styles.guestLine}>
              <div className={styles.av}>{av(episode.guest)}</div>
              <div>
                <div className={styles.guestName}>{episode.guest}</div>
                <div className={styles.guestRole}>{episode.role}</div>
              </div>
            </div>
            <h2 className={styles.epTitle}>{episode.title}</h2>
            <div className={styles.frameworkBox}>
              <div className={styles.frameworkLabel}>🧠 The framework</div>
              <div className={styles.frameworkText}>{insights.framework}</div>
            </div>
          </div>
          <div className={styles.aRight}>
            <div className={styles.highlightCard}>
              <div className={styles.formatTag}
                style={{ color: FORMAT_COLOR[highlight.format], borderColor: FORMAT_COLOR[highlight.format] + '55' }}>
                {FORMAT_LABEL[highlight.format]}
              </div>
              <p className={styles.highlightText}>{highlight.text}</p>
              <button className={styles.ctaBtn} onClick={() => go(episode)}>
                See all 5 takeaways →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── MODE B — centered full-width quote ────────────────────────────────────
  if (mode === 'B') {
    return (
      <div className={styles.hero}>
        <div className={styles.modeTag}>✦ Insight of the day</div>
        <div className={styles.modeB}>
          <div className={styles.bQuoteMark}>"</div>
          <blockquote className={styles.bQuote}>{insights.quote}</blockquote>
          <div className={styles.bGuest}>
            <div className={styles.av}>{av(episode.guest)}</div>
            <div>
              <span className={styles.guestName}>{episode.guest}</span>
              <span className={styles.guestRole}> · {episode.role}</span>
            </div>
          </div>
          <div className={styles.bDivider} />
          <div className={styles.bBottom}>
            <div className={styles.fwPill}>
              <span className={styles.fwPillLabel}>Framework: </span>
              {insights.framework.split(':')[0]}
            </div>
            <button className={styles.modeBCta} onClick={() => go(episode)}>
              Get the full breakdown →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── MODE C — two-column split ─────────────────────────────────────────────
  const tag   = episode.tags[0]
  const micro = insights2?.takeaways.find(t => t.format === 'remember-this') ?? insights2?.takeaways[1]

  return (
    <div className={styles.hero}>
      <div className={styles.modeTag}>✦ Start here</div>
      <div className={styles.modeC}>

        {/* Primary recommendation */}
        <div className={styles.cMain} onClick={() => go(episode)}>
          <div className={styles.cBadge}>Best for {TAG_LABEL[tag] ?? tag}</div>
          <div className={styles.cReason}>
            If you're thinking about <em>{TAG_LABEL[tag] ?? tag}</em> right now — this is the sharpest episode to start with.
          </div>
          <div className={styles.cEpRow}>
            <div className={styles.av}>{av(episode.guest)}</div>
            <div>
              <div className={styles.cEpTitle}>{episode.title}</div>
              <div className={styles.guestRole}>{episode.guest} · {episode.role}</div>
            </div>
          </div>
          <div className={styles.cMicro}>
            <div className={styles.cMicroLabel}>The one thing to take away</div>
            <div className={styles.cMicroText}>
              {insights.takeaways.find(t => t.format === 'remember-this')?.text}
            </div>
          </div>
          <div className={styles.cCta}>See all 5 takeaways →</div>
        </div>

        {/* Secondary episode */}
        {insights2 && micro && (
          <div className={styles.cSecondary} onClick={() => { trackHeroConvert(mode, episode2.id); navigate(`/episode/${episode2.id}`) }}>
            <div className={styles.cSecondaryLabel}>Also worth your time</div>
            <div className={styles.cEpRow} style={{ marginTop: '4px' }}>
              <div className={styles.av} style={{ width: '30px', height: '30px', fontSize: '10px' }}>
                {av(episode2.guest)}
              </div>
              <div className={styles.cEpTitle} style={{ fontSize: '15px' }}>{episode2.title}</div>
            </div>
            <div className={styles.cMicroText} style={{ fontSize: '12.5px', marginTop: '4px' }}>
              {micro.text.slice(0, 120)}…
            </div>
            <div className={styles.cCta} style={{ marginTop: 'auto' }}>Explore episode →</div>
          </div>
        )}
      </div>
    </div>
  )
}
