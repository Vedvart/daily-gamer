# Daily Gamer

## Project Overview

Daily Gamer is a central hub for people who play daily games (Wordle, NYT Connections, NYT Mini, Bandle, Catfishing, TimeGuessr, etc.). Users paste their share results from these games, and the site parses, stores, and displays them.

## Core Features (Phase 1 - MVP)

- User accounts (email/password + OAuth with Google/Apple)
- Paste results from supported daily games
- Personal profile showing today's results + historical stats
- Basic stats: averages, personal bests, streaks

## Future Features (Later Phases)

- Friend connections and group leaderboards
- Public/unlisted/private profile privacy controls
- Shareable result cards (images or formatted text)
- Game "playlists" with optional timers for speedruns
- Anonymous paste-and-compact tool (no account required)

## Supported Games (21 total)

1. **Wordle** - `Wordle [#] [n]/6` + emoji grid (🟩🟨⬛)
2. **NYT Connections** - `Connections Puzzle #[n]` + colored squares (🟨🟩🟦🟪)
3. **NYT Strands** - `Strands #[n]` + emoji grid (🔵🟡💡)
4. **NYT Mini** - `I solved the [date] New York Times Mini Crossword in [time]!`
5. **LA Times Mini** - `I finished the Los Angeles Times Mini Crossword in [time]`
6. **Bandle** - `Bandle #[n] [score]/6` + instrument emojis
7. **Catfishing** - `catfishing.net #[n] - [score]/10` + 🐈🐟 grid
8. **TimeGuessr** - `TimeGuessr #[n] [score]/50,000` + star ratings
9. **Travle** - `#travle #[n] +[extra]` + ✅🟧🟥 emojis
10. **Flagle** - `Flagle #[n] [guesses]/6` + flag guessing
11. **Kinda Hard Golf** - `Kinda Hard Golf [date] ⛳ [n] strokes`
12. **enclose.horse** - `enclose.horse Day [n] [medal] [percent]%`
13. **Kickoff League** - `Kickoff League #[n] [kicks] kicks`
14. **Scrandle** - `Scrandle #[n] [score]/10`
15. **One Up Puzzle** - `One Up Puzzle #[n]` + time
16. **Clues By Sam** - `Clues by Sam #[n]` + emoji grid
17. **Minute Cryptic** - `Minute Cryptic #[n]` + time/score
18. **Daily Dozen Trivia** - `Daily Dozen #[n] [score]/12`
19. **More Or Less** - `More or Less [streak] streak`
20. **Eruptle** - `Eruptle #[n] [score]/10`
21. **Thrice** - `Thrice Game #[n] → [points] points!`

Parser system is modular—each game is a plugin with its own regex/parsing logic. New games can be added by creating a new parser file.

## Technical Decisions

- **Frontend:** React
- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **Hosting:** Railway (handles app + database)
- **Auth:** Email/password + OAuth (Google/Apple)

## Design Preferences

- Dark mode color scheme
- Minimal clutter, but density is acceptable
- Clean, not flashy

## GitHub

- Repository: https://github.com/Vedvart/daily-gamer
- Push directly to `main` branch for now
- Auto-deploys to Railway on push

## Deployment

- **Hosting:** Railway (connected to GitHub, auto-deploys on push to main)
- **URL:** Check Railway dashboard for the live URL (*.up.railway.app)
- Railway project is connected to the Vedvart/daily-gamer repo

## Workflow Preferences

- **Always push changes to live:** After completing any feature or change, always commit and push to the repository so it auto-deploys to Railway. The user will reload the hosted website to see changes.
- Do not wait for explicit permission to push - deploy automatically after completing work.

## Project Structure

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
│   │   │   ├── TodayResults.jsx/css # Grid of today's results
│   │   │   ├── GameHistogram.jsx/css # Histogram components for all games
│   │   │   ├── AddResultModal.jsx/css # Modal for adding results
│   │   │   ├── ScorecardModal.jsx/css # Modal for generating scorecards
│   │   │   └── ProfileHeader.jsx/css  # Profile header with action buttons
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx/css    # Landing page
│   │   │   └── UserPage.jsx/css    # Dashboard for scores
│   │   ├── parsers/        # Game result parsers (21 total)
│   │   │   ├── index.js            # Parser registry
│   │   │   ├── wordleParser.js
│   │   │   ├── connectionsParser.js
│   │   │   ├── strandsParser.js
│   │   │   ├── miniParser.js
│   │   │   ├── latimesMiniParser.js
│   │   │   ├── bandleParser.js
│   │   │   ├── catfishingParser.js
│   │   │   ├── timeguessrParser.js
│   │   │   ├── travleParser.js
│   │   │   ├── flagleParser.js
│   │   │   ├── kindahardgolfParser.js
│   │   │   ├── enclosehorseParser.js
│   │   │   ├── kickoffleagueParser.js
│   │   │   ├── scrandleParser.js
│   │   │   ├── oneuppuzzleParser.js
│   │   │   ├── cluesbysamParser.js
│   │   │   ├── minutecrypticParser.js
│   │   │   ├── dailydozenParser.js
│   │   │   ├── moreorlessParser.js
│   │   │   ├── eruptleParser.js
│   │   │   └── thriceParser.js
│   │   └── hooks/          # Custom React hooks
│   │       └── useGameResults.js   # localStorage state management + histograms
│   ├── public/favicon.svg
│   ├── index.html
│   └── vite.config.js      # Vite config with API proxy
├── server/                 # Express backend
│   └── index.js            # API server, serves React build in production
├── package.json            # Root scripts, Railway uses this
└── CLAUDE.md
```

## Development Commands

```bash
npm run dev          # Run both client and server locally
npm run dev:client   # Run only frontend (localhost:5173)
npm run dev:server   # Run only backend (localhost:3001)
npm run build        # Build client for production
```

## Current Status

**Phase 1 MVP - In Progress**

Completed:
- [x] Project structure (React frontend, Express backend)
- [x] Hello World landing page with dark mode styling
- [x] Railway deployment pipeline working
- [x] API health check endpoint (/api/health)
- [x] React Router setup (/ and /dashboard routes)
- [x] Result parsing engine (modular plugin system for 21 games)
- [x] User dashboard page with result input
- [x] Today's results display grid with visual flair
- [x] localStorage persistence for results
- [x] Average Results histograms for all 21 games
- [x] Generate Scorecard feature (Full Text, Compact Text, Image)

In Progress:
- [ ] Add PostgreSQL database to Railway
- [ ] Build authentication system

## Next Steps

1. Add PostgreSQL database to Railway project
2. Build authentication system (email/password first, then OAuth)
3. Migrate localStorage to database storage
4. Add historical stats and streak tracking

---

## Special Game Logic Notes

- **Connections** has special achievements: "Reverse Perfect" (purple→blue→green→yellow order) and "Purple First" (purple first but not full reverse)
- **Catfishing** supports decimal scores (e.g., 3.5/10) - DO NOT round
- **"Failed" status** only shows for games with finite tries: Wordle, Bandle, Connections, Flagle
- Score-based games (Catfishing, TimeGuessr, etc.) just show the score, never "Failed"
- **"Great results"** trigger celebrations: Wordle ≤3, Connections perfect/achievements, Mini ≤60s, Bandle ≤3, Catfishing ≥8, TimeGuessr ≥40K, Strands 0 hints, Travle +0, etc.

## Scorecard Feature

The "Generate Scorecard" button (purple accent) opens a modal with three format options:
1. **Full Text** - Complete share text for all games back-to-back
2. **Compact Text** - Abbreviated one-line summaries (e.g., "Wordle #1234: 4/6")
3. **Image** - Visual scorecard using Canvas API with centered cards

All formats auto-copy to clipboard when generated.

## Histogram Types by Game

| Game | Histogram Type |
|------|---------------|
| Wordle | Guesses (1-6, X) |
| Connections | Achievements + Mistakes (RP, PF, 0-3, X) |
| Strands | Hints used (0, 1, 2, 3, 4+) |
| NYT Mini | Time buckets (<30s to 3m+) |
| LA Times Mini | Time buckets (<30s to 3m+) |
| Bandle | Guesses (1-6, X) |
| Catfishing | Score (0-10 in 0.5 increments) |
| TimeGuessr | Score ranges (5k buckets) |
| Travle | Extra guesses (+0 to +5+) |
| Flagle | Guesses (1-6, X) |
| Kinda Hard Golf | Strokes (1-6+) |
| enclose.horse | Percentage (0-20%, 21-40%, ... 100%) |
| Kickoff League | Kicks (1-6+) |
| Scrandle | Score (0-10) |
| One Up Puzzle | Time buckets (<1m to 10m+) |
| Clues By Sam | Time buckets (<1m to 10m+) |
| Minute Cryptic | Score vs par |
| Daily Dozen | Score ranges (0-12) |
| More Or Less | Streak ranges (1-5 to 21+) |
| Eruptle | Score (0-10) |
| Thrice | Points ranges (0-15) |
