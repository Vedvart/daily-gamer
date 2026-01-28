// GroupCard Component
// Card display for group in listings

import { Link } from 'react-router-dom';
import useGroupMembership from '../../hooks/useGroupMembership';
import './GroupCard.css';

function GroupCard({ group, currentUserId }) {
  const { members, isMember } = useGroupMembership(group.id);

  const memberCount = members.length;
  const isUserMember = isMember(currentUserId);

  // Get membership type label
  const getMembershipLabel = () => {
    switch (group.membership.type) {
      case 'open':
        return 'Open';
      case 'password':
        return 'Password';
      case 'invite-only':
        return 'Invite Only';
      default:
        return '';
    }
  };

  // Get visibility icon
  const getVisibilityIcon = () => {
    switch (group.visibility) {
      case 'public':
        return '🌐';
      case 'unlisted':
        return '🔗';
      case 'private':
        return '🔒';
      default:
        return '';
    }
  };

  // Get game count
  const enabledGamesCount = group.layout?.enabledGames?.length || 0;

  return (
    <Link to={`/group/${group.id}`} className="group-card">
      <div className="group-card__header">
        <h3 className="group-card__name">{group.name}</h3>
        <div className="group-card__badges">
          <span className="group-card__visibility" title={group.visibility}>
            {getVisibilityIcon()}
          </span>
          <span className={`group-card__membership group-card__membership--${group.membership.type}`}>
            {getMembershipLabel()}
          </span>
        </div>
      </div>

      <p className="group-card__description">{group.description}</p>

      <div className="group-card__footer">
        <div className="group-card__stats">
          <span className="group-card__stat">
            <span className="stat-icon">👥</span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className="group-card__stat">
            <span className="stat-icon">🎮</span>
            {enabledGamesCount} {enabledGamesCount === 1 ? 'game' : 'games'}
          </span>
        </div>

        {isUserMember && (
          <span className="group-card__member-badge">Joined</span>
        )}
      </div>
    </Link>
  );
}

export default GroupCard;
