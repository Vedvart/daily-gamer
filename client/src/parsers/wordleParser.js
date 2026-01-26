// Wordle Parser
// Format: "Wordle 1,234 4/6" followed by emoji grid

const wordleParser = {
  id: 'wordle',
  name: 'Wordle',

  // Match "Wordle 1,234 4/6" or "Wordle 1234 X/6"
  pattern: /Wordle\s+([\d,]+)\s+([X\d])\/6/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1].replace(/,/g, ''), 10);
    const attemptsRaw = headerMatch[2].toUpperCase();
    const won = attemptsRaw !== 'X';
    const scoreValue = won ? parseInt(attemptsRaw, 10) : 7;

    // Extract emoji grid (lines with emoji squares)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🟩🟨⬛⬜🟧\s]+$/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Use today's date for "today's results" filtering
    const date = new Date().toISOString().split('T')[0];

    return {
      id: `wordle-${puzzleNumber}-${Date.now()}`,
      gameId: 'wordle',
      gameName: 'Wordle',
      puzzleNumber,
      date,
      score: `${attemptsRaw}/6`,
      scoreValue,
      maxScore: 6,
      won,
      grid,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default wordleParser;
