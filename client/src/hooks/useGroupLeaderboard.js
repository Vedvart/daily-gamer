// useGroupLeaderboard Hook
// Computes leaderboard rankings for a group

import { useState, useEffect, useMemo } from 'react';
import useGameResults from './useGameResults';
import {
  calculateDailyRankings,
  calculateHistoricalRankings,
  calculateCombinedRankings
} from '../utils/leaderboardCalculations';

/**
 * Hook to get daily leaderboard for a specific game
 */
export function useDailyLeaderboard(members, gameId) {
  const [rankings, setRankings] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  // We need to load results for each member
  // This is a simplified approach - in production, this would be batched
  useEffect(() => {
    const loadRankings = () => {
      const memberResults = members.map(member => {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        let result = null;

        if (stored) {
          try {
            const data = JSON.parse(stored);
            result = data.results?.find(r => r.gameId === gameId && r.date === today) || null;
          } catch (e) {
            console.error('Failed to parse results:', e);
          }
        }

        return { userId: member.userId, result };
      });

      const calculated = calculateDailyRankings(gameId, memberResults);
      setRankings(calculated);
    };

    if (members.length > 0 && gameId) {
      loadRankings();
    } else {
      setRankings([]);
    }
  }, [members, gameId, today]);

  return rankings;
}

/**
 * Hook to get historical leaderboard for a specific game
 */
export function useHistoricalLeaderboard(members, gameId) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const loadRankings = () => {
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

      const calculated = calculateHistoricalRankings(gameId, memberResults);
      setRankings(calculated);
    };

    if (members.length > 0 && gameId) {
      loadRankings();
    } else {
      setRankings([]);
    }
  }, [members, gameId]);

  return rankings;
}

/**
 * Hook to get combined daily rankings across all enabled games
 */
export function useCombinedDailyLeaderboard(members, enabledGames) {
  const [rankings, setRankings] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadRankings = () => {
      // First, get all results for all members
      const memberResultsMap = {};

      for (const member of members) {
        const key = `dailygamer_results_${member.userId}`;
        const stored = localStorage.getItem(key);
        memberResultsMap[member.userId] = [];

        if (stored) {
          try {
            const data = JSON.parse(stored);
            memberResultsMap[member.userId] = data.results?.filter(r => r.date === today) || [];
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

      // Calculate combined rankings
      const combined = calculateCombinedRankings(gameRankings);
      setRankings(combined);
    };

    if (members.length > 0 && enabledGames.length > 0) {
      loadRankings();
    } else {
      setRankings([]);
    }
  }, [members, enabledGames, today]);

  return rankings;
}

/**
 * Hook to get combined historical rankings across all enabled games
 */
export function useCombinedHistoricalLeaderboard(members, enabledGames) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    const loadRankings = () => {
      // First, get all results for all members
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

      // Calculate combined rankings
      const combined = calculateCombinedRankings(gameRankings);
      setRankings(combined);
    };

    if (members.length > 0 && enabledGames.length > 0) {
      loadRankings();
    } else {
      setRankings([]);
    }
  }, [members, enabledGames]);

  return rankings;
}

export default {
  useDailyLeaderboard,
  useHistoricalLeaderboard,
  useCombinedDailyLeaderboard,
  useCombinedHistoricalLeaderboard
};
