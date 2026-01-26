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

    // Parse the date string (e.g., "January 26, 2026")
    let date;
    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      } else {
        date = new Date().toISOString().split('T')[0];
      }
    } catch {
      date = new Date().toISOString().split('T')[0];
    }

    // Generate puzzle number from date (approximate)
    const baseDate = new Date('2014-08-21'); // Mini started around this date
    const currentDate = new Date(date);
    const daysDiff = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
    const puzzleNumber = daysDiff;

    return {
      id: `mini-${date}-${Date.now()}`,
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
