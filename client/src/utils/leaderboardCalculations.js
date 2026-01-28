// Leaderboard Calculations
// Scoring logic for ranking players across different games

/**
 * Game scoring configurations
 * - sortOrder: 'asc' means lower is better, 'desc' means higher is better
 * - getScore: extracts the comparable score from a result
 * - formatScore: formats the score for display
 */
const gameConfigs = {
  wordle: {
    sortOrder: 'asc',
    getScore: (r) => r.won ? r.scoreValue : 7,
    formatScore: (r) => r.score,
    bestPossible: 1
  },
  connections: {
    sortOrder: 'custom', // Custom sorting for achievements
    getScore: (r) => {
      if (!r.won) return 100; // Failed
      if (r.isReversePerfect) return -2; // Best
      if (r.isPurpleFirst) return -1; // Second best
      return r.mistakes || (4 - r.scoreValue); // 0-3 mistakes
    },
    formatScore: (r) => {
      if (!r.won) return 'X';
      if (r.isReversePerfect) return 'RP';
      if (r.isPurpleFirst) return 'PF';
      const mistakes = r.mistakes || (4 - r.scoreValue);
      return mistakes === 0 ? 'Perfect' : `${mistakes} mistake${mistakes !== 1 ? 's' : ''}`;
    },
    bestPossible: 'RP'
  },
  strands: {
    sortOrder: 'asc',
    getScore: (r) => r.scoreValue || 0,
    formatScore: (r) => `${r.scoreValue || 0} hint${(r.scoreValue || 0) !== 1 ? 's' : ''}`,
    bestPossible: 0
  },
  mini: {
    sortOrder: 'asc', // Lower time is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: null
  },
  latimesmini: {
    sortOrder: 'asc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: null
  },
  bandle: {
    sortOrder: 'asc',
    getScore: (r) => r.won ? r.scoreValue : 7,
    formatScore: (r) => r.score,
    bestPossible: 1
  },
  catfishing: {
    sortOrder: 'desc', // Higher score is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: 10
  },
  timeguessr: {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.scoreValue.toLocaleString(),
    bestPossible: 50000
  },
  travle: {
    sortOrder: 'asc', // Fewer extra guesses is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `+${r.scoreValue}`,
    bestPossible: 0
  },
  flagle: {
    sortOrder: 'asc',
    getScore: (r) => r.won ? r.scoreValue : 7,
    formatScore: (r) => r.score,
    bestPossible: 1
  },
  kindahardgolf: {
    sortOrder: 'asc', // Fewer strokes is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `${r.scoreValue} stroke${r.scoreValue !== 1 ? 's' : ''}`,
    bestPossible: 1
  },
  enclosehorse: {
    sortOrder: 'desc', // Higher percentage is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `${r.scoreValue}%`,
    bestPossible: 100
  },
  kickoffleague: {
    sortOrder: 'asc', // Fewer kicks is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `${r.scoreValue} kick${r.scoreValue !== 1 ? 's' : ''}`,
    bestPossible: 1
  },
  scrandle: {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: 10
  },
  oneuppuzzle: {
    sortOrder: 'asc', // Faster time is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: null
  },
  cluesbysam: {
    sortOrder: 'asc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: null
  },
  minutecryptic: {
    sortOrder: 'asc', // Lower score is better (vs par)
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: null
  },
  dailydozen: {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: 12
  },
  moreorless: {
    sortOrder: 'desc', // Higher streak is better
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `${r.scoreValue} streak`,
    bestPossible: null
  },
  eruptle: {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => r.score,
    bestPossible: 10
  },
  thrice: {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue,
    formatScore: (r) => `${r.scoreValue} pts`,
    bestPossible: 15
  }
};

/**
 * Get game configuration
 */
export function getGameConfig(gameId) {
  return gameConfigs[gameId] || {
    sortOrder: 'desc',
    getScore: (r) => r.scoreValue || 0,
    formatScore: (r) => r.score || String(r.scoreValue || 0),
    bestPossible: null
  };
}

/**
 * Compare two scores for a game
 * Returns negative if a is better, positive if b is better, 0 if equal
 */
export function compareScores(gameId, scoreA, scoreB) {
  const config = getGameConfig(gameId);

  if (config.sortOrder === 'asc') {
    return scoreA - scoreB;
  } else {
    return scoreB - scoreA;
  }
}

/**
 * Calculate daily leaderboard rankings for a specific game
 * @param {string} gameId - The game ID
 * @param {Array} memberResults - Array of { userId, result } objects
 * @returns {Array} Sorted rankings with rank, userId, result, score
 */
export function calculateDailyRankings(gameId, memberResults) {
  const config = getGameConfig(gameId);

  // Filter to only members who have a result
  const withResults = memberResults.filter(mr => mr.result !== null);

  if (withResults.length === 0) {
    return [];
  }

  // Calculate scores and sort
  const scored = withResults.map(mr => ({
    userId: mr.userId,
    result: mr.result,
    score: config.getScore(mr.result),
    formattedScore: config.formatScore(mr.result)
  }));

  // Sort based on game config
  scored.sort((a, b) => compareScores(gameId, a.score, b.score));

  // Assign ranks (handle ties)
  let currentRank = 1;
  let previousScore = null;

  return scored.map((entry, index) => {
    if (previousScore !== null && entry.score !== previousScore) {
      currentRank = index + 1;
    }
    previousScore = entry.score;

    return {
      ...entry,
      rank: currentRank
    };
  });
}

/**
 * Calculate historical/all-time leaderboard rankings
 * @param {string} gameId - The game ID
 * @param {Array} memberResults - Array of { userId, results } objects (results is array)
 * @returns {Array} Sorted rankings with aggregate stats
 */
export function calculateHistoricalRankings(gameId, memberResults) {
  const config = getGameConfig(gameId);

  // Filter to only members who have played this game
  const withResults = memberResults.filter(mr => mr.results && mr.results.length > 0);

  if (withResults.length === 0) {
    return [];
  }

  // Calculate aggregate stats
  const aggregated = withResults.map(mr => {
    const scores = mr.results.map(r => config.getScore(r));
    const total = scores.reduce((sum, s) => sum + s, 0);
    const average = total / scores.length;
    const best = config.sortOrder === 'asc'
      ? Math.min(...scores)
      : Math.max(...scores);

    // Find win count for games with win/lose
    const wins = mr.results.filter(r => r.won !== undefined ? r.won : true).length;

    return {
      userId: mr.userId,
      gamesPlayed: mr.results.length,
      wins,
      averageScore: average,
      bestScore: best,
      formattedAverage: average.toFixed(1),
      formattedBest: config.formatScore({ ...mr.results[0], scoreValue: best, score: String(best) })
    };
  });

  // Sort by average score
  aggregated.sort((a, b) => compareScores(gameId, a.averageScore, b.averageScore));

  // Assign ranks
  let currentRank = 1;
  let previousScore = null;

  return aggregated.map((entry, index) => {
    if (previousScore !== null && Math.abs(entry.averageScore - previousScore) > 0.01) {
      currentRank = index + 1;
    }
    previousScore = entry.averageScore;

    return {
      ...entry,
      rank: currentRank
    };
  });
}

/**
 * Calculate overall points across multiple games (for combined leaderboards)
 * @param {Array} gameRankings - Array of { gameId, rankings } objects
 * @returns {Array} Combined rankings with total points
 */
export function calculateCombinedRankings(gameRankings) {
  const pointsByUser = {};

  // Award points: 1st = 10pts, 2nd = 7pts, 3rd = 5pts, 4th = 3pts, 5th = 2pts, 6th+ = 1pt
  const rankPoints = [10, 7, 5, 3, 2, 1];

  for (const { gameId, rankings } of gameRankings) {
    for (const entry of rankings) {
      if (!pointsByUser[entry.userId]) {
        pointsByUser[entry.userId] = {
          userId: entry.userId,
          totalPoints: 0,
          gamesPlayed: 0,
          firstPlaces: 0
        };
      }

      const points = entry.rank <= 6 ? rankPoints[entry.rank - 1] : 1;
      pointsByUser[entry.userId].totalPoints += points;
      pointsByUser[entry.userId].gamesPlayed += 1;

      if (entry.rank === 1) {
        pointsByUser[entry.userId].firstPlaces += 1;
      }
    }
  }

  // Convert to array and sort
  const sorted = Object.values(pointsByUser).sort((a, b) => {
    // First by total points (desc)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // Then by first places (desc)
    if (b.firstPlaces !== a.firstPlaces) {
      return b.firstPlaces - a.firstPlaces;
    }
    // Then by games played (desc)
    return b.gamesPlayed - a.gamesPlayed;
  });

  // Assign ranks
  let currentRank = 1;
  let previousPoints = null;

  return sorted.map((entry, index) => {
    if (previousPoints !== null && entry.totalPoints !== previousPoints) {
      currentRank = index + 1;
    }
    previousPoints = entry.totalPoints;

    return {
      ...entry,
      rank: currentRank
    };
  });
}

export default {
  getGameConfig,
  compareScores,
  calculateDailyRankings,
  calculateHistoricalRankings,
  calculateCombinedRankings
};
