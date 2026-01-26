import { useState, useCallback } from 'react';
import { parseResult } from '../parsers';
import './ResultInput.css';

function ResultInput({ onResultParsed }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleParse = useCallback((inputText) => {
    if (!inputText.trim()) {
      setFeedback(null);
      return;
    }

    const result = parseResult(inputText);

    if (result) {
      setFeedback({
        type: 'success',
        message: `Detected: ${result.gameName} #${result.puzzleNumber}`,
        result,
      });
    } else {
      setFeedback({
        type: 'error',
        message: 'Could not recognize game format. Try pasting a share result from a supported game.',
      });
    }
  }, []);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    handleParse(newText);
  };

  const handlePaste = (e) => {
    // Let the paste happen, then parse
    setTimeout(() => {
      handleParse(e.target.value);
    }, 0);
  };

  const handleSubmit = () => {
    if (feedback?.type === 'success' && feedback.result) {
      onResultParsed(feedback.result);
      setText('');
      setFeedback({
        type: 'success',
        message: `Saved ${feedback.result.gameName} result!`,
      });
      // Clear the saved message after a delay
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleClear = () => {
    setText('');
    setFeedback(null);
  };

  return (
    <div className="result-input">
      <h2 className="result-input__title">Paste Your Result</h2>
      <p className="result-input__subtitle">
        Copy your game result and paste it below
      </p>

      <textarea
        className="result-input__textarea"
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Paste your game result here...

Example:
Wordle 1,234 4/6

⬛🟨⬛⬛⬛
⬛🟩🟩⬛⬛
🟩🟩🟩⬛⬛
🟩🟩🟩🟩🟩"
        rows={8}
      />

      {feedback && (
        <div className={`result-input__feedback result-input__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="result-input__actions">
        <button
          className="result-input__button result-input__button--primary"
          onClick={handleSubmit}
          disabled={feedback?.type !== 'success' || !feedback.result}
        >
          Save Result
        </button>
        <button
          className="result-input__button result-input__button--secondary"
          onClick={handleClear}
          disabled={!text}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default ResultInput;
