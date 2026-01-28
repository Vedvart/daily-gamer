// GameSelectorModal Component
// Modal for selecting enabled games and pinned games

import { useState, useEffect } from 'react';
import { getSupportedGames } from '../../parsers';
import './GameSelectorModal.css';

function GameSelectorModal({ isOpen, onClose, enabledGames, pinnedGames, onSave }) {
  const [localEnabled, setLocalEnabled] = useState([]);
  const [localPinned, setLocalPinned] = useState([]);

  const allGames = getSupportedGames();

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalEnabled([...enabledGames]);
      setLocalPinned([...pinnedGames]);
    }
  }, [isOpen, enabledGames, pinnedGames]);

  const toggleEnabled = (gameId) => {
    setLocalEnabled(prev => {
      if (prev.includes(gameId)) {
        // Remove from enabled and pinned
        setLocalPinned(p => p.filter(g => g !== gameId));
        return prev.filter(g => g !== gameId);
      }
      return [...prev, gameId];
    });
  };

  const togglePinned = (gameId) => {
    if (!localEnabled.includes(gameId)) return;

    setLocalPinned(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(g => g !== gameId);
      }
      // Limit to 4 pinned games
      if (prev.length >= 4) {
        return [...prev.slice(1), gameId];
      }
      return [...prev, gameId];
    });
  };

  const handleSave = () => {
    onSave(localEnabled, localPinned);
  };

  const selectAll = () => {
    setLocalEnabled(allGames.map(g => g.id));
  };

  const selectNone = () => {
    setLocalEnabled([]);
    setLocalPinned([]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="game-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Games</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="game-selector-content">
          <div className="game-selector-actions">
            <button className="action-btn" onClick={selectAll}>
              Select All
            </button>
            <button className="action-btn" onClick={selectNone}>
              Select None
            </button>
          </div>

          <p className="game-selector-hint">
            Check games to include in leaderboards. Star up to 4 games to feature them.
          </p>

          <div className="game-selector-list">
            {allGames.map(game => {
              const isEnabled = localEnabled.includes(game.id);
              const isPinned = localPinned.includes(game.id);

              return (
                <div
                  key={game.id}
                  className={`game-selector-item ${isEnabled ? 'enabled' : ''}`}
                >
                  <label className="game-selector-checkbox">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleEnabled(game.id)}
                    />
                    <span className="game-name">{game.name}</span>
                  </label>

                  <button
                    className={`pin-btn ${isPinned ? 'pinned' : ''}`}
                    onClick={() => togglePinned(game.id)}
                    disabled={!isEnabled}
                    title={isPinned ? 'Unfeature' : 'Feature this game'}
                  >
                    {isPinned ? '★' : '☆'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="game-selector-summary">
            <span>{localEnabled.length} games enabled</span>
            <span>{localPinned.length}/4 featured</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Games
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSelectorModal;
