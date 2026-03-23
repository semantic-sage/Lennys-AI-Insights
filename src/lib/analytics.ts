import { insertEvent } from './supabase'

const SESSION_ID = Math.random().toString(36).slice(2)

function track(event_type: string, extras: object = {}) {
  // Fire and forget with a 3 second timeout — never blocks navigation
  const timeout = new Promise(resolve => setTimeout(resolve, 3000))
  Promise.race([
    insertEvent({ event_type, session_id: SESSION_ID, ...extras }),
    timeout
  ]).catch(() => {})
}

export function trackPageView(heroMode: 'A' | 'B' | 'C') {
  track('page_view', { hero_mode: heroMode })
}

export function trackEpisodeClick(episodeId: number, source: 'grid' | 'hero') {
  track('episode_click', { episode_id: episodeId, hero_mode: source })
}

export function trackHeroConvert(heroMode: 'A' | 'B' | 'C', episodeId: number) {
  track('hero_convert', { hero_mode: heroMode, episode_id: episodeId })
}

export function trackEpisodeView(episodeId: number) {
  track('episode_view', { episode_id: episodeId })
}

export function trackTimeOnPage(episodeId: number, seconds: number) {
  if (seconds < 3) return
  track('time_on_page', { episode_id: episodeId, time_on_page: seconds })
}
