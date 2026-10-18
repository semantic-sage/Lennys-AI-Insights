import { describe, expect, it } from 'vitest'
import { findEpisodes, scoreEpisode, tokenize } from '../src/search.js'
import { fixtureCatalog } from './fixtures/catalog.js'

const catalog = fixtureCatalog()

describe('tokenize', () => {
  it('lowercases, strips punctuation and drops stopwords', () => {
    expect(tokenize('Which episodes teach Pricing?')).toEqual(['pricing'])
  })
  it('removes duplicates and keeps order', () => {
    expect(tokenize('growth, growth and onboarding')).toEqual(['growth', 'onboarding'])
  })
})

describe('scoreEpisode', () => {
  it('scores a tag match higher than a description match', () => {
    const pricing = scoreEpisode('pricing', catalog.byId(1)!)
    const plsWithPriceInDesc = scoreEpisode('pricing', catalog.byId(3)!)
    expect(pricing.score).toBeGreaterThan(plsWithPriceInDesc.score)
    expect(pricing.why).toContain('tag: pricing')
  })
  it('returns the takeaways that contain a query token', () => {
    const result = scoreEpisode('onboarding', catalog.byId(2)!)
    expect(result.matchingTakeaways.map((t) => t.format)).toEqual(['do-this', 'real-example'])
  })
  it('matches simple stems: price ~ pricing, metric ~ metrics', () => {
    expect(scoreEpisode('price', catalog.byId(1)!).score).toBeGreaterThan(0)
    expect(scoreEpisode('metric', catalog.byId(3)!).score).toBeGreaterThan(0)
  })
  it('scores zero for an unrelated query', () => {
    expect(scoreEpisode('kubernetes', catalog.byId(1)!).score).toBe(0)
  })
})

describe('findEpisodes', () => {
  it('ranks best first and excludes zero scores', () => {
    const results = findEpisodes('how do I price it', catalog.records)
    expect(results.map((r) => r.record.episode.id)).toEqual([1, 3])
  })
  it('respects the limit', () => {
    expect(findEpisodes('growth', catalog.records, 1)).toHaveLength(1)
  })
  it('breaks ties by newest episode', () => {
    const results = findEpisodes('growth', catalog.records)
    expect(results[0].record.episode.id).toBe(3)
  })
  it('returns an empty list when nothing matches', () => {
    expect(findEpisodes('kubernetes', catalog.records)).toEqual([])
  })
})
