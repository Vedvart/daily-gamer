import { useState, useEffect, useCallback, useRef } from 'react';

// Get storage key for a user's results
function getStorageKey(userId) {
  if (userId) {
    return `dailygamer_results_${userId}`;
  }
  return 'dailygamer_results';
}

/**
 * Custom hook for managing game results with localStorage persistence
 * @param {string} userId - Optional user ID. If provided, loads that user's results.
 * @param {boolean} readOnly - If true, results cannot be modified (for viewing other users)
 */
function useGameResults(userId = null, readOnly = false) {
  const [results, setResults] = useState([]);
  const storageKey = getStorageKey(userId);
  const prevStorageKey = useRef(storageKey);

  // Load results from localStorage on mount or when userId changes
  useEffect(() => {
    // Reset results when switching users
    if (prevStorageKey.current !== storageKey) {
      setResults([]);
      prevStorageKey.current = storageKey;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed.results || []);
      }
    } catch (e) {
      console.error('Failed to load results from localStorage:', e);
    }
  }, [storageKey]);

  // Save results to localStorage whenever they change
  useEffect(() => {
    // Only save if not in read-only mode
    if (!readOnly && results.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ results }));
      } catch (e) {
        console.error('Failed to save results to localStorage:', e);
      }
    }
  }, [results, storageKey, readOnly]);

  // Get today's date in YYYY-MM-DD format
  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Filter results for today
  const todayResults = results.filter(r => r.date === getToday());

  // Add a new result (prevents duplicates based on gameId + puzzleNumber)
  const addResult = useCallback((result) => {
    // Don't allow adding results in read-only mode
    if (readOnly) {
      console.warn('Cannot add results in read-only mode');
      return;
    }

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
  }, [readOnly]);

  // Remove a result by ID
  const removeResult = useCallback((id) => {
    if (readOnly) {
      console.warn('Cannot remove results in read-only mode');
      return;
    }
    setResults(prev => prev.filter(r => r.id !== id));
  }, [readOnly]);

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

  // Get histogram data for Catfishing (half-point increments 0, 0.5, 1, 1.5, ... 10)
  const getCatfishingHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'catfishing');
    // Initialize all half-point buckets
    const histogram = {};
    for (let i = 0; i <= 20; i++) {
      histogram[i / 2] = 0;
    }

    gameResults.forEach(r => {
      const score = r.scoreValue;
      // Round to nearest 0.5
      const bucket = Math.round(score * 2) / 2;
      if (bucket >= 0 && bucket <= 10) {
        histogram[bucket]++;
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

  // Get histogram data for Strands (hints used)
  const getStrandsHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'strands');
    const histogram = { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 };

    gameResults.forEach(r => {
      const hints = r.scoreValue || 0;
      if (hints === 0) histogram[0]++;
      else if (hints === 1) histogram[1]++;
      else if (hints === 2) histogram[2]++;
      else if (hints === 3) histogram[3]++;
      else histogram['4+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for LA Times Mini (same as NYT Mini - time buckets)
  const getLatimesMiniHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'latimesmini');
    const histogram = { '<30s': 0, '30-60s': 0, '1-2m': 0, '2-3m': 0, '3m+': 0 };

    gameResults.forEach(r => {
      const seconds = r.scoreValue;
      if (seconds < 30) histogram['<30s']++;
      else if (seconds < 60) histogram['30-60s']++;
      else if (seconds < 120) histogram['1-2m']++;
      else if (seconds < 180) histogram['2-3m']++;
      else histogram['3m+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Travle (extra guesses)
  const getTravleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'travle');
    const histogram = { '+0': 0, '+1': 0, '+2': 0, '+3': 0, '+4': 0, '+5+': 0 };

    gameResults.forEach(r => {
      const extra = r.scoreValue || 0;
      if (extra === 0) histogram['+0']++;
      else if (extra === 1) histogram['+1']++;
      else if (extra === 2) histogram['+2']++;
      else if (extra === 3) histogram['+3']++;
      else if (extra === 4) histogram['+4']++;
      else histogram['+5+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Flagle (guesses 1-6, X)
  const getFlagleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'flagle');
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

  // Get histogram data for Kinda Hard Golf (strokes)
  const getKindahardgolfHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'kindahardgolf');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };

    gameResults.forEach(r => {
      const strokes = r.scoreValue || 0;
      if (strokes === 1) histogram[1]++;
      else if (strokes === 2) histogram[2]++;
      else if (strokes === 3) histogram[3]++;
      else if (strokes === 4) histogram[4]++;
      else if (strokes === 5) histogram[5]++;
      else histogram['6+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for enclose.horse (percentage buckets)
  const getEnclosehorseHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'enclosehorse');
    const histogram = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-99': 0, '100': 0 };

    gameResults.forEach(r => {
      const pct = r.scoreValue || 0;
      if (pct === 100) histogram['100']++;
      else if (pct >= 81) histogram['81-99']++;
      else if (pct >= 61) histogram['61-80']++;
      else if (pct >= 41) histogram['41-60']++;
      else if (pct >= 21) histogram['21-40']++;
      else histogram['0-20']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Kickoff League (kicks)
  const getKickoffleagueHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'kickoffleague');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };

    gameResults.forEach(r => {
      const kicks = r.scoreValue || 0;
      if (kicks === 1) histogram[1]++;
      else if (kicks === 2) histogram[2]++;
      else if (kicks === 3) histogram[3]++;
      else if (kicks === 4) histogram[4]++;
      else if (kicks === 5) histogram[5]++;
      else histogram['6+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Scrandle (score out of 10)
  const getScrandleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'scrandle');
    const histogram = {};
    for (let i = 0; i <= 10; i++) histogram[i] = 0;

    gameResults.forEach(r => {
      const score = Math.min(10, Math.max(0, r.scoreValue || 0));
      histogram[Math.round(score)]++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for One Up Puzzle (time buckets)
  const getOneuppuzzleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'oneuppuzzle');
    const histogram = { '<1m': 0, '1-2m': 0, '2-5m': 0, '5-10m': 0, '10m+': 0 };

    gameResults.forEach(r => {
      const seconds = r.scoreValue || 0;
      if (seconds < 60) histogram['<1m']++;
      else if (seconds < 120) histogram['1-2m']++;
      else if (seconds < 300) histogram['2-5m']++;
      else if (seconds < 600) histogram['5-10m']++;
      else histogram['10m+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Clues By Sam (time buckets)
  const getCluesbysamHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'cluesbysam');
    const histogram = { '<1m': 0, '1-2m': 0, '2-5m': 0, '5-10m': 0, '10m+': 0 };

    gameResults.forEach(r => {
      const seconds = r.scoreValue || 0;
      if (seconds < 60) histogram['<1m']++;
      else if (seconds < 120) histogram['1-2m']++;
      else if (seconds < 300) histogram['2-5m']++;
      else if (seconds < 600) histogram['5-10m']++;
      else histogram['10m+']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Minute Cryptic (score vs par)
  const getMinutecrypticHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'minutecryptic');
    const histogram = { '≤-2': 0, '-1': 0, '0': 0, '+1': 0, '+2': 0, '≥+3': 0 };

    gameResults.forEach(r => {
      const score = r.scoreValue || 0;
      // Assuming par is typically around 2, so score-2 gives diff
      // But since we just have score, we'll bucket by score directly
      if (score <= 0) histogram['≤-2']++;
      else if (score === 1) histogram['-1']++;
      else if (score === 2) histogram['0']++;
      else if (score === 3) histogram['+1']++;
      else if (score === 4) histogram['+2']++;
      else histogram['≥+3']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Daily Dozen (score out of 12)
  const getDailydozenHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'dailydozen');
    const histogram = { '0-3': 0, '4-6': 0, '7-9': 0, '10-11': 0, '12': 0 };

    gameResults.forEach(r => {
      const score = r.scoreValue || 0;
      if (score === 12) histogram['12']++;
      else if (score >= 10) histogram['10-11']++;
      else if (score >= 7) histogram['7-9']++;
      else if (score >= 4) histogram['4-6']++;
      else histogram['0-3']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for More Or Less (streak ranges)
  const getMoreorlessHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'moreorless');
    const histogram = { '1-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21+': 0 };

    gameResults.forEach(r => {
      const streak = r.scoreValue || 0;
      if (streak >= 21) histogram['21+']++;
      else if (streak >= 16) histogram['16-20']++;
      else if (streak >= 11) histogram['11-15']++;
      else if (streak >= 6) histogram['6-10']++;
      else histogram['1-5']++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Eruptle (score out of 10)
  const getEruptleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'eruptle');
    const histogram = {};
    for (let i = 0; i <= 10; i++) histogram[i] = 0;

    gameResults.forEach(r => {
      const score = Math.min(10, Math.max(0, r.scoreValue || 0));
      histogram[Math.round(score)]++;
    });

    return histogram;
  }, [results]);

  // Get histogram data for Thrice (points 0-15)
  const getThriceHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'thrice');
    const histogram = { '0-3': 0, '4-6': 0, '7-9': 0, '10-12': 0, '13-15': 0 };

    gameResults.forEach(r => {
      const points = r.scoreValue || 0;
      if (points >= 13) histogram['13-15']++;
      else if (points >= 10) histogram['10-12']++;
      else if (points >= 7) histogram['7-9']++;
      else if (points >= 4) histogram['4-6']++;
      else histogram['0-3']++;
    });

    return histogram;
  }, [results]);

  // Get all histogram data at once
  const getAllHistograms = useCallback(() => {
    return {
      wordle: getWordleHistogram(),
      connections: getConnectionsHistogram(),
      strands: getStrandsHistogram(),
      mini: getMiniHistogram(),
      latimesmini: getLatimesMiniHistogram(),
      bandle: getBandleHistogram(),
      catfishing: getCatfishingHistogram(),
      timeguessr: getTimeguessrHistogram(),
      travle: getTravleHistogram(),
      flagle: getFlagleHistogram(),
      kindahardgolf: getKindahardgolfHistogram(),
      enclosehorse: getEnclosehorseHistogram(),
      kickoffleague: getKickoffleagueHistogram(),
      scrandle: getScrandleHistogram(),
      oneuppuzzle: getOneuppuzzleHistogram(),
      cluesbysam: getCluesbysamHistogram(),
      minutecryptic: getMinutecrypticHistogram(),
      dailydozen: getDailydozenHistogram(),
      moreorless: getMoreorlessHistogram(),
      eruptle: getEruptleHistogram(),
      thrice: getThriceHistogram(),
    };
  }, [
    getWordleHistogram, getConnectionsHistogram, getStrandsHistogram, getMiniHistogram,
    getLatimesMiniHistogram, getBandleHistogram, getCatfishingHistogram, getTimeguessrHistogram,
    getTravleHistogram, getFlagleHistogram, getKindahardgolfHistogram, getEnclosehorseHistogram,
    getKickoffleagueHistogram, getScrandleHistogram, getOneuppuzzleHistogram, getCluesbysamHistogram,
    getMinutecrypticHistogram, getDailydozenHistogram, getMoreorlessHistogram, getEruptleHistogram,
    getThriceHistogram
  ]);

  // Get all games that have at least one result (for showing histograms)
  const getGamesWithResults = useCallback(() => {
    const gameIds = new Set(results.map(r => r.gameId));
    return Array.from(gameIds);
  }, [results]);

  // Clear all results (for testing/reset)
  const clearAll = useCallback(() => {
    setResults([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

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
