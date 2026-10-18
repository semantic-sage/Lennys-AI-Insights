import episodesJson from './episodes.json'

export interface Episode {
  id: number
  /** YouTube video id. Every episode must map to a real video in the public transcript archive. */
  videoId: string
  title: string
  guest: string
  role: string
  date: string
  duration: string
  tags: string[]
  desc: string
  url: string
  /** Folder name in github.com/ChatPRD/lennys-podcast-transcripts/episodes used to fetch the transcript at generation time. */
  archiveDir: string
}

export interface Resource {
  title: string
  type: 'book' | 'article' | 'framework' | 'tool'
}

export interface EpisodeInsights {
  episodeId: number
  videoId: string
  takeaways: Takeaway[]
  framework: string
  quote: string
  bestFor: string[]
  resources: Resource[]
}

export interface Takeaway {
  format: 'do-this' | 'remember-this' | 'real-example' | 'ask-yourself' | 'avoid-this'
  text: string
}

export interface LearningPath {
  icon: string
  label: string
  sub: string
  tags: string[]
}

// Source of truth is episodes.json so the MCP server (mcp/) can read the same file.
export const EPISODES: Episode[] = episodesJson as Episode[]

export const LEARNING_PATHS: LearningPath[] = [
  { icon: "🚀", label: "Starting a company",    sub: "Founding, PMF, early days",     tags: ["startups","PMF"] },
  { icon: "📈", label: "Growing fast",           sub: "Growth loops, metrics, scale",  tags: ["growth","metrics","scale","PLG"] },
  { icon: "🎨", label: "Building great product", sub: "Discovery, design, process",    tags: ["product","design","discovery","research"] },
  { icon: "👥", label: "Leading teams",          sub: "Culture, hiring, leadership",   tags: ["leadership","culture","career"] },
  { icon: "💬", label: "Comms & strategy",       sub: "Narrative, storytelling, GTM",  tags: ["communication","strategy","writing","GTM"] },
  { icon: "💰", label: "Monetizing",             sub: "Pricing, B2B, payments",        tags: ["pricing","monetization","B2B","payments"] },
]
