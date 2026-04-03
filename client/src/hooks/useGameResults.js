import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dailygamer_results';

function extractGridFromRawText(rawText, gameId) {
  if (!rawText) return null;
  const lines = rawText.split('\n');

  if (gameId === 'wordle' || gameId === 'bandle') {
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🟩🟨⬛⬜🟧🎸🎹🎺🎷🪘🎻\s]+$/.test(trimmed);
    });
    return gridLines.length > 0 ? gridLines.join('\n') : null;
  }
  if (gameId === 'connections') {
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🟨🟩🟦🟪\s]+$/.test(trimmed);
    });
    return gridLines.length > 0 ? gridLines.join('\n') : null;
  }
  if (gameId === 'strands') {
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🔵🟡💡\s]+$/.test(trimmed);
    });
    return gridLines.length > 0 ? gridLines.join('\n') : null;
  }
  if (gameId === 'catfishing') {
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🐈🐟⬜\s]+$/.test(trimmed);
    });
    return gridLines.length > 0 ? gridLines.join('\n') : null;
  }
  const gridLines = lines.filter(line => {
    const trimmed = line.trim();
    const emojiCount = (trimmed.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    return emojiCount >= 2;
  });
  return gridLines.length > 0 ? gridLines.join('\n') : null;
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.results || [];
    }
  } catch (e) {
    console.error('Failed to load results from localStorage:', e);
  }
  return [];
}

function useGameResults() {
  const [results, setResults] = useState(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ results }));
    } catch (e) {
      console.error('Failed to save results to localStorage:', e);
    }
  }, [results]);

  const getToday = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const todayResults = results.filter(r => {
    const resultDate = r.playDate || r.date;
    return resultDate === getToday();
  });

  const addResult = useCallback((result) => {
    setResults(prev => {
      const existingIndex = prev.findIndex(
        r => r.gameId === result.gameId && r.puzzleNumber === result.puzzleNumber
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      }
      return [...prev, result];
    });
  }, []);

  const removeResult = useCallback((id) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const getStats = useCallback((gameId) => {
    const gameResults = results.filter(r => r.gameId === gameId);
    if (gameResults.length === 0) {
      return { totalPlayed: 0, wins: 0, averageScore: null, bestScore: null, currentStreak: 0, longestStreak: 0 };
    }
    const wins = gameResults.filter(r => r.won || !r.isFailed).length;
    const isTimeBased = gameId === 'mini' || gameId === 'latimesmini';
    const scores = gameResults.map(r => r.scoreValue).filter(s => s != null);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    let bestScore = null;
    if (scores.length > 0) {
      bestScore = isTimeBased ? Math.min(...scores) : Math.max(...scores);
    }
    const sortedResults = [...gameResults].sort((a, b) =>
      new Date(b.playDate || b.date) - new Date(a.playDate || a.date)
    );
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    for (const result of sortedResults) {
      const isWin = result.won || !result.isFailed;
      if (isWin) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0) currentStreak = tempStreak;
        tempStreak = 0;
      }
    }
    return { totalPlayed: gameResults.length, wins, averageScore, bestScore, currentStreak, longestStreak };
  }, [results]);

  const getResultForDate = useCallback((gameId, date) => {
    return results.find(r => r.gameId === gameId && (r.playDate === date || r.date === date));
  }, [results]);

  const clearAll = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ============ HISTOGRAM FUNCTIONS ============

  const getWordleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'wordle');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
    gameResults.forEach(r => {
      if (r.won && r.scoreValue >= 1 && r.scoreValue <= 6) histogram[r.scoreValue]++;
      else histogram['X']++;
    });
    return histogram;
  }, [results]);

  const getConnectionsHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'connections');
    const histogram = { 'RP': 0, 'PF': 0, 0: 0, 1: 0, 2: 0, 3: 0, 'X': 0 };
    gameResults.forEach(r => {
      const achievement = r.achievement || (r.isReversePerfect ? 'reverse_perfect' : r.isPurpleFirst ? 'purple_first' : null);
      if (!r.won) {
        histogram['X']++;
      } else if (achievement === 'reverse_perfect' || r.isReversePerfect) {
        histogram['RP']++;
      } else if (achievement === 'purple_first' || r.isPurpleFirst) {
        histogram['PF']++;
      } else {
        const mistakes = 4 - r.scoreValue;
        if (mistakes >= 0 && mistakes <= 3) histogram[mistakes]++;
        else histogram[0]++;
      }
    });
    return histogram;
  }, [results]);

  const getMiniHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'mini');
    const histogram = { '<30s': 0, '30-60s': 0, '1-2m': 0, '2-3m': 0, '3m+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue;
      if (s < 30) histogram['<30s']++;
      else if (s < 60) histogram['30-60s']++;
      else if (s < 120) histogram['1-2m']++;
      else if (s < 180) histogram['2-3m']++;
      else histogram['3m+']++;
    });
    return histogram;
  }, [results]);

  const getBandleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'bandle');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
    gameResults.forEach(r => {
      if (r.won && r.scoreValue >= 1 && r.scoreValue <= 6) histogram[r.scoreValue]++;
      else histogram['X']++;
    });
    return histogram;
  }, [results]);

  const getCatfishingHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'catfishing');
    const histogram = {};
    for (let i = 0; i <= 20; i++) histogram[i / 2] = 0;
    gameResults.forEach(r => {
      const bucket = Math.round(r.scoreValue * 2) / 2;
      if (bucket >= 0 && bucket <= 10) histogram[bucket]++;
    });
    return histogram;
  }, [results]);

  const getTimeguessrHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'timeguessr');
    const histogram = {
      '0-5k': 0, '5-10k': 0, '10-15k': 0, '15-20k': 0, '20-25k': 0,
      '25-30k': 0, '30-35k': 0, '35-40k': 0, '40-45k': 0, '45-50k': 0,
    };
    gameResults.forEach(r => {
      const s = r.scoreValue;
      if (s < 5000) histogram['0-5k']++;
      else if (s < 10000) histogram['5-10k']++;
      else if (s < 15000) histogram['10-15k']++;
      else if (s < 20000) histogram['15-20k']++;
      else if (s < 25000) histogram['20-25k']++;
      else if (s < 30000) histogram['25-30k']++;
      else if (s < 35000) histogram['30-35k']++;
      else if (s < 40000) histogram['35-40k']++;
      else if (s < 45000) histogram['40-45k']++;
      else histogram['45-50k']++;
    });
    return histogram;
  }, [results]);

  const getStrandsHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'strands');
    const histogram = { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 };
    gameResults.forEach(r => {
      const h = r.scoreValue || 0;
      if (h <= 3) histogram[h]++;
      else histogram['4+']++;
    });
    return histogram;
  }, [results]);

  const getLatimesMiniHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'latimesmini');
    const histogram = { '<30s': 0, '30-60s': 0, '1-2m': 0, '2-3m': 0, '3m+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue;
      if (s < 30) histogram['<30s']++;
      else if (s < 60) histogram['30-60s']++;
      else if (s < 120) histogram['1-2m']++;
      else if (s < 180) histogram['2-3m']++;
      else histogram['3m+']++;
    });
    return histogram;
  }, [results]);

  const getTravleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'travle');
    const histogram = { '+0': 0, '+1': 0, '+2': 0, '+3': 0, '+4': 0, '+5+': 0 };
    gameResults.forEach(r => {
      const e = r.scoreValue || 0;
      if (e === 0) histogram['+0']++;
      else if (e === 1) histogram['+1']++;
      else if (e === 2) histogram['+2']++;
      else if (e === 3) histogram['+3']++;
      else if (e === 4) histogram['+4']++;
      else histogram['+5+']++;
    });
    return histogram;
  }, [results]);

  const getFlagleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'flagle');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
    gameResults.forEach(r => {
      if (r.won && r.scoreValue >= 1 && r.scoreValue <= 6) histogram[r.scoreValue]++;
      else histogram['X']++;
    });
    return histogram;
  }, [results]);

  const getKindahardgolfHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'kindahardgolf');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s >= 1 && s <= 5) histogram[s]++;
      else histogram['6+']++;
    });
    return histogram;
  }, [results]);

  const getEnclosehorseHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'enclosehorse');
    const histogram = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-99': 0, '100': 0 };
    gameResults.forEach(r => {
      const p = r.scoreValue || 0;
      if (p === 100) histogram['100']++;
      else if (p >= 81) histogram['81-99']++;
      else if (p >= 61) histogram['61-80']++;
      else if (p >= 41) histogram['41-60']++;
      else if (p >= 21) histogram['21-40']++;
      else histogram['0-20']++;
    });
    return histogram;
  }, [results]);

  const getKickoffleagueHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'kickoffleague');
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };
    gameResults.forEach(r => {
      const k = r.scoreValue || 0;
      if (k >= 1 && k <= 5) histogram[k]++;
      else histogram['6+']++;
    });
    return histogram;
  }, [results]);

  const getScrandleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'scrandle');
    const histogram = {};
    for (let i = 0; i <= 10; i++) histogram[i] = 0;
    gameResults.forEach(r => {
      histogram[Math.round(Math.min(10, Math.max(0, r.scoreValue || 0)))]++;
    });
    return histogram;
  }, [results]);

  const getOneuppuzzleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'oneuppuzzle');
    const histogram = { '<1m': 0, '1-2m': 0, '2-5m': 0, '5-10m': 0, '10m+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s < 60) histogram['<1m']++;
      else if (s < 120) histogram['1-2m']++;
      else if (s < 300) histogram['2-5m']++;
      else if (s < 600) histogram['5-10m']++;
      else histogram['10m+']++;
    });
    return histogram;
  }, [results]);

  const getCluesbysamHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'cluesbysam');
    const histogram = { '<1m': 0, '1-2m': 0, '2-5m': 0, '5-10m': 0, '10m+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s < 60) histogram['<1m']++;
      else if (s < 120) histogram['1-2m']++;
      else if (s < 300) histogram['2-5m']++;
      else if (s < 600) histogram['5-10m']++;
      else histogram['10m+']++;
    });
    return histogram;
  }, [results]);

  const getMinutecrypticHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'minutecryptic');
    const histogram = { '≤-2': 0, '-1': 0, '0': 0, '+1': 0, '+2': 0, '≥+3': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s <= 0) histogram['≤-2']++;
      else if (s === 1) histogram['-1']++;
      else if (s === 2) histogram['0']++;
      else if (s === 3) histogram['+1']++;
      else if (s === 4) histogram['+2']++;
      else histogram['≥+3']++;
    });
    return histogram;
  }, [results]);

  const getDailydozenHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'dailydozen');
    const histogram = { '0-3': 0, '4-6': 0, '7-9': 0, '10-11': 0, '12': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s === 12) histogram['12']++;
      else if (s >= 10) histogram['10-11']++;
      else if (s >= 7) histogram['7-9']++;
      else if (s >= 4) histogram['4-6']++;
      else histogram['0-3']++;
    });
    return histogram;
  }, [results]);

  const getMoreorlessHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'moreorless');
    const histogram = { '1-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21+': 0 };
    gameResults.forEach(r => {
      const s = r.scoreValue || 0;
      if (s >= 21) histogram['21+']++;
      else if (s >= 16) histogram['16-20']++;
      else if (s >= 11) histogram['11-15']++;
      else if (s >= 6) histogram['6-10']++;
      else histogram['1-5']++;
    });
    return histogram;
  }, [results]);

  const getEruptleHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'eruptle');
    const histogram = {};
    for (let i = 0; i <= 10; i++) histogram[i] = 0;
    gameResults.forEach(r => {
      histogram[Math.round(Math.min(10, Math.max(0, r.scoreValue || 0)))]++;
    });
    return histogram;
  }, [results]);

  const getThriceHistogram = useCallback(() => {
    const gameResults = results.filter(r => r.gameId === 'thrice');
    const histogram = { '0-3': 0, '4-6': 0, '7-9': 0, '10-12': 0, '13-15': 0 };
    gameResults.forEach(r => {
      const p = r.scoreValue || 0;
      if (p >= 13) histogram['13-15']++;
      else if (p >= 10) histogram['10-12']++;
      else if (p >= 7) histogram['7-9']++;
      else if (p >= 4) histogram['4-6']++;
      else histogram['0-3']++;
    });
    return histogram;
  }, [results]);

  const getAllHistograms = useCallback(() => ({
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
  }), [
    getWordleHistogram, getConnectionsHistogram, getStrandsHistogram, getMiniHistogram,
    getLatimesMiniHistogram, getBandleHistogram, getCatfishingHistogram, getTimeguessrHistogram,
    getTravleHistogram, getFlagleHistogram, getKindahardgolfHistogram, getEnclosehorseHistogram,
    getKickoffleagueHistogram, getScrandleHistogram, getOneuppuzzleHistogram, getCluesbysamHistogram,
    getMinutecrypticHistogram, getDailydozenHistogram, getMoreorlessHistogram, getEruptleHistogram,
    getThriceHistogram,
  ]);

  const getGamesWithResults = useCallback(() => {
    return Array.from(new Set(results.map(r => r.gameId)));
  }, [results]);

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
