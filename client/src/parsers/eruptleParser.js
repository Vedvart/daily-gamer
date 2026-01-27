// Eruptle Parser
// Format: "Eruptle #123" with score like "8/10"

const eruptleParser = {
  id: 'eruptle',
  name: 'Eruptle',

  // Match "Eruptle" with optional number
  pattern: /Eruptle\s*#?(\d+)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "Eruptle"
    if (!/eruptle/i.test(text)) return null;

    let puzzleNumber = headerMatch[1] ? parseInt(headerMatch[1], 10) : null;

    // Try to find puzzle number if not in header
    if (!puzzleNumber) {
      const numMatch = text.match(/#(\d+)/);
      puzzleNumber = numMatch ? parseInt(numMatch[1], 10) : Date.now();
    }

    // Look for score pattern like "8/10"
    const scoreMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
    let score = 'Completed';
    let scoreValue = 0;
    let maxScore = 10;

    if (scoreMatch) {
      scoreValue = parseInt(scoreMatch[1], 10);
      maxScore = parseInt(scoreMatch[2], 10);
      score = `${scoreValue}/${maxScore}`;
    }

    // Check for perfect
    const isPerfect = scoreValue === maxScore || /perfect|💯/i.test(text);
    if (isPerfect && scoreMatch) {
      score = `${score} Perfect!`;
    }

    // Extract emoji grid (volcano-related emojis)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🌋🔥🟩🟥⬜⬛✅❌🔴🟠]/.test(trimmed) &&
             !/eruptle/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `eruptle-${puzzleNumber}-${Date.now()}`,
      gameId: 'eruptle',
      gameName: 'Eruptle',
      puzzleNumber,
      date,
      score,
      scoreValue,
      maxScore,
      won: scoreValue >= maxScore / 2, // Consider 50%+ a win
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default eruptleParser;
