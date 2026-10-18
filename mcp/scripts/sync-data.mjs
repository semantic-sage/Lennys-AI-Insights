#!/usr/bin/env node
// Copies the app's episode data into mcp/src/data so the published package is self-contained.
// One source of truth: ../src/data/episodes.json and ../src/data/takeaways.json.
//
// Guard: every episode needs a videoId, and takeaways must have been generated from transcripts
// (top-level "source": "transcripts" with a matching videoId per episode). With --strict (used by
// prepublishOnly) a stale file fails the run. Without --strict it warns, so local builds and tests work
// before the owner has regenerated takeaways.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(here, '../../src/data')
const DEST = path.resolve(here, '../src/data')
const strict = process.argv.includes('--strict')

const episodes = JSON.parse(readFileSync(path.join(SRC, 'episodes.json'), 'utf8'))
const takeaways = JSON.parse(readFileSync(path.join(SRC, 'takeaways.json'), 'utf8'))

const problems = []
for (const e of episodes) {
  if (!/^[\w-]{11}$/.test(e.videoId ?? '')) problems.push(`episode ${e.id} has no valid videoId`)
}
if (takeaways.source !== 'transcripts') problems.push('takeaways.json was not generated from transcripts (missing "source": "transcripts")')
const byId = new Map((takeaways.episodes ?? []).map((t) => [t.episodeId, t]))
for (const e of episodes) {
  const t = byId.get(e.id)
  if (!t) problems.push(`episode ${e.id} (${e.guest}) has no takeaways`)
  else if (t.videoId !== e.videoId) problems.push(`episode ${e.id} (${e.guest}) takeaways were generated for a different video`)
}

if (problems.length) {
  const msg = `sync-data: ${problems.length} data problem(s):\n  - ${problems.join('\n  - ')}\n  Fix: from the repo root run  node scripts/regenerate-takeaways.mjs  (needs ANTHROPIC_API_KEY).`
  if (strict) { console.error(msg); process.exit(1) }
  console.warn(msg + '\n  Continuing because --strict was not set. Publishing will refuse this data.')
}

mkdirSync(DEST, { recursive: true })
writeFileSync(path.join(DEST, 'episodes.json'), JSON.stringify(episodes, null, 2) + '\n')
writeFileSync(path.join(DEST, 'takeaways.json'), JSON.stringify(takeaways, null, 2) + '\n')
console.log(`sync-data: copied ${episodes.length} episodes and ${byId.size} takeaway sets into mcp/src/data`)
