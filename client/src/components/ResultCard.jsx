import './ResultCard.css';

const gameConfig = {
  wordle:        { icon: 'W', name: 'Wordle' },
  connections:   { icon: 'C', name: 'Connections' },
  strands:       { icon: 'S', name: 'Strands' },
  mini:          { icon: 'M', name: 'NYT Mini' },
  latimesmini:   { icon: 'L', name: 'LA Times Mini' },
  bandle:        { icon: 'B', name: 'Bandle' },
  catfishing:    { icon: 'F', name: 'Catfishing' },
  timeguessr:    { icon: 'T', name: 'TimeGuessr' },
  travle:        { icon: 'T', name: 'Travle' },
  flagle:        { icon: 'F', name: 'Flagle' },
  kindahardgolf: { icon: 'G', name: 'Kinda Hard Golf' },
  enclosehorse:  { icon: 'E', name: 'enclose.horse' },
  kickoffleague: { icon: 'K', name: 'Kickoff League' },
  scrandle:      { icon: 'S', name: 'Scrandle' },
  oneuppuzzle:   { icon: 'O', name: 'One Up Puzzle' },
  cluesbysam:    { icon: 'C', name: 'Clues By Sam' },
  minutecryptic: { icon: 'M', name: 'Minute Cryptic' },
  dailydozen:    { icon: 'D', name: 'Daily Dozen' },
  moreorless:    { icon: 'M', name: 'More Or Less' },
  eruptle:       { icon: 'E', name: 'Eruptle' },
  thrice:        { icon: 'T', name: 'Thrice' },
};

const finiteTriesGames = ['wordle', 'bandle', 'connections', 'flagle'];

function ResultCard({ result, onRemove }) {
  const config = gameConfig[result.gameId] || {
    icon: (result.gameName || result.gameId)?.[0]?.toUpperCase() || '?',
    name: result.gameName || result.gameId,
  };

  const isGreatResult = !result.isUnknown && result.won && (
    (result.gameId === 'wordle'        && result.scoreValue <= 3) ||
    (result.gameId === 'connections'   && (result.isReversePerfect || result.isPurpleFirst || result.scoreValue === 4)) ||
    (result.gameId === 'strands'       && result.scoreValue === 0) ||
    (result.gameId === 'bandle'        && result.scoreValue <= 3) ||
    (result.gameId === 'catfishing'    && result.scoreValue >= 8) ||
    (result.gameId === 'timeguessr'    && result.scoreValue >= 40000) ||
    (result.gameId === 'mini'          && result.scoreValue <= 60) ||
    (result.gameId === 'latimesmini'   && result.scoreValue <= 60) ||
    (result.gameId === 'travle'        && result.scoreValue === 0) ||
    (result.gameId === 'kindahardgolf' && result.scoreValue <= 2) ||
    (result.gameId === 'enclosehorse'  && result.scoreValue >= 95) ||
    (result.gameId === 'thrice'        && result.scoreValue >= 12) ||
    (result.gameId === 'dailydozen'    && result.scoreValue >= 10) ||
    (result.gameId === 'eruptle'       && result.scoreValue >= 9)
  );

  const statusText = result.isUnknown
    ? '+ Added'
    : result.won
    ? '✓ Solved'
    : finiteTriesGames.includes(result.gameId)
    ? '✗ Failed'
    : '✓ Played';

  const statusClass = result.isUnknown || result.won
    ? 'result-card__status--won'
    : 'result-card__status--lost';

  return (
    <div className={`result-card result-card--${result.gameId} ${isGreatResult ? 'result-card--great' : ''} ${!result.won && !result.isUnknown ? 'result-card--failed' : ''}`}>
      <div className="result-card__bg-accent" />

      <div className="result-card__content">
        {/* Compact header */}
        <div className="result-card__header">
          <div className="result-card__game-info">
            <div className={`result-card__icon result-card__icon--${result.gameId}`}>
              {config.icon}
            </div>
            <div className="result-card__titles">
              <h3 className="result-card__game-name">{config.name}</h3>
              {result.puzzleNumber && (
                <span className="result-card__puzzle-number">#{result.puzzleNumber}</span>
              )}
            </div>
          </div>

          {result.score && (
            <div className="result-card__score-container">
              <div className={`result-card__score ${isGreatResult ? 'result-card__score--great' : ''}`}>
                {result.score}
              </div>
              {isGreatResult && <div className="result-card__celebration">✨</div>}
            </div>
          )}
        </div>

        {/* Full paste content */}
        {result.rawText && (
          <div className="result-card__rawtext-container">
            <pre className="result-card__rawtext">{result.rawText}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="result-card__footer">
          <span className={`result-card__status ${statusClass}`}>{statusText}</span>
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
