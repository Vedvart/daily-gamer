// HistoricalLeaderboard Component
// Shows all-time rankings for a group

import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useHistoricalLeaderboard, useCombinedHistoricalLeaderboard } from '../../hooks/useGroupLeaderboard';
import LeaderboardGameSelector from './LeaderboardGameSelector';
import LeaderboardRow from './LeaderboardRow';
import './HistoricalLeaderboard.css';

function HistoricalLeaderboard({ groupId, enabledGames, members, useApi = false }) {
  const { currentUserId } = useCurrentUser();
  const [selectedGame, setSelectedGame] = useState('all');

  // Get rankings based on selection
  const { rankings: singleGameRankings, isLoading: singleLoading } = useHistoricalLeaderboard(
    selectedGame !== 'all' ? members : [],
    selectedGame !== 'all' ? selectedGame : null,
    useApi
  );

  const { rankings: combinedRankings, isLoading: combinedLoading } = useCombinedHistoricalLeaderboard(
    selectedGame === 'all' ? members : [],
    selectedGame === 'all' ? enabledGames : [],
    useApi
  );

  const rankings = selectedGame === 'all' ? combinedRankings : singleGameRankings;
  const isLoading = selectedGame === 'all' ? combinedLoading : singleLoading;

  return (
    <div className="historical-leaderboard">
      <LeaderboardGameSelector
        enabledGames={enabledGames}
        selectedGame={selectedGame}
        onSelectGame={setSelectedGame}
        showAllOption={enabledGames.length > 1}
      />

      {isLoading ? (
        <div className="historical-leaderboard__empty">
          <p>Loading leaderboard...</p>
        </div>
      ) : rankings.length > 0 ? (
        <div className="historical-leaderboard__list">
          {rankings.map(entry => (
            <LeaderboardRow
              key={entry.userId}
              rank={entry.rank}
              userId={entry.userId}
              score={entry.averageScore || entry.totalPoints}
              formattedScore={
                selectedGame === 'all'
                  ? `${entry.totalPoints} pts`
                  : entry.formattedScore || `Avg: ${entry.formattedAverage}`
              }
              subtitle={
                selectedGame === 'all'
                  ? `${entry.firstPlaces} first${entry.firstPlaces !== 1 ? 's' : ''}`
                  : `${entry.gamesPlayed} game${entry.gamesPlayed !== 1 ? 's' : ''} played`
              }
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="historical-leaderboard__empty">
          <p>
            {selectedGame === 'all'
              ? 'No historical data yet. Start playing to build your rankings!'
              : `No one has played ${selectedGame} yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default HistoricalLeaderboard;
