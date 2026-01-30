// useGroups Hook
// Manages groups - CRUD operations, search, and filtering

import { useState, useEffect, useCallback } from 'react';
import { groupsApi } from '../utils/api';
import { dummyGroups, groupMemberships } from '../data/dummyGroups';

const STORAGE_KEY = 'dailygamer_groups';

function useGroups() {
  const [groups, setGroups] = useState([]);
  const [useApi, setUseApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load groups on mount
  useEffect(() => {
    let isMounted = true;

    async function loadGroups() {
      // Try API first
      try {
        const apiGroups = await groupsApi.list({ limit: 100 });
        if (!isMounted) return;

        if (apiGroups && apiGroups.length > 0) {
          setGroups(apiGroups);
          setUseApi(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        if (!isMounted) return;
        console.log('API not available for groups, using localStorage:', e.message);
      }

      // Fall back to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          if (isMounted) {
            setGroups(JSON.parse(stored));
          }
        } else {
          // Initialize with dummy groups
          if (isMounted) {
            setGroups(dummyGroups);
          }
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
        if (isMounted) {
          setGroups(dummyGroups);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save groups to localStorage whenever they change (fallback mode only)
  useEffect(() => {
    if (!useApi && groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups, useApi]);

  // Get a group by ID
  const getGroup = useCallback(async (groupId) => {
    // Try local cache first
    const cached = groups.find(g => g.id === groupId);
    if (cached) return cached;

    // Try API if available
    if (useApi) {
      try {
        const group = await groupsApi.getById(groupId);
        if (group) {
          setGroups(prev => {
            if (!prev.find(g => g.id === group.id)) {
              return [...prev, group];
            }
            return prev;
          });
          return group;
        }
      } catch {
        // Not found
      }
    }

    return null;
  }, [groups, useApi]);

  // Get a group by ID (sync version)
  const getGroupSync = useCallback((groupId) => {
    return groups.find(g => g.id === groupId) || null;
  }, [groups]);

  // Get public groups (for browsing)
  const getPublicGroups = useCallback(() => {
    return groups.filter(g => g.visibility === 'public');
  }, [groups]);

  // Search groups by name or description
  const searchGroups = useCallback(async (query, visibility = null) => {
    // Try API if available
    if (useApi) {
      try {
        const results = await groupsApi.list({
          search: query,
          visibility: visibility || 'public',
        });
        return results || [];
      } catch (e) {
        console.log('API search failed, using local:', e.message);
      }
    }

    // Fall back to local search
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
        (g.description || '').toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [groups, useApi]);

  // Create a new group
  const createGroup = useCallback(async (groupData) => {
    // Try API first
    if (useApi) {
      try {
        const group = await groupsApi.create(groupData);
        setGroups(prev => [...prev, group]);
        return group;
      } catch (e) {
        console.error('Failed to create group via API:', e.message);
        throw e;
      }
    }

    // Local fallback
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
  }, [useApi]);

  // Update a group
  const updateGroup = useCallback(async (groupId, updates) => {
    // Try API first
    if (useApi) {
      try {
        const updated = await groupsApi.update(groupId, updates);
        setGroups(prev => prev.map(g =>
          g.id === groupId ? updated : g
        ));
        return updated;
      } catch (e) {
        console.error('Failed to update group via API:', e.message);
        throw e;
      }
    }

    // Local fallback
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    ));
  }, [useApi]);

  // Delete a group
  const deleteGroup = useCallback(async (groupId) => {
    // Try API first
    if (useApi) {
      try {
        await groupsApi.delete(groupId);
      } catch (e) {
        console.error('Failed to delete group via API:', e.message);
        throw e;
      }
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));

    // Clean up membership data (local)
    localStorage.removeItem(`dailygamer_group_members_${groupId}`);
    localStorage.removeItem(`dailygamer_discussions_${groupId}`);
  }, [useApi]);

  // Get groups for a specific user (where they are a member) - async version
  const getGroupsForUser = useCallback(async (userId) => {
    // Try API first
    if (useApi) {
      try {
        const userGroups = await groupsApi.getUserGroups(userId);
        return userGroups || [];
      } catch (e) {
        console.log('Failed to get user groups from API:', e.message);
      }
    }

    // Local fallback
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
  }, [groups, useApi]);

  // Get groups for a specific user - sync version for rendering
  // Note: In API mode, this filters from cached groups state
  const getGroupsForUserSync = useCallback((userId) => {
    // In API mode, we can't check membership synchronously
    // But groups from API include memberCount, and we load user's groups on the groups list
    // For now, return empty in API mode (the page should use async version or load separately)
    if (useApi) {
      // Filter groups where the user might be a member based on cached data
      // This is a limitation - we'd need to track membership separately
      return [];
    }

    // Local fallback - check membership in localStorage
    const userGroups = [];
    for (const group of groups) {
      const memberKey = `dailygamer_group_members_${group.id}`;
      const memberData = localStorage.getItem(memberKey);
      if (memberData) {
        try {
          const { members } = JSON.parse(memberData);
          if (members.some(m => m.userId === userId)) {
            userGroups.push(group);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return userGroups;
  }, [groups, useApi]);

  // Check if a password is correct for a group
  const verifyPassword = useCallback((groupId, password) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;

    // API groups use hasPassword flag
    if (useApi) {
      // This would need to be verified server-side on join
      return true;
    }

    // Local groups have membership.type and membership.password
    if (!group.membership || group.membership.type !== 'password') {
      return false;
    }
    return group.membership.password === password;
  }, [groups, useApi]);

  // Check if an invite code is valid for a group
  const verifyInviteCode = useCallback((groupId, code) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;

    // API groups have inviteCode directly
    if (group.inviteCode) {
      return group.inviteCode === code;
    }

    // Local groups have membership.inviteCode
    if (!group.membership || group.membership.type !== 'invite-only') {
      return false;
    }
    return group.membership.inviteCode === code;
  }, [groups]);

  // Refresh groups from API
  const refreshGroups = useCallback(async () => {
    try {
      const apiGroups = await groupsApi.list({ limit: 100 });
      if (apiGroups && apiGroups.length > 0) {
        setGroups(apiGroups);
        setUseApi(true);
      }
    } catch (e) {
      console.log('Could not refresh groups from API:', e.message);
    }
  }, []);

  return {
    groups,
    isLoading,
    useApi,
    getGroup,
    getGroupSync,
    getPublicGroups,
    searchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupsForUser,
    getGroupsForUserSync,
    verifyPassword,
    verifyInviteCode,
    refreshGroups
  };
}

export default useGroups;
