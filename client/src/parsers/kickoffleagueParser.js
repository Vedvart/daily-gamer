// Kickoff League Parser
// Format: "Kickoff League #123" with goal/kick count

const kickoffleagueParser = {
  id: 'kickoffleague',
  name: 'Kickoff League',

  // Match "Kickoff League" with puzzle number and optional score
  pattern: /Kickoff\s*League\s*#?(\d+)[\s\S]*?(\d+)\s*(?:kicks?|goals?|⚽)/i,

  parse(text) {
    // Also try alternate pattern
    let headerMatch = text.match(this.pattern);

    if (!headerMatch) {
      // Try simpler pattern
      const simpleMatch = text.match(/Kickoff\s*League\s*#?(\d+)/i);
      if (!simpleMatch) return null;

      const puzzleNumber = parseInt(simpleMatch[1], 10);

      // Look for any number that could be a score
      const scoreMatch = text.match(/(\d+)\s*(?:kicks?|goals?|⚽|\/)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

      const date = new Date().toISOString().split('T')[0];

      return {
        id: `kickoffleague-${puzzleNumber}-${Date.now()}`,
        gameId: 'kickoffleague',
        gameName: 'Kickoff League',
        puzzleNumber,
        date,
        score: score ? `${score} kicks` : 'Completed',
        scoreValue: score || 0,
        maxScore: null,
        won: true,
        grid: null,
        rawText: text.trim(),
        timestamp: Date.now(),
      };
    }

    const puzzleNumber = parseInt(headerMatch[1], 10);
    const kicks = parseInt(headerMatch[2], 10);

    // Extract emoji grid if present
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && /[⚽🥅🟩🟥⬜]/.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `kickoffleague-${puzzleNumber}-${Date.now()}`,
      gameId: 'kickoffleague',
      gameName: 'Kickoff League',
      puzzleNumber,
      date,
      score: `${kicks} kicks`,
      scoreValue: kicks, // Lower is better
      maxScore: null,
      won: true,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default kickoffleagueParser;
