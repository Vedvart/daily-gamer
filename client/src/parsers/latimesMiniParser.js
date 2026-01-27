// LA Times Mini Crossword Parser
// Format: "I finished the Los Angeles Times Mini Crossword in 1:23"

const latimesMiniParser = {
  id: 'latimesmini',
  name: 'LA Times Mini',

  // Match the LA Times Mini Crossword share format
  pattern: /(?:I (?:finished|solved|completed) the|Los Angeles Times Mini|LA Times Mini)[\s\S]*?(\d+):(\d+)/i,

  parse(text) {
    const match = text.match(this.pattern);
    if (!match) return null;

    // Check for LA Times specifically
    if (!/(?:Los Angeles|LA) Times/i.test(text)) return null;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const totalSeconds = minutes * 60 + seconds;

    // Try to extract date from text
    let puzzleNumber = Date.now();
    const dateMatch = text.match(/(\w+ \d+,? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (dateMatch) {
      try {
        const parsedDate = new Date(dateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          const baseDate = new Date('2020-01-01');
          puzzleNumber = Math.floor((parsedDate - baseDate) / (1000 * 60 * 60 * 24));
        }
      } catch {
        // Keep default puzzle number
      }
    }

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `latimesmini-${puzzleNumber}-${Date.now()}`,
      gameId: 'latimesmini',
      gameName: 'LA Times Mini',
      puzzleNumber,
      date,
      score: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      scoreValue: totalSeconds,
      maxScore: null,
      won: true,
      grid: null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default latimesMiniParser;
