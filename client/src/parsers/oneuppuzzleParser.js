// One Up Puzzle Parser
// Format: "One Up Puzzle #248" with time or completion status

const oneuppuzzleParser = {
  id: 'oneuppuzzle',
  name: 'One Up Puzzle',

  // Match "One Up Puzzle #248" or "One Up #248"
  pattern: /One\s*Up(?:\s*Puzzle)?\s*#?(\d+)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);

    // Look for time format (M:SS or MM:SS)
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    let score = 'Completed';
    let scoreValue = 0;

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      scoreValue = minutes * 60 + seconds;
      score = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Extract any emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟨⬜⬛✅❌🔢]/.test(trimmed) &&
             !this.pattern.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `oneuppuzzle-${puzzleNumber}-${Date.now()}`,
      gameId: 'oneuppuzzle',
      gameName: 'One Up Puzzle',
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

export default oneuppuzzleParser;
