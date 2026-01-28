// UserSwitcher Component
// Debug sidebar for switching between demo users

import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAvatar from './UserAvatar';
import { resetData } from '../../data/seedData';
import './UserSwitcher.css';

function UserSwitcher() {
  const { currentUser, availableUsers, switchUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = searchQuery
    ? availableUsers.filter(u =>
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableUsers;

  const handleUserSelect = (userId) => {
    switchUser(userId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data? This will regenerate all users and results.')) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div className={`user-switcher ${isOpen ? 'open' : ''}`}>
      {/* Toggle button */}
      <button
        className="switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch User (Demo)"
      >
        <UserAvatar user={currentUser} size="small" />
        <span className="toggle-icon">{isOpen ? '>' : '<'}</span>
      </button>

      {/* Panel */}
      <div className="switcher-panel">
        <div className="switcher-header">
          <h3>Switch User</h3>
          <span className="demo-badge">Demo Mode</span>
        </div>

        <input
          type="text"
          className="switcher-search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="switcher-list">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              className={`switcher-user ${currentUser?.id === user.id ? 'active' : ''}`}
              onClick={() => handleUserSelect(user.id)}
            >
              <UserAvatar user={user} size="small" />
              <div className="user-info">
                <span className="user-display-name">{user.displayName}</span>
                <span className="user-username">@{user.username}</span>
              </div>
              {currentUser?.id === user.id && (
                <span className="current-indicator">Current</span>
              )}
            </button>
          ))}
        </div>

        <div className="switcher-actions">
          <button className="reset-button" onClick={handleReset}>
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSwitcher;
