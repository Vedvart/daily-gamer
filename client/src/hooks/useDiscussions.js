// useDiscussions Hook
// Manages discussion threads and comments for a group

import { useState, useEffect, useCallback } from 'react';

function getStorageKey(groupId) {
  return `dailygamer_discussions_${groupId}`;
}

function useDiscussions(groupId) {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(groupId);

  // Load discussions from localStorage
  useEffect(() => {
    if (!groupId) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setThreads(data.threads || []);
      } else {
        // Initialize with empty threads
        setThreads([]);
      }
    } catch (e) {
      console.error('Failed to load discussions:', e);
      setThreads([]);
    }

    setIsLoading(false);
  }, [groupId, storageKey]);

  // Save discussions to localStorage
  const save = useCallback((newThreads) => {
    if (!groupId) return;

    localStorage.setItem(storageKey, JSON.stringify({ threads: newThreads }));
  }, [groupId, storageKey]);

  // Get today's date string
  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Get or create a daily thread for a specific game
  const getDailyThread = useCallback((gameId) => {
    const today = getToday();
    const existingThread = threads.find(
      t => t.type === 'daily' && t.gameId === gameId && t.date === today
    );

    if (existingThread) {
      return existingThread;
    }

    // Create new daily thread
    const newThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'daily',
      gameId,
      date: today,
      title: `${gameId.charAt(0).toUpperCase() + gameId.slice(1)} - ${today}`,
      comments: [],
      createdAt: new Date().toISOString()
    };

    const newThreads = [newThread, ...threads];
    setThreads(newThreads);
    save(newThreads);

    return newThread;
  }, [threads, getToday, save]);

  // Create a general discussion thread
  const createThread = useCallback((title, userId, initialComment = null) => {
    const newThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'general',
      gameId: null,
      date: null,
      title,
      createdBy: userId,
      comments: initialComment ? [{
        id: `comment_${Date.now()}`,
        userId,
        text: initialComment,
        timestamp: new Date().toISOString(),
        replyTo: null
      }] : [],
      createdAt: new Date().toISOString()
    };

    const newThreads = [newThread, ...threads];
    setThreads(newThreads);
    save(newThreads);

    return newThread;
  }, [threads, save]);

  // Get a thread by ID
  const getThread = useCallback((threadId) => {
    return threads.find(t => t.id === threadId) || null;
  }, [threads]);

  // Get all threads, optionally filtered
  const getThreads = useCallback((filter = {}) => {
    let filtered = threads;

    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.gameId) {
      filtered = filtered.filter(t => t.gameId === filter.gameId);
    }

    if (filter.date) {
      filtered = filtered.filter(t => t.date === filter.date);
    }

    // Sort by most recent activity
    return filtered.sort((a, b) => {
      const aLatest = a.comments.length > 0
        ? new Date(a.comments[a.comments.length - 1].timestamp)
        : new Date(a.createdAt);
      const bLatest = b.comments.length > 0
        ? new Date(b.comments[b.comments.length - 1].timestamp)
        : new Date(b.createdAt);
      return bLatest - aLatest;
    });
  }, [threads]);

  // Add a comment to a thread
  const addComment = useCallback((threadId, userId, text, replyTo = null) => {
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      text,
      timestamp: new Date().toISOString(),
      replyTo
    };

    const newThreads = threads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          comments: [...thread.comments, newComment]
        };
      }
      return thread;
    });

    setThreads(newThreads);
    save(newThreads);

    return newComment;
  }, [threads, save]);

  // Delete a comment (only by author or moderator)
  const deleteComment = useCallback((threadId, commentId) => {
    const newThreads = threads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          comments: thread.comments.filter(c => c.id !== commentId)
        };
      }
      return thread;
    });

    setThreads(newThreads);
    save(newThreads);
  }, [threads, save]);

  // Delete a thread
  const deleteThread = useCallback((threadId) => {
    const newThreads = threads.filter(t => t.id !== threadId);
    setThreads(newThreads);
    save(newThreads);
  }, [threads, save]);

  // Get recent daily threads (for quick access)
  const getRecentDailyThreads = useCallback((limit = 5) => {
    return threads
      .filter(t => t.type === 'daily')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [threads]);

  return {
    threads,
    isLoading,
    getDailyThread,
    createThread,
    getThread,
    getThreads,
    addComment,
    deleteComment,
    deleteThread,
    getRecentDailyThreads
  };
}

export default useDiscussions;
