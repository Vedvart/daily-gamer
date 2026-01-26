// Catfishing Parser
// Format: "catfishing.net #78 - 8/10" with cat/fish emojis

const catfishingParser = {
  id: 'catfishing',
  name: 'Catfishing',

  // Match "catfishing.net #78 - 8/10"
  pattern: /catfishing\.net\s*#?(\d+)\s*[-–]\s*(\d+)\/10/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const score = parseInt(headerMatch[2], 10);
    const won = score >= 5; // Consider 5+ as a "win"

    // Extract emoji grid (lines with cat/fish emojis)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /[🐈🐟🐱🐠🐡🟩🟥⬛⬜]/.test(trimmed) && !this.pattern.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Calculate approximate date
    const baseDate = new Date('2023-01-01');
    const puzzleDate = new Date(baseDate);
    puzzleDate.setDate(baseDate.getDate() + puzzleNumber - 1);
    const date = puzzleDate.toISOString().split('T')[0];

    return {
      id: `catfishing-${puzzleNumber}-${Date.now()}`,
      gameId: 'catfishing',
      gameName: 'Catfishing',
      puzzleNumber,
      date,
      score: `${score}/10`,
      scoreValue: score,
      maxScore: 10,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default catfishingParser;
