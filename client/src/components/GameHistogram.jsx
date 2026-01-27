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
      <div className={`histogram ${labels.length > 8 ? 'histogram--compact' : ''}`}>
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

// Connections Histogram: Reverse Perfect, Purple First, 0-3 mistakes, X
export function ConnectionsHistogram({ data }) {
  const labels = ['RP', 'PF', '0', '1', '2', '3', 'X'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { 'X': 'failure', 'RP': 'special', 'PF': 'special', '0': 'perfect' };

  const formatLabel = (l) => {
    if (l === 'RP') return 'Rev';
    if (l === 'PF') return 'Purp';
    if (l === 'X') return 'X';
    if (l === '0') return '0';
    return l;
  };

  return (
    <GameHistogram
      title="Connections"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
      formatLabel={formatLabel}
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

// Catfishing Histogram: Half-point increments 0, 0.5, 1, 1.5, ... 10
export function CatfishingHistogram({ data }) {
  // Generate labels for 0, 0.5, 1, 1.5, ... 10
  const numericLabels = [];
  for (let i = 0; i <= 20; i++) {
    numericLabels.push(i / 2);
  }

  const total = numericLabels.reduce((sum, l) => sum + (data[l] || 0), 0);

  // Only 0 is failure (pink), everything else is green
  const colors = { '0': 'failure' };

  // Format label: show ½ for half values, number for whole
  const formatLabel = (l) => {
    const num = parseFloat(l);
    if (num === Math.floor(num)) {
      return String(num);
    }
    return '½';
  };

  // Format value with K notation for thousands
  const formatValue = (v) => {
    if (v >= 1000) {
      const k = v / 1000;
      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return v > 0 ? String(v) : '';
  };

  return (
    <CatfishingHistogramCustom
      data={data}
      labels={numericLabels}
      colors={colors}
      total={total}
      formatLabel={formatLabel}
      formatValue={formatValue}
    />
  );
}

// Custom component for Catfishing with value formatting
function CatfishingHistogramCustom({ data, labels, colors, total, formatLabel, formatValue }) {
  const values = labels.map(label => data[label] || 0);
  const maxValue = Math.max(...values, 1);

  if (total === 0) {
    return null;
  }

  return (
    <div className="histogram-card histogram-card--catfishing">
      <h3 className="histogram-card__title">Catfishing</h3>
      <div className="histogram histogram--catfishing">
        {labels.map((label, index) => {
          const value = values[index];
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const color = colors[String(label)] || 'catfishing';

          return (
            <div key={label} className="histogram__column">
              <div className="histogram__bar-container">
                <span className="histogram__value">{formatValue(value)}</span>
                <div
                  className={`histogram__bar histogram__bar--${color}`}
                  style={{ height: `${Math.max(heightPercent, value > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="histogram__label">{formatLabel(label)}</span>
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

// TimeGuessr Histogram: 5k point buckets
export function TimeguessrHistogram({ data }) {
  const labels = ['0-5k', '5-10k', '10-15k', '15-20k', '20-25k', '25-30k', '30-35k', '35-40k', '40-45k', '45-50k'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '45-50k': 'perfect', '40-45k': 'perfect', '0-5k': 'failure', '5-10k': 'failure' };

  // Shorter labels for display
  const formatLabel = (l) => {
    const match = l.match(/(\d+)-/);
    return match ? match[1] : l;
  };

  return (
    <GameHistogram
      title="TimeGuessr"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
      formatLabel={formatLabel}
    />
  );
}

export default GameHistogram;
