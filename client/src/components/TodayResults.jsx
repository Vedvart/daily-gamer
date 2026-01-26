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
        <h2 className="today-results__title">Today's Results</h2>
        <p className="today-results__date">{today}</p>
        <div className="today-results__empty">
          <p>No results yet today.</p>
          <p className="today-results__empty-hint">Click "Add Result" to paste your game results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-results">
      <h2 className="today-results__title">Today's Results</h2>
      <p className="today-results__date">{today}</p>
      <div className="today-results__list">
        {results.map(result => (
          <ResultCard
            key={result.id}
            result={result}
            onRemove={onRemoveResult}
            compact
          />
        ))}
      </div>
    </div>
  );
}

export default TodayResults;
