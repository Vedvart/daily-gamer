// PinnedGamesSection Component
// Displays featured games for a group with member results

import { useMemo } from 'react';
import { getParser } from '../../parsers';
import useUsers from '../../hooks/useUsers';
import UserAvatar from '../user/UserAvatar';
import './PinnedGamesSection.css';

// Helper to get results from localStorage without hooks
function getMemberResults(userId) {
  try {
    const key = `dailygamer_results_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      return data.results || [];
    }
  } catch (e) {
    console.error('Failed to load results for user:', userId, e);
  }
  return [];
}

function PinnedGamesSection({ groupId, pinnedGames, members }) {
  const { getUser } = useUsers();
  const today = new Date().toISOString().split('T')[0];

  // Pre-fetch all member results (not using hooks in loops)
  const memberResultsMap = useMemo(() => {
    const map = {};
    members.forEach(member => {
      map[member.userId] = getMemberResults(member.userId);
    });
    return map;
  }, [members]);

  // Build game data with results
  const gameData = pinnedGames.map(gameId => {
    const parser = getParser(gameId);
    const gameName = parser?.name || gameId;

    const membersWithResults = members.map(member => {
      const user = getUser(member.userId);
      const results = memberResultsMap[member.userId] || [];
      const todayResult = results.find(r => r.gameId === gameId && r.date === today);
      return { ...member, user, todayResult };
    });

    return {
      id: gameId,
      name: gameName,
      members: membersWithResults
    };
  });

  if (gameData.length === 0) {
    return (
      <div className="pinned-games-section">
        <div className="pinned-games-empty">
          No featured games configured.
        </div>
      </div>
    );
  }

  return (
    <div className="pinned-games-section">
      <div className="pinned-games-grid">
        {gameData.map(game => (
          <div key={game.id} className={`pinned-game-card pinned-game-card--${game.id}`}>
            <h3 className="pinned-game-card__title">{game.name}</h3>
            <div className="pinned-game-card__members">
              {game.members.slice(0, 8).map(({ userId, user, todayResult }) => (
                user && (
                  <div
                    key={userId}
                    className={`member-result ${todayResult ? 'has-result' : 'no-result'}`}
                  >
                    <UserAvatar user={user} size="small" />
                    <div className="member-result__info">
                      <span className="member-result__name">{user.displayName}</span>
                      {todayResult ? (
                        <span className="member-result__score">{todayResult.score}</span>
                      ) : (
                        <span className="member-result__pending">Not played</span>
                      )}
                    </div>
                  </div>
                )
              ))}
              {game.members.length > 8 && (
                <div className="pinned-game-card__more">
                  +{game.members.length - 8} more
                </div>
              )}
              {game.members.length === 0 && (
                <div className="pinned-game-card__empty">
                  No members yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PinnedGamesSection;
