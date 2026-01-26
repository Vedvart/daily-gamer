import { getSupportedGames } from '../parsers';
import ResultCard from './ResultCard';
import './TodayResults.css';

// Game-specific icons/letters
const gameIcons = {
  wordle: 'W',
  connections: 'C',
  mini: 'M',
  bandle: 'B',
  catfishing: 'F',
  timeguessr: 'T',
};

function TodayResults({ results, onRemoveResult }) {
  const supportedGames = getSupportedGames();

  // Create a map of today's results by game ID
  const resultsByGame = {};
  results.forEach(r => {
    resultsByGame[r.gameId] = r;
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="today-results">
      <div className="today-results__header">
        <h2 className="today-results__title">Today's Results</h2>
        <span className="today-results__date">{today}</span>
      </div>

      <div className="today-results__grid">
        {supportedGames.map(game => {
          const result = resultsByGame[game.id];

          if (result) {
            return (
              <ResultCard
                key={game.id}
                result={result}
                onRemove={onRemoveResult}
              />
            );
          }

          return (
            <div key={game.id} className={`today-results__placeholder today-results__placeholder--${game.id}`}>
              <div className={`today-results__placeholder-icon today-results__placeholder-icon--${game.id}`}>
                {gameIcons[game.id]}
              </div>
              <span className="today-results__placeholder-name">{game.name}</span>
              <span className="today-results__placeholder-status">Not played yet</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TodayResults;
