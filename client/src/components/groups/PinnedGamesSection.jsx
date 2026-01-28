// PinnedGamesSection Component
// Displays featured games for a group with member results

import { getParser } from '../../parsers';
import useGameResults from '../../hooks/useGameResults';
import useUsers from '../../hooks/useUsers';
import UserAvatar from '../user/UserAvatar';
import './PinnedGamesSection.css';

function PinnedGamesSection({ groupId, pinnedGames, members }) {
  const { getUser } = useUsers();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // For each pinned game, find members who have played today
  const gameData = pinnedGames.map(gameId => {
    const parser = getParser(gameId);
    const gameName = parser?.name || gameId;

    return {
      id: gameId,
      name: gameName,
      members: members.map(member => {
        const user = getUser(member.userId);
        return { ...member, user };
      })
    };
  });

  return (
    <div className="pinned-games-section">
      {gameData.length === 0 ? (
        <div className="pinned-games-empty">
          No featured games configured.
        </div>
      ) : (
        <div className="pinned-games-grid">
          {gameData.map(game => (
            <PinnedGameCard
              key={game.id}
              gameId={game.id}
              gameName={game.name}
              members={game.members}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PinnedGameCard({ gameId, gameName, members, today }) {
  // Get results for each member for this game today
  const memberResults = members.map(member => {
    // We need to read each user's results
    // This is a simplified version - in production you'd batch this
    return {
      member,
      result: null // Will be populated below
    };
  });

  return (
    <div className={`pinned-game-card pinned-game-card--${gameId}`}>
      <h3 className="pinned-game-card__title">{gameName}</h3>

      <div className="pinned-game-card__members">
        {members.slice(0, 8).map(({ userId, user }) => (
          <PinnedGameMemberResult
            key={userId}
            userId={userId}
            user={user}
            gameId={gameId}
            today={today}
          />
        ))}

        {members.length > 8 && (
          <div className="pinned-game-card__more">
            +{members.length - 8} more
          </div>
        )}

        {members.length === 0 && (
          <div className="pinned-game-card__empty">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
}

function PinnedGameMemberResult({ userId, user, gameId, today }) {
  const { results } = useGameResults(userId);

  // Find today's result for this game
  const todayResult = results.find(r => r.gameId === gameId && r.date === today);

  if (!user) return null;

  return (
    <div className={`member-result ${todayResult ? 'has-result' : 'no-result'}`}>
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
  );
}

export default PinnedGamesSection;
