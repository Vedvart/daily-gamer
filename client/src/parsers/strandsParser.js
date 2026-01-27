// NYT Strands Parser
// Format: "Strands #695" followed by emoji grid
// 🔵 = found theme word, 🟡 = found spangram, 💡 = used hint

const strandsParser = {
  id: 'strands',
  name: 'Strands',

  // Match "Strands #695" or "Strands\n#695"
  pattern: /Strands\s*#?(\d+)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);

    // Extract emoji grid (lines with blue dots, yellow dots, or lightbulbs)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /[🔵🟡💡]/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Count elements
    const allEmojis = grid.match(/[🔵🟡💡]/gu) || [];
    const hints = (grid.match(/💡/gu) || []).length;
    const foundSpangram = grid.includes('🟡');
    const themeWords = (grid.match(/🔵/gu) || []).length;

    // Won if spangram found (completing the puzzle)
    const won = foundSpangram;

    // Score description
    let score;
    if (hints === 0) {
      score = 'Perfect!';
    } else {
      score = `${hints} hint${hints !== 1 ? 's' : ''}`;
    }

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `strands-${puzzleNumber}-${Date.now()}`,
      gameId: 'strands',
      gameName: 'Strands',
      puzzleNumber,
      date,
      score,
      scoreValue: hints, // Lower is better
      maxScore: null,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
      hints,
      themeWords,
    };
  },
};

export default strandsParser;
