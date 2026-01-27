// Travle Parser
// Format: "#travle #511 +0 (Perfect) ✅✅✅✅✅" or similar
// ✅ = correct/optimal, 🟧 = close, 🟥 = detour, ⬛ = no land route

const travleParser = {
  id: 'travle',
  name: 'Travle',

  // Match "#travle #511 +0" or "travle #511 +2"
  pattern: /#?travle\s*#?(\d+)\s*\+?(-?\d+)/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const extraGuesses = parseInt(headerMatch[2], 10);

    // Extract emoji grid
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /[✅🟧🟥⬛✓🟩]/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    // Score representation
    const scoreText = extraGuesses === 0 ? '+0 (Perfect)' : `+${extraGuesses}`;
    const won = extraGuesses >= 0; // Negative would mean didn't finish

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `travle-${puzzleNumber}-${Date.now()}`,
      gameId: 'travle',
      gameName: 'Travle',
      puzzleNumber,
      date,
      score: scoreText,
      scoreValue: extraGuesses, // Lower is better
      maxScore: null,
      won,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default travleParser;
