// UserAvatar Component
// Displays a user's avatar based on their avatar configuration

import './UserAvatar.css';

function UserAvatar({ user, size = 'medium', showName = false, onClick }) {
  if (!user) return null;

  const { avatar, displayName } = user;
  const sizeClass = `avatar-${size}`;

  const renderAvatarContent = () => {
    switch (avatar?.type) {
      case 'emoji':
        return <span className="avatar-emoji">{avatar.value}</span>;
      case 'initials':
      default:
        return <span className="avatar-initials">{avatar?.value || displayName.slice(0, 2).toUpperCase()}</span>;
    }
  };

  const avatarStyle = {
    backgroundColor: avatar?.backgroundColor || '#538d4e'
  };

  return (
    <div
      className={`user-avatar ${sizeClass} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="avatar-circle" style={avatarStyle}>
        {renderAvatarContent()}
      </div>
      {showName && (
        <span className="avatar-name">{displayName}</span>
      )}
    </div>
  );
}

export default UserAvatar;
