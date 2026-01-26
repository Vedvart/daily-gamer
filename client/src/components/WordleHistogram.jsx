import './WordleHistogram.css';

// Dummy data - will be replaced with real data later
const DUMMY_WORDLE_DATA = {
  1: 1,
  2: 14,
  3: 56,
  4: 187,
  5: 87,
  6: 35,
  X: 28,
};

function WordleHistogram({ data = DUMMY_WORDLE_DATA }) {
  const labels = ['1', '2', '3', '4', '5', '6', 'X'];
  const values = labels.map(label => data[label] || 0);
  const maxValue = Math.max(...values);
  const total = values.reduce((a, b) => a + b, 0);

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
                <span className="histogram__value">{value}</span>
                <div
                  className={`histogram__bar ${isFailure ? 'histogram__bar--failure' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="histogram__label">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="histogram__total">
        {total} games played
      </div>
    </div>
  );
}

export default WordleHistogram;
