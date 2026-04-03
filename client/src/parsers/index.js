// Parser Registry
// Central hub for all game parsers

import wordleParser from './wordleParser';
import connectionsParser from './connectionsParser';
import strandsParser from './strandsParser';
import miniParser from './miniParser';
import latimesMiniParser from './latimesMiniParser';
import bandleParser from './bandleParser';
import catfishingParser from './catfishingParser';
import timeguessrParser from './timeguessrParser';
import travleParser from './travleParser';
import flagleParser from './flagleParser';
import kindahardgolfParser from './kindahardgolfParser';
import enclosehorseParser from './enclosehorseParser';
import kickoffleagueParser from './kickoffleagueParser';
import scrandleParser from './scrandleParser';
import oneuppuzzleParser from './oneuppuzzleParser';
import cluesbysamParser from './cluesbysamParser';
import minutecrypticParser from './minutecrypticParser';
import dailydozenParser from './dailydozenParser';
import moreorlessParser from './moreorlessParser';
import eruptleParser from './eruptleParser';
import thriceParser from './thriceParser';

const parsers = [
  wordleParser,
  connectionsParser,
  strandsParser,
  miniParser,
  latimesMiniParser,
  bandleParser,
  catfishingParser,
  timeguessrParser,
  travleParser,
  flagleParser,
  kindahardgolfParser,
  enclosehorseParser,
  kickoffleagueParser,
  scrandleParser,
  oneuppuzzleParser,
  cluesbysamParser,
  minutecrypticParser,
  dailydozenParser,
  moreorlessParser,
  eruptleParser,
  thriceParser,
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

function toTitleCase(str) {
  return str
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Attempt to guess the game name from unrecognized paste text.
 * Heuristics (in order):
 *   1. If a URL is present, use the most descriptive hostname segment.
 *   2. Parse the first non-empty line: take leading words up to the first
 *      purely-numeric token, X/N score, or +N pattern.
 *   3. Fallback: first 30 characters of the first line.
 * @param {string} text
 * @returns {string}
 */
export function guessGameName(text) {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  // 1. URL → extract hostname
  const urlMatch = trimmed.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)/);
  if (urlMatch) {
    const host = urlMatch[1]; // e.g. "catfishing.net"
    const parts = host.split('.');
    const candidate = parts[0].length > 2 ? parts[0] : parts.slice(0, -1).join('.');
    return toTitleCase(candidate.replace(/-/g, ' '));
  }

  // 2. First non-empty line
  const firstLine = trimmed.split('\n').map(l => l.trim()).find(l => l.length > 0) || '';
  // Strip leading # from the whole line (e.g. "#travle #445 +1")
  const cleaned = firstLine.replace(/^#+\s*/, '');
  const words = cleaned.split(/\s+/);
  const nameTokens = [];

  for (const word of words) {
    const w = word.replace(/^#/, ''); // strip leading # from individual tokens
    if (!w.length) continue;
    // Stop at: pure number, X/N score, +N, slash pattern
    if (/^\d+$/.test(w)) break;
    if (/^[X\d]+\/\d+/.test(w)) break;
    if (/^\+\d+$/.test(w)) break;
    nameTokens.push(w);
    if (nameTokens.length >= 3) break;
  }

  if (nameTokens.length > 0) return toTitleCase(nameTokens.join(' '));

  // 3. Fallback
  return firstLine.slice(0, 30).trim();
}

export default parsers;
