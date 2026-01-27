// Clues By Sam Parser
// Format: "Clues by Sam #123" with time and/or emoji grid

const cluesbysamParser = {
  id: 'cluesbysam',
  name: 'Clues By Sam',

  // Match "Clues by Sam #123" or just "Clues by Sam" with nearby number
  pattern: /Clues\s*(?:by|from)?\s*Sam\s*#?(\d+)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "Clues" and "Sam"
    if (!/clues/i.test(text) || !/sam/i.test(text)) return null;

    let puzzleNumber = headerMatch[1] ? parseInt(headerMatch[1], 10) : null;

    // Try to find puzzle number if not in header
    if (!puzzleNumber) {
      const numMatch = text.match(/#(\d+)/);
      puzzleNumber = numMatch ? parseInt(numMatch[1], 10) : Date.now();
    }

    // Look for time format
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    let score = 'Completed';
    let scoreValue = 0;

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      scoreValue = minutes * 60 + seconds;
      score = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Check for perfect solve
    const isPerfect = /perfect|100%|flawless/i.test(text);
    if (isPerfect && score === 'Completed') {
      score = 'Perfect!';
    }

    // Extract emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟨🟥⬜⬛✅❌🔲🔳]/.test(trimmed) &&
             !/clues/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `cluesbysam-${puzzleNumber}-${Date.now()}`,
      gameId: 'cluesbysam',
      gameName: 'Clues By Sam',
      puzzleNumber,
      date,
      score,
      scoreValue,
      maxScore: null,
      won: true,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default cluesbysamParser;
