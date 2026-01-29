// LeaderboardRow Component
// Single row in a leaderboard

import { Link } from 'react-router-dom';
import useUsers from '../../hooks/useUsers';
import UserAvatar from '../user/UserAvatar';
import RankBadge from './RankBadge';
import './LeaderboardRow.css';

function LeaderboardRow({
  rank,
  userId,
  score,
  formattedScore,
  subtitle,
  isCurrentUser,
  showAvatar = true
}) {
  const { getUserSync } = useUsers();
  const user = getUserSync(userId);

  if (!user) return null;

  return (
    <div className={`leaderboard-row ${isCurrentUser ? 'leaderboard-row--current' : ''}`}>
      <RankBadge rank={rank} size="medium" />

      {showAvatar && (
        <Link to={`/user/${userId}`} className="leaderboard-row__user">
          <UserAvatar user={user} size="small" />
          <div className="leaderboard-row__info">
            <span className="leaderboard-row__name">
              {user.displayName}
              {isCurrentUser && <span className="leaderboard-row__you">(you)</span>}
            </span>
            {subtitle && (
              <span className="leaderboard-row__subtitle">{subtitle}</span>
            )}
          </div>
        </Link>
      )}

      <div className="leaderboard-row__score">
        {formattedScore}
      </div>
    </div>
  );
}

export default LeaderboardRow;
