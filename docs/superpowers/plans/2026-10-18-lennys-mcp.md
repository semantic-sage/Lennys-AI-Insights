# Lenny's Podcast MCP server: implementation plan

> **For agentic workers:** the code in this plan is already written and tested in this folder tree (19 tests pass, React app builds). Execute the steps on the publishing machine in order; each step says the expected result.

**Goal:** publish `lennys-podcast-mcp` to npm from the `mcp/` folder of semantic-sage/Lennys-AI-Insights, with a catalog of 22 real episodes and transcript-based takeaways.

**Architecture:** one data source (`src/data/episodes.json` + `src/data/takeaways.json`) shared by the React app and the MCP server. `mcp/scripts/sync-data.mjs` copies it into the package and guards it. `mcp/src/catalog.ts` joins episodes with insights; `mcp/src/search.ts` scores keyword matches; `mcp/src/server.ts` exposes four tools over stdio.

**Tech stack:** TypeScript 5.9, @modelcontextprotocol/sdk 1.32, zod 4, vitest 5, Node 20+. Generation script: @anthropic-ai/sdk 0.135 with `messages.parse` and `zodOutputFormat`.

## Global constraints
- No employer code, data, names or email anywhere, including the git author (`.githooks/pre-commit` enforces the email domain).
- No transcript text is stored in the repo; transcripts are fetched in memory at generation time only.
- Exactly four tools: find_episodes_for, get_episode, list_topics, get_learning_path.
- No API key and no network at runtime for the server.

## Task 1: Replace the catalog (files already in place)
Files: `src/data/episodes.json` (new), `src/data/episodes.ts` (rewritten), `src/pages/EpisodePage.tsx` (one string), `package.json` (script + dev deps).
- [ ] From the repo root run `npm install`. Expected: no errors.
- [ ] Run `npm run build`. Expected: `✓ built`.
- [ ] Commit: `git add src package.json package-lock.json && git commit -m "Replace invented episode list with 22 real episodes"`.

## Task 2: Regenerate takeaways from transcripts
Files: `scripts/regenerate-takeaways.mjs`, output `src/data/takeaways.json`.
- [ ] `node scripts/regenerate-takeaways.mjs --dry-run`. Expected: 22 lines ending in `transcript ok`.
- [ ] With `ANTHROPIC_API_KEY` set: `node scripts/regenerate-takeaways.mjs`. Expected: 22 lines ending in `done (...)` then `Wrote 22 episodes`.
- [ ] Open `src/data/takeaways.json`; confirm `"source": "transcripts"` and five takeaways per episode. Rerun one with `--only <id>` if needed.
- [ ] Commit: `git add src/data/takeaways.json scripts && git commit -m "Generate takeaways from real transcripts"`.

## Task 3: MCP server tests
Files: everything under `mcp/`.
- [ ] `cd mcp && npm install && npm test`. Expected: `Tests  19 passed (19)` and no `sync-data` warning (the warning means Task 2 was skipped).
- [ ] Commit: `git add mcp .github .githooks HOWTO.md docs && git commit -m "Add MCP server for Lenny's Podcast insights"`.

## Task 4: Push and publish
- [ ] `git log -1 --format=%ae` shows the personal email. `git push`.
- [ ] `cd mcp && npm publish --access public`. Expected: `+ lennys-podcast-mcp@1.0.0`. The `prepublishOnly` step refuses stale data.
- [ ] Add the server to Claude Desktop (block in HOWTO.md) and ask "Which episodes teach pricing?". Expected: a ranked list with YouTube links.
