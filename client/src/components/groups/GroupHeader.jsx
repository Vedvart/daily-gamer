// GroupHeader Component
// Header section for group pages

import './GroupHeader.css';

function GroupHeader({
  group,
  memberCount,
  isMember,
  isAdmin,
  onJoin,
  onLeave,
  onSettings
}) {
  // Get visibility label
  const getVisibilityLabel = () => {
    switch (group.visibility) {
      case 'public':
        return { icon: '🌐', label: 'Public' };
      case 'unlisted':
        return { icon: '🔗', label: 'Unlisted' };
      case 'private':
        return { icon: '🔒', label: 'Private' };
      default:
        return { icon: '', label: '' };
    }
  };

  // Get membership type - handle both API format (joinPolicy) and localStorage format (membership.type)
  const membershipType = group.joinPolicy || group.membership?.type || 'open';

  // Get membership type label
  const getMembershipLabel = () => {
    switch (membershipType) {
      case 'open':
        return 'Open to join';
      case 'password':
        return 'Password required';
      case 'invite-only':
      case 'invite_only':
        return 'Invite only';
      default:
        return '';
    }
  };

  const visibility = getVisibilityLabel();
  const enabledGamesCount = group.trackedGames?.length || group.layout?.enabledGames?.length || 0;

  return (
    <header className="group-header">
      <div className="group-header__main">
        <div className="group-header__info">
          <h1 className="group-header__name">{group.name}</h1>
          <p className="group-header__description">{group.description}</p>

          <div className="group-header__meta">
            <span className="group-header__meta-item">
              <span className="meta-icon">👥</span>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
            <span className="group-header__meta-item">
              <span className="meta-icon">🎮</span>
              {enabledGamesCount} {enabledGamesCount === 1 ? 'game' : 'games'}
            </span>
            <span className="group-header__meta-item">
              <span className="meta-icon">{visibility.icon}</span>
              {visibility.label}
            </span>
            <span className="group-header__meta-item group-header__membership-type">
              {getMembershipLabel()}
            </span>
          </div>
        </div>

        <div className="group-header__actions">
          {isMember ? (
            <>
              {isAdmin && (
                <button
                  className="group-header__btn group-header__btn--settings"
                  onClick={onSettings}
                >
                  Settings
                </button>
              )}
              <button
                className="group-header__btn group-header__btn--leave"
                onClick={onLeave}
              >
                Leave Group
              </button>
            </>
          ) : (
            <button
              className="group-header__btn group-header__btn--join"
              onClick={onJoin}
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default GroupHeader;
