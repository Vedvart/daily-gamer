import { useState, useCallback, useEffect, useRef } from 'react';
import { parseResult } from '../parsers';
import { guessGameName } from '../parsers';
import './AddResultModal.css';

function AddResultModal({ isOpen, onClose, onResultParsed }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null); // null | { type: 'success'|'unknown', result? }
  const [gameName, setGameName] = useState('');
  const isAutoName = useRef(true); // true = game name was set automatically; false = user edited it

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('');
      setFeedback(null);
      setGameName('');
      isAutoName.current = true;
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);

    if (!newText.trim()) {
      setFeedback(null);
      setGameName('');
      isAutoName.current = true;
      return;
    }

    const result = parseResult(newText);
    if (result) {
      setFeedback({ type: 'success', result });
    } else {
      if (isAutoName.current) {
        setGameName(guessGameName(newText));
      }
      setFeedback({ type: 'unknown' });
    }
  }, []);

  const handleGameNameChange = (e) => {
    isAutoName.current = false;
    setGameName(e.target.value);
  };

  const handleSubmit = () => {
    if (feedback?.type === 'success' && feedback.result) {
      onResultParsed(feedback.result);
    } else if (feedback?.type === 'unknown' && gameName.trim()) {
      const slug = gameName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const today = new Date().toISOString().split('T')[0];
      onResultParsed({
        id: `unknown-${slug}-${Date.now()}`,
        gameId: `unknown-${slug}`,
        gameName: gameName.trim(),
        puzzleNumber: null,
        date: today,
        score: '',
        scoreValue: null,
        won: true,
        grid: null,
        rawText: text.trim(),
        isUnknown: true,
        timestamp: Date.now(),
      });
    }
    onClose();
  };

  const canSubmit =
    feedback?.type === 'success'
      ? !!feedback.result
      : feedback?.type === 'unknown'
      ? gameName.trim().length > 0
      : false;

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
          <p className="modal__subtitle">Paste your game result below</p>

          <textarea
            className="modal__textarea"
            value={text}
            onChange={handleChange}
            placeholder="Paste your game result here..."
            rows={8}
            autoFocus
          />

          {feedback?.type === 'success' && (
            <div className="modal__feedback modal__feedback--success">
              Detected: {feedback.result.gameName}
              {feedback.result.puzzleNumber ? ` #${feedback.result.puzzleNumber}` : ''}
            </div>
          )}

          {feedback?.type === 'unknown' && (
            <>
              <div className="modal__feedback modal__feedback--unknown">
                <span className="modal__feedback-icon">⚠</span>
                This game is not recognized. You can still add it, but performance stats
                won't be tracked for it.
              </div>

              <div className="modal__game-name-group">
                <label className="modal__game-name-label" htmlFor="modal-game-name">
                  Game Name
                </label>
                <input
                  id="modal-game-name"
                  type="text"
                  className="modal__game-name-input"
                  value={gameName}
                  onChange={handleGameNameChange}
                  placeholder="Enter game name…"
                />
              </div>
            </>
          )}
        </div>

        <div className="modal__footer">
          <button className="modal__button modal__button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal__button modal__button--primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddResultModal;
