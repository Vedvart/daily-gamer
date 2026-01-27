// Catfishing Parser
// Format: "catfishing.net" followed by "#573 - 3.5/10" with cat/fish/egg emojis
// Cat (🐈) = success, Fish (🐟) = failure, Egg (🥚) = close enough (counts as success)

const catfishingParser = {
  id: 'catfishing',
  name: 'Catfishing',

  // Match "catfishing.net" followed by "#number - score/10" (can be on separate lines)
  // Score can be decimal (e.g., 3.5)
  pattern: /catfishing\.net[\s\S]*?#(\d+)\s*[-–]\s*([\d.]+)\/10/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const score = parseFloat(headerMatch[2]);
    const won = score >= 5; // Consider 5+ as a "win"

    // Extract emoji grid (lines with cat/fish/egg emojis)
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      // Include egg emoji (🥚) in the pattern, exclude header lines
      return trimmed.length > 0 &&
             /[🐈🐟🥚🐱🐠🐡]/.test(trimmed) &&
             !trimmed.includes('catfishing.net') &&
             !trimmed.includes('/10');
    });
    const grid = gridLines.join('\n');

    // Use today's date for "today's results" filtering
    const date = new Date().toISOString().split('T')[0];

    return {
      id: `catfishing-${puzzleNumber}-${Date.now()}`,
      gameId: 'catfishing',
      gameName: 'Catfishing',
      puzzleNumber,
      date,
      score: `${score}/10`,
      scoreValue: score,
      maxScore: 10,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default catfishingParser;
