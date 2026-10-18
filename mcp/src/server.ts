import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { Catalog, LEARNING_PATHS } from './catalog.js'
import { findEpisodes } from './search.js'
import type { EpisodeRecord } from './types.js'

function episodeSummary({ episode, insights }: EpisodeRecord) {
  return {
    id: episode.id,
    title: episode.title,
    guest: episode.guest,
    role: episode.role,
    date: episode.date,
    duration: episode.duration,
    url: episode.url,
    tags: episode.tags,
    framework: insights?.framework ?? null,
    quote: insights?.quote ?? null,
    bestFor: insights?.bestFor ?? [],
  }
}

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function error(message: string, extra: Record<string, unknown> = {}) {
  return { isError: true as const, content: [{ type: 'text' as const, text: JSON.stringify({ error: message, ...extra }, null, 2) }] }
}

export function createServer(catalog: Catalog): McpServer {
  const server = new McpServer({ name: 'lennys-podcast-mcp', version: '1.0.0' })

  server.registerTool(
    'find_episodes_for',
    {
      title: 'Find episodes that teach a topic',
      description:
        'Answer "which Lenny\'s Podcast episodes teach X". Returns ranked episodes with the takeaways that matched, the guest\'s key framework, a quote and a link. Use the returned takeaways to write a short answer for the user.',
      inputSchema: {
        query: z.string().min(2).describe('What the user wants to learn, e.g. "pricing", "onboarding", "how to say no to feature requests"'),
        limit: z.number().int().min(1).max(10).default(5).describe('Maximum episodes to return'),
      },
    },
    async ({ query, limit }) => {
      const results = findEpisodes(query, catalog.records, limit)
      if (results.length === 0) {
        return json({
          query,
          results: [],
          hint: `No episode matched. Try one of these topics: ${catalog.topics().slice(0, 8).map((t) => t.tag).join(', ')}`,
        })
      }
      return json({
        query,
        results: results.map((r) => ({
          ...episodeSummary(r.record),
          score: r.score,
          why: r.why,
          matchingTakeaways: r.matchingTakeaways,
        })),
      })
    },
  )

  server.registerTool(
    'get_episode',
    {
      title: 'Get one episode in full',
      description: 'Full details for one episode by id, or by a word from its title or guest name: all five takeaways, framework, quote, who it is best for, resources and link.',
      inputSchema: {
        id: z.number().int().optional().describe('Episode id from find_episodes_for or list_topics'),
        title: z.string().optional().describe('Part of the title or the guest name, e.g. "pricing" or "Teresa Torres"'),
      },
    },
    async ({ id, title }) => {
      if (id === undefined && !title) return error('Pass an id or a title.')
      let record: EpisodeRecord | undefined
      if (id !== undefined) {
        record = catalog.byId(id)
        if (!record) return error(`No episode with id ${id}.`, { validIds: catalog.records.map((r) => r.episode.id) })
      } else {
        const matches = catalog.byTitle(title!)
        if (matches.length === 0) return error(`No episode title or guest contains "${title}".`)
        if (matches.length > 1) return error(`"${title}" matches ${matches.length} episodes. Pass an id.`, { candidates: matches.map((m) => ({ id: m.episode.id, title: m.episode.title, guest: m.episode.guest })) })
        record = matches[0]
      }
      return json({
        ...episodeSummary(record),
        description: record.episode.desc,
        takeaways: record.insights?.takeaways ?? [],
        resources: record.insights?.resources ?? [],
      })
    },
  )

  server.registerTool(
    'list_topics',
    {
      title: 'List topics covered',
      description: 'All topic tags in the catalog with episode counts, plus the learning path names. Use it to see what the catalog covers before searching.',
      inputSchema: {},
    },
    async () => json({ episodeCount: catalog.records.length, topics: catalog.topics(), learningPaths: LEARNING_PATHS.map((p) => p.label) }),
  )

  server.registerTool(
    'get_learning_path',
    {
      title: 'Get a learning path',
      description: 'Episodes for one learning path such as "Growing fast" or "Monetizing", newest first. Call list_topics for the valid names.',
      inputSchema: {
        label: z.string().describe('Learning path name, e.g. "Leading teams"'),
      },
    },
    async ({ label }) => {
      const found = catalog.learningPath(label)
      if (!found) return error(`Unknown learning path "${label}".`, { validLabels: LEARNING_PATHS.map((p) => p.label) })
      return json({ ...found.path, episodes: found.records.map(episodeSummary) })
    },
  )

  return server
}
