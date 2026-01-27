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

\## Workflow Preferences

\- **Always push changes to live:** After completing any feature or change, always commit and push to the repository so it auto-deploys to Railway. The user will reload the hosted website to see changes.
\- Do not wait for explicit permission to push - deploy automatically after completing work.

\## Project Structure

```
daily-gamer/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx         # Main app with React Router
│   │   ├── App.css         # App container styles
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css       # Global styles (CSS variables for dark theme)
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Header.jsx/css      # Navigation header
│   │   │   ├── Footer.jsx/css      # Site footer
│   │   │   ├── ResultInput.jsx/css # Paste input for game results
│   │   │   ├── ResultCard.jsx/css  # Displays a single game result
│   │   │   └── TodayResults.jsx/css # Grid of today's results
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx/css    # Landing page
│   │   │   └── UserPage.jsx/css    # Dashboard for scores
│   │   ├── parsers/        # Game result parsers (modular)
│   │   │   ├── index.js            # Parser registry
│   │   │   ├── wordleParser.js
│   │   │   ├── connectionsParser.js
│   │   │   ├── miniParser.js
│   │   │   ├── bandleParser.js
│   │   │   ├── catfishingParser.js
│   │   │   └── timeguessrParser.js
│   │   └── hooks/          # Custom React hooks
│   │       └── useGameResults.js   # localStorage state management
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
- [x] React Router setup (/ and /dashboard routes)
- [x] Result parsing engine (modular plugin system for 6 games)
- [x] User dashboard page with result input
- [x] Today's results display grid
- [x] localStorage persistence for results

In Progress:
- [ ] Add PostgreSQL database to Railway
- [ ] Build authentication system

\## Next Steps

1\. Add PostgreSQL database to Railway project
2\. Build authentication system (email/password first, then OAuth)
3\. Migrate localStorage to database storage
4\. Add historical stats and streak tracking

---

\## Session Notes (January 27, 2026)

\### Recent Work Completed This Session:
- Redesigned layout: Today's Results now full-width at top, Average Results below (single-column)
- Added visual flair to ResultCard: gradient backgrounds, game-colored accent bars, shimmer animations for "great results", hover effects, sparkle celebrations
- Compacted the result cards to take up less space (smaller icons, fonts, padding, tighter grid)
- All changes pushed to Railway and deployed

\### Current Task IN PROGRESS - Generate Scorecard Feature:
User requested a "Generate Scorecard" button next to "Customize Page" that opens a modal with three format options:
1. **Full Text** - Complete share text for all games back-to-back
2. **Compact Text** - Abbreviated one-line summaries (e.g., "Wordle #1234: 4/6")
3. **Image** - Visual scorecard using Canvas API

Flow: Button → Options modal → Generate → Result popup with auto-copy to clipboard

\### Files Created (COMPLETE):
- `client/src/components/ScorecardModal.jsx` - Full component with all three generators
- `client/src/components/ScorecardModal.css` - Complete styling

\### Files Modified (COMPLETE):
- `client/src/components/ProfileHeader.jsx` - Added `onGenerateScorecard` prop and button
- `client/src/components/ProfileHeader.css` - Added `.profile-header__button--accent` style

\### Files Modified (PARTIAL - NEED TO FINISH):
- `client/src/pages/UserPage.jsx` - Added import and state, but STILL NEED TO:
  1. Add the `<ScorecardModal>` component at the end of the JSX (after `<AddResultModal>`)
  2. Pass props: `isOpen={isScorecardOpen}`, `onClose={() => setIsScorecardOpen(false)}`, `results={todayResults}`

\### To Complete Next Session:
1. Finish UserPage.jsx - add the ScorecardModal component to the JSX
2. Test all three scorecard formats work correctly
3. Commit and push to Railway
4. Verify on live site

\### Special Game Logic Notes:
- Connections has special achievements: "Reverse Perfect" (purple→blue→green→yellow order) and "Purple First" (purple first but not full reverse)
- Catfishing supports decimal scores (e.g., 3.5/10) - DO NOT round
- "Great results" trigger celebrations: Wordle ≤3, Connections perfect/achievements, Mini ≤60s, Bandle ≤3, Catfishing ≥8, TimeGuessr ≥40K

