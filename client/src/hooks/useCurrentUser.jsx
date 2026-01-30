// useCurrentUser Hook
// Manages the currently logged-in user session

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { userApi } from '../utils/api';
import dummyUsers from '../data/dummyUsers';
import { seedDummyData, isSeeded } from '../data/seedData';

const STORAGE_KEY = 'dailygamer_current_user';

// Context for current user (to avoid prop drilling)
const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState(dummyUsers);
  const [useApi, setUseApi] = useState(false);

  // Initialize on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Try to load users from API first
      try {
        const apiUsers = await userApi.list(100);
        if (!isMounted) return;

        if (apiUsers && apiUsers.length > 0) {
          setAvailableUsers(apiUsers);
          setUseApi(true);
        } else {
          // Fall back to localStorage/dummy data
          if (!isSeeded()) {
            seedDummyData();
          }
          setAvailableUsers(dummyUsers);
        }
      } catch (e) {
        if (!isMounted) return;
        console.log('API not available, using localStorage:', e.message);
        // Fall back to localStorage
        if (!isSeeded()) {
          seedDummyData();
        }
        setAvailableUsers(dummyUsers);
      }

      // Load current user from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { userId, isDemo: demoMode } = JSON.parse(stored);
          if (isMounted) {
            setCurrentUserId(userId);
            setIsDemo(demoMode ?? true);
          }

          // Try to load user from API
          try {
            const user = await userApi.getById(userId);
            if (!isMounted) return;
            if (user) {
              setCurrentUser(user);
              setIsLoading(false);
              return;
            }
          } catch {
            // Fallback to dummy users
          }

          if (!isMounted) return;

          // Find user in available users
          const users = dummyUsers;
          const user = users.find(u => u.id === userId);
          setCurrentUser(user || users[0]);
          if (!user) {
            setCurrentUserId(users[0].id);
          }
        } else {
          // Set default user
          const defaultUser = dummyUsers[0];
          if (isMounted) {
            setCurrentUserId(defaultUser.id);
            setCurrentUser(defaultUser);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            userId: defaultUser.id,
            isDemo: true
          }));
        }
      } catch (e) {
        console.error('Failed to load current user:', e);
        if (isMounted) {
          setCurrentUserId(dummyUsers[0].id);
          setCurrentUser(dummyUsers[0]);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Switch to a different user
  const switchUser = useCallback(async (userId) => {
    // Try API first
    if (useApi) {
      try {
        const user = await userApi.getById(userId);
        if (user) {
          setCurrentUserId(userId);
          setCurrentUser(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            userId,
            isDemo: true
          }));
          return true;
        }
      } catch {
        // Fall through to local
      }
    }

    // Fall back to local users
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userId,
        isDemo: true
      }));
      return true;
    }
    return false;
  }, [availableUsers, useApi]);

  // Refresh available users from API
  const refreshUsers = useCallback(async () => {
    try {
      const apiUsers = await userApi.list(100);
      if (apiUsers && apiUsers.length > 0) {
        setAvailableUsers(apiUsers);
        setUseApi(true);
      }
    } catch (e) {
      console.log('Could not refresh users from API:', e.message);
    }
  }, []);

  const value = {
    currentUserId,
    currentUser,
    isDemo,
    isLoading,
    switchUser,
    availableUsers,
    refreshUsers,
    useApi
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// Hook to use current user context
export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}

export default useCurrentUser;
