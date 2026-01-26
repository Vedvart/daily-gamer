// Connections Parser
// Format: "Connections Puzzle #123" followed by colored squares grid

const connectionsParser = {
  id: 'connections',
  name: 'Connections',

  // Match "Connections" followed by "Puzzle #123"
  pattern: /Connections\s*\n?Puzzle\s*#?(\d+)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);

    // Extract emoji grid (lines with colored squares)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /^[🟨🟩🟦🟪\s]+$/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Calculate mistakes from grid - perfect is 4 lines of same color
    // Count how many "wrong" guesses (lines that aren't all same color)
    let mistakes = 0;
    gridLines.forEach(line => {
      const squares = line.trim().match(/[🟨🟩🟦🟪]/g) || [];
      if (squares.length === 4) {
        const allSame = squares.every(s => s === squares[0]);
        if (!allSame) mistakes++;
      }
    });

    // Score is 4 - mistakes (4 is perfect, 0 means lost)
    const won = gridLines.length === 4 && mistakes === 0;
    const scoreValue = 4 - mistakes;

    // Calculate approximate date (Connections started around June 2023)
    // Puzzle #1 was June 12, 2023
    const baseDate = new Date('2023-06-12');
    const puzzleDate = new Date(baseDate);
    puzzleDate.setDate(baseDate.getDate() + puzzleNumber - 1);
    const date = puzzleDate.toISOString().split('T')[0];

    return {
      id: `connections-${puzzleNumber}-${Date.now()}`,
      gameId: 'connections',
      gameName: 'Connections',
      puzzleNumber,
      date,
      score: won ? 'Perfect!' : `${mistakes} mistake${mistakes !== 1 ? 's' : ''}`,
      scoreValue,
      maxScore: 4,
      won,
      grid,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default connectionsParser;
