# How to publish the Lenny's Podcast MCP server from your personal computer

You unzipped `lennys-mcp-handoff.zip`. It contains everything that changes in the repo, already tested. This is the order to run things. About 30 minutes the first time, most of it waiting on installs.

## What is in the zip

- `mcp/` : the MCP server package (TypeScript, 4 tools, tests, README).
- `src/data/episodes.json` : the catalog of 22 real episodes (real titles, dates, YouTube links). Replaces the old invented list.
- `src/data/episodes.ts` : now reads from episodes.json. Same exports, so the React app keeps working.
- `src/pages/EpisodePage.tsx` : the "Listen" button now says "Watch the full episode on YouTube".
- `scripts/regenerate-takeaways.mjs` : regenerates takeaways from the real transcripts with your Anthropic key.
- `package.json` : adds that script and two dev dependencies.
- `.githooks/pre-commit` : refuses commits whose author email is not on your personal domain, and refuses a staged .env.
- `.github/workflows/mcp-ci.yml` : runs the MCP tests on every push.
- `docs/superpowers/` : the design spec and this build's plan.

## One-time setup

1. Node.js 20 or newer: https://nodejs.org (LTS). Check with `node -v`.
2. Git: https://git-scm.com. Check with `git -v`.
3. An npm account with your personal email: https://www.npmjs.com/signup then `npm login`.
4. An Anthropic API key for the one-time takeaway generation: https://console.anthropic.com → API Keys. Cost for all 22 episodes: about 2 dollars with the default model, under 1 dollar with `--model claude-sonnet-5-5`.
5. Signed in to GitHub in the browser as semantic-sage.

## Steps

```text
git clone https://github.com/semantic-sage/Lennys-AI-Insights.git
cd Lennys-AI-Insights
git config user.name "Sri Adidam"
git config user.email "<your personal email>"
git config core.hooksPath .githooks
git config hooks.allowedEmailDomain <your personal email domain, e.g. gmail.com>
```

Unzip the handoff so its folders land on top of the repo (you should now see a `mcp` folder next to `src`). Then:

```text
npm install
set ANTHROPIC_API_KEY=sk-ant-...        (Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...")
node scripts/regenerate-takeaways.mjs --dry-run      (checks all 22 transcripts download; no cost)
node scripts/regenerate-takeaways.mjs                (the real run, 22 API calls, a few minutes)
npm run build                                         (React app still builds)
cd mcp
npm install
npm test                                              (expect: 19 passed)
cd ..
```

Look at `src/data/takeaways.json` once. Each episode should have five takeaways that read like the real episode. If one looks off, rerun just that one: `node scripts/regenerate-takeaways.mjs --only 7`.

Commit and push:

```text
git add -A
git status                 (confirm .env is NOT listed)
git commit -m "Replace invented episode list with 22 real episodes; add MCP server"
git push
```

Publish to npm:

```text
cd mcp
npm publish --access public
```

`npm publish` refuses to run if takeaways were not regenerated from the real transcripts, so you cannot ship stale data by accident.

## Check it in Claude Desktop

Settings → Developer → Edit Config, add:

```text
{
  "mcpServers": {
    "lennys-podcast": { "command": "npx", "args": ["-y", "lennys-podcast-mcp"] }
  }
}
```

Restart Claude Desktop and ask: "Which Lenny's Podcast episodes teach pricing?"

## Safety checks before you push

- `git log -1 --format=%ae` shows your personal email.
- Search the repo for your employer's name and confirm nothing prints.
- `.env` does not appear in `git status`.
