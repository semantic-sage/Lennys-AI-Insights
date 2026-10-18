import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { LEARNING_PATHS, loadCatalog } from '../src/catalog.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const entry = path.resolve(here, '../dist/index.js')

function text(result: { content: unknown }): unknown {
  const first = (result.content as Array<{ type: string; text: string }>)[0]
  return JSON.parse(first.text)
}

describe('built server over stdio (run `npm run build` first)', () => {
  const client = new Client({ name: 'test-client', version: '0.0.0' })
  beforeAll(async () => {
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [entry] }))
  })
  afterAll(async () => { await client.close() })

  it('exposes exactly four tools', async () => {
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual(['find_episodes_for', 'get_episode', 'get_learning_path', 'list_topics'])
  })

  it('find_episodes_for returns ranked episodes with links', async () => {
    const data = text(await client.callTool({ name: 'find_episodes_for', arguments: { query: 'pricing' } })) as { results: Array<{ url: string; score: number }> }
    expect(data.results.length).toBeGreaterThan(0)
    expect(data.results[0].url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/)
    expect(data.results[0].score).toBeGreaterThanOrEqual(data.results.at(-1)!.score)
  })

  it('find_episodes_for gives a hint when nothing matches', async () => {
    const data = text(await client.callTool({ name: 'find_episodes_for', arguments: { query: 'kubernetes' } })) as { results: unknown[]; hint: string }
    expect(data.results).toEqual([])
    expect(data.hint).toContain('Try one of these topics')
  })

  it('get_episode works by id and errors on a bad id', async () => {
    const ok = text(await client.callTool({ name: 'get_episode', arguments: { id: 1 } })) as { id: number; takeaways: unknown[] }
    expect(ok.id).toBe(1)
    const bad = await client.callTool({ name: 'get_episode', arguments: { id: 999 } })
    expect(bad.isError).toBe(true)
  })

  it('list_topics returns counts and learning path names', async () => {
    const data = text(await client.callTool({ name: 'list_topics', arguments: {} })) as { topics: Array<{ tag: string; count: number }>; learningPaths: string[] }
    expect(data.topics[0].count).toBeGreaterThanOrEqual(data.topics.at(-1)!.count)
    expect(data.learningPaths).toEqual(LEARNING_PATHS.map((p) => p.label))
  })

  it('get_learning_path returns episodes newest first and lists valid labels on error', async () => {
    const data = text(await client.callTool({ name: 'get_learning_path', arguments: { label: 'Monetizing' } })) as { episodes: Array<{ date: string }> }
    expect(data.episodes.length).toBeGreaterThan(0)
    const dates = data.episodes.map((e) => e.date)
    expect([...dates].sort().reverse()).toEqual(dates)
    const bad = await client.callTool({ name: 'get_learning_path', arguments: { label: 'nope' } })
    expect(bad.isError).toBe(true)
  })
})

describe('real data integrity', () => {
  const catalog = loadCatalog()
  it('every episode has a YouTube video id, a YouTube url and 2-4 tags', () => {
    for (const { episode } of catalog.records) {
      expect(episode.videoId, `episode ${episode.id}`).toMatch(/^[\w-]{11}$/)
      expect(episode.url).toBe(`https://www.youtube.com/watch?v=${episode.videoId}`)
      expect(episode.tags.length).toBeGreaterThanOrEqual(2)
      expect(episode.tags.length).toBeLessThanOrEqual(4)
    }
  })
  it('every learning path tag is used by at least one episode', () => {
    const used = new Set(catalog.records.flatMap((r) => r.episode.tags))
    for (const p of LEARNING_PATHS) for (const t of p.tags) expect(used.has(t), `tag ${t} in ${p.label}`).toBe(true)
  })
  it('episode ids are unique and sequential', () => {
    expect(catalog.records.map((r) => r.episode.id)).toEqual(catalog.records.map((_, i) => i + 1))
  })
})
