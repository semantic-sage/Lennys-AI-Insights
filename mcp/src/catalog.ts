import type { Episode, EpisodeRecord, LearningPath, TakeawaysFile } from './types.js'
import episodesJson from './data/episodes.json' with { type: 'json' }
import takeawaysJson from './data/takeaways.json' with { type: 'json' }

// Mirrors LEARNING_PATHS in the app (src/data/episodes.ts). Kept in sync by hand; the server test checks every tag exists.
export const LEARNING_PATHS: LearningPath[] = [
  { label: 'Starting a company',    sub: 'Founding, PMF, early days',    tags: ['startups', 'PMF'] },
  { label: 'Growing fast',          sub: 'Growth loops, metrics, scale', tags: ['growth', 'metrics', 'scale', 'PLG'] },
  { label: 'Building great product', sub: 'Discovery, design, process',   tags: ['product', 'design', 'discovery', 'research'] },
  { label: 'Leading teams',         sub: 'Culture, hiring, leadership',  tags: ['leadership', 'culture', 'career'] },
  { label: 'Comms & strategy',      sub: 'Narrative, storytelling, GTM', tags: ['communication', 'strategy', 'writing', 'GTM'] },
  { label: 'Monetizing',            sub: 'Pricing, B2B, payments',       tags: ['pricing', 'monetization', 'B2B', 'payments'] },
]

export interface TopicCount {
  tag: string
  count: number
  episodeIds: number[]
}

export class Catalog {
  readonly records: EpisodeRecord[]

  constructor(episodes: Episode[], takeaways: TakeawaysFile) {
    const byId = new Map(takeaways.episodes.map((t) => [t.episodeId, t]))
    this.records = episodes.map((episode) => ({ episode, insights: byId.get(episode.id) }))
  }

  byId(id: number): EpisodeRecord | undefined {
    return this.records.find((r) => r.episode.id === id)
  }

  /** Case-insensitive substring match on title or guest. */
  byTitle(text: string): EpisodeRecord[] {
    const needle = text.trim().toLowerCase()
    if (!needle) return []
    return this.records.filter(
      (r) => r.episode.title.toLowerCase().includes(needle) || r.episode.guest.toLowerCase().includes(needle),
    )
  }

  topics(): TopicCount[] {
    const map = new Map<string, number[]>()
    for (const { episode } of this.records) {
      for (const tag of episode.tags) map.set(tag, [...(map.get(tag) ?? []), episode.id])
    }
    return [...map.entries()]
      .map(([tag, episodeIds]) => ({ tag, count: episodeIds.length, episodeIds }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
  }

  learningPath(label: string): { path: LearningPath; records: EpisodeRecord[] } | undefined {
    const path = LEARNING_PATHS.find((p) => p.label.toLowerCase() === label.trim().toLowerCase())
    if (!path) return undefined
    const records = this.records
      .filter((r) => r.episode.tags.some((t) => path.tags.includes(t)))
      .sort((a, b) => b.episode.date.localeCompare(a.episode.date))
    return { path, records }
  }
}

export function loadCatalog(): Catalog {
  return new Catalog(episodesJson as Episode[], takeawaysJson as TakeawaysFile)
}
