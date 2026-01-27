import ResultCard from './ResultCard';
import './TodayResults.css';

function TodayResults({ results, onRemoveResult }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (results.length === 0) {
    return (
      <div className="today-results">
        <div className="today-results__header">
          <h2 className="today-results__title">Today's Results</h2>
          <span className="today-results__date">{today}</span>
        </div>
        <div className="today-results__empty">
          <div className="today-results__empty-icon">
            <span>🎮</span>
          </div>
          <p className="today-results__empty-text">No games played yet today</p>
          <p className="today-results__empty-hint">
            Click "Add Result" to paste your game results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-results">
      <div className="today-results__header">
        <h2 className="today-results__title">Today's Results</h2>
        <span className="today-results__date">{today}</span>
      </div>
      <div className="today-results__grid">
        {results.map(result => (
          <ResultCard
            key={result.id}
            result={result}
            onRemove={onRemoveResult}
          />
        ))}
      </div>
    </div>
  );
}

export default TodayResults;
