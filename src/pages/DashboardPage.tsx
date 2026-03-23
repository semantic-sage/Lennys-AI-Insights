import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { queryEvents, supabaseReady } from '../lib/supabase'
import type { EventRow } from '../lib/supabase'
import { EPISODES } from '../data/episodes'
import styles from './DashboardPage.module.css'

type Window = 'today' | '7d' | 'all'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function fmtNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [window, setWindow] = useState<Window>('7d')
  const [events, setEvents] = useState<EventRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }
    setLoading(true)
    const since = window === 'today' ? daysAgo(0) : window === '7d' ? daysAgo(7) : '2020-01-01T00:00:00Z'
    queryEvents(`created_at=gte.${since}&order=created_at.desc&limit=5000`)
      .then(rows => { setEvents(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }, [window])

  // ── Derived metrics ────────────────────────────────────────────────────────
  const pageViews     = events?.filter(e => e.event_type === 'page_view').length ?? 0
  const uniqueSessions = new Set(events?.filter(e => e.event_type === 'page_view').map(e => e.session_id)).size
  const episodeClicks = events?.filter(e => e.event_type === 'episode_click') ?? []
  const heroConverts  = events?.filter(e => e.event_type === 'hero_convert') ?? []
  const timeEvents    = events?.filter(e => e.event_type === 'time_on_page') ?? []

  // Top episodes by clicks
  const clicksByEp = episodeClicks.reduce((acc, e) => {
    if (e.episode_id) acc[e.episode_id] = (acc[e.episode_id] ?? 0) + 1
    return acc
  }, {} as Record<number, number>)
  const topEpisodes = Object.entries(clicksByEp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([id, count]) => ({ ep: EPISODES.find(e => e.id === Number(id)), count }))
    .filter(x => x.ep)
  const maxClicks = topEpisodes[0]?.count ?? 1

  // Hero mode stats
  const modeStats = (['A', 'B', 'C'] as const).map(m => {
    const views = events?.filter(e => e.event_type === 'page_view' && e.hero_mode === m).length ?? 0
    const converts = heroConverts.filter(e => e.hero_mode === m).length
    return { mode: m, views, converts, rate: views ? Math.round((converts / views) * 100) : 0 }
  })

  // Avg time on page per episode
  const timeByEp = timeEvents.reduce((acc, e) => {
    if (e.episode_id && e.time_on_page) {
      if (!acc[e.episode_id]) acc[e.episode_id] = []
      acc[e.episode_id].push(e.time_on_page)
    }
    return acc
  }, {} as Record<number, number[]>)
  const avgTimes = Object.entries(timeByEp)
    .map(([id, times]) => ({
      ep: EPISODES.find(e => e.id === Number(id)),
      avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    }))
    .filter(x => x.ep)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  // Daily sparkline (last 14 days)
  const spark = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const ds = d.toISOString().slice(0, 10)
    return { day: ds, count: events?.filter(e => e.event_type === 'page_view' && e.created_at.startsWith(ds)).length ?? 0 }
  })
  const sparkMax = Math.max(...spark.map(s => s.count), 1)

  const MODE_COLOR: Record<string, string> = { A: '#E8A030', B: '#60A5FA', C: '#34D399' }

  return (
    <div className={styles.page}>
      {/* Nav */}
      <div className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 className={styles.navTitle}>Analytics Dashboard</h1>
        <div className={styles.windowBtns}>
          {(['today', '7d', 'all'] as Window[]).map(w => (
            <button key={w} className={`${styles.wBtn} ${window === w ? styles.wActive : ''}`}
              onClick={() => setWindow(w)}>
              {w === 'today' ? 'Today' : w === '7d' ? '7 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {!supabaseReady && (
          <div className={styles.notice}>
            <strong>Supabase not configured.</strong> Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file to see real data.
            See <code>README.md → Supabase Setup</code> for instructions.
          </div>
        )}

        {loading && <div className={styles.loading}>Loading analytics…</div>}

        {!loading && (
          <>
            {/* Top stats */}
            <div className={styles.statGrid}>
              {[
                { label: 'Page views',      value: fmtNum(pageViews) },
                { label: 'Unique sessions', value: fmtNum(uniqueSessions) },
                { label: 'Episode clicks',  value: fmtNum(episodeClicks.length) },
                { label: 'Hero converts',   value: fmtNum(heroConverts.length) },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sparkline */}
            <div className={styles.card}>
              <div className={styles.cardHead}>Daily page views — last 14 days</div>
              <div className={styles.sparkWrap}>
                {spark.map((s, i) => (
                  <div key={i} className={styles.sparkCol}>
                    <div className={styles.sparkBarWrap}>
                      <div
                        className={styles.sparkBar}
                        style={{ height: `${Math.max(4, (s.count / sparkMax) * 100)}%` }}
                        title={`${s.day}: ${s.count} views`}
                      />
                    </div>
                    {(i === 0 || i === 6 || i === 13) && (
                      <div className={styles.sparkLabel}>{s.day.slice(5)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero mode conversion */}
            <div className={styles.card}>
              <div className={styles.cardHead}>Hero mode — conversion rate</div>
              <div className={styles.modeGrid}>
                {modeStats.map(m => (
                  <div key={m.mode} className={styles.modeCard}>
                    <div className={styles.modeLetter} style={{ color: MODE_COLOR[m.mode] }}>
                      Mode {m.mode}
                    </div>
                    <div className={styles.modeRate} style={{ color: MODE_COLOR[m.mode] }}>
                      {m.rate}%
                    </div>
                    <div className={styles.modeSub}>{m.converts} converts / {m.views} views</div>
                    <div className={styles.modeDesc}>
                      {m.mode === 'A' ? 'Featured episode' : m.mode === 'B' ? 'Insight of the day' : 'Start here'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top episodes */}
            <div className={styles.card}>
              <div className={styles.cardHead}>Most clicked episodes</div>
              {topEpisodes.length === 0 ? (
                <div className={styles.empty}>No click data yet.</div>
              ) : (
                <div className={styles.epBars}>
                  {topEpisodes.map(({ ep, count }) => ep && (
                    <div key={ep.id} className={styles.epBarRow}>
                      <div className={styles.epBarLabel}>{ep.title}</div>
                      <div className={styles.epBarTrack}>
                        <div
                          className={styles.epBarFill}
                          style={{ width: `${(count / maxClicks) * 100}%` }}
                        />
                      </div>
                      <div className={styles.epBarCount}>{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time on page */}
            <div className={styles.card}>
              <div className={styles.cardHead}>Avg. time on episode page (seconds)</div>
              {avgTimes.length === 0 ? (
                <div className={styles.empty}>No time data yet.</div>
              ) : (
                <div className={styles.epBars}>
                  {avgTimes.map(({ ep, avg }) => ep && (
                    <div key={ep.id} className={styles.epBarRow}>
                      <div className={styles.epBarLabel}>{ep.title}</div>
                      <div className={styles.epBarTrack}>
                        <div
                          className={styles.epBarFill}
                          style={{ width: `${Math.min(100, (avg / 300) * 100)}%`, background: '#34D399' }}
                        />
                      </div>
                      <div className={styles.epBarCount}>{avg}s</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
