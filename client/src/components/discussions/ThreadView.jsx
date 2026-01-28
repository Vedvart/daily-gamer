// ThreadView Component
// Full view of a discussion thread with comments

import { getParser } from '../../parsers';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import './ThreadView.css';

function ThreadView({
  thread,
  currentUserId,
  canPost,
  onAddComment,
  onDeleteComment,
  onBack
}) {
  // Format the thread title based on type
  const getTitle = () => {
    if (thread.type === 'daily' && thread.gameId) {
      const parser = getParser(thread.gameId);
      const gameName = parser?.name || thread.gameId;
      const date = new Date(thread.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
      return `${gameName} - ${date}`;
    }
    return thread.title;
  };

  const handleSubmitComment = (text) => {
    onAddComment(thread.id, currentUserId, text);
  };

  return (
    <div className="thread-view">
      <div className="thread-view__header">
        <button className="thread-view__back" onClick={onBack}>
          &larr; Back
        </button>
        <h3 className="thread-view__title">{getTitle()}</h3>
      </div>

      <div className="thread-view__comments">
        {thread.comments.length > 0 ? (
          thread.comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              canDelete={canPost}
              onDelete={(commentId) => onDeleteComment(thread.id, commentId)}
            />
          ))
        ) : (
          <div className="thread-view__empty">
            <p>No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {canPost ? (
        <div className="thread-view__input">
          <CommentInput
            onSubmit={handleSubmitComment}
            placeholder="Add your thoughts..."
            buttonText="Post"
          />
        </div>
      ) : (
        <div className="thread-view__join-prompt">
          <p>Join the group to participate in discussions.</p>
        </div>
      )}
    </div>
  );
}

export default ThreadView;
