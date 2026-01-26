// Parser Registry
// Central hub for all game parsers

import wordleParser from './wordleParser';
import connectionsParser from './connectionsParser';
import miniParser from './miniParser';
import bandleParser from './bandleParser';
import catfishingParser from './catfishingParser';
import timeguessrParser from './timeguessrParser';

const parsers = [
  wordleParser,
  connectionsParser,
  miniParser,
  bandleParser,
  catfishingParser,
  timeguessrParser,
];

/**
 * Attempt to parse text as a game result
 * @param {string} text - The pasted text to parse
 * @returns {Object|null} - Parsed result object or null if no parser matched
 */
export function parseResult(text) {
  if (!text || typeof text !== 'string') return null;

  for (const parser of parsers) {
    if (parser.pattern.test(text)) {
      try {
        const result = parser.parse(text);
        if (result) return result;
      } catch (e) {
        console.error(`Parser ${parser.id} failed:`, e);
      }
    }
  }
  return null;
}

/**
 * Get a specific parser by game ID
 * @param {string} gameId - The game identifier
 * @returns {Object|undefined} - The parser object or undefined
 */
export function getParser(gameId) {
  return parsers.find(p => p.id === gameId);
}

/**
 * Get all registered parsers
 * @returns {Array} - Array of all parser objects
 */
export function getAllParsers() {
  return parsers;
}

/**
 * Get all supported game IDs
 * @returns {Array<string>} - Array of game IDs
 */
export function getSupportedGames() {
  return parsers.map(p => ({
    id: p.id,
    name: p.name,
  }));
}

export default parsers;
