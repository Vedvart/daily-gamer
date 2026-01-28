// DailyLeaderboard Component
// Shows today's rankings for a group

import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useDailyLeaderboard, useCombinedDailyLeaderboard } from '../../hooks/useGroupLeaderboard';
import LeaderboardGameSelector from './LeaderboardGameSelector';
import LeaderboardRow from './LeaderboardRow';
import './DailyLeaderboard.css';

function DailyLeaderboard({ groupId, enabledGames, members }) {
  const { currentUserId } = useCurrentUser();
  const [selectedGame, setSelectedGame] = useState('all');

  // Get rankings based on selection
  const singleGameRankings = useDailyLeaderboard(
    selectedGame !== 'all' ? members : [],
    selectedGame !== 'all' ? selectedGame : null
  );

  const combinedRankings = useCombinedDailyLeaderboard(
    selectedGame === 'all' ? members : [],
    selectedGame === 'all' ? enabledGames : []
  );

  const rankings = selectedGame === 'all' ? combinedRankings : singleGameRankings;

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="daily-leaderboard">
      <div className="daily-leaderboard__date">
        {dateStr}
      </div>

      <LeaderboardGameSelector
        enabledGames={enabledGames}
        selectedGame={selectedGame}
        onSelectGame={setSelectedGame}
        showAllOption={enabledGames.length > 1}
      />

      {rankings.length > 0 ? (
        <div className="daily-leaderboard__list">
          {rankings.map(entry => (
            <LeaderboardRow
              key={entry.userId}
              rank={entry.rank}
              userId={entry.userId}
              score={entry.score}
              formattedScore={
                selectedGame === 'all'
                  ? `${entry.totalPoints} pts`
                  : entry.formattedScore
              }
              subtitle={
                selectedGame === 'all' && entry.gamesPlayed > 0
                  ? `${entry.gamesPlayed} game${entry.gamesPlayed !== 1 ? 's' : ''}`
                  : undefined
              }
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="daily-leaderboard__empty">
          <p>
            {selectedGame === 'all'
              ? 'No results yet today. Be the first to play!'
              : `No one has played ${selectedGame} yet today.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default DailyLeaderboard;
