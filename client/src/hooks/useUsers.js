// useUsers Hook
// Manages the list of users and provides user lookup functionality

import { useState, useEffect, useCallback } from 'react';
import dummyUsers from '../data/dummyUsers';

const STORAGE_KEY = 'dailygamer_users';

function useUsers() {
  const [users, setUsers] = useState([]);

  // Load users from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        // Initialize with dummy users if no data exists
        setUsers(dummyUsers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyUsers));
      }
    } catch (e) {
      console.error('Failed to load users:', e);
      setUsers(dummyUsers);
    }
  }, []);

  // Get a user by ID
  const getUser = useCallback((userId) => {
    return users.find(u => u.id === userId) || null;
  }, [users]);

  // Get a user by username
  const getUserByUsername = useCallback((username) => {
    return users.find(u => u.username === username) || null;
  }, [users]);

  // Search users by name or username
  const searchUsers = useCallback((query) => {
    if (!query) return users;
    const lower = query.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(lower) ||
      u.displayName.toLowerCase().includes(lower)
    );
  }, [users]);

  // Get multiple users by IDs
  const getUsersByIds = useCallback((userIds) => {
    return userIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  }, [users]);

  return {
    users,
    getUser,
    getUserByUsername,
    searchUsers,
    getUsersByIds
  };
}

export default useUsers;
