// LeaderboardGameSelector Component
// Dropdown to select which game to show leaderboard for

import { getParser } from '../../parsers';
import './LeaderboardGameSelector.css';

function LeaderboardGameSelector({
  enabledGames,
  selectedGame,
  onSelectGame,
  showAllOption = true
}) {
  // Get game names
  const gameOptions = enabledGames.map(gameId => ({
    id: gameId,
    name: getParser(gameId)?.name || gameId
  }));

  return (
    <div className="leaderboard-game-selector">
      {showAllOption && (
        <button
          className={`game-selector-btn ${selectedGame === 'all' ? 'active' : ''}`}
          onClick={() => onSelectGame('all')}
        >
          All Games
        </button>
      )}

      {gameOptions.map(game => (
        <button
          key={game.id}
          className={`game-selector-btn ${selectedGame === game.id ? 'active' : ''}`}
          onClick={() => onSelectGame(game.id)}
        >
          {game.name}
        </button>
      ))}
    </div>
  );
}

export default LeaderboardGameSelector;
