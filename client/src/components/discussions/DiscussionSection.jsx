// DiscussionSection Component
// Container for group discussions

import { useState } from 'react';
import useDiscussions from '../../hooks/useDiscussions';
import ThreadList from './ThreadList';
import ThreadView from './ThreadView';
import CommentInput from './CommentInput';
import './DiscussionSection.css';

function DiscussionSection({ groupId, currentUserId, canPost }) {
  const {
    threads,
    getThreads,
    createThread,
    addComment,
    deleteComment
  } = useDiscussions(groupId);

  const [selectedThread, setSelectedThread] = useState(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'daily', 'general'

  // Filter threads
  const filteredThreads = filter === 'all'
    ? getThreads()
    : getThreads({ type: filter });

  // Handle creating a new thread
  const handleCreateThread = (initialComment) => {
    if (!newThreadTitle.trim()) return;

    const thread = createThread(newThreadTitle.trim(), currentUserId, initialComment);
    setNewThreadTitle('');
    setShowNewThread(false);
    setSelectedThread(thread);
  };

  // Handle adding a comment
  const handleAddComment = (threadId, userId, text) => {
    addComment(threadId, userId, text);
    // Refresh selected thread
    const updated = threads.find(t => t.id === threadId);
    if (updated) {
      setSelectedThread({ ...updated, comments: [...updated.comments] });
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = (threadId, commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteComment(threadId, commentId);
      // Refresh selected thread
      const updated = threads.find(t => t.id === threadId);
      if (updated) {
        setSelectedThread(updated);
      }
    }
  };

  // If viewing a thread
  if (selectedThread) {
    // Get fresh thread data
    const freshThread = threads.find(t => t.id === selectedThread.id) || selectedThread;

    return (
      <ThreadView
        thread={freshThread}
        currentUserId={currentUserId}
        canPost={canPost}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onBack={() => setSelectedThread(null)}
      />
    );
  }

  return (
    <div className="discussion-section">
      {/* Controls */}
      <div className="discussion-section__controls">
        <div className="discussion-section__filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'daily' ? 'active' : ''}`}
            onClick={() => setFilter('daily')}
          >
            Daily
          </button>
          <button
            className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
            onClick={() => setFilter('general')}
          >
            General
          </button>
        </div>

        {canPost && !showNewThread && (
          <button
            className="discussion-section__new-btn"
            onClick={() => setShowNewThread(true)}
          >
            New Thread
          </button>
        )}
      </div>

      {/* New Thread Form */}
      {showNewThread && (
        <div className="discussion-section__new-form">
          <div className="new-thread-header">
            <h4>New Discussion</h4>
            <button
              className="new-thread-cancel"
              onClick={() => {
                setShowNewThread(false);
                setNewThreadTitle('');
              }}
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            className="new-thread-title"
            placeholder="Thread title..."
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            maxLength={100}
          />
          <CommentInput
            onSubmit={handleCreateThread}
            placeholder="Write your first comment..."
            buttonText="Create Thread"
            disabled={!newThreadTitle.trim()}
          />
        </div>
      )}

      {/* Thread List */}
      <ThreadList
        threads={filteredThreads}
        onSelectThread={setSelectedThread}
      />

      {/* Prompt for non-members */}
      {!canPost && filteredThreads.length === 0 && (
        <div className="discussion-section__join-prompt">
          <p>Join the group to start discussions.</p>
        </div>
      )}
    </div>
  );
}

export default DiscussionSection;
