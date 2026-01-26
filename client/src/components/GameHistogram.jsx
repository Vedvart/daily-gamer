import './GameHistogram.css';

// Generic histogram component that works with different game configurations
function GameHistogram({ title, data, labels, colors, total, formatLabel }) {
  const values = labels.map(label => data[label] || 0);
  const maxValue = Math.max(...values, 1);

  if (total === 0) {
    return null;
  }

  return (
    <div className="histogram-card">
      <h3 className="histogram-card__title">{title}</h3>
      <div className="histogram">
        {labels.map((label, index) => {
          const value = values[index];
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const color = colors?.[label] || 'default';

          return (
            <div key={label} className="histogram__column">
              <div className="histogram__bar-container">
                <span className="histogram__value">{value > 0 ? value : ''}</span>
                <div
                  className={`histogram__bar histogram__bar--${color}`}
                  style={{ height: `${Math.max(heightPercent, value > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="histogram__label">{formatLabel ? formatLabel(label) : label}</span>
            </div>
          );
        })}
      </div>
      <div className="histogram__total">
        {total} game{total !== 1 ? 's' : ''} played
      </div>
    </div>
  );
}

// Wordle Histogram: 1-6 guesses or X for failure
export function WordleHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { 'X': 'failure' };

  return (
    <GameHistogram
      title="Wordle"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Connections Histogram: 0-4 mistakes
export function ConnectionsHistogram({ data }) {
  const labels = ['0', '1', '2', '3', 'X'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { 'X': 'failure', '0': 'perfect' };

  return (
    <GameHistogram
      title="Connections"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
      formatLabel={(l) => l === 'X' ? 'X' : l === '0' ? 'Perfect' : `${l} err`}
    />
  );
}

// NYT Mini Histogram: Time buckets
export function MiniHistogram({ data }) {
  const labels = ['<30s', '30-60s', '1-2m', '2-3m', '3m+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '<30s': 'perfect' };

  return (
    <GameHistogram
      title="NYT Mini"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Bandle Histogram: 1-6 guesses or X for failure (same as Wordle)
export function BandleHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { 'X': 'failure' };

  return (
    <GameHistogram
      title="Bandle"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Catfishing Histogram: Score ranges 1-10
export function CatfishingHistogram({ data }) {
  const labels = ['1-2', '3-4', '5-6', '7-8', '9-10'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '9-10': 'perfect', '1-2': 'failure' };

  return (
    <GameHistogram
      title="Catfishing"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// TimeGuessr Histogram: Score percentage ranges
export function TimeguessrHistogram({ data }) {
  const labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '80-100%': 'perfect', '0-20%': 'failure' };

  return (
    <GameHistogram
      title="TimeGuessr"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

export default GameHistogram;
