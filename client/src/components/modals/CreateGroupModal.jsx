// CreateGroupModal Component
// Modal for creating a new group

import { useState } from 'react';
import { getSupportedGames } from '../../parsers';
import './CreateGroupModal.css';

function CreateGroupModal({ isOpen, onClose, onCreateGroup }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [membershipType, setMembershipType] = useState('open');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedGames, setSelectedGames] = useState(['wordle', 'connections']);
  const [error, setError] = useState('');

  const allGames = getSupportedGames();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (membershipType === 'password' && !password.trim()) {
      setError('Password is required for password-protected groups');
      return;
    }

    if (membershipType === 'invite-only' && !inviteCode.trim()) {
      setError('Invite code is required for invite-only groups');
      return;
    }

    if (selectedGames.length === 0) {
      setError('Select at least one game');
      return;
    }

    const groupData = {
      name: name.trim(),
      description: description.trim(),
      membership: {
        type: membershipType,
        password: membershipType === 'password' ? password : null,
        inviteCode: membershipType === 'invite-only' ? inviteCode.toUpperCase() : null
      },
      visibility,
      layout: {
        enabledGames: selectedGames,
        pinnedGames: selectedGames.slice(0, 2)
      }
    };

    onCreateGroup(groupData);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setMembershipType('open');
    setPassword('');
    setInviteCode('');
    setVisibility('public');
    setSelectedGames(['wordle', 'connections']);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleGame = (gameId) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(g => g !== gameId)
        : [...prev, gameId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group</h2>
          <button className="modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Puzzle Group"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="group-description">Description</label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Membership Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="membership"
                  value="open"
                  checked={membershipType === 'open'}
                  onChange={(e) => setMembershipType(e.target.value)}
                />
                <span className="radio-label">
                  <strong>Open</strong>
                  <small>Anyone can join</small>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="membership"
                  value="password"
                  checked={membershipType === 'password'}
                  onChange={(e) => setMembershipType(e.target.value)}
                />
                <span className="radio-label">
                  <strong>Password</strong>
                  <small>Requires password to join</small>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="membership"
                  value="invite-only"
                  checked={membershipType === 'invite-only'}
                  onChange={(e) => setMembershipType(e.target.value)}
                />
                <span className="radio-label">
                  <strong>Invite Only</strong>
                  <small>Requires invite code</small>
                </span>
              </label>
            </div>
          </div>

          {membershipType === 'password' && (
            <div className="form-group">
              <label htmlFor="group-password">Password</label>
              <input
                id="group-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
              />
            </div>
          )}

          {membershipType === 'invite-only' && (
            <div className="form-group">
              <label htmlFor="group-invite">Invite Code</label>
              <input
                id="group-invite"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., PUZZLE2026"
                maxLength={20}
              />
            </div>
          )}

          <div className="form-group">
            <label>Visibility</label>
            <div className="radio-group radio-group--horizontal">
              <label className="radio-option radio-option--compact">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span>Public</span>
              </label>

              <label className="radio-option radio-option--compact">
                <input
                  type="radio"
                  name="visibility"
                  value="unlisted"
                  checked={visibility === 'unlisted'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span>Unlisted</span>
              </label>

              <label className="radio-option radio-option--compact">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Games ({selectedGames.length} selected)</label>
            <div className="game-grid">
              {allGames.map(game => (
                <label
                  key={game.id}
                  className={`game-chip ${selectedGames.includes(game.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGames.includes(game.id)}
                    onChange={() => toggleGame(game.id)}
                  />
                  {game.name}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;
