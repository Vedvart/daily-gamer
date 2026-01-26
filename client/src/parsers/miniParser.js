// NYT Mini Crossword Parser
// Format: "I solved the January 26, 2026 New York Times Mini Crossword in 1:23!"

const miniParser = {
  id: 'mini',
  name: 'NYT Mini',

  // Match the Mini Crossword share format
  pattern: /I solved the (.+?) New York Times Mini Crossword in (\d+):(\d+)/i,

  parse(text) {
    const match = text.match(this.pattern);
    if (!match) return null;

    const dateStr = match[1].trim();
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const totalSeconds = minutes * 60 + seconds;

    // Generate puzzle number from the date string (approximate)
    let puzzleNumber = 0;
    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        const baseDate = new Date('2014-08-21');
        puzzleNumber = Math.floor((parsedDate - baseDate) / (1000 * 60 * 60 * 24));
      }
    } catch {
      puzzleNumber = Date.now();
    }

    // Use today's date for "today's results" filtering
    const date = new Date().toISOString().split('T')[0];

    return {
      id: `mini-${puzzleNumber}-${Date.now()}`,
      gameId: 'mini',
      gameName: 'NYT Mini',
      puzzleNumber,
      date,
      score: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      scoreValue: totalSeconds, // Lower is better for time-based games
      maxScore: null, // No max for time
      won: true, // If they're sharing, they solved it
      grid: null, // Mini doesn't have a grid
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default miniParser;
