// GroupSettingsPage - Admin settings for a group
// Allows customization of layout, games, and membership settings

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import useGroups from '../hooks/useGroups';
import useGroupMembership from '../hooks/useGroupMembership';
import { getSupportedGames } from '../parsers';
import LayoutEditorModal from '../components/modals/LayoutEditorModal';
import GameSelectorModal from '../components/modals/GameSelectorModal';
import InviteModal from '../components/modals/InviteModal';
import './GroupSettingsPage.css';

function GroupSettingsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const { getGroup, updateGroup, deleteGroup } = useGroups();
  const { isAdmin, members } = useGroupMembership(groupId);

  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const group = getGroup(groupId);
  const userIsAdmin = isAdmin(currentUserId);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [membershipType, setMembershipType] = useState('open');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize form state from group
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      // Handle both API format (joinPolicy, hasPassword, inviteCode) and localStorage format (membership.type, etc.)
      setMembershipType(group.joinPolicy || group.membership?.type || 'open');
      setPassword(group.membership?.password || '');
      setInviteCode(group.inviteCode || group.membership?.inviteCode || '');
      setVisibility(group.visibility);
    }
  }, [group]);

  // Group not found or not authorized
  if (!group) {
    return (
      <main className="group-settings-page">
        <div className="group-settings-page__container">
          <div className="group-settings-page__error">
            <h2>Group Not Found</h2>
            <Link to="/groups">Browse Groups</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!userIsAdmin) {
    return (
      <main className="group-settings-page">
        <div className="group-settings-page__container">
          <div className="group-settings-page__error">
            <h2>Access Denied</h2>
            <p>Only group admins can access settings.</p>
            <Link to={`/group/${groupId}`}>Back to Group</Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle saving general settings
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSaveMessage('');

    updateGroup(groupId, {
      name: name.trim(),
      description: description.trim(),
      membership: {
        type: membershipType,
        password: membershipType === 'password' ? password : null,
        inviteCode: membershipType === 'invite-only' ? inviteCode.toUpperCase() : null
      },
      visibility
    });

    setSaveMessage('Settings saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Handle layout update
  const handleLayoutUpdate = (newSections) => {
    updateGroup(groupId, {
      layout: {
        ...group.layout,
        sections: newSections
      }
    });
    setShowLayoutEditor(false);
  };

  // Handle games update
  const handleGamesUpdate = (enabledGames, pinnedGames) => {
    updateGroup(groupId, {
      layout: {
        ...group.layout,
        enabledGames,
        pinnedGames
      }
    });
    setShowGameSelector(false);
  };

  // Handle delete group
  const handleDeleteGroup = () => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"? This cannot be undone.`)) {
      if (window.confirm('Really delete? All data will be lost.')) {
        deleteGroup(groupId);
        navigate('/groups');
      }
    }
  };

  return (
    <main className="group-settings-page" key={groupId}>
      <div className="group-settings-page__container">
        <header className="group-settings-page__header">
          <Link to={`/group/${groupId}`} className="back-link">
            &larr; Back to {group.name}
          </Link>
          <h1>Group Settings</h1>
        </header>

        {/* General Settings */}
        <section className="settings-section">
          <h2>General</h2>
          <form onSubmit={handleSaveGeneral}>
            <div className="form-group">
              <label htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-row">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  Public
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="unlisted"
                    checked={visibility === 'unlisted'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  Unlisted
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  Private
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Membership Type</label>
              <div className="radio-row">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="membership"
                    value="open"
                    checked={membershipType === 'open'}
                    onChange={(e) => setMembershipType(e.target.value)}
                  />
                  Open
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="membership"
                    value="password"
                    checked={membershipType === 'password'}
                    onChange={(e) => setMembershipType(e.target.value)}
                  />
                  Password
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="membership"
                    value="invite-only"
                    checked={membershipType === 'invite-only'}
                    onChange={(e) => setMembershipType(e.target.value)}
                  />
                  Invite Only
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
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              {saveMessage && (
                <span className="save-message">{saveMessage}</span>
              )}
            </div>
          </form>
        </section>

        {/* Layout Settings */}
        <section className="settings-section">
          <h2>Layout & Games</h2>
          <p className="section-description">
            Customize which sections appear and which games are tracked.
          </p>

          <div className="settings-buttons">
            <button
              className="settings-btn"
              onClick={() => setShowLayoutEditor(true)}
            >
              Edit Layout
              <span className="settings-btn-desc">
                Reorder and show/hide sections
              </span>
            </button>

            <button
              className="settings-btn"
              onClick={() => setShowGameSelector(true)}
            >
              Manage Games
              <span className="settings-btn-desc">
                {group.layout?.enabledGames?.length || 0} games enabled
              </span>
            </button>

            <button
              className="settings-btn"
              onClick={() => setShowInviteModal(true)}
            >
              Invite Members
              <span className="settings-btn-desc">
                {members.length} current members
              </span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-section settings-section--danger">
          <h2>Danger Zone</h2>
          <p className="section-description">
            These actions are permanent and cannot be undone.
          </p>

          <button
            className="btn-danger"
            onClick={handleDeleteGroup}
          >
            Delete Group
          </button>
        </section>
      </div>

      <LayoutEditorModal
        isOpen={showLayoutEditor}
        onClose={() => setShowLayoutEditor(false)}
        sections={group.layout?.sections || []}
        onSave={handleLayoutUpdate}
      />

      <GameSelectorModal
        isOpen={showGameSelector}
        onClose={() => setShowGameSelector(false)}
        enabledGames={group.layout?.enabledGames || []}
        pinnedGames={group.layout?.pinnedGames || []}
        onSave={handleGamesUpdate}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={groupId}
        membershipType={group.joinPolicy || group.membership?.type || 'open'}
        password={group.membership?.password}
        inviteCode={group.inviteCode || group.membership?.inviteCode}
      />
    </main>
  );
}

export default GroupSettingsPage;
