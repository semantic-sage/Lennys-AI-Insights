#!/usr/bin/env node
// Regenerates src/data/takeaways.json from the real episode transcripts.
//
// Usage (from the repo root):
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/regenerate-takeaways.mjs            # all 22 episodes
//   node scripts/regenerate-takeaways.mjs --only 7                                 # one episode
//   node scripts/regenerate-takeaways.mjs --dry-run                                # fetch transcripts, no API calls
//   node scripts/regenerate-takeaways.mjs --model claude-sonnet-5-5               # cheaper model
//
// Transcripts come from the public archive github.com/ChatPRD/lennys-podcast-transcripts
// and are read in memory only. Nothing from the transcript is stored except the generated insights.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EPISODES_PATH = path.join(ROOT, 'src/data/episodes.json')
const TAKEAWAYS_PATH = path.join(ROOT, 'src/data/takeaways.json')
const ARCHIVE = 'https://raw.githubusercontent.com/ChatPRD/lennys-podcast-transcripts/main/episodes'

const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const DRY_RUN = args.includes('--dry-run')
const ONLY = flag('--only') ? Number(flag('--only')) : undefined
const MODEL = flag('--model') ?? 'claude-opus-5-5'

const Insights = z.object({
  takeaways: z.array(z.object({
    format: z.enum(['do-this', 'remember-this', 'real-example', 'ask-yourself', 'avoid-this']),
    text: z.string(),
  })).length(5),
  framework: z.string(),
  quote: z.string(),
  bestFor: z.array(z.string()).min(2).max(4),
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(['book', 'article', 'framework', 'tool']),
  })).max(5),
})

const PROMPT = `You are summarizing one episode of Lenny's Podcast for product people who want to learn from it.
Read the full transcript below and return insights that are faithful to what the guest actually said.

Rules:
- Exactly 5 takeaways, one of each format in this order: do-this, remember-this, real-example, ask-yourself, avoid-this.
- Each takeaway is 1-2 plain sentences. No jargon without a plain explanation.
- "framework": the one mental model or method the guest teaches, named and explained in one sentence.
- "quote": one memorable sentence the guest said, verbatim from the transcript.
- "bestFor": 2-4 roles who benefit most (for example "Product Manager", "Founder", "Growth Lead", "Designer").
- "resources": books, articles, frameworks or tools the guest named, up to 5. Empty array if none.`

function stripFrontmatter(md) {
  if (!md.startsWith('---')) return md
  const end = md.indexOf('\n---', 3)
  return end === -1 ? md : md.slice(end + 4)
}

async function fetchTranscript(ep) {
  const url = `${ARCHIVE}/${ep.archiveDir}/transcript.md`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Transcript fetch failed for episode ${ep.id} (${ep.guest}): ${res.status} ${url}`)
  const md = await res.text()
  if (!md.includes(`video_id: ${ep.videoId}`)) {
    throw new Error(`Archive folder ${ep.archiveDir} does not contain video ${ep.videoId} (episode ${ep.id}, ${ep.guest})`)
  }
  return stripFrontmatter(md)
}

async function main() {
  const episodes = JSON.parse(await readFile(EPISODES_PATH, 'utf8'))
  const targets = ONLY ? episodes.filter((e) => e.id === ONLY) : episodes
  if (targets.length === 0) throw new Error(`No episode with id ${ONLY}`)

  let existing = { episodes: [] }
  try { existing = JSON.parse(await readFile(TAKEAWAYS_PATH, 'utf8')) } catch { /* first run */ }
  const byId = new Map((existing.episodes ?? []).filter((e) => e.videoId).map((e) => [e.episodeId, e]))

  const client = DRY_RUN ? null : new Anthropic()
  for (const ep of targets) {
    process.stdout.write(`#${ep.id} ${ep.guest} ... `)
    const transcript = await fetchTranscript(ep)
    if (DRY_RUN) { console.log(`transcript ok (${transcript.length.toLocaleString()} chars)`); continue }

    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `${PROMPT}\n\nEpisode: ${ep.title}\nGuest: ${ep.guest} (${ep.role})\n\n<transcript>\n${transcript}\n</transcript>`,
      }],
      output_config: { format: zodOutputFormat(Insights) },
    })
    if (response.stop_reason === 'refusal') throw new Error(`Model refused episode ${ep.id}`)
    if (!response.parsed_output) throw new Error(`Could not parse insights for episode ${ep.id}`)
    byId.set(ep.id, { episodeId: ep.id, videoId: ep.videoId, ...response.parsed_output })
    console.log(`done (${response.usage.input_tokens.toLocaleString()} in / ${response.usage.output_tokens} out)`)
  }

  if (DRY_RUN) return
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    model: MODEL,
    source: 'transcripts',
    episodes: episodes.map((e) => byId.get(e.id)).filter(Boolean),
  }
  await writeFile(TAKEAWAYS_PATH, JSON.stringify(out, null, 2) + '\n')
  console.log(`Wrote ${out.episodes.length} episodes to ${path.relative(ROOT, TAKEAWAYS_PATH)}`)
}

main().catch((err) => { console.error(err.message); process.exit(1) })
