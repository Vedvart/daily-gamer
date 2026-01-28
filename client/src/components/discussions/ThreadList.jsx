// ThreadList Component
// List of discussion threads

import ThreadCard from './ThreadCard';
import './ThreadList.css';

function ThreadList({ threads, onSelectThread }) {
  if (threads.length === 0) {
    return (
      <div className="thread-list__empty">
        <p>No discussions yet.</p>
      </div>
    );
  }

  return (
    <div className="thread-list">
      {threads.map(thread => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          onClick={() => onSelectThread(thread)}
        />
      ))}
    </div>
  );
}

export default ThreadList;
