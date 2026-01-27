// Daily Dozen Trivia Parser
// Format: "Daily Dozen #123" or "The Dozen" with score like "8/9" or "8/12"

const dailydozenParser = {
  id: 'dailydozen',
  name: 'Daily Dozen',

  // Match "Daily Dozen" or "The Dozen" with optional number
  pattern: /(?:Daily\s*Dozen|The\s*Dozen)(?:\s*(?:Trivia)?)\s*#?(\d+)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "Dozen"
    if (!/dozen/i.test(text)) return null;

    let puzzleNumber = headerMatch[1] ? parseInt(headerMatch[1], 10) : null;

    // Try to find puzzle number if not in header
    if (!puzzleNumber) {
      const numMatch = text.match(/#(\d+)/);
      puzzleNumber = numMatch ? parseInt(numMatch[1], 10) : Date.now();
    }

    // Look for score pattern like "8/9" or "8/12"
    const scoreMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
    let score = 'Completed';
    let scoreValue = 0;
    let maxScore = 12;

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

    // Extract emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟥⬜✅❌🔲🔳]/.test(trimmed) &&
             !/dozen/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `dailydozen-${puzzleNumber}-${Date.now()}`,
      gameId: 'dailydozen',
      gameName: 'Daily Dozen',
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

export default dailydozenParser;
