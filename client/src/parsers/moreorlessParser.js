// More Or Less Parser
// Format: "More or Less" with streak/score number

const moreorlessParser = {
  id: 'moreorless',
  name: 'More Or Less',

  // Match "More or Less" or "Higher or Lower" with score
  pattern: /(?:More\s*or\s*Less|Higher\s*or\s*Lower)[\s\S]*?(\d+)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "More or Less" or "Higher or Lower"
    if (!/more\s*or\s*less|higher\s*or\s*lower/i.test(text)) return null;

    const streak = parseInt(headerMatch[1], 10);

    // Try to find a category/mode
    const categoryMatch = text.match(/(?:Mode|Category|Game)[:\s]*([A-Za-z\s]+)/i);
    const category = categoryMatch ? categoryMatch[1].trim() : null;

    // Look for puzzle/day number
    const numMatch = text.match(/#(\d+)/);
    const puzzleNumber = numMatch ? parseInt(numMatch[1], 10) : Date.now();

    // Extract emoji grid if present
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🔼🔽⬆️⬇️✅❌🟩🟥]/.test(trimmed) &&
             !/more|less|higher|lower/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `moreorless-${puzzleNumber}-${Date.now()}`,
      gameId: 'moreorless',
      gameName: 'More Or Less',
      puzzleNumber,
      date,
      score: `${streak} streak`,
      scoreValue: streak, // Higher is better
      maxScore: null,
      won: streak >= 5, // Consider 5+ a good score
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
      category,
    };
  },
};

export default moreorlessParser;
