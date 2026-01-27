import './ResultCard.css';

// Game-specific icons/letters and display names
const gameConfig = {
  wordle: { icon: 'W', name: 'Wordle', emoji: '🟩' },
  connections: { icon: 'C', name: 'Connections', emoji: '🟪' },
  strands: { icon: 'S', name: 'Strands', emoji: '🔵' },
  mini: { icon: 'M', name: 'NYT Mini', emoji: '⏱️' },
  latimesmini: { icon: 'L', name: 'LA Times Mini', emoji: '⏱️' },
  bandle: { icon: 'B', name: 'Bandle', emoji: '🎵' },
  catfishing: { icon: 'F', name: 'Catfishing', emoji: '🐈' },
  timeguessr: { icon: 'T', name: 'TimeGuessr', emoji: '📍' },
  travle: { icon: 'T', name: 'Travle', emoji: '🌍' },
  flagle: { icon: 'F', name: 'Flagle', emoji: '🏳️' },
  kindahardgolf: { icon: 'G', name: 'Kinda Hard Golf', emoji: '⛳' },
  enclosehorse: { icon: 'E', name: 'enclose.horse', emoji: '🐴' },
  kickoffleague: { icon: 'K', name: 'Kickoff League', emoji: '⚽' },
  scrandle: { icon: 'S', name: 'Scrandle', emoji: '🍔' },
  oneuppuzzle: { icon: 'O', name: 'One Up Puzzle', emoji: '🔢' },
  cluesbysam: { icon: 'C', name: 'Clues By Sam', emoji: '🔍' },
  minutecryptic: { icon: 'M', name: 'Minute Cryptic', emoji: '📝' },
  dailydozen: { icon: 'D', name: 'Daily Dozen', emoji: '🎯' },
  moreorless: { icon: 'M', name: 'More Or Less', emoji: '⬆️' },
  eruptle: { icon: 'E', name: 'Eruptle', emoji: '🌋' },
  thrice: { icon: 'T', name: 'Thrice', emoji: '3️⃣' },
};

// Games with finite tries that can "fail"
const finiteTriesGames = ['wordle', 'bandle', 'connections', 'flagle'];

function ResultCard({ result, onRemove }) {
  const config = gameConfig[result.gameId] || { icon: '?', name: result.gameName, emoji: '🎮' };

  // Determine if this is a "great" result for celebration styling
  const isGreatResult = result.won && (
    (result.gameId === 'wordle' && result.scoreValue <= 3) ||
    (result.gameId === 'connections' && (result.isReversePerfect || result.isPurpleFirst || result.scoreValue === 4)) ||
    (result.gameId === 'strands' && result.scoreValue === 0) || // No hints
    (result.gameId === 'bandle' && result.scoreValue <= 3) ||
    (result.gameId === 'catfishing' && result.scoreValue >= 8) ||
    (result.gameId === 'timeguessr' && result.scoreValue >= 40000) ||
    (result.gameId === 'mini' && result.scoreValue <= 60) ||
    (result.gameId === 'latimesmini' && result.scoreValue <= 60) ||
    (result.gameId === 'travle' && result.scoreValue === 0) || // Perfect path
    (result.gameId === 'kindahardgolf' && result.scoreValue <= 2) ||
    (result.gameId === 'enclosehorse' && result.scoreValue >= 95) ||
    (result.gameId === 'thrice' && result.scoreValue >= 12) ||
    (result.gameId === 'dailydozen' && result.scoreValue >= 10) ||
    (result.gameId === 'eruptle' && result.scoreValue >= 9)
  );

  return (
    <div className={`result-card result-card--${result.gameId} ${isGreatResult ? 'result-card--great' : ''} ${!result.won ? 'result-card--failed' : ''}`}>
      {/* Decorative background element */}
      <div className="result-card__bg-accent" />

      <div className="result-card__content">
        {/* Header with game info and score */}
        <div className="result-card__header">
          <div className="result-card__game-info">
            <div className={`result-card__icon result-card__icon--${result.gameId}`}>
              {config.icon}
            </div>
            <div className="result-card__titles">
              <h3 className="result-card__game-name">{config.name}</h3>
              <span className="result-card__puzzle-number">Puzzle #{result.puzzleNumber}</span>
            </div>
          </div>

          <div className="result-card__score-container">
            <div className={`result-card__score ${isGreatResult ? 'result-card__score--great' : ''}`}>
              {result.score}
            </div>
            {isGreatResult && <div className="result-card__celebration">✨</div>}
          </div>
        </div>

        {/* Emoji Grid Display */}
        {result.grid && (
          <div className="result-card__grid-container">
            <div className="result-card__grid">
              {result.grid}
            </div>
          </div>
        )}

        {/* Footer with status and actions */}
        <div className="result-card__footer">
          <div className="result-card__status-badge">
            <span className={`result-card__status ${result.won ? 'result-card__status--won' : 'result-card__status--lost'}`}>
              {result.won ? '✓ Solved' : (finiteTriesGames.includes(result.gameId) ? '✗ Failed' : '✓ Played')}
            </span>
          </div>

          {onRemove && (
            <button
              className="result-card__remove"
              onClick={() => onRemove(result.id)}
              title="Remove result"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
