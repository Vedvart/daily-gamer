// useGroupMembership Hook
// Manages group membership - join, leave, invite, kick

import { useState, useEffect, useCallback } from 'react';
import { groupsApi } from '../utils/api';

function getStorageKey(groupId) {
  return `dailygamer_group_members_${groupId}`;
}

function useGroupMembership(groupId) {
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useApi, setUseApi] = useState(false);

  const storageKey = getStorageKey(groupId);

  // Load membership data
  useEffect(() => {
    if (!groupId) {
      setMembers([]);
      setPendingInvites([]);
      setIsLoading(false);
      return;
    }

    async function loadMembership() {
      // Try API first
      try {
        const apiMembers = await groupsApi.getMembers(groupId);
        if (apiMembers) {
          // Transform API response to match expected format
          const transformed = apiMembers.map(m => ({
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
            user: m.user,
          }));
          setMembers(transformed);
          setUseApi(true);

          // Also load invites
          try {
            const invites = await groupsApi.getInvites(groupId);
            setPendingInvites(invites || []);
          } catch {
            // Invites might not be accessible to non-admins
          }

          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.log('API not available for membership, using localStorage:', e.message);
      }

      // Fall back to localStorage
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          setMembers(data.members || []);
          setPendingInvites(data.pendingInvites || []);
        } else {
          setMembers([]);
          setPendingInvites([]);
        }
      } catch (e) {
        console.error('Failed to load group membership:', e);
        setMembers([]);
        setPendingInvites([]);
      }

      setIsLoading(false);
    }

    loadMembership();
  }, [groupId, storageKey]);

  // Save membership data to localStorage (fallback mode only)
  const save = useCallback((newMembers, newInvites) => {
    if (!groupId || useApi) return;

    const data = {
      members: newMembers,
      pendingInvites: newInvites
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [groupId, storageKey, useApi]);

  // Check if a user is a member
  const isMember = useCallback((userId) => {
    return members.some(m => m.userId === userId);
  }, [members]);

  // Get a member's role
  const getMemberRole = useCallback((userId) => {
    const member = members.find(m => m.userId === userId);
    return member?.role || null;
  }, [members]);

  // Check if a user is an admin
  const isAdmin = useCallback((userId) => {
    return getMemberRole(userId) === 'admin';
  }, [getMemberRole]);

  // Check if a user is a moderator or admin
  const isModerator = useCallback((userId) => {
    const role = getMemberRole(userId);
    return role === 'admin' || role === 'moderator';
  }, [getMemberRole]);

  // Join the group
  const joinGroup = useCallback(async (userId, password = null) => {
    if (isMember(userId)) {
      return { success: false, error: 'Already a member' };
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.join(groupId, userId, password);
        // Refresh members
        const apiMembers = await groupsApi.getMembers(groupId);
        if (apiMembers) {
          setMembers(apiMembers.map(m => ({
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
            user: m.user,
          })));
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const newMember = {
      userId,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const newMembers = [...members, newMember];
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, isMember, save, useApi]);

  // Leave the group
  const leaveGroup = useCallback(async (userId) => {
    if (!isMember(userId)) {
      return { success: false, error: 'Not a member' };
    }

    // Can't leave if you're the only admin
    const admins = members.filter(m => m.role === 'admin');
    if (admins.length === 1 && admins[0].userId === userId) {
      return { success: false, error: 'Cannot leave - you are the only admin' };
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.leave(groupId, userId);
        setMembers(prev => prev.filter(m => m.userId !== userId));
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const newMembers = members.filter(m => m.userId !== userId);
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, isMember, save, useApi]);

  // Kick a member (requires admin/mod)
  const kickMember = useCallback(async (actorId, targetId) => {
    if (!isModerator(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    const targetRole = getMemberRole(targetId);
    if (!targetRole) {
      return { success: false, error: 'User is not a member' };
    }

    // Can't kick admins
    if (targetRole === 'admin') {
      return { success: false, error: 'Cannot kick an admin' };
    }

    // Mods can only kick regular members
    if (getMemberRole(actorId) === 'moderator' && targetRole === 'moderator') {
      return { success: false, error: 'Moderators cannot kick other moderators' };
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.removeMember(groupId, targetId);
        setMembers(prev => prev.filter(m => m.userId !== targetId));
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const newMembers = members.filter(m => m.userId !== targetId);
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, isModerator, getMemberRole, save, useApi]);

  // Update a member's role (admin only)
  const updateRole = useCallback(async (actorId, targetId, newRole) => {
    if (!isAdmin(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    if (!isMember(targetId)) {
      return { success: false, error: 'User is not a member' };
    }

    // Can't demote yourself if you're the only admin
    if (actorId === targetId && newRole !== 'admin') {
      const admins = members.filter(m => m.role === 'admin');
      if (admins.length === 1) {
        return { success: false, error: 'Cannot demote - you are the only admin' };
      }
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.updateMemberRole(groupId, targetId, newRole);
        setMembers(prev => prev.map(m =>
          m.userId === targetId ? { ...m, role: newRole } : m
        ));
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const newMembers = members.map(m =>
      m.userId === targetId ? { ...m, role: newRole } : m
    );
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, isAdmin, isMember, save, useApi]);

  // Create an invite
  const createInvite = useCallback(async (actorId, targetUserId) => {
    if (!isModerator(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    if (isMember(targetUserId)) {
      return { success: false, error: 'User is already a member' };
    }

    if (pendingInvites.some(i => i.userId === targetUserId)) {
      return { success: false, error: 'Invite already pending' };
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.createInvite(groupId, targetUserId, actorId);
        // Refresh invites
        const invites = await groupsApi.getInvites(groupId);
        setPendingInvites(invites || []);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const invite = {
      userId: targetUserId,
      invitedBy: actorId,
      invitedAt: new Date().toISOString()
    };

    const newInvites = [...pendingInvites, invite];
    setPendingInvites(newInvites);
    save(members, newInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, isModerator, isMember, save, useApi]);

  // Cancel an invite
  const cancelInvite = useCallback(async (actorId, targetUserId) => {
    if (!isModerator(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    // API doesn't have a cancel endpoint, so this is local only
    const newInvites = pendingInvites.filter(i => i.userId !== targetUserId);
    setPendingInvites(newInvites);
    save(members, newInvites);

    return { success: true };
  }, [members, pendingInvites, isModerator, save]);

  // Accept an invite (user perspective)
  const acceptInvite = useCallback(async (userId) => {
    const invite = pendingInvites.find(i => i.userId === userId);
    if (!invite && !useApi) {
      return { success: false, error: 'No pending invite' };
    }

    // Try API first
    if (useApi) {
      try {
        await groupsApi.respondToInvite(groupId, userId, true);
        // Refresh members
        const apiMembers = await groupsApi.getMembers(groupId);
        if (apiMembers) {
          setMembers(apiMembers.map(m => ({
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
            user: m.user,
          })));
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Local fallback
    const newMember = {
      userId,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const newMembers = [...members, newMember];
    const newInvites = pendingInvites.filter(i => i.userId !== userId);

    setMembers(newMembers);
    setPendingInvites(newInvites);
    save(newMembers, newInvites);

    return { success: true };
  }, [groupId, members, pendingInvites, save, useApi]);

  // Refresh membership from API
  const refreshMembership = useCallback(async () => {
    if (!groupId) return;

    try {
      const apiMembers = await groupsApi.getMembers(groupId);
      if (apiMembers) {
        setMembers(apiMembers.map(m => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          user: m.user,
        })));
        setUseApi(true);
      }
    } catch (e) {
      console.log('Could not refresh membership from API:', e.message);
    }
  }, [groupId]);

  return {
    members,
    pendingInvites,
    isLoading,
    useApi,
    isMember,
    isAdmin,
    isModerator,
    getMemberRole,
    joinGroup,
    leaveGroup,
    kickMember,
    updateRole,
    createInvite,
    cancelInvite,
    acceptInvite,
    refreshMembership
  };
}

export default useGroupMembership;
