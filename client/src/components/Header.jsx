import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import UserAvatar from './user/UserAvatar';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, availableUsers, switchUser } = useCurrentUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowUserSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId) => {
    switchUser(userId);
    setShowUserSwitcher(false);
    setShowUserMenu(false);
  };

  const handleViewProfile = () => {
    if (currentUser) {
      navigate(`/user/${currentUser.id}`);
    }
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <div className="logo-grid">
          <span className="logo-tile green"></span>
          <span className="logo-tile yellow"></span>
          <span className="logo-tile blue"></span>
          <span className="logo-tile purple"></span>
        </div>
        <h1>Daily Gamer</h1>
      </Link>

      <nav className="nav">
        <Link
          to="/dashboard"
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          My Results
        </Link>
        <Link
          to="/groups"
          className={`nav-link ${location.pathname.startsWith('/group') ? 'active' : ''}`}
        >
          Groups
        </Link>
      </nav>

      {/* User Menu */}
      <div className="header__user" ref={menuRef}>
        <button
          className="header__user-button"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <UserAvatar user={currentUser} size="small" />
          <span className="header__user-name">{currentUser?.displayName}</span>
          <span className="header__user-caret">{showUserMenu ? '▲' : '▼'}</span>
        </button>

        {showUserMenu && (
          <div className="header__dropdown">
            {!showUserSwitcher ? (
              <>
                <div className="header__dropdown-header">
                  <UserAvatar user={currentUser} size="medium" />
                  <div>
                    <div className="header__dropdown-name">{currentUser?.displayName}</div>
                    <div className="header__dropdown-username">@{currentUser?.username}</div>
                  </div>
                </div>

                <div className="header__dropdown-divider" />

                <button className="header__dropdown-item" onClick={handleViewProfile}>
                  View Profile
                </button>
                <Link
                  to="/dashboard"
                  className="header__dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Results
                </Link>

                <div className="header__dropdown-divider" />

                <button
                  className="header__dropdown-item header__dropdown-item--switch"
                  onClick={() => setShowUserSwitcher(true)}
                >
                  Switch User
                  <span className="header__demo-badge">Demo</span>
                </button>
              </>
            ) : (
              <>
                <div className="header__dropdown-header header__dropdown-header--back">
                  <button
                    className="header__back-btn"
                    onClick={() => setShowUserSwitcher(false)}
                  >
                    ← Back
                  </button>
                  <span>Switch User</span>
                </div>

                <div className="header__dropdown-divider" />

                <div className="header__user-list">
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      className={`header__user-option ${user.id === currentUser?.id ? 'active' : ''}`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <UserAvatar user={user} size="small" />
                      <span className="header__user-option-name">{user.displayName}</span>
                      {user.id === currentUser?.id && (
                        <span className="header__check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
