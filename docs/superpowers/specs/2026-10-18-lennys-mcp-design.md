# Lenny's Podcast MCP server: design

Date: 2026-10-18. Repo: github.com/semantic-sage/Lennys-AI-Insights, new folder `mcp/`.

## Goal
Any MCP client (Claude Desktop, Claude Code, Cursor) can ask "which episodes teach X" and get ranked episodes with takeaways, a quote, a framework and a working link. The client's own model writes the short answer from the returned data. No API key, no network call at runtime.

## Decisions made
1. Data: the 22 curated episodes from the app, re-anchored to 22 real episodes (real title, date, YouTube link, video id). No transcripts stored, no timestamps.
2. Takeaways: regenerated once from the real transcripts by a script the repo owner runs locally with their own Anthropic key. Output is committed as `src/data/takeaways.json`. The transcript source is the public archive github.com/ChatPRD/lennys-podcast-transcripts, fetched at generation time only, never re-hosted.
3. Language: TypeScript, official `@modelcontextprotocol/sdk`, stdio transport, Node 20+.
4. Location: `mcp/` inside the existing repo, own `package.json`, published to npm as `lennys-podcast-mcp`, run with `npx -y lennys-podcast-mcp`.
5. Four tools: `find_episodes_for`, `get_episode`, `list_topics`, `get_learning_path`.
6. No employer code, data, names or email anywhere, including the git author.

## Components
- `src/data/episodes.ts` (app, existing file, rewritten): `Episode` gains `videoId: string`; `url` becomes the YouTube link. 22 entries. `LEARNING_PATHS` unchanged.
- `src/data/takeaways.json` (app, existing file, regenerated): adds top-level `source: "transcripts"` and per-episode `videoId`. Shape otherwise unchanged (takeaways[5], framework, quote, bestFor, resources).
- `scripts/regenerate-takeaways.mjs` (app root): for each episode, fetch `episodes/<dir>/transcript.md` from the archive by a `videoId -> dir` map, strip frontmatter, send transcript to Claude (claude-sonnet-4-5 or newer) with a fixed prompt, validate JSON shape, write takeaways.json. Needs `ANTHROPIC_API_KEY`. Supports `--only <id>` and `--dry-run`.
- `mcp/scripts/sync-data.mjs`: copies the two data files into `mcp/src/data/`. Fails with a clear message if `takeaways.json` lacks `source: "transcripts"` or any episode lacks a matching `videoId`. Runs as `prebuild`.
- `mcp/src/catalog.ts`: loads episodes and takeaways, joins by id, exposes typed `EpisodeRecord` (episode + insights) and `topics()`.
- `mcp/src/search.ts`: `scoreEpisode(query, record)` keyword scoring. Tokenize query (lowercase, strip punctuation, drop stopwords). Weights: tag exact 5, title token 3, framework token 2, takeaway token 1, description token 1, guest/role token 2. Returns matched takeaways (those containing any query token) for the response. `findEpisodes(query, limit=5)` returns records with score > 0 sorted by score desc, then date desc.
- `mcp/src/server.ts`: registers the four tools with zod input schemas, returns JSON text content. `mcp/src/index.ts`: stdio entry with shebang.
- `mcp/README.md`: two-minute install for the three clients, three example questions, how to add an episode.
- `mcp/test/`: vitest. Unit tests for tokenizer and scoring (ordering, zero-score exclusion, matched takeaways). One integration test that spawns the built server over stdio with the SDK client, lists tools (expects 4) and calls each.

## Tool contracts
- `find_episodes_for({ query: string, limit?: number (1-10, default 5) })` -> `{ query, results: [{ id, title, guest, role, date, url, tags, score, why: string[] (matched fields), framework, quote, matchingTakeaways: [{format,text}], bestFor }] }`. Empty results -> `{ query, results: [], hint: "Try one of these topics: ..." }` with top 8 topics.
- `get_episode({ id?: number, title?: string })` -> full episode plus insights. Title match is case-insensitive substring; ambiguous -> list candidates; none -> error text.
- `list_topics()` -> `{ topics: [{ tag, count, episodeIds }] }` sorted by count desc, plus `learningPaths: [label]`.
- `get_learning_path({ label: string })` -> `{ label, sub, tags, episodes: [{ id, title, guest, date, url, framework }] }` ordered by date desc. Unknown label -> list of valid labels.

## Error handling
All tool errors are returned as `isError: true` text content with a one-sentence message and the valid options. The server never throws to the transport. Data load errors fail fast at startup with the file path.

## Testing
`npm test` in `mcp/` runs unit + integration. `npm run build` runs `sync-data` then `tsc`. CI: a GitHub Actions workflow `mcp-ci.yml` runs `npm ci && npm test` in `mcp/` on push and pull request.

## Out of scope
Transcripts, timestamps, embeddings, server-side LLM calls, more than 22 episodes, changes to the React UI beyond what the new data fields require (the episode page shows the YouTube link).
