// PinnedGamesSection Component
// Displays featured games for a group with member results

import { useState, useEffect } from 'react';
import { getParser } from '../../parsers';
import useUsers from '../../hooks/useUsers';
import { resultsApi } from '../../utils/api';
import UserAvatar from '../user/UserAvatar';
import './PinnedGamesSection.css';

// Helper to get results from localStorage
function getMemberResultsLocal(userId, today) {
  try {
    const key = `dailygamer_results_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      return (data.results || []).filter(r =>
        (r.date === today || r.playDate === today)
      );
    }
  } catch (e) {
    console.error('Failed to load results for user:', userId, e);
  }
  return [];
}

function PinnedGamesSection({ groupId, pinnedGames, members, useApi = false }) {
  const { getUserSync } = useUsers();
  const today = new Date().toISOString().split('T')[0];
  const [gameResults, setGameResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load results for all pinned games
  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      if (!members.length || !pinnedGames.length) {
        if (isMounted) {
          setGameResults({});
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }
      const results = {};

      if (useApi) {
        // Load from API - fetch leaderboard for each game
        const userIds = members.map(m => m.userId);

        await Promise.all(pinnedGames.map(async (gameId) => {
          try {
            const leaderboard = await resultsApi.getLeaderboard(gameId, today, userIds);
            results[gameId] = {};
            (leaderboard || []).forEach(r => {
              results[gameId][r.userId] = {
                score: r.scoreDisplay || r.score,
                scoreValue: r.scoreValue,
                isFailed: r.isFailed,
                isGreat: r.isGreat,
              };
            });
          } catch (e) {
            console.log(`Failed to load ${gameId} results:`, e.message);
            results[gameId] = {};
          }
        }));
      } else {
        // Load from localStorage
        pinnedGames.forEach(gameId => {
          results[gameId] = {};
        });

        members.forEach(member => {
          const memberResults = getMemberResultsLocal(member.userId, today);
          pinnedGames.forEach(gameId => {
            const result = memberResults.find(r => r.gameId === gameId);
            if (result) {
              results[gameId][member.userId] = {
                score: result.score || result.scoreDisplay,
                scoreValue: result.scoreValue,
                isFailed: result.isFailed || !result.won,
                isGreat: result.isGreat,
              };
            }
          });
        });
      }

      if (isMounted) {
        setGameResults(results);
        setIsLoading(false);
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [members, pinnedGames, today, useApi]);

  // Build game data with results
  const gameData = pinnedGames.map(gameId => {
    const parser = getParser(gameId);
    const gameName = parser?.name || gameId.charAt(0).toUpperCase() + gameId.slice(1);
    const gameIcon = parser?.icon || '🎮';

    const membersWithResults = members.map(member => {
      const user = getUserSync(member.userId);
      const result = gameResults[gameId]?.[member.userId];
      return { ...member, user, result };
    });

    // Sort: users with results first, then by score
    membersWithResults.sort((a, b) => {
      if (a.result && !b.result) return -1;
      if (!a.result && b.result) return 1;
      if (a.result && b.result) {
        // For most games, lower is better (wordle, bandle, etc.)
        // For some games, higher is better (catfishing, timeguessr)
        const higherIsBetter = ['catfishing', 'timeguessr', 'dailydozen', 'moreorless', 'thrice', 'scrandle', 'eruptle'].includes(gameId);
        if (higherIsBetter) {
          return (b.result.scoreValue || 0) - (a.result.scoreValue || 0);
        }
        return (a.result.scoreValue || 999) - (b.result.scoreValue || 999);
      }
      return 0;
    });

    // Count completed
    const completedCount = membersWithResults.filter(m => m.result).length;

    return {
      id: gameId,
      name: gameName,
      icon: gameIcon,
      members: membersWithResults,
      completedCount,
    };
  });

  if (isLoading) {
    return (
      <div className="pinned-games-section">
        <div className="pinned-games-loading">Loading results...</div>
      </div>
    );
  }

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
            <div className="pinned-game-card__header">
              <span className="pinned-game-card__icon">{game.icon}</span>
              <h3 className="pinned-game-card__title">{game.name}</h3>
              <span className="pinned-game-card__count">
                {game.completedCount}/{members.length} played
              </span>
            </div>
            <div className="pinned-game-card__members">
              {game.members.slice(0, 6).map(({ userId, user, result }) => (
                user && (
                  <div
                    key={userId}
                    className={`member-result ${result ? 'has-result' : 'no-result'} ${result?.isGreat ? 'is-great' : ''} ${result?.isFailed ? 'is-failed' : ''}`}
                  >
                    <UserAvatar user={user} size="small" />
                    <div className="member-result__info">
                      <span className="member-result__name">{user.displayName}</span>
                      {result ? (
                        <span className={`member-result__score ${result.isGreat ? 'great' : ''} ${result.isFailed ? 'failed' : ''}`}>
                          {result.score}
                        </span>
                      ) : (
                        <span className="member-result__pending">—</span>
                      )}
                    </div>
                  </div>
                )
              ))}
              {game.members.length > 6 && (
                <div className="pinned-game-card__more">
                  +{game.members.length - 6} more
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
