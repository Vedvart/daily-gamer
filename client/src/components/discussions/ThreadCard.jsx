// ThreadCard Component
// Preview card for a discussion thread

import useUsers from '../../hooks/useUsers';
import { getParser } from '../../parsers';
import './ThreadCard.css';

function ThreadCard({ thread, onClick }) {
  const { getUserSync } = useUsers();

  // Get the most recent comment
  const lastComment = thread.comments?.length > 0
    ? thread.comments[thread.comments.length - 1]
    : null;

  const lastUser = lastComment ? getUserSync(lastComment.userId) : null;

  // Format the thread title based on type
  const getTitle = () => {
    if (thread.type === 'daily' && thread.gameId) {
      const parser = getParser(thread.gameId);
      const gameName = parser?.name || thread.gameId;
      const date = new Date(thread.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return `${gameName} - ${date}`;
    }
    return thread.title;
  };

  // Format time
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

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const lastActivity = lastComment
    ? formatTime(lastComment.timestamp)
    : formatTime(thread.createdAt);

  return (
    <button className="thread-card" onClick={onClick}>
      <div className="thread-card__header">
        <span className={`thread-card__type thread-card__type--${thread.type}`}>
          {thread.type === 'daily' ? 'Daily' : 'General'}
        </span>
        <span className="thread-card__time">{lastActivity}</span>
      </div>

      <h4 className="thread-card__title">{getTitle()}</h4>

      <div className="thread-card__footer">
        <span className="thread-card__comments">
          {thread.comments.length} comment{thread.comments.length !== 1 ? 's' : ''}
        </span>

        {lastUser && (
          <span className="thread-card__last">
            Last by {lastUser.displayName}
          </span>
        )}
      </div>
    </button>
  );
}

export default ThreadCard;
