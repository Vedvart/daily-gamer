export const gameOrder = [
  'wordle', 'connections', 'strands', 'mini', 'latimesmini',
  'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle',
  'kindahardgolf', 'enclosehorse', 'kickoffleague', 'scrandle',
  'oneuppuzzle', 'cluesbysam', 'minutecryptic', 'dailydozen',
  'moreorless', 'eruptle', 'thrice',
];

export const gameNames = {
  wordle: 'Wordle',
  connections: 'Connections',
  strands: 'Strands',
  mini: 'NYT Mini',
  latimesmini: 'LA Times Mini',
  bandle: 'Bandle',
  catfishing: 'Catfishing',
  timeguessr: 'TimeGuessr',
  travle: 'Travle',
  flagle: 'Flagle',
  kindahardgolf: 'Kinda Hard Golf',
  enclosehorse: 'enclose.horse',
  kickoffleague: 'Kickoff League',
  scrandle: 'Scrandle',
  oneuppuzzle: 'One Up Puzzle',
  cluesbysam: 'Clues By Sam',
  minutecryptic: 'Minute Cryptic',
  dailydozen: 'Daily Dozen',
  moreorless: 'More Or Less',
  eruptle: 'Eruptle',
  thrice: 'Thrice',
};

const gameColors = {
  wordle: '#538d4e',
  connections: '#a855f7',
  strands: '#60a5fa',
  mini: '#3b82f6',
  latimesmini: '#f59e0b',
  bandle: '#eab308',
  catfishing: '#f97316',
  timeguessr: '#22c55e',
  travle: '#10b981',
  flagle: '#ef4444',
  kindahardgolf: '#84cc16',
  enclosehorse: '#8b5cf6',
  kickoffleague: '#06b6d4',
  scrandle: '#ec4899',
  oneuppuzzle: '#14b8a6',
  cluesbysam: '#f472b6',
  minutecryptic: '#a78bfa',
  dailydozen: '#fbbf24',
  moreorless: '#6366f1',
  eruptle: '#dc2626',
  thrice: '#0ea5e9',
};

const finiteTriesGames = ['wordle', 'bandle', 'connections'];

function sorted(results) {
  return [...results].sort(
    (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
  );
}

export function generateFullText(results) {
  return sorted(results).map(r => r.rawText).join('\n\n');
}

export function generateCompactText(results) {
  const lines = sorted(results).map(r => {
    switch (r.gameId) {
      case 'wordle':     return `Wordle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'connections':
        if (r.isReversePerfect) return `Connections #${r.puzzleNumber}: Reverse Perfect`;
        if (r.isPurpleFirst)    return `Connections #${r.puzzleNumber}: Purple First`;
        return `Connections #${r.puzzleNumber}: ${r.won ? `${r.scoreValue} mistakes` : 'Failed'}`;
      case 'strands':        return `Strands #${r.puzzleNumber}: ${r.score}`;
      case 'mini':           return `NYT Mini: ${r.score}`;
      case 'latimesmini':    return `LA Times Mini: ${r.score}`;
      case 'bandle':         return `Bandle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'catfishing':     return `Catfishing #${r.puzzleNumber}: ${r.score}`;
      case 'timeguessr':     return `TimeGuessr #${r.puzzleNumber}: ${r.score}`;
      case 'travle':         return `Travle #${r.puzzleNumber}: ${r.score}`;
      case 'flagle':         return `Flagle #${r.puzzleNumber}: ${r.score}`;
      case 'kindahardgolf':  return `Kinda Hard Golf: ${r.score}`;
      case 'enclosehorse':   return `enclose.horse Day ${r.puzzleNumber}: ${r.score}`;
      case 'kickoffleague':  return `Kickoff League #${r.puzzleNumber}: ${r.score}`;
      case 'scrandle':       return `Scrandle #${r.puzzleNumber}: ${r.score}`;
      case 'oneuppuzzle':    return `One Up #${r.puzzleNumber}: ${r.score}`;
      case 'cluesbysam':     return `Clues By Sam #${r.puzzleNumber}: ${r.score}`;
      case 'minutecryptic':  return `Minute Cryptic #${r.puzzleNumber}: ${r.score}`;
      case 'dailydozen':     return `Daily Dozen #${r.puzzleNumber}: ${r.score}`;
      case 'moreorless':     return `More Or Less: ${r.score}`;
      case 'eruptle':        return `Eruptle #${r.puzzleNumber}: ${r.score}`;
      case 'thrice':         return `Thrice #${r.puzzleNumber}: ${r.score}`;
      default:
        // Unknown / unrecognized game — include the full paste text
        if (r.isUnknown) return r.rawText;
        return `${gameNames[r.gameId] || r.gameName || r.gameId}${r.puzzleNumber ? ` #${r.puzzleNumber}` : ''}: ${r.score}`;
    }
  });

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  return `Daily Games - ${today}\n${lines.join('\n')}`;
}

// Draws results onto a canvas element. Synchronous.
export function renderImageToCanvas(results, canvas) {
  const ctx = canvas.getContext('2d');
  const s = sorted(results);

  const padding = 32;
  const cardWidth = 280;
  const cardHeight = 120;
  const cardGap = 16;
  const cols = Math.min(s.length, 3);
  const rows = Math.ceil(s.length / 3);

  const width  = padding * 2 + cols * cardWidth + (cols - 1) * cardGap;
  const height = padding * 2 + 60 + rows * cardHeight + (rows - 1) * cardGap;

  canvas.width  = width;
  canvas.height = height;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Daily Games', width / 2, padding + 24);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText(today, width / 2, padding + 46);

  // Cards
  s.forEach((result, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cardsInRow = Math.min(3, s.length - row * 3);
    const rowWidth = cardsInRow * cardWidth + (cardsInRow - 1) * cardGap;
    const rowOffset = (width - padding * 2 - rowWidth) / 2;
    const x = padding + rowOffset + col * (cardWidth + cardGap);
    const y = padding + 60 + row * (cardHeight + cardGap);

    ctx.fillStyle = 'rgba(37, 37, 64, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 12);
    ctx.fill();

    ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
    ctx.fillRect(x, y, cardWidth, 4);

    const iconSize = 32;
    const iconX = x + 16;
    const iconY = y + 20;

    ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.gameId[0].toUpperCase(), iconX + iconSize / 2, iconY + 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(gameNames[result.gameId] || result.gameName || result.gameId, iconX + iconSize + 12, iconY + 14);

    if (result.puzzleNumber) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${result.puzzleNumber}`, iconX + iconSize + 12, iconY + 28);
    }

    if (result.score) {
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(result.score, x + cardWidth - 16, iconY + 22);
    }

    let statusText = result.won ? 'Solved' : finiteTriesGames.includes(result.gameId) ? 'Failed' : '';
    if (statusText) {
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(statusText, x + cardWidth - 16, y + cardHeight - 16);
    }
  });

  // Watermark
  ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('dailygamer.app', width / 2, height - 10);
}
