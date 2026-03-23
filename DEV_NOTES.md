# Dev Notes — Lenny's Insights
### Sri Adidam · Last updated: March 2026

---

## Daily Commands

| What | Command |
|------|---------|
| Navigate to project | `cd "C:\Users\Sri\OneDrive\Desktop\AI Projects\Sri Project Lenny's Insights\lennys-insights"` |
| Start the app | `npm run dev` |
| Stop the app | `Ctrl + C` in terminal |
| Restart the app | `Ctrl + C` then `npm run dev` again |
| Build for production | `npm run build` |
| Update npm (optional) | `npm install -g npm@latest` |

After starting, open: **http://localhost:5173**

---

## ⚠️ GIT SAFETY — READ BEFORE EVERY PUSH

**NEVER commit `.env` to GitHub.**

Your `.env` file contains your Anthropic API key. If it goes to GitHub (even a private repo), it is a security risk.

Before every `git push`, verify:
1. `.env` is listed in `.gitignore` ✅ (already set up)
2. Run `git status` — `.env` should NOT appear in the list of files to commit
3. Only `.env.example` (with no real key) should ever be committed

If you ever accidentally push your key, go to **console.anthropic.com → API Keys** and delete it immediately, then generate a new one.

---

## Takeaway Caching Plan (save money + work offline)

### The idea
Instead of calling the Claude API every time a user opens an episode, we:
1. Generate takeaways once per episode (using your key, locally)
2. Save them to a JSON file in the repo (`src/data/takeaways.json`)
3. The app reads from that file first — API is never called in production

### Benefits
- ✅ Zero API cost for visitors / production use
- ✅ Works offline and on GitHub Pages / Netlify
- ✅ Takeaways are consistent (same result every time)
- ✅ API key stays out of the deployed app entirely

### Plan (to implement next)
- Add `src/data/takeaways.json` — keyed by episode id
- Update `useTakeaways.ts` to check JSON cache first, only call API if missing
- Add a local script (`scripts/generate-takeaways.ts`) you run once on your machine to populate the cache
- Commit `takeaways.json` to git (it's just text, no keys)

### Cost estimate without caching
- Each takeaway generation ≈ ~800 tokens in + ~200 tokens out
- Cost per episode: ~$0.003 (less than half a cent)
- 22 episodes × $0.003 = ~$0.07 total to generate all takeaways once

So even without caching it's cheap — but caching means $0 ongoing cost and
no key needed in the deployed build at all.

---

## Project Location
```
C:\Users\Sri\OneDrive\Desktop\AI Projects\Sri Project Lenny's Insights\lennys-insights
```

## Key Files
| File | Purpose |
|------|---------|
| `.env` | Your API key — NEVER commit |
| `.env.example` | Blank template — safe to commit |
| `src/data/episodes.ts` | Add new episodes here |
| `src/data/takeaways.json` | (coming next) Cached takeaways |
| `README.md` | Setup instructions |
