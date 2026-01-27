// enclose.horse Parser
// Format: "enclose.horse Day 9 🥇 Excellent! 96%" or "enclose.horse Day 3 💎 PERFECT!"

const enclosehorseParser = {
  id: 'enclosehorse',
  name: 'enclose.horse',

  // Match "enclose.horse Day X" with optional score/percentage
  pattern: /enclose\.?horse\s*Day\s*(\d+)[\s\S]*?(\d+)?%?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const dayNumber = parseInt(headerMatch[1], 10);

    // Look for percentage
    const percentMatch = text.match(/(\d+)%/);
    const percentage = percentMatch ? parseInt(percentMatch[1], 10) : null;

    // Check for perfect
    const isPerfect = /PERFECT|💎/i.test(text);

    // Determine score text
    let score;
    if (isPerfect) {
      score = 'Perfect!';
    } else if (percentage !== null) {
      score = `${percentage}%`;
    } else {
      score = 'Completed';
    }

    // Extract medal/emojis
    const emojiMatch = text.match(/[🥇🥈🥉💎⭐]/gu);
    const grid = emojiMatch ? emojiMatch.join(' ') : null;

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `enclosehorse-${dayNumber}-${Date.now()}`,
      gameId: 'enclosehorse',
      gameName: 'enclose.horse',
      puzzleNumber: dayNumber,
      date,
      score,
      scoreValue: isPerfect ? 100 : (percentage || 50), // Higher is better
      maxScore: 100,
      won: true, // If sharing, they completed it
      grid,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default enclosehorseParser;
