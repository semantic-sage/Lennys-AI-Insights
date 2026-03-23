import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { EPISODES, LEARNING_PATHS } from '../data/episodes'
import type { Episode } from '../data/episodes'
import { trackEpisodeClick } from '../lib/analytics'
import styles from './EpisodesPage.module.css'

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
function getEpisodePath(ep: Episode): string {
  let best = { label: 'Other', score: 0 }
  for (const path of LEARNING_PATHS) {
    const score = ep.tags.filter(t => path.tags.includes(t)).length
    const primaryBonus = path.tags.includes(ep.tags[0]) ? 10 : 0
    const total = score + primaryBonus
    if (total > best.score) best = { label: path.label, score: total }
  }
  return best.label
}

interface NavState { search?: string; path?: string }

export default function EpisodesPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const navState  = (location.state as NavState) ?? {}

  const [search, setSearch]         = useState(navState.search ?? '')
  const [activePath, setActivePath] = useState(navState.path ?? '')
  const [guest, setGuest]           = useState('all')
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({})

  const guests = useMemo(() => [...new Set(EPISODES.map(e => e.guest))], [])

  const filtered = useMemo(() => {
    const pathTags = activePath
      ? LEARNING_PATHS.find(p => p.label === activePath)?.tags ?? null
      : null
    return EPISODES.filter(ep => {
      const q  = search.toLowerCase()
      const ms = !q || ep.title.toLowerCase().includes(q)
        || ep.guest.toLowerCase().includes(q)
        || ep.desc.toLowerCase().includes(q)
        || ep.tags.some(t => t.toLowerCase().includes(q))
      const mp = !pathTags || ep.tags.some(t => pathTags.includes(t))
      const mg = guest === 'all' || ep.guest === guest
      return ms && mp && mg
    })
  }, [search, activePath, guest])

  const grouped = useMemo(() =>
    LEARNING_PATHS.map(path => ({
      path,
      episodes: filtered.filter(ep => getEpisodePath(ep) === path.label),
    })).filter(g => g.episodes.length > 0),
    [filtered]
  )

  const categorized = useMemo(() =>
    new Set(grouped.flatMap(g => g.episodes.map(e => e.id))),
    [grouped]
  )
  const uncategorized = useMemo(() =>
    filtered.filter(ep => !categorized.has(ep.id)),
    [filtered, categorized]
  )

  const hasFilter = search || activePath || guest !== 'all'

  function clearAll() { setSearch(''); setActivePath(''); setGuest('all') }
  function toggleSection(label: string) {
    setCollapsed(c => ({ ...c, [label]: !c[label] }))
  }
  function openEpisode(id: number) {
    trackEpisodeClick(id, 'grid')
    navigate(`/episode/${id}`)
  }

  const EpRow = ({ ep }: { ep: Episode }) => (
    <div className={styles.epRow} onClick={() => openEpisode(ep.id)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && openEpisode(ep.id)}>
      <div className={styles.epAv}>{initials(ep.guest)}</div>
      <div className={styles.epMain}>
        <div className={styles.epTitle}>{ep.title}</div>
        <div className={styles.epMeta}>{ep.guest} · {ep.role}</div>
      </div>
      <div className={styles.epRight}>
        <div className={styles.epTags}>
          {ep.tags.slice(0, 2).map(t => <span key={t} className={styles.epTag}>{t}</span>)}
        </div>
        <div className={styles.epDate}>{fmtDate(ep.date)}</div>
      </div>
      <span className={styles.epArrow}>→</span>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.filterBar}>

        {/* Top row: back button + search */}
        <div className={styles.topRow}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Home
          </button>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search episodes, guests, topics..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActivePath('') }}
            />
            {search && (
              <button className={styles.clearX} onClick={() => setSearch('')}>×</button>
            )}
          </div>
        </div>

        {/* Path pills + guest filter */}
        <div className={styles.filterRow}>
          <div className={styles.pathPills}>
            <button
              className={`${styles.pathPill} ${!activePath ? styles.pathPillActive : ''}`}
              onClick={() => { setActivePath(''); setSearch('') }}
            >All</button>
            {LEARNING_PATHS.map(p => (
              <button
                key={p.label}
                className={`${styles.pathPill} ${activePath === p.label ? styles.pathPillActive : ''}`}
                onClick={() => setActivePath(p.label === activePath ? '' : p.label)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          <div className={styles.filterRight}>
            <select className={styles.guestSel} value={guest} onChange={e => setGuest(e.target.value)}>
              <option value="all">All guests</option>
              {guests.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {hasFilter && <button className={styles.clearBtn} onClick={clearAll}>Clear ×</button>}
            <span className={styles.resultCount}>{filtered.length} of {EPISODES.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>◎ No episodes match — try clearing a filter.</div>
        ) : (
          <>
            {grouped.map(({ path, episodes }) => (
              <div key={path.label} className={styles.group}>
                <button className={styles.groupHeader} onClick={() => toggleSection(path.label)}>
                  <span className={styles.groupIcon}>{path.icon}</span>
                  <span className={styles.groupName}>{path.label}</span>
                  <span className={styles.groupCount}>{episodes.length} episodes</span>
                  <span className={styles.groupChevron}>{collapsed[path.label] ? '▶' : '▼'}</span>
                </button>
                {!collapsed[path.label] && (
                  <div className={styles.episodeList}>
                    {episodes.map(ep => <EpRow key={ep.id} ep={ep} />)}
                  </div>
                )}
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div className={styles.group}>
                <button className={styles.groupHeader} onClick={() => toggleSection('other')}>
                  <span className={styles.groupIcon}>📌</span>
                  <span className={styles.groupName}>Other episodes</span>
                  <span className={styles.groupCount}>{uncategorized.length} episodes</span>
                  <span className={styles.groupChevron}>{collapsed['other'] ? '▶' : '▼'}</span>
                </button>
                {!collapsed['other'] && (
                  <div className={styles.episodeList}>
                    {uncategorized.map(ep => <EpRow key={ep.id} ep={ep} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
