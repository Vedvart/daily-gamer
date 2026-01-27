import { useState, useRef, useEffect } from 'react';
import './ScorecardModal.css';

const gameOrder = ['wordle', 'connections', 'mini', 'bandle', 'catfishing', 'timeguessr'];
const gameNames = {
  wordle: 'Wordle',
  connections: 'Connections',
  mini: 'NYT Mini',
  bandle: 'Bandle',
  catfishing: 'Catfishing',
  timeguessr: 'TimeGuessr',
};

function generateFullText(results) {
  const sortedResults = [...results].sort(
    (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
  );

  return sortedResults.map(r => r.rawText).join('\n\n');
}

function generateCompactText(results) {
  const sortedResults = [...results].sort(
    (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
  );

  const lines = sortedResults.map(r => {
    switch (r.gameId) {
      case 'wordle':
        return `Wordle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'connections':
        if (r.isReversePerfect) return `Connections #${r.puzzleNumber}: Reverse Perfect`;
        if (r.isPurpleFirst) return `Connections #${r.puzzleNumber}: Purple First`;
        return `Connections #${r.puzzleNumber}: ${r.won ? `${r.scoreValue} mistakes` : 'Failed'}`;
      case 'mini':
        return `Mini #${r.puzzleNumber}: ${r.score}`;
      case 'bandle':
        return `Bandle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'catfishing':
        return `Catfishing #${r.puzzleNumber}: ${r.score}`;
      case 'timeguessr':
        return `TimeGuessr #${r.puzzleNumber}: ${r.score}`;
      default:
        return `${r.gameName} #${r.puzzleNumber}: ${r.score}`;
    }
  });

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `Daily Games - ${today}\n${lines.join('\n')}`;
}

function ScorecardModal({ isOpen, onClose, results }) {
  const [stage, setStage] = useState('options'); // 'options' or 'result'
  const [format, setFormat] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStage('options');
      setFormat(null);
      setGeneratedContent('');
      setCopyMessage('');
      setGeneratedImage(null);
    }
  }, [isOpen]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy');
    }
  };

  const copyImageToClipboard = async (canvas) => {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyMessage('Image copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy image - try right-click to save');
    }
  };

  const generateImage = async () => {
    setIsGeneratingImage(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const sortedResults = [...results].sort(
      (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
    );

    // Canvas dimensions
    const padding = 32;
    const cardWidth = 280;
    const cardHeight = 120;
    const cardGap = 16;
    const cols = Math.min(sortedResults.length, 3);
    const rows = Math.ceil(sortedResults.length / 3);

    const width = padding * 2 + cols * cardWidth + (cols - 1) * cardGap;
    const height = padding * 2 + 60 + rows * cardHeight + (rows - 1) * cardGap;

    canvas.width = width;
    canvas.height = height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Title
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Daily Games', width / 2, padding + 24);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText(today, width / 2, padding + 46);

    // Game colors
    const gameColors = {
      wordle: '#538d4e',
      connections: '#a855f7',
      mini: '#3b82f6',
      bandle: '#eab308',
      catfishing: '#f97316',
      timeguessr: '#22c55e',
    };

    // Draw cards
    sortedResults.forEach((result, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = padding + col * (cardWidth + cardGap);
      const y = padding + 60 + row * (cardHeight + cardGap);

      // Card background
      ctx.fillStyle = 'rgba(37, 37, 64, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.fill();

      // Accent bar
      ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
      ctx.fillRect(x, y, cardWidth, 4);

      // Game icon
      const iconSize = 32;
      const iconX = x + 16;
      const iconY = y + 20;

      ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
      ctx.beginPath();
      ctx.roundRect(iconX, iconY, iconSize, iconSize, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.gameId[0].toUpperCase(), iconX + iconSize / 2, iconY + 22);

      // Game name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(gameNames[result.gameId] || result.gameName, iconX + iconSize + 12, iconY + 14);

      // Puzzle number
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${result.puzzleNumber}`, iconX + iconSize + 12, iconY + 28);

      // Score
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(result.score, x + cardWidth - 16, iconY + 22);

      // Status
      const statusText = result.won ? 'Solved' : 'Failed';
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(statusText, x + cardWidth - 16, y + cardHeight - 16);
    });

    // Watermark
    ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('dailygamer.app', width / 2, height - 10);

    setGeneratedImage(canvas.toDataURL('image/png'));
    setIsGeneratingImage(false);

    // Auto-copy
    await copyImageToClipboard(canvas);
  };

  const handleGenerate = async (selectedFormat) => {
    setFormat(selectedFormat);

    if (selectedFormat === 'full') {
      const text = generateFullText(results);
      setGeneratedContent(text);
      setStage('result');
      await copyToClipboard(text);
    } else if (selectedFormat === 'compact') {
      const text = generateCompactText(results);
      setGeneratedContent(text);
      setStage('result');
      await copyToClipboard(text);
    } else if (selectedFormat === 'image') {
      setStage('result');
      await generateImage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scorecard-modal__overlay" onClick={onClose}>
      <div className="scorecard-modal" onClick={e => e.stopPropagation()}>
        <button className="scorecard-modal__close" onClick={onClose}>
          &times;
        </button>

        {stage === 'options' && (
          <>
            <h2 className="scorecard-modal__title">Generate Scorecard</h2>
            <p className="scorecard-modal__subtitle">
              Choose a format for your daily results
            </p>

            {results.length === 0 ? (
              <div className="scorecard-modal__empty">
                No results to share yet. Add some games first!
              </div>
            ) : (
              <div className="scorecard-modal__options">
                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('full')}
                >
                  <div className="scorecard-modal__option-icon">📝</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Full Text</h3>
                    <p>Complete share text for all games</p>
                  </div>
                </button>

                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('compact')}
                >
                  <div className="scorecard-modal__option-icon">📋</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Compact Text</h3>
                    <p>Abbreviated one-line summaries</p>
                  </div>
                </button>

                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('image')}
                >
                  <div className="scorecard-modal__option-icon">🖼️</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Image</h3>
                    <p>Visual scorecard to share</p>
                  </div>
                </button>
              </div>
            )}
          </>
        )}

        {stage === 'result' && (
          <>
            <button
              className="scorecard-modal__back"
              onClick={() => setStage('options')}
            >
              &larr; Back
            </button>

            <h2 className="scorecard-modal__title">
              {format === 'full' && 'Full Text Scorecard'}
              {format === 'compact' && 'Compact Scorecard'}
              {format === 'image' && 'Image Scorecard'}
            </h2>

            {copyMessage && (
              <div className="scorecard-modal__copy-message">{copyMessage}</div>
            )}

            {(format === 'full' || format === 'compact') && (
              <div className="scorecard-modal__text-result">
                <pre className="scorecard-modal__text">{generatedContent}</pre>
                <button
                  className="scorecard-modal__copy-btn"
                  onClick={() => copyToClipboard(generatedContent)}
                >
                  Copy Text
                </button>
              </div>
            )}

            {format === 'image' && (
              <div className="scorecard-modal__image-result">
                {isGeneratingImage ? (
                  <div className="scorecard-modal__loading">Generating image...</div>
                ) : (
                  <>
                    <img
                      src={generatedImage}
                      alt="Scorecard"
                      className="scorecard-modal__image"
                    />
                    <button
                      className="scorecard-modal__copy-btn"
                      onClick={() => copyImageToClipboard(canvasRef.current)}
                    >
                      Copy Image
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ScorecardModal;
