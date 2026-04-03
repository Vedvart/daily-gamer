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
// Single-column layout; each card shows the full rawText content.
export function renderImageToCanvas(results, canvas) {
  const ctx = canvas.getContext('2d');
  const s = sorted(results);

  // Layout constants
  const outerPad  = 28;
  const cardWidth = 500;
  const cardGap   = 10;
  const hPad      = 14; // horizontal padding inside card
  const headerH   = 50; // height of the icon/name/score row
  const divH      = 1;
  const textSize  = 12;
  const lineH     = 18; // px per rawText line
  const textPadT  = 10; // padding above text block
  const textPadB  = 10; // padding below text block
  const maxLines  = 20; // cap to avoid absurdly tall cards

  // Pre-compute each card's rawText lines and resulting height
  const cards = s.map(result => {
    const allLines = (result.rawText || '').split('\n');
    const displayLines = allLines.slice(0, maxLines);
    const overflow = allLines.length - displayLines.length;
    const textH = displayLines.length * lineH;
    const cardH = headerH + divH + textPadT + textH + textPadB;
    return { result, displayLines, overflow, cardH };
  });

  const titleH   = 56;
  const totalCardH = cards.reduce((sum, c, i) =>
    sum + c.cardH + (i < cards.length - 1 ? cardGap : 0), 0);
  const wmH      = 20; // watermark area
  const canvasW  = outerPad * 2 + cardWidth;
  const canvasH  = outerPad * 2 + titleH + totalCardH + wmH;

  canvas.width  = canvasW;
  canvas.height = canvasH;

  // Background
  const bg = ctx.createLinearGradient(0, 0, canvasW, canvasH);
  bg.addColorStop(0, '#1a1a2e');
  bg.addColorStop(1, '#16213e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Title block
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Daily Games', canvasW / 2, outerPad + 22);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(today, canvasW / 2, outerPad + 42);

  // Cards
  let cardY = outerPad + titleH;
  const emojiFont = `${textSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif`;

  cards.forEach(({ result, displayLines, overflow, cardH }) => {
    const x = outerPad;
    const y = cardY;
    const color = gameColors[result.gameId] || '#6b7280';

    // Card background
    ctx.fillStyle = 'rgba(37, 37, 64, 0.92)';
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardH, 10);
    ctx.fill();

    // Top accent bar
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cardWidth, 3);

    // ── Header ──────────────────────────────────────────────
    const iconSize = 28;
    const iconX = x + hPad;
    const iconY = y + (headerH - iconSize) / 2;

    // Icon background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 5);
    ctx.fill();

    // Icon letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    const iconLetter = (result.gameId[0] || '?').toUpperCase();
    ctx.fillText(iconLetter, iconX + iconSize / 2, iconY + 19);

    // Game name
    const gameLabel = gameNames[result.gameId] || result.gameName || result.gameId;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(gameLabel, iconX + iconSize + 10, y + 22);

    // Puzzle number
    if (result.puzzleNumber) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = `11px system-ui, -apple-system, sans-serif`;
      ctx.fillText(`#${result.puzzleNumber}`, iconX + iconSize + 10, y + 37);
    }

    // Score (right-aligned in header)
    if (result.score) {
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = `bold 16px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(result.score, x + cardWidth - hPad, y + 31);
    }

    // ── Divider ─────────────────────────────────────────────
    const divY = y + headerH;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(x + hPad, divY, cardWidth - hPad * 2, divH);

    // ── Raw text lines ───────────────────────────────────────
    // Clip to text area so long lines don't overflow card
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + hPad, divY + divH, cardWidth - hPad * 2, cardH - headerH - divH);
    ctx.clip();

    ctx.font = emojiFont;
    ctx.fillStyle = '#d1d5db';
    ctx.textAlign = 'left';

    let lineY = divY + divH + textPadT + textSize;
    displayLines.forEach(line => {
      ctx.fillText(line, x + hPad, lineY);
      lineY += lineH;
    });

    if (overflow > 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = `italic 11px system-ui, sans-serif`;
      ctx.fillText(`… ${overflow} more line${overflow === 1 ? '' : 's'}`, x + hPad, lineY);
    }

    ctx.restore();

    cardY += cardH + cardGap;
  });

  // Watermark
  ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
  ctx.font = '9px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('dailygamer.app', canvasW / 2, canvasH - 6);
}
