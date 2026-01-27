// Thrice Parser
// Format: "Thrice Game #129 → 10 points!" or "Thrice #129 10 points"

const thriceParser = {
  id: 'thrice',
  name: 'Thrice',

  // Match "Thrice" with number and points
  pattern: /Thrice(?:\s*Game)?\s*#?(\d+)[\s\S]*?(\d+)\s*(?:points?|pts?)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const points = parseInt(headerMatch[2], 10);

    // Max score is 15 (5 questions × 3 points each for first try)
    const maxScore = 15;
    const isPerfect = points === maxScore;

    let score = `${points} points`;
    if (isPerfect) {
      score = `${points} points (Perfect!)`;
    }

    // Extract any emoji/visual representation
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟨🟥⬜1️⃣2️⃣3️⃣❌✅]/.test(trimmed) &&
             !/thrice/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `thrice-${puzzleNumber}-${Date.now()}`,
      gameId: 'thrice',
      gameName: 'Thrice',
      puzzleNumber,
      date,
      score,
      scoreValue: points, // Higher is better
      maxScore,
      won: points >= 8, // Consider 8+ a good score
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default thriceParser;
