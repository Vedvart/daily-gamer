\# Daily Gamer



\## Project Overview



Daily Gamer is a central hub for people who play daily games (Wordle, NYT Connections, NYT Mini, Bandle, Catfishing, TimeGuessr, etc.). Users paste their share results from these games, and the site parses, stores, and displays them.



\## Core Features (Phase 1 - MVP)



\- User accounts (email/password + OAuth with Google/Apple)

\- Paste results from supported daily games

\- Personal profile showing today's results + historical stats

\- Basic stats: averages, personal bests, streaks



\## Future Features (Later Phases)



\- Friend connections and group leaderboards

\- Public/unlisted/private profile privacy controls

\- Shareable result cards (images or formatted text)

\- Game "playlists" with optional timers for speedruns

\- Anonymous paste-and-compact tool (no account required)



\## Supported Games (Initial)



1\. \*\*Wordle\*\* - `Wordle \[#] \[n]/6` + emoji grid (🟩🟨⬛)

2\. \*\*NYT Connections\*\* - `Connections Puzzle #\[n]` + colored squares (🟨🟩🟦🟪)

3\. \*\*NYT Mini\*\* - `I solved the \[date] New York Times Mini Crossword in \[time]!`

4\. \*\*Bandle\*\* - `Bandle #\[n] \[score]/6` + instrument emojis

5\. \*\*Catfishing\*\* - `catfishing.net #\[n] - \[score]/10` + 🐈🐟 grid

6\. \*\*TimeGuessr\*\* - `TimeGuessr #\[n] \[score]/50,000` + star ratings



Parser should be modular—each game is a plugin with its own regex/parsing logic. New games can be added by defining their format.



\## Technical Decisions



\- \*\*Frontend:\*\* React

\- \*\*Backend:\*\* Node.js with Express

\- \*\*Database:\*\* PostgreSQL

\- \*\*Hosting:\*\* Railway (handles app + database)

\- \*\*Auth:\*\* Email/password + OAuth (Google/Apple)



\## Design Preferences



\- Dark mode color scheme

\- Minimal clutter, but density is acceptable

\- Clean, not flashy



\## GitHub

\- Repository: https://github.com/Vedvart/daily-gamer
\- Push directly to `main` branch for now
\- Auto-deploys to Railway on push

\## Deployment

\- **Hosting:** Railway (connected to GitHub, auto-deploys on push to main)
\- **URL:** Check Railway dashboard for the live URL (*.up.railway.app)
\- Railway project is connected to the Vedvart/daily-gamer repo

\## Project Structure

```
daily-gamer/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   ├── App.css         # Component styles
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles (CSS variables for dark theme)
│   ├── public/favicon.svg
│   ├── index.html
│   └── vite.config.js      # Vite config with API proxy
├── server/                 # Express backend
│   └── index.js            # API server, serves React build in production
├── package.json            # Root scripts, Railway uses this
└── CLAUDE.md
```

\## Development Commands

```bash
npm run dev          # Run both client and server locally
npm run dev:client   # Run only frontend (localhost:5173)
npm run dev:server   # Run only backend (localhost:3001)
npm run build        # Build client for production
```

\## Current Status

**Phase 1 MVP - In Progress**

Completed:
- [x] Project structure (React frontend, Express backend)
- [x] Hello World landing page with dark mode styling
- [x] Railway deployment pipeline working
- [x] API health check endpoint (/api/health)

In Progress:
- [ ] Add PostgreSQL database to Railway
- [ ] Build authentication system
- [ ] Build result parsing engine
- [ ] Build user profiles and stats display

\## Next Steps

1\. Add PostgreSQL database to Railway project
2\. Build authentication system (email/password first, then OAuth)
3\. Build result parsing engine (modular plugin system for each game)
4\. Build user profiles and stats display

