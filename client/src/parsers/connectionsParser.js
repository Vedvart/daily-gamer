// Connections Parser
// Format: "Connections Puzzle #123" followed by colored squares grid
// Colors: 🟨 (yellow), 🟩 (green), 🟦 (blue), 🟪 (purple)
// Special achievements:
// - Reverse Perfect: Purple → Blue → Green → Yellow order, no mistakes
// - Purple First: Purple first but not full reverse order, no mistakes

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
    const rowColors = []; // Track the color of each successful row

    gridLines.forEach(line => {
      const squares = line.trim().match(/[🟨🟩🟦🟪]/g) || [];
      if (squares.length === 4) {
        const allSame = squares.every(s => s === squares[0]);
        if (!allSame) {
          mistakes++;
        } else {
          rowColors.push(squares[0]);
        }
      }
    });

    // Game is won if all 4 categories were found (4 successful rows)
    const won = rowColors.length === 4;
    const scoreValue = 4 - mistakes;

    // Check for special achievements (only if no mistakes and won)
    let isReversePerfect = false;
    let isPurpleFirst = false;

    if (won && mistakes === 0) {
      // Reverse Perfect: Purple → Blue → Green → Yellow
      const reverseOrder = ['🟪', '🟦', '🟩', '🟨'];
      isReversePerfect = rowColors.every((color, i) => color === reverseOrder[i]);

      // Purple First: Purple is first but not full reverse order
      if (!isReversePerfect && rowColors[0] === '🟪') {
        isPurpleFirst = true;
      }
    }

    let score;
    if (isReversePerfect) {
      score = 'Reverse Perfect!';
    } else if (isPurpleFirst) {
      score = 'Purple First!';
    } else if (won && mistakes === 0) {
      score = 'Perfect!';
    } else if (won) {
      score = `${mistakes} mistake${mistakes !== 1 ? 's' : ''}`;
    } else {
      score = 'Failed';
    }

    // Use today's date for "today's results" filtering
    const date = new Date().toISOString().split('T')[0];

    return {
      id: `connections-${puzzleNumber}-${Date.now()}`,
      gameId: 'connections',
      gameName: 'Connections',
      puzzleNumber,
      date,
      score,
      scoreValue,
      maxScore: 4,
      won,
      grid,
      rawText: text.trim(),
      timestamp: Date.now(),
      // Extra metadata for histogram categorization
      isReversePerfect,
      isPurpleFirst,
    };
  },
};

export default connectionsParser;
