// useGroupMembership Hook
// Manages group membership - join, leave, invite, kick

import { useState, useEffect, useCallback } from 'react';

function getStorageKey(groupId) {
  return `dailygamer_group_members_${groupId}`;
}

function useGroupMembership(groupId) {
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(groupId);

  // Load membership data from localStorage
  useEffect(() => {
    if (!groupId) {
      setMembers([]);
      setPendingInvites([]);
      setIsLoading(false);
      return;
    }

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
  }, [groupId, storageKey]);

  // Save membership data to localStorage
  const save = useCallback((newMembers, newInvites) => {
    if (!groupId) return;

    const data = {
      members: newMembers,
      pendingInvites: newInvites
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [groupId, storageKey]);

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
  const joinGroup = useCallback((userId) => {
    if (isMember(userId)) {
      return { success: false, error: 'Already a member' };
    }

    const newMember = {
      userId,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const newMembers = [...members, newMember];
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [members, pendingInvites, isMember, save]);

  // Leave the group
  const leaveGroup = useCallback((userId) => {
    if (!isMember(userId)) {
      return { success: false, error: 'Not a member' };
    }

    // Can't leave if you're the only admin
    const admins = members.filter(m => m.role === 'admin');
    if (admins.length === 1 && admins[0].userId === userId) {
      return { success: false, error: 'Cannot leave - you are the only admin' };
    }

    const newMembers = members.filter(m => m.userId !== userId);
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [members, pendingInvites, isMember, save]);

  // Kick a member (requires admin/mod)
  const kickMember = useCallback((actorId, targetId) => {
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

    const newMembers = members.filter(m => m.userId !== targetId);
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [members, pendingInvites, isModerator, getMemberRole, save]);

  // Update a member's role (admin only)
  const updateRole = useCallback((actorId, targetId, newRole) => {
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

    const newMembers = members.map(m =>
      m.userId === targetId ? { ...m, role: newRole } : m
    );
    setMembers(newMembers);
    save(newMembers, pendingInvites);

    return { success: true };
  }, [members, pendingInvites, isAdmin, isMember, save]);

  // Create an invite
  const createInvite = useCallback((actorId, targetUserId) => {
    if (!isModerator(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    if (isMember(targetUserId)) {
      return { success: false, error: 'User is already a member' };
    }

    if (pendingInvites.some(i => i.userId === targetUserId)) {
      return { success: false, error: 'Invite already pending' };
    }

    const invite = {
      userId: targetUserId,
      invitedBy: actorId,
      invitedAt: new Date().toISOString()
    };

    const newInvites = [...pendingInvites, invite];
    setPendingInvites(newInvites);
    save(members, newInvites);

    return { success: true };
  }, [members, pendingInvites, isModerator, isMember, save]);

  // Cancel an invite
  const cancelInvite = useCallback((actorId, targetUserId) => {
    if (!isModerator(actorId)) {
      return { success: false, error: 'Not authorized' };
    }

    const newInvites = pendingInvites.filter(i => i.userId !== targetUserId);
    setPendingInvites(newInvites);
    save(members, newInvites);

    return { success: true };
  }, [members, pendingInvites, isModerator, save]);

  // Accept an invite (user perspective)
  const acceptInvite = useCallback((userId) => {
    const invite = pendingInvites.find(i => i.userId === userId);
    if (!invite) {
      return { success: false, error: 'No pending invite' };
    }

    // Add as member
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
  }, [members, pendingInvites, save]);

  return {
    members,
    pendingInvites,
    isLoading,
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
    acceptInvite
  };
}

export default useGroupMembership;
