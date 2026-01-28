// useCurrentUser Hook
// Manages the currently logged-in user session

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
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

  // Initialize on mount
  useEffect(() => {
    // Seed dummy data if not already done
    if (!isSeeded()) {
      seedDummyData();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { userId, isDemo: demoMode } = JSON.parse(stored);
        setCurrentUserId(userId);
        setIsDemo(demoMode ?? true);

        // Find user in dummy users
        const user = dummyUsers.find(u => u.id === userId);
        setCurrentUser(user || dummyUsers[0]);
        if (!user) {
          // Reset to first user if stored user not found
          setCurrentUserId(dummyUsers[0].id);
        }
      } else {
        // Set default user
        setCurrentUserId(dummyUsers[0].id);
        setCurrentUser(dummyUsers[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          userId: dummyUsers[0].id,
          isDemo: true
        }));
      }
    } catch (e) {
      console.error('Failed to load current user:', e);
      setCurrentUserId(dummyUsers[0].id);
      setCurrentUser(dummyUsers[0]);
    }

    setIsLoading(false);
  }, []);

  // Switch to a different user
  const switchUser = useCallback((userId) => {
    const user = dummyUsers.find(u => u.id === userId);
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
  }, []);

  // Get all available users for switching
  const availableUsers = dummyUsers;

  const value = {
    currentUserId,
    currentUser,
    isDemo,
    isLoading,
    switchUser,
    availableUsers
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
