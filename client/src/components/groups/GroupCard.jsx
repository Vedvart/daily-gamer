// GroupCard Component
// Card display for group in listings

import { Link } from 'react-router-dom';
import useGroupMembership from '../../hooks/useGroupMembership';
import './GroupCard.css';

function GroupCard({ group, currentUserId }) {
  const { members, isMember } = useGroupMembership(group.id);

  const memberCount = group.memberCount || members.length;
  const isUserMember = isMember(currentUserId);

  // Get membership type - handle both API format (joinPolicy) and localStorage format (membership.type)
  const membershipType = group.joinPolicy || group.membership?.type || 'open';

  // Get membership type label
  const getMembershipLabel = () => {
    switch (membershipType) {
      case 'open':
        return 'Open';
      case 'password':
        return 'Password';
      case 'invite-only':
      case 'invite_only':
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

  // Get game count - handle both API format (trackedGames) and localStorage format (layout.enabledGames)
  const enabledGamesCount = group.trackedGames?.length || group.layout?.enabledGames?.length || 0;

  return (
    <Link to={`/group/${group.id}`} className="group-card">
      <div className="group-card__header">
        <h3 className="group-card__name">{group.name}</h3>
        <div className="group-card__badges">
          <span className="group-card__visibility" title={group.visibility}>
            {getVisibilityIcon()}
          </span>
          <span className={`group-card__membership group-card__membership--${membershipType}`}>
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
