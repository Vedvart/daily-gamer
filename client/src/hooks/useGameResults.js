import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dailygamer_results';

/**
 * Custom hook for managing game results with localStorage persistence
 */
function useGameResults() {
  const [results, setResults] = useState([]);

  // Load results from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed.results || []);
      }
    } catch (e) {
      console.error('Failed to load results from localStorage:', e);
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ results }));
    } catch (e) {
      console.error('Failed to save results to localStorage:', e);
    }
  }, [results]);

  // Get today's date in YYYY-MM-DD format
  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Filter results for today
  const todayResults = results.filter(r => r.date === getToday());

  // Add a new result (prevents duplicates based on gameId + puzzleNumber)
  const addResult = useCallback((result) => {
    setResults(prev => {
      // Check for duplicate
      const existingIndex = prev.findIndex(
        r => r.gameId === result.gameId && r.puzzleNumber === result.puzzleNumber
      );

      if (existingIndex !== -1) {
        // Replace existing result
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      }

      // Add new result
      return [...prev, result];
    });
  }, []);

  // Remove a result by ID
  const removeResult = useCallback((id) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  // Get stats for a specific game
  const getStats = useCallback((gameId) => {
    const gameResults = results.filter(r => r.gameId === gameId);

    if (gameResults.length === 0) {
      return {
        totalPlayed: 0,
        wins: 0,
        averageScore: null,
        bestScore: null,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const wins = gameResults.filter(r => r.won).length;

    // Calculate average (for time-based games like Mini, lower is better)
    const isTimeBased = gameId === 'mini';
    const scores = gameResults.map(r => r.scoreValue).filter(s => s != null);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // Calculate best score
    let bestScore = null;
    if (scores.length > 0) {
      bestScore = isTimeBased
        ? Math.min(...scores) // Lower is better for time
        : Math.max(...scores); // Higher is better for score
    }

    // Calculate streaks (simplified - based on consecutive wins)
    const sortedResults = [...gameResults].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const result of sortedResults) {
      if (result.won) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0) currentStreak = tempStreak;
        tempStreak = 0;
      }
    }

    return {
      totalPlayed: gameResults.length,
      wins,
      averageScore,
      bestScore,
      currentStreak,
      longestStreak,
    };
  }, [results]);

  // Get result for a specific game and date
  const getResultForDate = useCallback((gameId, date) => {
    return results.find(r => r.gameId === gameId && r.date === date);
  }, [results]);

  // Clear all results (for testing/reset)
  const clearAll = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    results,
    todayResults,
    addResult,
    removeResult,
    getStats,
    getResultForDate,
    clearAll,
  };
}

export default useGameResults;
