// UserCard Component
// Compact card for displaying user info in lists

import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import './UserCard.css';

function UserCard({ user, subtitle, rightContent, linkTo, onClick, size = 'medium' }) {
  if (!user) return null;

  const content = (
    <>
      <UserAvatar user={user} size={size === 'small' ? 'small' : 'medium'} />
      <div className="user-card__info">
        <span className="user-card__name">{user.displayName}</span>
        {subtitle ? (
          <span className="user-card__subtitle">{subtitle}</span>
        ) : (
          <span className="user-card__username">@{user.username}</span>
        )}
      </div>
      {rightContent && (
        <div className="user-card__right">
          {rightContent}
        </div>
      )}
    </>
  );

  // If a link is provided, render as Link
  if (linkTo) {
    return (
      <Link to={linkTo} className={`user-card user-card--${size} user-card--link`}>
        {content}
      </Link>
    );
  }

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button className={`user-card user-card--${size} user-card--button`} onClick={onClick}>
        {content}
      </button>
    );
  }

  // Default: static div
  return (
    <div className={`user-card user-card--${size}`}>
      {content}
    </div>
  );
}

export default UserCard;
