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

  // ============ HISTOGRAM FUNCTIONS ============

  // Get histogram data for Wordle (score distribution 1-6, X)
  const getWordleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'wordle');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };

    gameResults.forEach(r => {
      if (r.won && r.scoreValue >= 1 && r.scoreValue <= 6) {
        histogram[r.scoreValue]++;
      } else {
        histogram['X']++;
      }
    });

    return histogram;
  }, [results]);

  // Get histogram data for Connections (includes Reverse Perfect and Purple First)
  const getConnectionsHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'connections');
    const histogram = { 'RP': 0, 'PF': 0, 0: 0, 1: 0, 2: 0, 3: 0, 'X': 0 };

    gameResults.forEach(r => {
      if (!r.won) {
        histogram['X']++;
      } else if (r.isReversePerfect) {
        histogram['RP']++;
      } else if (r.isPurpleFirst) {
        histogram['PF']++;
      } else {
        // scoreValue is 4 - mistakes, so mistakes = 4 - scoreValue
        const mistakes = 4 - r.scoreValue;
        if (mistakes >= 0 && mistakes <= 3) {
          histogram[mistakes]++;
        } else {
          histogram[0]++;
        }
      }
    });

    return histogram;
  }, [results]);

  // Get histogram data for NYT Mini (time buckets)
  const getMiniHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'mini');
    const histogram = { '<30s': 0, '30-60s': 0, '1-2m': 0, '2-3m': 0, '3m+': 0 };

    gameResults.forEach(r => {
      const seconds = r.scoreValue; // scoreValue is time in seconds
      if (seconds < 30) {
        histogram['<30s']++;
      } else if (seconds < 60) {
        histogram['30-60s']++;
      } else if (seconds < 120) {
        histogram['1-2m']++;
      } else if (seconds < 180) {
        histogram['2-3m']++;
      } else {
        histogram['3m+']++;
      }
    });

    return histogram;
  }, [results]);

  // Get histogram data for Bandle (score distribution 1-6, X)
  const getBandleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'bandle');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };

    gameResults.forEach(r => {
      if (r.won && r.scoreValue >= 1 && r.scoreValue <= 6) {
        histogram[r.scoreValue]++;
      } else {
        histogram['X']++;
      }
    });

    return histogram;
  }, [results]);

  // Get histogram data for Catfishing (individual scores 0-10)
  const getCatfishingHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'catfishing');
    const histogram = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

    gameResults.forEach(r => {
      const score = r.scoreValue;
      if (score >= 0 && score <= 10) {
        histogram[score]++;
      }
    });

    return histogram;
  }, [results]);

  // Get histogram data for TimeGuessr (5k point buckets)
  const getTimeguessrHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'timeguessr');
    const histogram = {
      '0-5k': 0, '5-10k': 0, '10-15k': 0, '15-20k': 0, '20-25k': 0,
      '25-30k': 0, '30-35k': 0, '35-40k': 0, '40-45k': 0, '45-50k': 0
    };

    gameResults.forEach(r => {
      const score = r.scoreValue;
      if (score < 5000) histogram['0-5k']++;
      else if (score < 10000) histogram['5-10k']++;
      else if (score < 15000) histogram['10-15k']++;
      else if (score < 20000) histogram['15-20k']++;
      else if (score < 25000) histogram['20-25k']++;
      else if (score < 30000) histogram['25-30k']++;
      else if (score < 35000) histogram['30-35k']++;
      else if (score < 40000) histogram['35-40k']++;
      else if (score < 45000) histogram['40-45k']++;
      else histogram['45-50k']++;
    });

    return histogram;
  }, [results]);

  // Get all histogram data at once
  const getAllHistograms = useCallback(() => {
    return {
      wordle: getWordleHistogram(),
      connections: getConnectionsHistogram(),
      mini: getMiniHistogram(),
      bandle: getBandleHistogram(),
      catfishing: getCatfishingHistogram(),
      timeguessr: getTimeguessrHistogram(),
    };
  }, [getWordleHistogram, getConnectionsHistogram, getMiniHistogram, getBandleHistogram, getCatfishingHistogram, getTimeguessrHistogram]);

  // Get all games that have at least one result (for showing histograms)
  const getGamesWithResults = useCallback(() => {
    const gameIds = new Set(results.map(r => r.gameId));
    return Array.from(gameIds);
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
    getWordleHistogram,
    getConnectionsHistogram,
    getMiniHistogram,
    getBandleHistogram,
    getCatfishingHistogram,
    getTimeguessrHistogram,
    getAllHistograms,
    getGamesWithResults,
    clearAll,
  };
}

export default useGameResults;
