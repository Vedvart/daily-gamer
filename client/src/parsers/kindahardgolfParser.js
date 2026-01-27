// Kinda Hard Golf Parser
// Format: "Kinda Hard Golf 01/15 ⛳ 3 strokes 🏌️‍♂️ 🎯🎯🎯"

const kindahardgolfParser = {
  id: 'kindahardgolf',
  name: 'Kinda Hard Golf',

  // Match "Kinda Hard Golf" with date and strokes
  pattern: /Kinda\s*Hard\s*Golf\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)?[\s\S]*?(\d+)\s*(?:stroke|strokes|⛳)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const strokes = parseInt(headerMatch[2], 10);

    // Parse date for puzzle number
    let puzzleNumber = Date.now();
    if (headerMatch[1]) {
      try {
        const dateParts = headerMatch[1].split('/');
        const month = parseInt(dateParts[0], 10);
        const day = parseInt(dateParts[1], 10);
        const year = dateParts[2] ? parseInt(dateParts[2], 10) : new Date().getFullYear();
        const fullYear = year < 100 ? 2000 + year : year;
        const parsedDate = new Date(fullYear, month - 1, day);
        const baseDate = new Date('2024-01-01');
        puzzleNumber = Math.floor((parsedDate - baseDate) / (1000 * 60 * 60 * 24));
      } catch {
        // Keep default
      }
    }

    // Extract emoji indicators
    const emojiMatch = text.match(/[⛳🏌️🎯⬜🟩🟥]+/gu);
    const grid = emojiMatch ? emojiMatch.join(' ') : null;

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `kindahardgolf-${puzzleNumber}-${Date.now()}`,
      gameId: 'kindahardgolf',
      gameName: 'Kinda Hard Golf',
      puzzleNumber,
      date,
      score: `${strokes} stroke${strokes !== 1 ? 's' : ''}`,
      scoreValue: strokes, // Lower is better
      maxScore: null,
      won: true, // If sharing, they completed it
      grid,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default kindahardgolfParser;
