import { useState, useCallback, useEffect } from 'react';
import { parseResult } from '../parsers';
import './AddResultModal.css';

function AddResultModal({ isOpen, onClose, onResultParsed }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('');
      setFeedback(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
        message: 'Could not recognize game format.',
      });
    }
  }, []);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    handleParse(newText);
  };

  const handleSubmit = () => {
    if (feedback?.type === 'success' && feedback.result) {
      onResultParsed(feedback.result);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add Result</h2>
          <button className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <p className="modal__subtitle">
            Paste your game result below
          </p>

          <textarea
            className="modal__textarea"
            value={text}
            onChange={handleChange}
            placeholder="Paste your game result here..."
            rows={8}
            autoFocus
          />

          {feedback && (
            <div className={`modal__feedback modal__feedback--${feedback.type}`}>
              {feedback.message}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button
            className="modal__button modal__button--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="modal__button modal__button--primary"
            onClick={handleSubmit}
            disabled={feedback?.type !== 'success' || !feedback.result}
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddResultModal;
