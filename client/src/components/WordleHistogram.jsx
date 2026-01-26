import './WordleHistogram.css';

function WordleHistogram({ data }) {
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const values = labels.map(label => data[label] || 0);
  const maxValue = Math.max(...values);
  const total = values.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return null; // Don't render if no data
  }

  return (
    <div className="histogram-card">
      <h3 className="histogram-card__title">Wordle</h3>
      <div className="histogram">
        {labels.map((label, index) => {
          const value = values[index];
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isFailure = label === 'X';

          return (
            <div key={label} className="histogram__column">
              <div className="histogram__bar-container">
                <span className="histogram__value">{value > 0 ? value : ''}</span>
                <div
                  className={`histogram__bar ${isFailure ? 'histogram__bar--failure' : ''}`}
                  style={{ height: `${Math.max(heightPercent, value > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="histogram__label">{label}</span>
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

export default WordleHistogram;
