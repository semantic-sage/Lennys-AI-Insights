# Lenny's Podcast Insights
### by Sri Adidam · github.com/semantic-sage

A React app for discovering AI-extracted insights from Lenny's Podcast episodes — with analytics tracking and a live dashboard.
**[→ Try it live](https://semantic-sage.github.io/Lennys-AI-Insights/)**
---

## Quick Start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Then edit .env and fill in your keys (see below)

# 3. Run locally
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Edit `.env` — never commit this file (it's in `.gitignore`).

```env
# Anthropic — for generating insights on uncached episodes
# Get key at: console.anthropic.com → API Keys
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase — for analytics tracking
# Get these at: supabase.com → your project → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Supabase Setup (5 minutes)

Analytics won't work until you do this once.

### Step 1 — Create account
Go to [supabase.com](https://supabase.com) and sign up free. Create a new project (any name, any region).

### Step 2 — Create the events table
In your Supabase project, go to **SQL Editor** and run this:

```sql
create table events (
  id           bigserial primary key,
  created_at   timestamptz default now(),
  event_type   text not null,
  episode_id   int,
  hero_mode    text,
  session_id   text not null,
  time_on_page int
);

-- Allow anonymous inserts (your app writes events from the browser)
alter table events enable row level security;
create policy "allow anon insert" on events for insert to anon with check (true);
create policy "allow anon select" on events for select to anon using (true);
```

### Step 3 — Get your keys
Go to **Settings → API** in your Supabase project. Copy:
- **Project URL** → paste as `VITE_SUPABASE_URL`
- **anon / public key** → paste as `VITE_SUPABASE_ANON_KEY`

### Step 4 — Restart dev server
```bash
# Ctrl+C to stop, then:
npm run dev
```

Events will now appear in your Supabase **Table Editor → events** in real time.

### View your dashboard
Navigate to `/#/dashboard` in the app, or click "Analytics dashboard →" in the left sidebar.

---

## Deploy to GitHub Pages

### Step 1 — Create the repo
Go to [github.com/Learner-Apps](https://github.com/Learner-Apps) and create a new repository named `lennys-insights`.

### Step 2 — Push your code
```bash
git init
git add .
git commit -m "v4 — wow factors, analytics, dashboard"
git remote add origin https://github.com/Learner-Apps/lennys-insights.git
git push -u origin main
```

### Step 3 — Add secrets to GitHub
Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**. Add:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

> Do NOT add your Anthropic key — the deployed app uses pre-cached takeaways only.

### Step 4 — Create GitHub Actions workflow
Create this file in your project:

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 5 — Enable GitHub Pages
Go to repo → **Settings → Pages → Source → gh-pages branch**. Save.

Your app will be live at:
**https://learner-apps.github.io/lennys-insights/**

Every push to `main` automatically rebuilds and redeploys.

---

## Project Structure

```
src/
├── main.tsx                    # Entry — HashRouter (GitHub Pages compatible)
├── App.tsx                     # Shell — routes + persistent left panel
├── App.module.css
├── styles/global.css           # CSS variables, dark theme
├── lib/
│   ├── supabase.ts             # Lightweight Supabase client (no SDK)
│   └── analytics.ts            # All tracking functions
├── data/
│   ├── episodes.ts             # 22 episodes + TypeScript types
│   └── takeaways.json          # Pre-cached insights (5 formats × 22 episodes)
├── components/
│   ├── Topbar                  # Sri's byline bar
│   ├── PortfolioSidebar        # Left panel — always visible
│   └── HeroSection             # Rotating wow — Mode A / B / C
└── pages/
    ├── HomePage                # Discovery — filters + episode grid
    ├── EpisodePage             # Full episode detail — all insights
    └── DashboardPage           # Analytics — views, clicks, hero modes, time
```

---

## Version History

| Version | Description |
|---------|-------------|
| v1.0 | Initial React app — discovery center, AI takeaways, portfolio sidebar |
| v2.0 | Redesign — left portfolio pane, 4 insight types, pre-built JSON cache |
| v3.0 | Bold dark redesign — resources added, all 4 insight types cached |
| v4.0 | Rotating hero (A/B/C modes), 5 rotating takeaway formats, React Router pages |
| v5.0 | Supabase analytics, dashboard, GitHub Pages deploy config, HashRouter |
