import { useState, useEffect, useRef, useMemo } from 'react';
import { generateFullText, generateCompactText, renderImageToCanvas, gameNames } from '../utils/scorecard';
import './ScorecardPanel.css';

function ScorecardPanel({ results }) {
  const [mode, setMode] = useState('full');
  const [selected, setSelected] = useState({});
  const [copyFeedback, setCopyFeedback] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const canvasRef = useRef(null);

  // Sync selection state with results — new results default to checked
  useEffect(() => {
    setSelected(prev => {
      const next = {};
      results.forEach(r => {
        next[r.id] = r.id in prev ? prev[r.id] : true;
      });
      return next;
    });
  }, [results]);

  const selectedResults = useMemo(
    () => results.filter(r => selected[r.id]),
    [results, selected]
  );

  // Re-render canvas whenever image mode is active and selection changes
  useEffect(() => {
    if (mode !== 'image' || !canvasRef.current || selectedResults.length === 0) {
      if (mode === 'image') setImageDataUrl(null);
      return;
    }
    renderImageToCanvas(selectedResults, canvasRef.current);
    setImageDataUrl(canvasRef.current.toDataURL('image/png'));
  }, [mode, selectedResults]);

  const previewText = useMemo(() => {
    if (selectedResults.length === 0) return '';
    if (mode === 'full')    return generateFullText(selectedResults);
    if (mode === 'compact') return generateCompactText(selectedResults);
    return null;
  }, [mode, selectedResults]);

  const handleCopy = async () => {
    if (selectedResults.length === 0) return;
    try {
      if (mode === 'image' && canvasRef.current) {
        const blob = await new Promise(res => canvasRef.current.toBlob(res, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else {
        await navigator.clipboard.writeText(previewText);
      }
      setCopyFeedback('Copied!');
    } catch {
      setCopyFeedback('Failed');
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const toggleResult = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="scorecard-panel">
      <div className="scorecard-panel__toolbar">
        <div className="scorecard-panel__modes">
          <button
            className={`scorecard-panel__mode-btn ${mode === 'full' ? 'active' : ''}`}
            onClick={() => setMode('full')}
          >
            Full Text
          </button>
          <button
            className={`scorecard-panel__mode-btn ${mode === 'compact' ? 'active' : ''}`}
            onClick={() => setMode('compact')}
          >
            Compact
          </button>
          <button
            className={`scorecard-panel__mode-btn ${mode === 'image' ? 'active' : ''}`}
            onClick={() => setMode('image')}
          >
            Image
          </button>
        </div>
        <button
          className={`scorecard-panel__copy-btn ${copyFeedback ? 'scorecard-panel__copy-btn--feedback' : ''}`}
          onClick={handleCopy}
          disabled={selectedResults.length === 0}
        >
          {copyFeedback || 'Copy'}
        </button>
      </div>

      {results.length === 0 ? (
        <div className="scorecard-panel__placeholder">
          Add results to build your scorecard
        </div>
      ) : (
        <div className="scorecard-panel__body">
          <div className="scorecard-panel__checks">
            {results.map(r => (
              <label key={r.id} className="scorecard-panel__check-row">
                <input
                  type="checkbox"
                  checked={!!selected[r.id]}
                  onChange={() => toggleResult(r.id)}
                />
                <span className="scorecard-panel__check-name">
                  {gameNames[r.gameId] || r.gameName || r.gameId}
                </span>
              </label>
            ))}
          </div>

          <div className="scorecard-panel__preview">
            {selectedResults.length === 0 ? (
              <span className="scorecard-panel__preview-empty">No results selected</span>
            ) : mode === 'image' ? (
              imageDataUrl
                ? <img src={imageDataUrl} alt="Scorecard" className="scorecard-panel__image" />
                : <span className="scorecard-panel__preview-empty">Rendering...</span>
            ) : (
              <pre className="scorecard-panel__text">{previewText}</pre>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default ScorecardPanel;
