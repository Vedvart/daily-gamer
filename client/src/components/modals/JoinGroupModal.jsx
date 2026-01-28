// JoinGroupModal Component
// Modal for entering password or invite code to join a group

import { useState } from 'react';
import './JoinGroupModal.css';

function JoinGroupModal({
  isOpen,
  onClose,
  onJoin,
  membershipType,
  groupName,
  error
}) {
  const [credential, setCredential] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credential.trim()) {
      onJoin(credential.trim());
    }
  };

  const handleClose = () => {
    setCredential('');
    onClose();
  };

  if (!isOpen) return null;

  const isPassword = membershipType === 'password';
  const title = isPassword ? 'Enter Password' : 'Enter Invite Code';
  const placeholder = isPassword ? 'Group password' : 'Invite code';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="join-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="join-modal__info">
            {isPassword
              ? `Enter the password to join "${groupName}".`
              : `Enter the invite code to join "${groupName}".`
            }
          </p>

          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <input
              type={isPassword ? 'password' : 'text'}
              value={credential}
              onChange={(e) => setCredential(isPassword ? e.target.value : e.target.value.toUpperCase())}
              placeholder={placeholder}
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!credential.trim()}>
              Join Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinGroupModal;
