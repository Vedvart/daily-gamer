// Flagle Parser (Flagged / Flag guessing game)
// Format: "#Flagle #123 (5/6)" or "Flagle #123 🟩⬜⬜🟩🟩🟩"

const flagleParser = {
  id: 'flagle',
  name: 'Flagle',

  // Match "Flagle #123" with optional score
  pattern: /[#]?(?:Flagle|Flagged)\s*#?(\d+)(?:\s*[(\[]?(\d+|X)\/(\d+)[)\]]?)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);

    let attempts = 1;
    let maxAttempts = 6;
    let won = true;

    if (headerMatch[2]) {
      const attemptsRaw = headerMatch[2].toUpperCase();
      won = attemptsRaw !== 'X';
      attempts = won ? parseInt(attemptsRaw, 10) : parseInt(headerMatch[3], 10) + 1;
      maxAttempts = parseInt(headerMatch[3], 10);
    }

    // Extract emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟨⬜⬛🟥🟧🏳️🚩]/.test(trimmed) &&
             !this.pattern.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // If we found a grid but no score, count from grid
    if (!headerMatch[2] && grid) {
      const rows = grid.split('\n').length;
      attempts = rows;
      // Check if last row is all green (won)
      const lastRow = gridLines[gridLines.length - 1] || '';
      won = /^[🟩\s]+$/.test(lastRow);
    }

    const score = won ? `${attempts}/${maxAttempts}` : `X/${maxAttempts}`;
    const scoreValue = won ? attempts : maxAttempts + 1;

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `flagle-${puzzleNumber}-${Date.now()}`,
      gameId: 'flagle',
      gameName: 'Flagle',
      puzzleNumber,
      date,
      score,
      scoreValue,
      maxScore: maxAttempts,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default flagleParser;
