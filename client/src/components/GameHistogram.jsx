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

// Strands Histogram: Hints used
export function StrandsHistogram({ data }) {
  const labels = ['0', '1', '2', '3', '4+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || data[parseInt(l)] || 0), 0);
  const colors = { '0': 'perfect' };

  return (
    <GameHistogram
      title="Strands"
      data={{ ...data, '0': data[0] || 0, '1': data[1] || 0, '2': data[2] || 0, '3': data[3] || 0 }}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// LA Times Mini Histogram: Time buckets (same as NYT Mini)
export function LatimesMiniHistogram({ data }) {
  const labels = ['<30s', '30-60s', '1-2m', '2-3m', '3m+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '<30s': 'perfect' };

  return (
    <GameHistogram
      title="LA Times Mini"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Travle Histogram: Extra guesses
export function TravleHistogram({ data }) {
  const labels = ['+0', '+1', '+2', '+3', '+4', '+5+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '+0': 'perfect' };

  return (
    <GameHistogram
      title="Travle"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Flagle Histogram: Guesses 1-6, X
export function FlagleHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const total = labels.reduce((sum, l) => sum + (data[l] || data[parseInt(l)] || 0), 0);
  const colors = { 'X': 'failure' };

  return (
    <GameHistogram
      title="Flagle"
      data={{ ...data, '1': data[1] || 0, '2': data[2] || 0, '3': data[3] || 0, '4': data[4] || 0, '5': data[5] || 0, '6': data[6] || 0 }}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Kinda Hard Golf Histogram: Strokes
export function KindahardgolfHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || data[parseInt(l)] || 0), 0);
  const colors = { '1': 'perfect', '2': 'perfect' };

  return (
    <GameHistogram
      title="Kinda Hard Golf"
      data={{ ...data, '1': data[1] || 0, '2': data[2] || 0, '3': data[3] || 0, '4': data[4] || 0, '5': data[5] || 0 }}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// enclose.horse Histogram: Percentage buckets
export function EnclosehorseHistogram({ data }) {
  const labels = ['0-20', '21-40', '41-60', '61-80', '81-99', '100'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '100': 'perfect', '81-99': 'perfect', '0-20': 'failure' };

  const formatLabel = (l) => l === '100' ? '100' : l.split('-')[0];

  return (
    <GameHistogram
      title="enclose.horse"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
      formatLabel={formatLabel}
    />
  );
}

// Kickoff League Histogram: Kicks
export function KickoffleagueHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || data[parseInt(l)] || 0), 0);
  const colors = { '1': 'perfect', '2': 'perfect' };

  return (
    <GameHistogram
      title="Kickoff League"
      data={{ ...data, '1': data[1] || 0, '2': data[2] || 0, '3': data[3] || 0, '4': data[4] || 0, '5': data[5] || 0 }}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Scrandle Histogram: Score 0-10
export function ScrandleHistogram({ data }) {
  const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const total = labels.reduce((sum, l) => sum + (data[parseInt(l)] || 0), 0);
  const colors = { '10': 'perfect', '9': 'perfect', '0': 'failure', '1': 'failure' };

  return (
    <GameHistogram
      title="Scrandle"
      data={Object.fromEntries(labels.map(l => [l, data[parseInt(l)] || 0]))}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// One Up Puzzle Histogram: Time buckets
export function OneuppuzzleHistogram({ data }) {
  const labels = ['<1m', '1-2m', '2-5m', '5-10m', '10m+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '<1m': 'perfect' };

  return (
    <GameHistogram
      title="One Up Puzzle"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Clues By Sam Histogram: Time buckets
export function CluesbysamHistogram({ data }) {
  const labels = ['<1m', '1-2m', '2-5m', '5-10m', '10m+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '<1m': 'perfect' };

  return (
    <GameHistogram
      title="Clues By Sam"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Minute Cryptic Histogram: Score relative to par
export function MinutecrypticHistogram({ data }) {
  const labels = ['≤-2', '-1', '0', '+1', '+2', '≥+3'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '≤-2': 'perfect', '-1': 'perfect', '0': 'perfect' };

  return (
    <GameHistogram
      title="Minute Cryptic"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Daily Dozen Histogram: Score ranges
export function DailydozenHistogram({ data }) {
  const labels = ['0-3', '4-6', '7-9', '10-11', '12'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '12': 'perfect', '10-11': 'perfect', '0-3': 'failure' };

  return (
    <GameHistogram
      title="Daily Dozen"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// More Or Less Histogram: Streak ranges
export function MoreorlessHistogram({ data }) {
  const labels = ['1-5', '6-10', '11-15', '16-20', '21+'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '21+': 'perfect', '16-20': 'perfect' };

  return (
    <GameHistogram
      title="More Or Less"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Eruptle Histogram: Score 0-10
export function EruptleHistogram({ data }) {
  const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const total = labels.reduce((sum, l) => sum + (data[parseInt(l)] || 0), 0);
  const colors = { '10': 'perfect', '9': 'perfect', '0': 'failure', '1': 'failure' };

  return (
    <GameHistogram
      title="Eruptle"
      data={Object.fromEntries(labels.map(l => [l, data[parseInt(l)] || 0]))}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

// Thrice Histogram: Points ranges
export function ThriceHistogram({ data }) {
  const labels = ['0-3', '4-6', '7-9', '10-12', '13-15'];
  const total = labels.reduce((sum, l) => sum + (data[l] || 0), 0);
  const colors = { '13-15': 'perfect', '10-12': 'perfect', '0-3': 'failure' };

  return (
    <GameHistogram
      title="Thrice"
      data={data}
      labels={labels}
      colors={colors}
      total={total}
    />
  );
}

export default GameHistogram;
