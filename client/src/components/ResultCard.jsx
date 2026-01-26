import './ResultCard.css';

// Game-specific icons/letters
const gameIcons = {
  wordle: 'W',
  connections: 'C',
  mini: 'M',
  bandle: 'B',
  catfishing: 'F',
  timeguessr: 'T',
};

function ResultCard({ result, onRemove, compact = false }) {
  const icon = gameIcons[result.gameId] || '?';

  return (
    <div className={`result-card result-card--${result.gameId} ${compact ? 'result-card--compact' : ''}`}>
      <div className="result-card__header">
        <div className={`result-card__icon result-card__icon--${result.gameId}`}>
          {icon}
        </div>
        <div className="result-card__info">
          <h3 className="result-card__game">{result.gameName}</h3>
          <span className="result-card__puzzle">#{result.puzzleNumber}</span>
        </div>
        <div className="result-card__score">
          {result.score}
        </div>
      </div>

      {result.grid && !compact && (
        <div className="result-card__grid">
          {result.grid}
        </div>
      )}

      {!compact && (
        <div className="result-card__footer">
          <span className={`result-card__status ${result.won ? 'won' : 'lost'}`}>
            {result.won ? 'Solved' : 'Failed'}
          </span>
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
      )}
    </div>
  );
}

export default ResultCard;
