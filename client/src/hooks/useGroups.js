// useGroups Hook
// Manages groups - CRUD operations, search, and filtering

import { useState, useEffect, useCallback } from 'react';
import { dummyGroups, groupMemberships } from '../data/dummyGroups';

const STORAGE_KEY = 'dailygamer_groups';

function useGroups() {
  const [groups, setGroups] = useState([]);

  // Load groups from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setGroups(JSON.parse(stored));
      } else {
        // Initialize with dummy groups
        setGroups(dummyGroups);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyGroups));

        // Also initialize group memberships
        for (const [groupId, members] of Object.entries(groupMemberships)) {
          const memberKey = `dailygamer_group_members_${groupId}`;
          if (!localStorage.getItem(memberKey)) {
            localStorage.setItem(memberKey, JSON.stringify({ members, pendingInvites: [] }));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load groups:', e);
      setGroups(dummyGroups);
    }
  }, []);

  // Save groups to localStorage whenever they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups]);

  // Get a group by ID
  const getGroup = useCallback((groupId) => {
    return groups.find(g => g.id === groupId) || null;
  }, [groups]);

  // Get public groups (for browsing)
  const getPublicGroups = useCallback(() => {
    return groups.filter(g => g.visibility === 'public');
  }, [groups]);

  // Search groups by name or description
  const searchGroups = useCallback((query, visibility = null) => {
    let filtered = groups;

    // Filter by visibility
    if (visibility === 'public') {
      filtered = filtered.filter(g => g.visibility === 'public');
    } else if (visibility === 'unlisted') {
      filtered = filtered.filter(g => g.visibility === 'unlisted');
    }

    // Filter by query
    if (query) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(lower) ||
        g.description.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [groups]);

  // Create a new group
  const createGroup = useCallback((groupData) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      createdAt: new Date().toISOString(),
      layout: {
        sections: [
          { type: 'pinned-games', visible: true, order: 0 },
          { type: 'daily-leaderboard', visible: true, order: 1 },
          { type: 'historical-leaderboard', visible: true, order: 2 },
          { type: 'discussions', visible: true, order: 3 },
          { type: 'members', visible: true, order: 4 }
        ],
        enabledGames: groupData.enabledGames || ['wordle', 'connections'],
        pinnedGames: groupData.pinnedGames || ['wordle']
      },
      ...groupData
    };

    setGroups(prev => [...prev, newGroup]);

    // Initialize membership with creator as admin
    const memberKey = `dailygamer_group_members_${newGroup.id}`;
    localStorage.setItem(memberKey, JSON.stringify({
      members: [{
        userId: groupData.createdBy,
        role: 'admin',
        joinedAt: newGroup.createdAt
      }],
      pendingInvites: []
    }));

    return newGroup;
  }, []);

  // Update a group
  const updateGroup = useCallback((groupId, updates) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    ));
  }, []);

  // Delete a group
  const deleteGroup = useCallback((groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));

    // Clean up membership data
    localStorage.removeItem(`dailygamer_group_members_${groupId}`);
    localStorage.removeItem(`dailygamer_discussions_${groupId}`);
  }, []);

  // Get groups for a specific user (where they are a member)
  const getGroupsForUser = useCallback((userId) => {
    const userGroups = [];

    for (const group of groups) {
      const memberKey = `dailygamer_group_members_${group.id}`;
      const memberData = localStorage.getItem(memberKey);
      if (memberData) {
        const { members } = JSON.parse(memberData);
        if (members.some(m => m.userId === userId)) {
          userGroups.push(group);
        }
      }
    }

    return userGroups;
  }, [groups]);

  // Check if a password is correct for a group
  const verifyPassword = useCallback((groupId, password) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.membership.type !== 'password') {
      return false;
    }
    return group.membership.password === password;
  }, [groups]);

  // Check if an invite code is valid for a group
  const verifyInviteCode = useCallback((groupId, code) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.membership.type !== 'invite-only') {
      return false;
    }
    return group.membership.inviteCode === code;
  }, [groups]);

  return {
    groups,
    getGroup,
    getPublicGroups,
    searchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupsForUser,
    verifyPassword,
    verifyInviteCode
  };
}

export default useGroups;
