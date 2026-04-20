# anybody-insights

A self-contained, one-shot prompt for building a **Facts & Opinions** interactive knowledge-graph website about any public figure (podcaster, founder, researcher, KOL) from their recent public content.

---

## How to use

Copy this entire README and paste it into any capable coding agent (Claude Code, Cursor, Devin, OpenHands, a Codex-like agent, or any Claude-powered tool). Or, if your agent can fetch URLs, just point it at this repo:

> Read `https://github.com/e7h4n/anybody-insights` and execute the prompt in the README. Before you start, ask me for: (1) the subject (public figure), (2) the time window, (3) the source material (RSS feed / YouTube channel / blog / Twitter handle), (4) which ingestion tools I have available (Firecrawl / Jina Reader / GitHub).

The agent should then run the 7-step workflow below end-to-end, ship the site, and return the deployment URL plus a data-quality summary.

---

## The Prompt

````
# Task: Build a "Facts & Opinions" interactive knowledge-graph site about a public figure from their recent public content

## Goal
Given one public figure (or a podcast / KOL) and a time window of their public content (podcasts, interviews, articles, tweets, talks), produce a deployable interactive website that surfaces two views:
- **Opinions**: subjective judgements, predictions, stances — tagged with a confidence level
- **Facts / Data Points**: verifiable numbers, events, quotes, attributions

## Input
The user will provide one of:
- A local folder of text material (`transcript.md`, `article.md`, `tweet.json`, …)
- A list of URLs (fetch via Firecrawl or Jina Reader)
- A YouTube channel or RSS feed (batch-pull transcripts first)

Default time window: past 12 months. Adjustable.

## Workflow (7 steps, strictly in order)

### 1. Ingest raw material
Pull everything into `/tmp/<subject>/raw/`. Each file carries a metadata header (`source_url`, `published_at`, `episode/title`, `speakers`). After ingest, count tokens per source; split any source over 50K tokens.

### 2. Extract (LLM pass per source, parallelized)
Run two extraction prompts against every source:
- **Opinions pass** — "subjective judgements, predictions, stances the subject made". Each row: `{speaker, topic, stance(≤150 chars), confidence: "h|m|l", bucket, source_date}`. Confidence inferred from tone: assertive = h, hedged = m, speculative = l.
- **Facts pass** — "verifiable numbers, events, quotes". Each row: `{date, episode, claim(≤120 chars), context(≤80 chars), speaker}`.

### 3. Clean, dedupe, bucket
- Dedupe by `(speaker, first 60 chars of stance)`. On conflict keep the higher-confidence row.
- Cluster opinions into **10–12 topic buckets** tailored to the subject's domain. For AI: `AI Timelines & AGI / Scaling & Architecture / Alignment & Safety / Economy / Biology / Cognition / Robotics / Energy / Other`. Pick buckets that fit your subject.
- Compute top-15 speakers by opinion count for the sidebar. **If the subject is a single person**, replace the speaker sidebar with top-15 topics (otherwise it'd be a single-name column).
- **Target volume**: 400–500 opinions, 400–700 data points. Under 300 means extraction was thin — loop back to Step 2.

### 4. Data file
Emit `lib/data.ts`:

```ts
export type Opinion = {id:number;sp:string;tp:string;st:string;cf:string;bk:string;dt:string};
export type DataPoint = {dt:string;ep:string;cl:string;cx:string;sp:string};
export const OPINIONS: Opinion[] = [...];
export const DATA_POINTS: DataPoint[] = [...];
export const TOPIC_COLORS: Record<string,string> = {...}; // one Tailwind-compatible hex per bucket
```

Field names are deliberately short (`sp/tp/st/cf/bk/dt`) to keep the TS file under 150 KB for fast Pages builds.

### 5. UI
Start from the scaffold in this repo (`app/`, `lib/`, `next.config.ts`, workflow, …). Build the following components under `components/` (hand-write, or use any codegen tool — just do not paste the full dataset into any LLM chat; wire it in via the file system):
- **TopBar**: live search across speaker + topic + stance; confidence filter (All / Confident / Hedged / Speculative); view toggle (Opinions ↔ Data Points).
- **Sidebar (left)**: Topic list with `TOPIC_COLORS` dots + Speaker list (top 15 with counts).
- **OpinionCard**: masonry grid (`columns-*` CSS, no library); each card shows speaker, stance, topic chip (colored), confidence dot, date.
- **DataPointsTable**: four columns — date / claim / context / speaker; sortable by date.
- **FilterBar**: chips for active filters with one-click clear.

Styling: background `#0a0a0a`, primary text `#ededed`, secondary `#888`. Tailwind transitions only, no animation libraries.

### 6. Deploy
- GitHub repo: `<subject>-insights` (fork/clone this scaffold, rename).
- Enable GitHub Pages → Source: **GitHub Actions**. The included `.github/workflows/pages.yml` handles `npm install && next build && deploy`. Resulting URL: `https://<user>.github.io/<subject>-insights/`.
- Every data refresh: `git push`; the workflow redeploys. Bump the header comment in `lib/data.ts`: `// <N> opinions · <M> data points`.
- Custom domain: add a `CNAME` file at the repo root and set the DNS `CNAME` record to `<user>.github.io`. Update `basePath`/`assetPrefix` in `next.config.ts` to `""` when serving from the apex.

### 7. Verify (do not skip)
Fetch the deployed HTML with a headless browser and assert:
- DOM card count (Opinions view) == `OPINIONS.length`
- Table row count (Data Points view) == `DATA_POINTS.length`
- Click 3 random topic filters → only that bucket's opinions render
- Spot-check 5 random opinion stances against the source transcript

If any count mismatches (e.g. 620 entries but only 300 render), it's **almost certainly a Step 4 batch-write truncation** — regenerate `data.ts` in full and redeploy.

## Known pitfalls (copy these guardrails, don't re-learn them)
1. **Never paste the full dataset into an LLM chat.** Large payloads silently truncate or timeout; wire data in via `lib/data.ts` on the file system.
2. **Data Points silently truncate** on batched imports — the last batch often times out after partially writing. Step 7's count assertion is non-negotiable.
3. **Hard-code `TOPIC_COLORS`** in `data.ts`. Do not hash at runtime — colors should be stable across reloads.
4. **Masonry layout** — use CSS `columns-*` only. Avoid `react-masonry-css`; first-paint jitter is worse.
5. **Single-subject mode** — if the subject is one person (CEO, researcher), swap the Speaker sidebar for "People they cited / interviewed". A sidebar with one name is useless.
6. **Source-date granularity** — normalize every `dt` to `YYYY-MM-DD` or `YYYY-MM`. Mixed granularity breaks date sorting.
7. **`basePath` on Pages** — the scaffold auto-derives `basePath` from `GITHUB_REPOSITORY` when `GITHUB_PAGES=true`. All asset links must be relative or use Next's `<Link>`/`<Image>`; hard-coded `/foo.png` paths will 404 under the repo-name prefix.

## Acceptance criteria
- First paint < 3 s
- ≥ 400 opinions and ≥ 400 data points
- Five interactions all functional: search, topic filter, speaker filter, confidence filter, view toggle
- Counts verified; 5/5 random stance spot-checks match source
- Deliverables: deployment URL + GitHub repo URL + summary (`N opinions / M data points / K topics / J speakers`)

## Before running, ask the user
- **Subject**: who? (e.g. Balaji Srinivasan, Paul Graham, Lex Fridman)
- **Time window**: default past 12 months
- **Sources**: podcast RSS / YouTube channel / blog RSS / Twitter handle / mix
- **Available ingestion tools**: Firecrawl / Jina Reader / direct file input — any scraper works. Deployment always goes to GitHub Pages via the bundled workflow.
````

---

## What's in this repo

- **`README.md`** — the prompt above.
- **Scaffolding** — a minimal Next.js 15 + Tailwind app (`app/`, `lib/`, `next.config.ts`, `package.json`, …) with an empty `lib/data.ts` template. Clone → fill in `OPINIONS` / `DATA_POINTS` / `TOPIC_COLORS` → `npm run build`.
- **GitHub Pages workflow** at `.github/workflows/pages.yml`. Push to `main`, enable Pages (source = GitHub Actions), done. `basePath` auto-resolves from `GITHUB_REPOSITORY`.

## Reference implementation

See [e7h4n/insights-dwarkesh](https://github.com/e7h4n/insights-dwarkesh) — a concrete build using this exact prompt. 450 opinions + 445 data points from 54 Dwarkesh Podcast episodes. Live at [e7h4n.github.io/insights-dwarkesh](https://e7h4n.github.io/insights-dwarkesh/).
