// GroupsListPage - Browse and search groups
// Main page for discovering and joining groups

import { useState, useMemo } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import useGroups from '../hooks/useGroups';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import './GroupsListPage.css';

function GroupsListPage() {
  const { currentUserId } = useCurrentUser();
  const { groups, getPublicGroups, getGroupsForUser, createGroup } = useGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'my-groups', 'public'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter and search groups
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Apply filter
    if (filter === 'my-groups') {
      result = getGroupsForUser(currentUserId);
    } else if (filter === 'public') {
      result = getPublicGroups();
    } else {
      // 'all' - show public groups and groups user is member of
      const publicGroups = getPublicGroups();
      const myGroups = getGroupsForUser(currentUserId);
      const myGroupIds = new Set(myGroups.map(g => g.id));

      // Combine without duplicates
      result = [
        ...myGroups,
        ...publicGroups.filter(g => !myGroupIds.has(g.id))
      ];
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [groups, filter, searchQuery, currentUserId, getPublicGroups, getGroupsForUser]);

  const myGroupsCount = getGroupsForUser(currentUserId).length;

  const handleCreateGroup = (groupData) => {
    createGroup({
      ...groupData,
      createdBy: currentUserId
    });
    setIsCreateModalOpen(false);
  };

  return (
    <main className="groups-list-page">
      <div className="groups-list-page__container">
        <header className="groups-list-page__header">
          <div className="groups-list-page__title-row">
            <h1>Groups</h1>
            <button
              className="groups-list-page__create-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Group
            </button>
          </div>
          <p className="groups-list-page__subtitle">
            Join groups to compete on leaderboards and discuss daily games with friends.
          </p>
        </header>

        <div className="groups-list-page__controls">
          <input
            type="text"
            className="groups-list-page__search"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="groups-list-page__filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'my-groups' ? 'active' : ''}`}
              onClick={() => setFilter('my-groups')}
            >
              My Groups ({myGroupsCount})
            </button>
            <button
              className={`filter-btn ${filter === 'public' ? 'active' : ''}`}
              onClick={() => setFilter('public')}
            >
              Public
            </button>
          </div>
        </div>

        <div className="groups-list-page__content">
          {filteredGroups.length > 0 ? (
            <div className="groups-list-page__grid">
              {filteredGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          ) : (
            <div className="groups-list-page__empty">
              {searchQuery ? (
                <>
                  <h3>No groups found</h3>
                  <p>Try a different search term or create a new group.</p>
                </>
              ) : filter === 'my-groups' ? (
                <>
                  <h3>You haven't joined any groups yet</h3>
                  <p>Browse public groups or create your own!</p>
                </>
              ) : (
                <>
                  <h3>No groups available</h3>
                  <p>Be the first to create a group!</p>
                </>
              )}
              <button
                className="groups-list-page__create-btn"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </main>
  );
}

export default GroupsListPage;
