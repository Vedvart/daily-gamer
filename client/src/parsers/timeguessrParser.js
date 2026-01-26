// TimeGuessr Parser
// Format: "TimeGuessr #90 42,500/50,000" with optional star ratings

const timeguessrParser = {
  id: 'timeguessr',
  name: 'TimeGuessr',

  // Match "TimeGuessr #90 42,500/50,000"
  pattern: /TimeGuessr\s*#?(\d+)\s+([\d,]+)\/(50,?000)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const score = parseInt(headerMatch[2].replace(/,/g, ''), 10);
    const maxScore = 50000;
    const won = score >= 25000; // Consider 50%+ as a "win"

    // Extract star ratings if present
    const starMatch = text.match(/[⭐★☆]+/g);
    const stars = starMatch ? starMatch.join(' ') : null;

    // Calculate approximate date
    const baseDate = new Date('2023-06-01');
    const puzzleDate = new Date(baseDate);
    puzzleDate.setDate(baseDate.getDate() + puzzleNumber - 1);
    const date = puzzleDate.toISOString().split('T')[0];

    // Format score with commas
    const formattedScore = score.toLocaleString();

    return {
      id: `timeguessr-${puzzleNumber}-${Date.now()}`,
      gameId: 'timeguessr',
      gameName: 'TimeGuessr',
      puzzleNumber,
      date,
      score: `${formattedScore}/50,000`,
      scoreValue: score,
      maxScore,
      won,
      grid: stars,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default timeguessrParser;
