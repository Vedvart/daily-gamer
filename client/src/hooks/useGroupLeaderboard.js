// useGroupLeaderboard Hook
// Computes leaderboard rankings for a group

import { useState, useEffect } from 'react';
import { resultsApi } from '../utils/api';
import {
  calculateDailyRankings,
  calculateHistoricalRankings,
  calculateCombinedRankings
} from '../utils/leaderboardCalculations';

/**
 * Hook to get daily leaderboard for a specific game
 */
export function useDailyLeaderboard(members, gameId, useApi = false) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isMounted = true;

    const loadRankings = async () => {
      if (!members.length || !gameId) {
        if (isMounted) {
          setRankings([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      // Try API first if enabled
      if (useApi) {
        try {
          const userIds = members.map(m => m.userId);
          const apiResults = await resultsApi.getLeaderboard(gameId, today, userIds);

          if (!isMounted) return;

          if (apiResults) {
            // Transform API results to expected format
            const memberResults = members.map(member => {
              const result = apiResults.find(r => r.userId === member.userId) || null;
              // Normalize result properties
              if (result) {
                return {
                  userId: member.userId,
                  result: {
                    ...result,
                    score: result.score || result.scoreDisplay,
                    won: result.won !== undefined ? result.won : !result.isFailed,
                    date: result.date || result.playDate,
                  }
                };
              }
              return { userId: member.userId, result: null };
            });

            const calculated = calculateDailyRankings(gameId, memberResults);
            setRankings(calculated);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          if (!isMounted) return;
          console.log('API leaderboard not available, falling back to localStorage:', e.message);
        }
      }

      // Fall back to localStorage
      const memberResults = members.map(member => {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        let result = null;

        if (stored) {
          try {
            const data = JSON.parse(stored);
            result = data.results?.find(r =>
              r.gameId === gameId && (r.date === today || r.playDate === today)
            ) || null;
          } catch (e) {
            console.error('Failed to parse results:', e);
          }
        }

        return { userId: member.userId, result };
      });

      if (isMounted) {
        const calculated = calculateDailyRankings(gameId, memberResults);
        setRankings(calculated);
        setIsLoading(false);
      }
    };

    loadRankings();

    return () => {
      isMounted = false;
    };
  }, [members, gameId, today, useApi]);

  return { rankings, isLoading };
}

/**
 * Hook to get historical leaderboard for a specific game
 */
export function useHistoricalLeaderboard(members, gameId, useApi = false) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRankings = async () => {
      if (!members.length || !gameId) {
        if (isMounted) {
          setRankings([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      // Try API first if enabled
      if (useApi) {
        try {
          const userIds = members.map(m => m.userId);
          const apiResults = await resultsApi.getHistoricalLeaderboard(gameId, userIds, 50);

          if (!isMounted) return;

          if (apiResults) {
            // API already returns aggregated historical data
            const calculated = apiResults.map((r, index) => ({
              rank: index + 1,
              userId: r.userId,
              averageScore: r.averageScore,
              gamesPlayed: r.gamesPlayed,
              bestScore: r.bestScore,
              formattedScore: formatHistoricalScore(gameId, r.averageScore, r.gamesPlayed),
            }));

            setRankings(calculated);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          if (!isMounted) return;
          console.log('API historical leaderboard not available, falling back to localStorage:', e.message);
        }
      }

      // Fall back to localStorage
      const memberResults = members.map(member => {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        let results = [];

        if (stored) {
          try {
            const data = JSON.parse(stored);
            results = data.results?.filter(r => r.gameId === gameId) || [];
          } catch (e) {
            console.error('Failed to parse results:', e);
          }
        }

        return { userId: member.userId, results };
      });

      if (isMounted) {
        const calculated = calculateHistoricalRankings(gameId, memberResults);
        setRankings(calculated);
        setIsLoading(false);
      }
    };

    loadRankings();

    return () => {
      isMounted = false;
    };
  }, [members, gameId, useApi]);

  return { rankings, isLoading };
}

/**
 * Hook to get combined daily rankings across all enabled games
 */
export function useCombinedDailyLeaderboard(members, enabledGames, useApi = false) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isMounted = true;

    const loadRankings = async () => {
      if (!members.length || !enabledGames.length) {
        if (isMounted) {
          setRankings([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      // Try API first if enabled
      if (useApi) {
        try {
          const userIds = members.map(m => m.userId);

          // Fetch results for all games in parallel
          const gameResultsPromises = enabledGames.map(gameId =>
            resultsApi.getLeaderboard(gameId, today, userIds)
              .then(results => ({ gameId, results: results || [] }))
              .catch(() => ({ gameId, results: [] }))
          );

          const allGameResults = await Promise.all(gameResultsPromises);

          if (!isMounted) return;

          // Calculate rankings for each game
          const gameRankings = allGameResults.map(({ gameId, results }) => {
            const memberResults = members.map(member => {
              const result = results.find(r => r.userId === member.userId) || null;
              if (result) {
                return {
                  userId: member.userId,
                  result: {
                    ...result,
                    score: result.score || result.scoreDisplay,
                    won: result.won !== undefined ? result.won : !result.isFailed,
                    date: result.date || result.playDate,
                  }
                };
              }
              return { userId: member.userId, result: null };
            });

            return {
              gameId,
              rankings: calculateDailyRankings(gameId, memberResults)
            };
          });

          const combined = calculateCombinedRankings(gameRankings);
          setRankings(combined);
          setIsLoading(false);
          return;
        } catch (e) {
          if (!isMounted) return;
          console.log('API combined leaderboard not available, falling back to localStorage:', e.message);
        }
      }

      // Fall back to localStorage
      const memberResultsMap = {};

      for (const member of members) {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        memberResultsMap[member.userId] = [];

        if (stored) {
          try {
            const data = JSON.parse(stored);
            memberResultsMap[member.userId] = data.results?.filter(r =>
              r.date === today || r.playDate === today
            ) || [];
          } catch (e) {
            console.error('Failed to parse results:', e);
          }
        }
      }

      // Calculate rankings for each game
      const gameRankings = enabledGames.map(gameId => {
        const memberResults = members.map(member => {
          const result = memberResultsMap[member.userId].find(r => r.gameId === gameId) || null;
          return { userId: member.userId, result };
        });

        return {
          gameId,
          rankings: calculateDailyRankings(gameId, memberResults)
        };
      });

      if (isMounted) {
        const combined = calculateCombinedRankings(gameRankings);
        setRankings(combined);
        setIsLoading(false);
      }
    };

    loadRankings();

    return () => {
      isMounted = false;
    };
  }, [members, enabledGames, today, useApi]);

  return { rankings, isLoading };
}

/**
 * Hook to get combined historical rankings across all enabled games
 */
export function useCombinedHistoricalLeaderboard(members, enabledGames, useApi = false) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRankings = async () => {
      if (!members.length || !enabledGames.length) {
        if (isMounted) {
          setRankings([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      // Try API first if enabled
      if (useApi) {
        try {
          const userIds = members.map(m => m.userId);

          // Fetch historical results for all games in parallel
          const gameResultsPromises = enabledGames.map(gameId =>
            resultsApi.getHistoricalLeaderboard(gameId, userIds, 50)
              .then(results => ({ gameId, results: results || [] }))
              .catch(() => ({ gameId, results: [] }))
          );

          const allGameResults = await Promise.all(gameResultsPromises);

          if (!isMounted) return;

          // Calculate rankings for each game
          const gameRankings = allGameResults.map(({ gameId, results }) => {
            // Convert API historical format to expected rankings format
            const rankings = results.map((r, index) => ({
              rank: index + 1,
              userId: r.userId,
              averageScore: r.averageScore,
              gamesPlayed: r.gamesPlayed,
              score: r.averageScore,
            }));

            return { gameId, rankings };
          });

          const combined = calculateCombinedRankings(gameRankings);
          setRankings(combined);
          setIsLoading(false);
          return;
        } catch (e) {
          if (!isMounted) return;
          console.log('API combined historical leaderboard not available, falling back to localStorage:', e.message);
        }
      }

      // Fall back to localStorage
      const memberResultsMap = {};

      for (const member of members) {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        memberResultsMap[member.userId] = [];

        if (stored) {
          try {
            const data = JSON.parse(stored);
            memberResultsMap[member.userId] = data.results || [];
          } catch (e) {
            console.error('Failed to parse results:', e);
          }
        }
      }

      // Calculate rankings for each game
      const gameRankings = enabledGames.map(gameId => {
        const memberResults = members.map(member => {
          const results = memberResultsMap[member.userId].filter(r => r.gameId === gameId);
          return { userId: member.userId, results };
        });

        return {
          gameId,
          rankings: calculateHistoricalRankings(gameId, memberResults)
        };
      });

      if (isMounted) {
        const combined = calculateCombinedRankings(gameRankings);
        setRankings(combined);
        setIsLoading(false);
      }
    };

    loadRankings();

    return () => {
      isMounted = false;
    };
  }, [members, enabledGames, useApi]);

  return { rankings, isLoading };
}

// Helper function to format historical scores for display
function formatHistoricalScore(gameId, averageScore, gamesPlayed) {
  if (!averageScore && averageScore !== 0) return '-';

  const avg = parseFloat(averageScore);

  // Games where lower is better
  if (['wordle', 'bandle', 'flagle', 'mini', 'latimesmini', 'travle', 'kindahardgolf', 'kickoffleague'].includes(gameId)) {
    return `${avg.toFixed(1)} avg (${gamesPlayed} games)`;
  }

  // Games where higher is better
  return `${avg.toFixed(1)} avg (${gamesPlayed} games)`;
}

export default {
  useDailyLeaderboard,
  useHistoricalLeaderboard,
  useCombinedDailyLeaderboard,
  useCombinedHistoricalLeaderboard
};
