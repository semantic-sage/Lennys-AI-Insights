import type { EpisodeRecord, Takeaway } from './types.js'

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'how', 'do', 'i', 'my', 'we', 'our',
  'is', 'are', 'be', 'what', 'which', 'who', 'about', 'teach', 'teaches', 'episode', 'episodes', 'learn',
  'can', 'should', 'me', 'you', 'your', 'this', 'that', 'it', 'at', 'from', 'by', 'as', 'into', 'up',
])

/** Lowercase, strip punctuation, drop stopwords and one-letter tokens. Keeps order, removes duplicates. */
export function tokenize(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.toLowerCase().split(/[^a-z0-9+-]+/)) {
    const t = raw.replace(/^-+|-+$/g, '')
    if (t.length < 2 || STOPWORDS.has(t) || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/** True when `token` matches `word` exactly or as a simple stem (pricing ~ price, metrics ~ metric). */
function stemMatch(token: string, word: string): boolean {
  if (token === word) return true
  const a = token.replace(/(ing|ies|es|s)$/, '')
  const b = word.replace(/(ing|ies|es|s)$/, '')
  return a.length >= 3 && a === b
}

function hasToken(text: string, token: string): boolean {
  return tokenize(text).some((w) => stemMatch(token, w))
}

const WEIGHTS = { tag: 5, title: 3, guest: 2, framework: 2, takeaway: 1, desc: 1 } as const

export interface ScoredEpisode {
  record: EpisodeRecord
  score: number
  /** Human-readable reasons, e.g. "tag: pricing", "title: pricing". */
  why: string[]
  matchingTakeaways: Takeaway[]
}

export function scoreEpisode(query: string, record: EpisodeRecord): ScoredEpisode {
  const tokens = tokenize(query)
  const { episode, insights } = record
  let score = 0
  const why: string[] = []
  const matchingTakeaways: Takeaway[] = []

  for (const token of tokens) {
    const tag = episode.tags.find((t) => stemMatch(token, t.toLowerCase()))
    if (tag) { score += WEIGHTS.tag; why.push(`tag: ${tag}`) }
    if (hasToken(episode.title, token)) { score += WEIGHTS.title; why.push(`title: ${token}`) }
    if (hasToken(`${episode.guest} ${episode.role}`, token)) { score += WEIGHTS.guest; why.push(`guest: ${token}`) }
    if (hasToken(episode.desc, token)) { score += WEIGHTS.desc; why.push(`description: ${token}`) }
    if (insights) {
      if (hasToken(insights.framework, token)) { score += WEIGHTS.framework; why.push(`framework: ${token}`) }
      for (const tk of insights.takeaways) {
        if (hasToken(tk.text, token)) {
          score += WEIGHTS.takeaway
          if (!matchingTakeaways.includes(tk)) matchingTakeaways.push(tk)
        }
      }
    }
  }
  if (matchingTakeaways.length) why.push(`takeaways: ${matchingTakeaways.length}`)
  return { record, score, why, matchingTakeaways }
}

/** Ranked matches with score > 0, best first; ties broken by newest episode. */
export function findEpisodes(query: string, records: EpisodeRecord[], limit = 5): ScoredEpisode[] {
  return records
    .map((r) => scoreEpisode(query, r))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.record.episode.date.localeCompare(a.record.episode.date))
    .slice(0, limit)
}
