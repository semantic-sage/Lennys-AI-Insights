export interface Episode {
  id: number
  videoId: string
  title: string
  guest: string
  role: string
  date: string
  duration: string
  tags: string[]
  desc: string
  url: string
  archiveDir: string
}

export type TakeawayFormat = 'do-this' | 'remember-this' | 'real-example' | 'ask-yourself' | 'avoid-this'

export interface Takeaway {
  format: TakeawayFormat
  text: string
}

export interface Resource {
  title: string
  type: 'book' | 'article' | 'framework' | 'tool'
}

export interface EpisodeInsights {
  episodeId: number
  videoId?: string
  takeaways: Takeaway[]
  framework: string
  quote: string
  bestFor: string[]
  resources: Resource[]
}

export interface TakeawaysFile {
  generated: string
  model: string
  source?: string
  episodes: EpisodeInsights[]
}

export interface LearningPath {
  label: string
  sub: string
  tags: string[]
}

/** One episode joined with its insights. Insights may be missing for an episode not yet generated. */
export interface EpisodeRecord {
  episode: Episode
  insights: EpisodeInsights | undefined
}
