# Show Tracker

A personal TV watchlist. Keep track of what you're **watching**, what you **plan to watch**, and get **recommendations** based on both.

Built with React, Vite and TypeScript. Show data comes from [TMDB](https://www.themoviedb.org/); your watchlist is saved in the browser's localStorage.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Get a free TMDB account, then copy the **API Read Access Token** from <https://www.themoviedb.org/settings/api>.
3. Copy `.env.example` to `.env.local` and paste the token:
   ```
   VITE_TMDB_READ_TOKEN=your-token-here
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

> The token is bundled into the frontend, so anyone using the built site can see it. That's fine for personal use; move TMDB calls behind a backend before deploying publicly.

## How recommendations work

For up to 10 shows on your list (Watching first, then newest), the app fetches TMDB's per-show recommendations and merges them (`src/lib/recommendations.ts`). A show ranks higher when:

- several of your shows recommend it,
- it sits near the top of those lists,
- it comes from a show you're **watching** (counts double vs. plan to watch),
- its genres overlap with the genres on your list.

Shows already on your list are excluded.

## Project layout

```
src/
  api/tmdb.ts               TMDB client (search, recommendations, poster URLs)
  storage/watchlist.ts      Persistence (localStorage today; swap for Supabase etc. later)
  hooks/useWatchlist.ts     Watchlist state + saving
  hooks/useRecommendations.ts
  lib/recommendations.ts    Recommendation ranking (pure functions)
  components/               ShowCard, SearchPanel, RecommendationsPanel
  App.tsx                   Tabs: Watching / Plan to Watch / Recommended / Search
```

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: type-check and build for production
- `npm run lint`: lint with oxlint
- `npm run preview`: preview the production build
