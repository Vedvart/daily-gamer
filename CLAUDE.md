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



\## Current Status



Project is brand new. No code has been written yet. Starting with Phase 1 MVP.



\## Next Steps



1\. Set up project structure (React frontend, Express backend)

2\. Implement basic Hello World to verify deployment pipeline

3\. Set up Railway hosting with PostgreSQL

4\. Build authentication system

5\. Build result parsing engine

6\. Build user profiles and stats display

