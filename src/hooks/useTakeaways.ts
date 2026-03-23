import { useState, useCallback } from 'react'
import type { Episode, EpisodeInsights } from '../data/episodes'
import cachedData from '../data/takeaways.json'

// Pre-built cache from takeaways.json — zero API cost for all indexed episodes
const CACHE = new Map<number, EpisodeInsights>(
  (cachedData.episodes as EpisodeInsights[]).map(e => [e.episodeId, e])
)

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

export type InsightState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; insights: EpisodeInsights }
  | { status: 'error'; message: string }

export function useInsights() {
  const [runtimeCache, setRuntimeCache] = useState<Map<number, EpisodeInsights>>(new Map())
  const [state, setState] = useState<InsightState>({ status: 'idle' })

  const load = useCallback(async (ep: Episode) => {
    // 1. JSON cache first — instant, free, no key needed
    const cached = CACHE.get(ep.id) ?? runtimeCache.get(ep.id)
    if (cached) {
      setState({ status: 'done', insights: cached })
      return
    }

    // 2. Live API for uncached episodes
    if (!API_KEY || API_KEY.includes('paste-your-key')) {
      setState({ status: 'error', message: 'Episode not yet cached. Add API key to .env to generate.' })
      return
    }

    setState({ status: 'loading' })
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Analyze this podcast episode and return a JSON object.\n\nEpisode: "${ep.title}"\nGuest: ${ep.guest} (${ep.role})\nDescription: ${ep.desc}\n\nReturn ONLY valid JSON:\n{"episodeId":${ep.id},"takeaways":["5 takeaways 1-2 sentences each"],"framework":"One key mental model from this episode","quote":"Best guest quote","bestFor":["2-4 audience types"]}`,
          }],
        }),
      })
      const data = await res.json()
      const text: string = data.content?.[0]?.text ?? '{}'
      const insights: EpisodeInsights = JSON.parse(text.replace(/```json|```/g, '').trim())
      setRuntimeCache(prev => new Map(prev).set(ep.id, insights))
      setState({ status: 'done', insights })
    } catch {
      setState({ status: 'error', message: 'Could not generate insights. Check your .env API key.' })
    }
  }, [runtimeCache])

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, load, reset }
}
