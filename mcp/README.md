# Lenny's Podcast MCP server

Ask your AI assistant **"which Lenny's Podcast episodes teach pricing?"** and get real episodes, the takeaways that matched, the guest's key framework, a quote, and a YouTube link. Works in Claude Desktop, Claude Code, Cursor, or any [Model Context Protocol](https://modelcontextprotocol.io) client.

No API key. No network calls at runtime. 22 curated episodes, insights generated from the full transcripts.

## Install (2 minutes)

You need Node.js 20 or newer (`node -v`).

**Claude Desktop**: Settings → Developer → Edit Config, add this, restart Claude Desktop.

```json
{
  "mcpServers": {
    "lennys-podcast": { "command": "npx", "args": ["-y", "lennys-podcast-mcp"] }
  }
}
```

**Claude Code**:

```bash
claude mcp add lennys-podcast -- npx -y lennys-podcast-mcp
```

**Cursor**: Settings → MCP → Add new server, or put the same JSON block above in `.cursor/mcp.json`.

## Try it

- "Which episodes teach pricing?"
- "I'm a new PM. What should I listen to about leading teams?"
- "What is Teresa Torres's framework and who is the episode best for?"

## Tools

| Tool | What it does |
|---|---|
| `find_episodes_for` | Ranked episodes for a learning goal, with the matching takeaways, framework, quote and link. The assistant writes the short answer from this. |
| `get_episode` | Everything about one episode, by id or by a word from the title or guest. |
| `list_topics` | Every topic tag with episode counts, plus the learning path names. |
| `get_learning_path` | Episodes for one path: Starting a company, Growing fast, Building great product, Leading teams, Comms & strategy, Monetizing. |

Search is keyword scoring over tags, title, guest, description, framework and takeaways (tags weigh most). It runs instantly and needs no model download. The returned `why` field shows what matched.

## How the data is built

- `../src/data/episodes.json` is the catalog: real episode title, date, duration, YouTube video id and link. Every entry maps to a real video.
- `../src/data/takeaways.json` holds five takeaways, a framework, a quote, audience and resources per episode. They are generated once from the full transcript by `../scripts/regenerate-takeaways.mjs` using the Claude API, then committed. Transcripts come from the public archive [ChatPRD/lennys-podcast-transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts) and are read in memory only; this repo stores no transcript text.
- `npm run build` copies both files into the package. Publishing refuses data whose takeaways were not generated from the transcript of the listed video, so the catalog cannot drift from the insights by accident.

## Develop

```bash
cd mcp
npm install
npm test          # builds, then unit tests + a stdio round-trip against the built server
npm start         # run the server on stdio
```

To add an episode: add it to `../src/data/episodes.json` (find its `archiveDir` and `videoId` in the transcript archive), run `node scripts/regenerate-takeaways.mjs --only <id>` from the repo root with `ANTHROPIC_API_KEY` set, then `npm test` here.

## License

MIT for the code. Episode titles and links point to Lenny's Podcast; the podcast content belongs to its creators.
