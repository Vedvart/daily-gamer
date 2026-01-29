// GroupPage - Main group view
// Displays group content based on layout configuration

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import useGroups from '../hooks/useGroups';
import useGroupMembership from '../hooks/useGroupMembership';
import GroupHeader from '../components/groups/GroupHeader';
import GroupMemberList from '../components/groups/GroupMemberList';
import GroupSection from '../components/groups/GroupSection';
import PinnedGamesSection from '../components/groups/PinnedGamesSection';
import DailyLeaderboard from '../components/leaderboards/DailyLeaderboard';
import HistoricalLeaderboard from '../components/leaderboards/HistoricalLeaderboard';
import DiscussionSection from '../components/discussions/DiscussionSection';
import JoinGroupModal from '../components/modals/JoinGroupModal';
import './GroupPage.css';

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const { getGroup, verifyPassword, verifyInviteCode } = useGroups();
  const {
    members,
    isMember,
    isAdmin,
    isModerator,
    joinGroup,
    leaveGroup,
    isLoading
  } = useGroupMembership(groupId);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState('');

  const group = getGroup(groupId);
  const userIsMember = isMember(currentUserId);
  const userIsAdmin = isAdmin(currentUserId);
  const userIsModerator = isModerator(currentUserId);

  // Group not found
  if (!group) {
    return (
      <main className="group-page">
        <div className="group-page__container">
          <div className="group-page__not-found">
            <h2>Group Not Found</h2>
            <p>This group doesn't exist or has been deleted.</p>
            <Link to="/groups" className="group-page__back-link">
              Browse Groups
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Private group - only show to members
  if (group.visibility === 'private' && !userIsMember && !isLoading) {
    return (
      <main className="group-page">
        <div className="group-page__container">
          <div className="group-page__private">
            <h2>Private Group</h2>
            <p>This group is private. You need an invitation to view it.</p>
            <Link to="/groups" className="group-page__back-link">
              Browse Groups
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle join
  const handleJoinClick = () => {
    if (group.membership.type === 'open') {
      // Direct join
      const result = joinGroup(currentUserId);
      if (!result.success) {
        setJoinError(result.error);
      }
    } else {
      // Show join modal for password/invite
      setShowJoinModal(true);
    }
  };

  const handleJoinWithCredentials = (credential) => {
    setJoinError('');

    if (group.membership.type === 'password') {
      if (!verifyPassword(groupId, credential)) {
        setJoinError('Incorrect password');
        return;
      }
    } else if (group.membership.type === 'invite-only') {
      if (!verifyInviteCode(groupId, credential)) {
        setJoinError('Invalid invite code');
        return;
      }
    }

    const result = joinGroup(currentUserId);
    if (result.success) {
      setShowJoinModal(false);
    } else {
      setJoinError(result.error);
    }
  };

  // Handle leave
  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      const result = leaveGroup(currentUserId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  // Get visible sections sorted by order
  const visibleSections = (group.layout?.sections || [])
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  // Render a section based on type
  const renderSection = (section) => {
    switch (section.type) {
      case 'pinned-games':
        return (
          <GroupSection key={section.type} title="Featured Games">
            <PinnedGamesSection
              groupId={groupId}
              pinnedGames={group.layout?.pinnedGames || []}
              members={members}
            />
          </GroupSection>
        );

      case 'daily-leaderboard':
        return (
          <GroupSection key={section.type} title="Today's Leaderboard">
            <DailyLeaderboard
              groupId={groupId}
              enabledGames={group.layout?.enabledGames || []}
              members={members}
            />
          </GroupSection>
        );

      case 'historical-leaderboard':
        return (
          <GroupSection key={section.type} title="All-Time Leaderboard">
            <HistoricalLeaderboard
              groupId={groupId}
              enabledGames={group.layout?.enabledGames || []}
              members={members}
            />
          </GroupSection>
        );

      case 'discussions':
        return (
          <GroupSection key={section.type} title="Discussions">
            <DiscussionSection
              groupId={groupId}
              currentUserId={currentUserId}
              canPost={userIsMember}
            />
          </GroupSection>
        );

      case 'members':
        return (
          <GroupSection key={section.type} title={`Members (${members.length})`}>
            <GroupMemberList
              groupId={groupId}
              members={members}
              currentUserId={currentUserId}
              canManage={userIsModerator}
              isAdmin={userIsAdmin}
            />
          </GroupSection>
        );

      default:
        return null;
    }
  };

  return (
    <main className="group-page" key={groupId}>
      <div className="group-page__container">
        {/* Breadcrumb */}
        <nav className="group-page__breadcrumb">
          <Link to="/groups">Groups</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{group.name}</span>
        </nav>

        <GroupHeader
          group={group}
          memberCount={members.length}
          isMember={userIsMember}
          isAdmin={userIsAdmin}
          onJoin={handleJoinClick}
          onLeave={handleLeave}
          onSettings={() => navigate(`/group/${groupId}/settings`)}
        />

        {userIsMember ? (
          <div className="group-page__content">
            {visibleSections.map(renderSection)}
          </div>
        ) : (
          <div className="group-page__preview">
            <div className="group-page__preview-message">
              <h3>Join to participate</h3>
              <p>Join this group to see leaderboards, discussions, and compete with other members.</p>
              <button className="group-page__join-btn" onClick={handleJoinClick}>
                Join Group
              </button>
            </div>

            {/* Show member list preview for public groups */}
            {group.visibility === 'public' && (
              <GroupSection title={`Members (${members.length})`}>
                <GroupMemberList
                  groupId={groupId}
                  members={members.slice(0, 5)}
                  currentUserId={currentUserId}
                  canManage={false}
                  isPreview={true}
                />
              </GroupSection>
            )}
          </div>
        )}
      </div>

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError('');
        }}
        onJoin={handleJoinWithCredentials}
        membershipType={group.membership.type}
        groupName={group.name}
        error={joinError}
      />
    </main>
  );
}

export default GroupPage;
