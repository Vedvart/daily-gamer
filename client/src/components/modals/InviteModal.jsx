// InviteModal Component
// Modal for inviting users to a group

import { useState } from 'react';
import './InviteModal.css';

function InviteModal({
  isOpen,
  onClose,
  groupId,
  membershipType,
  password,
  inviteCode
}) {
  const [copied, setCopied] = useState(false);

  // Generate share text based on membership type
  const getShareText = () => {
    const baseUrl = window.location.origin;
    const groupUrl = `${baseUrl}/group/${groupId}`;

    switch (membershipType) {
      case 'open':
        return `Join our group on Daily Gamer!\n${groupUrl}`;
      case 'password':
        return `Join our group on Daily Gamer!\n${groupUrl}\n\nPassword: ${password}`;
      case 'invite-only':
        return `Join our group on Daily Gamer!\n${groupUrl}\n\nInvite Code: ${inviteCode}`;
      default:
        return groupUrl;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Members</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="invite-modal-content">
          <p className="invite-description">
            Share this information with people you want to invite to your group.
          </p>

          <div className="invite-info-box">
            <div className="invite-info-row">
              <span className="invite-label">Group Link:</span>
              <span className="invite-value">
                {window.location.origin}/group/{groupId}
              </span>
            </div>

            {membershipType === 'password' && (
              <div className="invite-info-row">
                <span className="invite-label">Password:</span>
                <span className="invite-value invite-value--secret">
                  {password}
                </span>
              </div>
            )}

            {membershipType === 'invite-only' && (
              <div className="invite-info-row">
                <span className="invite-label">Invite Code:</span>
                <span className="invite-value invite-value--secret">
                  {inviteCode}
                </span>
              </div>
            )}

            {membershipType === 'open' && (
              <div className="invite-note">
                This group is open - anyone with the link can join.
              </div>
            )}
          </div>

          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Invite Text'}
          </button>

          <div className="invite-preview">
            <span className="preview-label">Preview:</span>
            <pre className="preview-text">{getShareText()}</pre>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;
