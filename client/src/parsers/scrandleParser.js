// Scrandle Parser
// Format: "Scrandle #123" with score and emoji grid for food comparison game

const scrandleParser = {
  id: 'scrandle',
  name: 'Scrandle',

  // Match "Scrandle #123" or "Scrandle" with a number nearby
  pattern: /Scrandle\s*#?(\d+)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "Scrandle" somewhere
    if (!/scrandle/i.test(text)) return null;

    // Try to find puzzle number
    let puzzleNumber = headerMatch[1] ? parseInt(headerMatch[1], 10) : Date.now();

    // Look for score pattern like "8/10" or "Score: 8"
    const scoreMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
    let score = null;
    let scoreValue = null;
    let maxScore = null;

    if (scoreMatch) {
      scoreValue = parseInt(scoreMatch[1], 10);
      maxScore = parseInt(scoreMatch[2], 10);
      score = `${scoreValue}/${maxScore}`;
    } else {
      // Look for streak or points
      const streakMatch = text.match(/(\d+)\s*(?:streak|correct|points)/i);
      if (streakMatch) {
        scoreValue = parseInt(streakMatch[1], 10);
        score = `${scoreValue} correct`;
      }
    }

    // Extract emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🍔🌭🍕🍟🥤✅❌🟩🟥⬜]/.test(trimmed) &&
             !this.pattern.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `scrandle-${puzzleNumber}-${Date.now()}`,
      gameId: 'scrandle',
      gameName: 'Scrandle',
      puzzleNumber,
      date,
      score: score || 'Completed',
      scoreValue: scoreValue || 0,
      maxScore,
      won: true,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default scrandleParser;
