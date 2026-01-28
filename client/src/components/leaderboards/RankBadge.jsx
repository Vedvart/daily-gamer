// RankBadge Component
// Displays rank with medal for top 3

import './RankBadge.css';

function RankBadge({ rank, size = 'medium' }) {
  const getMedal = () => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', class: 'gold' };
      case 2:
        return { emoji: '🥈', class: 'silver' };
      case 3:
        return { emoji: '🥉', class: 'bronze' };
      default:
        return null;
    }
  };

  const medal = getMedal();

  return (
    <div className={`rank-badge rank-badge--${size} ${medal ? `rank-badge--${medal.class}` : ''}`}>
      {medal ? (
        <span className="rank-badge__medal">{medal.emoji}</span>
      ) : (
        <span className="rank-badge__number">{rank}</span>
      )}
    </div>
  );
}

export default RankBadge;
