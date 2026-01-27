// Minute Cryptic Parser
// Format: "Minute Cryptic #123" with time, score, par, hints

const minutecrypticParser = {
  id: 'minutecryptic',
  name: 'Minute Cryptic',

  // Match "Minute Cryptic" with optional number
  pattern: /Minute\s*Cryptic\s*#?(\d+)?/i,

  parse(text) {
    const headerMatch = text.match(this.pattern);
    if (!headerMatch) return null;

    // Must contain "Minute Cryptic"
    if (!/minute\s*cryptic/i.test(text)) return null;

    let puzzleNumber = headerMatch[1] ? parseInt(headerMatch[1], 10) : null;

    // Try to find puzzle number if not in header
    if (!puzzleNumber) {
      const numMatch = text.match(/#(\d+)/);
      puzzleNumber = numMatch ? parseInt(numMatch[1], 10) : Date.now();
    }

    // Look for time format
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    let timeScore = null;
    let timeValue = 0;

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      timeValue = minutes * 60 + seconds;
      timeScore = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Look for score/par
    const scoreMatch = text.match(/Score[:\s]*(\d+)/i);
    const parMatch = text.match(/Par[:\s]*(\d+)/i);
    const hintsMatch = text.match(/(\d+)\s*hints?/i);

    let score = timeScore || 'Completed';
    let scoreValue = timeValue;

    if (scoreMatch) {
      const numScore = parseInt(scoreMatch[1], 10);
      if (parMatch) {
        const par = parseInt(parMatch[1], 10);
        const diff = numScore - par;
        score = diff === 0 ? 'Par' : (diff > 0 ? `+${diff}` : `${diff}`);
        scoreValue = numScore;
      } else {
        score = `Score: ${numScore}`;
        scoreValue = numScore;
      }
    }

    // Extract emoji grid if present
    const lines = text.split('\n');
    const gridLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             /[🟩🟨⬜⬛✅❌💡]/.test(trimmed) &&
             !/minute/i.test(trimmed);
    });
    const grid = gridLines.join('\n');

    const date = new Date().toISOString().split('T')[0];

    return {
      id: `minutecryptic-${puzzleNumber}-${Date.now()}`,
      gameId: 'minutecryptic',
      gameName: 'Minute Cryptic',
      puzzleNumber,
      date,
      score,
      scoreValue,
      maxScore: null,
      won: true,
      grid: grid || null,
      rawText: text.trim(),
      timestamp: Date.now(),
    };
  },
};

export default minutecrypticParser;
