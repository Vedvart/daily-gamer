// Bandle Parser
// Format: "Bandle #456 3/6" with instrument emojis

const bandleParser = {
  id: 'bandle',
  name: 'Bandle',

  // Match "Bandle #456 3/6" or "Bandle #456 x/6"
  pattern: /Bandle\s*#?(\d+)\s+([x\d])\/6/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const attemptsRaw = headerMatch[2].toLowerCase();
    const won = attemptsRaw !== 'x';
    const scoreValue = won ? parseInt(attemptsRaw, 10) : 7;

    // Extract emoji grid (lines with instrument/indicator emojis)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      // Bandle uses various emojis including instruments and colored squares
      return trimmed.length > 0 &&
             !this.pattern.test(trimmed) &&
             /[🎸🎹🥁🎷🎺🎻🪕🪗🎤🎵🟩🟥⬛⬜🔴🟢]/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Use today's date for "today's results" filtering
    const date = new Date().toISOString().split('T')[0];

    return {
      id: `bandle-${puzzleNumber}-${Date.now()}`,
      gameId: 'bandle',
      gameName: 'Bandle',
      puzzleNumber,
      date,
      score: `${attemptsRaw}/6`,
      scoreValue,
      maxScore: 6,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default bandleParser;
