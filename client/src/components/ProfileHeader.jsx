import { useState } from 'react';
import './ProfileHeader.css';

function ProfileHeader({ username = "Player", isOwner = true, onAddResult, onGenerateScorecard }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCustomize = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="profile-header">
      <div className="profile-header__user">
        <div className="profile-header__avatar">
          <svg viewBox="0 0 24 24" fill="currentColor" className="profile-header__avatar-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h1 className="profile-header__username">{username}</h1>
      </div>

      {isOwner && (
        <div className="profile-header__actions">
          <div className="profile-header__button-wrapper">
            <button
              className="profile-header__button profile-header__button--secondary"
              onClick={handleCustomize}
            >
              Customize Page
            </button>
            {showTooltip && (
              <div className="profile-header__tooltip">
                Coming soon!
              </div>
            )}
          </div>
          <button
            className="profile-header__button profile-header__button--accent"
            onClick={onGenerateScorecard}
          >
            Generate Scorecard
          </button>
          <button
            className="profile-header__button profile-header__button--primary"
            onClick={onAddResult}
          >
            Add Result
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
