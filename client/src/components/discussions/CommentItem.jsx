// CommentItem Component
// Single comment display

import { Link } from 'react-router-dom';
import useUsers from '../../hooks/useUsers';
import UserAvatar from '../user/UserAvatar';
import './CommentItem.css';

function CommentItem({ comment, currentUserId, onDelete, canDelete = false }) {
  const { getUser } = useUsers();
  const user = getUser(comment.userId);

  if (!user) return null;

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOwner = comment.userId === currentUserId;

  return (
    <div className="comment-item">
      <Link to={`/user/${comment.userId}`} className="comment-item__avatar">
        <UserAvatar user={user} size="small" />
      </Link>

      <div className="comment-item__content">
        <div className="comment-item__header">
          <Link to={`/user/${comment.userId}`} className="comment-item__author">
            {user.displayName}
            {isOwner && <span className="comment-item__you">(you)</span>}
          </Link>
          <span className="comment-item__time">{formatTime(comment.timestamp)}</span>
        </div>

        <p className="comment-item__text">{comment.text}</p>

        {canDelete && (isOwner || canDelete === 'admin') && (
          <button
            className="comment-item__delete"
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentItem;
