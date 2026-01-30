// useUsers Hook
// Manages the list of users and provides user lookup functionality

import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../utils/api';
import dummyUsers from '../data/dummyUsers';

const STORAGE_KEY = 'dailygamer_users';

function useUsers() {
  const [users, setUsers] = useState([]);
  const [useApi, setUseApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load users on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      // Try API first
      try {
        const apiUsers = await userApi.list(500);
        if (!isMounted) return;

        if (apiUsers && apiUsers.length > 0) {
          setUsers(apiUsers);
          setUseApi(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        if (!isMounted) return;
        console.log('API not available for users, using localStorage:', e.message);
      }

      // Fall back to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          if (isMounted) {
            setUsers(JSON.parse(stored));
          }
        } else {
          // Initialize with dummy users if no data exists
          if (isMounted) {
            setUsers(dummyUsers);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyUsers));
        }
      } catch (e) {
        console.error('Failed to load users:', e);
        if (isMounted) {
          setUsers(dummyUsers);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get a user by ID
  const getUser = useCallback(async (userId) => {
    // Try local cache first
    const cached = users.find(u => u.id === userId);
    if (cached) return cached;

    // Try API if available
    if (useApi) {
      try {
        const user = await userApi.getById(userId);
        if (user) {
          // Add to local cache
          setUsers(prev => {
            if (!prev.find(u => u.id === user.id)) {
              return [...prev, user];
            }
            return prev;
          });
          return user;
        }
      } catch {
        // Not found
      }
    }

    return null;
  }, [users, useApi]);

  // Get a user by ID (sync version for backwards compatibility)
  const getUserSync = useCallback((userId) => {
    return users.find(u => u.id === userId) || null;
  }, [users]);

  // Get a user by username
  const getUserByUsername = useCallback(async (username) => {
    // Try local cache first
    const cached = users.find(u => u.username === username);
    if (cached) return cached;

    // Try API if available
    if (useApi) {
      try {
        const user = await userApi.getByUsername(username);
        if (user) {
          setUsers(prev => {
            if (!prev.find(u => u.id === user.id)) {
              return [...prev, user];
            }
            return prev;
          });
          return user;
        }
      } catch {
        // Not found
      }
    }

    return null;
  }, [users, useApi]);

  // Get a user by username (sync version)
  const getUserByUsernameSync = useCallback((username) => {
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

  // Refresh users from API
  const refreshUsers = useCallback(async () => {
    try {
      const apiUsers = await userApi.list(500);
      if (apiUsers && apiUsers.length > 0) {
        setUsers(apiUsers);
        setUseApi(true);
      }
    } catch (e) {
      console.log('Could not refresh users from API:', e.message);
    }
  }, []);

  return {
    users,
    isLoading,
    useApi,
    getUser,
    getUserSync,
    getUserByUsername,
    getUserByUsernameSync,
    searchUsers,
    getUsersByIds,
    refreshUsers
  };
}

export default useUsers;
