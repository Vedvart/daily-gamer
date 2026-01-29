// useDiscussions Hook
// Manages discussion threads and comments for a group

import { useState, useEffect, useCallback } from 'react';
import { discussionsApi } from '../utils/api';

function getStorageKey(groupId) {
  return `dailygamer_discussions_${groupId}`;
}

function useDiscussions(groupId) {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useApi, setUseApi] = useState(false);

  const storageKey = getStorageKey(groupId);

  // Load discussions
  useEffect(() => {
    if (!groupId) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    async function loadDiscussions() {
      // Try API first
      try {
        const apiThreads = await discussionsApi.getThreads(groupId, { limit: 100 });
        if (apiThreads) {
          setThreads(apiThreads);
          setUseApi(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.log('API not available for discussions, using localStorage:', e.message);
      }

      // Fall back to localStorage
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
    }

    loadDiscussions();
  }, [groupId, storageKey]);

  // Save discussions to localStorage (fallback mode only)
  const save = useCallback((newThreads) => {
    if (!groupId || useApi) return;
    localStorage.setItem(storageKey, JSON.stringify({ threads: newThreads }));
  }, [groupId, storageKey, useApi]);

  // Get today's date string
  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Get or create a daily thread for a specific game
  const getDailyThread = useCallback(async (gameId, userId = null) => {
    const today = getToday();

    // Try API first
    if (useApi) {
      try {
        const thread = await discussionsApi.getDailyThread(groupId, gameId, today, userId);
        // Update local cache
        setThreads(prev => {
          const existingIndex = prev.findIndex(t => t.id === thread.id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = thread;
            return updated;
          }
          return [thread, ...prev];
        });
        return thread;
      } catch (e) {
        console.error('Failed to get daily thread from API:', e.message);
      }
    }

    // Local fallback
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
  }, [groupId, threads, getToday, save, useApi]);

  // Create a general discussion thread
  const createThread = useCallback(async (title, userId, initialComment = null) => {
    // Try API first
    if (useApi) {
      try {
        const thread = await discussionsApi.createThread(groupId, {
          title,
          createdBy: userId,
        });

        // Add initial comment if provided
        if (initialComment && thread.id) {
          await discussionsApi.addComment(groupId, thread.id, {
            userId,
            content: initialComment,
          });
          // Refresh thread to get comment
          const updated = await discussionsApi.getThread(groupId, thread.id);
          setThreads(prev => [updated, ...prev]);
          return updated;
        }

        setThreads(prev => [thread, ...prev]);
        return thread;
      } catch (e) {
        console.error('Failed to create thread via API:', e.message);
        throw e;
      }
    }

    // Local fallback
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
  }, [groupId, threads, save, useApi]);

  // Get a thread by ID
  const getThread = useCallback(async (threadId) => {
    // Try local cache first
    const cached = threads.find(t => t.id === threadId);
    if (cached && cached.comments) return cached;

    // Try API if available
    if (useApi) {
      try {
        const thread = await discussionsApi.getThread(groupId, threadId);
        if (thread) {
          // Update cache
          setThreads(prev => {
            const existingIndex = prev.findIndex(t => t.id === threadId);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = thread;
              return updated;
            }
            return [...prev, thread];
          });
          return thread;
        }
      } catch {
        // Not found
      }
    }

    return cached || null;
  }, [groupId, threads, useApi]);

  // Get a thread by ID (sync version)
  const getThreadSync = useCallback((threadId) => {
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
      filtered = filtered.filter(t => (t.date || t.threadDate) === filter.date);
    }

    // Sort by most recent activity
    return filtered.sort((a, b) => {
      const aLatest = a.lastActivityAt || a.createdAt ||
        (a.comments?.length > 0 ? a.comments[a.comments.length - 1].timestamp : a.createdAt);
      const bLatest = b.lastActivityAt || b.createdAt ||
        (b.comments?.length > 0 ? b.comments[b.comments.length - 1].timestamp : b.createdAt);
      return new Date(bLatest) - new Date(aLatest);
    });
  }, [threads]);

  // Add a comment to a thread
  const addComment = useCallback(async (threadId, userId, text, replyTo = null) => {
    // Try API first
    if (useApi) {
      try {
        const comment = await discussionsApi.addComment(groupId, threadId, {
          userId,
          content: text,
          parentId: replyTo,
        });

        // Update local cache
        setThreads(prev => prev.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              comments: [...(thread.comments || []), comment],
              commentCount: (thread.commentCount || 0) + 1,
              lastActivityAt: new Date().toISOString(),
            };
          }
          return thread;
        }));

        return comment;
      } catch (e) {
        console.error('Failed to add comment via API:', e.message);
        throw e;
      }
    }

    // Local fallback
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
          comments: [...(thread.comments || []), newComment]
        };
      }
      return thread;
    });

    setThreads(newThreads);
    save(newThreads);

    return newComment;
  }, [groupId, threads, save, useApi]);

  // Delete a comment (only by author or moderator)
  const deleteComment = useCallback(async (threadId, commentId) => {
    // Try API first
    if (useApi) {
      try {
        await discussionsApi.deleteComment(groupId, threadId, commentId);
      } catch (e) {
        console.error('Failed to delete comment via API:', e.message);
      }
    }

    // Update local state
    const newThreads = threads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          comments: (thread.comments || []).filter(c => c.id !== commentId),
          commentCount: Math.max(0, (thread.commentCount || 0) - 1),
        };
      }
      return thread;
    });

    setThreads(newThreads);
    save(newThreads);
  }, [groupId, threads, save, useApi]);

  // Delete a thread
  const deleteThread = useCallback(async (threadId) => {
    // Try API first
    if (useApi) {
      try {
        await discussionsApi.deleteThread(groupId, threadId);
      } catch (e) {
        console.error('Failed to delete thread via API:', e.message);
      }
    }

    const newThreads = threads.filter(t => t.id !== threadId);
    setThreads(newThreads);
    save(newThreads);
  }, [groupId, threads, save, useApi]);

  // Get recent daily threads (for quick access)
  const getRecentDailyThreads = useCallback((limit = 5) => {
    return threads
      .filter(t => t.type === 'daily')
      .sort((a, b) => new Date(b.date || b.threadDate) - new Date(a.date || a.threadDate))
      .slice(0, limit);
  }, [threads]);

  // Refresh threads from API
  const refreshThreads = useCallback(async () => {
    if (!groupId) return;

    try {
      const apiThreads = await discussionsApi.getThreads(groupId, { limit: 100 });
      if (apiThreads) {
        setThreads(apiThreads);
        setUseApi(true);
      }
    } catch (e) {
      console.log('Could not refresh threads from API:', e.message);
    }
  }, [groupId]);

  return {
    threads,
    isLoading,
    useApi,
    getDailyThread,
    createThread,
    getThread,
    getThreadSync,
    getThreads,
    addComment,
    deleteComment,
    deleteThread,
    getRecentDailyThreads,
    refreshThreads
  };
}

export default useDiscussions;
